export const config = {
  maxDuration: 30
};

export default async function handler(req, res) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  // ── Webhook from Stripe ──────────────────────────────────────────────────────
  if (req.method === 'POST' && req.query.webhook === 'true') {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      const body = await getRawBody(req);
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // ── One-time practice paper purchase ────────────────────────────────────
      if (session.mode === 'payment' && (session.metadata?.productType === 'practice-paper' || session.metadata?.productType === 'practice-paper-bundle')) {
        try {
          const { getLevelServer, getPaperServer } = require('./_practicePapersServer');
          const supabaseAdmin = getSupabaseAdmin();
          const customerEmail = session.customer_details?.email || session.customer_email;
          const { levelSlug, paperId } = session.metadata;

          let papersToSend = [];
          if (session.metadata.productType === 'practice-paper-bundle') {
            const level = getLevelServer(levelSlug);
            papersToSend = (level?.papers || []).filter(p => p.available);
          } else {
            const paper = getPaperServer(levelSlug, paperId);
            if (paper) papersToSend = [paper];
          }

          if (customerEmail && supabaseAdmin && papersToSend.length > 0) {
            const downloads = [];
            for (const paper of papersToSend) {
              const { data, error: signError } = await supabaseAdmin.storage
                .from('practice-papers')
                .createSignedUrl(paper.file, 60 * 60 * 24 * 7); // 7 days
              if (!signError && data) downloads.push({ title: `${paper.title} (${paper.examStyle})`, url: data.signedUrl });
            }
            await sendPracticePaperEmail(customerEmail, downloads);
            console.log('Sent practice paper email to:', customerEmail, 'papers:', downloads.length);
          }
        } catch (err) {
          console.error('Practice paper webhook error:', err.message);
        }
        return res.json({ received: true });
      }

      if (session.mode === 'subscription') {
        try {
          const supabaseAdmin = getSupabaseAdmin();
          if (!supabaseAdmin) return res.json({ received: true, warning: 'Missing Supabase config' });

          const customerEmail =
            session.customer_details?.email ||
            session.customer_email ||
            await getStripeCustomerEmail(stripe, session.customer);

          const customerName = session.customer_details?.name || 'there';

          console.log('Webhook: processing subscription for:', customerEmail);

          if (customerEmail) {
            const user = await findUserByEmail(supabaseAdmin, customerEmail);
            if (user) {
              await supabaseAdmin.auth.admin.updateUserById(user.id, {
                user_metadata: {
                  ...user.user_metadata,
                  subscribed: true,
                  stripe_customer_id: session.customer,
                  subscription_id: session.subscription,
                  subscribed_at: new Date().toISOString()
                }
              });
              console.log('Successfully subscribed user:', customerEmail);
            } else {
              console.warn('No matching Supabase user found for:', customerEmail);
            }

            await sendSubscriptionConfirmationEmail(customerEmail, customerName);
          }
        } catch (err) {
          console.error('Webhook processing error:', err.message);
        }
      }
    }

    // ── Subscription cancelled / fully ended ──────────────────────────────────
    // Fires when a subscription is deleted immediately, or when a
    // cancel-at-period-end subscription actually reaches its end date.
    if (event.type === 'customer.subscription.deleted') {
      try {
        const subscription = event.data.object;
        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) return res.json({ received: true, warning: 'Missing Supabase config' });

        const customerEmail = await getStripeCustomerEmail(stripe, subscription.customer);
        console.log('Webhook: subscription deleted for:', customerEmail, subscription.id);

        if (customerEmail) {
          const user = await findUserByEmail(supabaseAdmin, customerEmail);
          if (user) {
            await supabaseAdmin.auth.admin.updateUserById(user.id, {
              user_metadata: {
                ...user.user_metadata,
                subscribed: false,
                subscription_id: null,
                unsubscribed_at: new Date().toISOString()
              }
            });
            console.log('Successfully unsubscribed user:', customerEmail);
          } else {
            console.warn('No matching Supabase user found for cancelled sub:', customerEmail);
          }
        }
      } catch (err) {
        console.error('Webhook processing error (subscription.deleted):', err.message);
      }
    }

    // ── Subscription updated ──────────────────────────────────────────────────
    // Fires on status changes, plan changes, and cancel-at-period-end being
    // toggled. We only act when the status itself has moved to a non-active
    // state, to avoid overwriting subscribed:true on every minor update.
    if (event.type === 'customer.subscription.updated') {
      try {
        const subscription = event.data.object;
        const inactiveStatuses = ['canceled', 'unpaid', 'incomplete_expired', 'past_due'];

        if (inactiveStatuses.includes(subscription.status)) {
          const supabaseAdmin = getSupabaseAdmin();
          if (!supabaseAdmin) return res.json({ received: true, warning: 'Missing Supabase config' });

          const customerEmail = await getStripeCustomerEmail(stripe, subscription.customer);
          console.log('Webhook: subscription status changed to', subscription.status, 'for:', customerEmail);

          if (customerEmail) {
            const user = await findUserByEmail(supabaseAdmin, customerEmail);
            if (user) {
              await supabaseAdmin.auth.admin.updateUserById(user.id, {
                user_metadata: {
                  ...user.user_metadata,
                  subscribed: false,
                  subscription_status: subscription.status,
                  unsubscribed_at: new Date().toISOString()
                }
              });
              console.log('Marked user unsubscribed due to status:', subscription.status, customerEmail);
            }
          }
        }
      } catch (err) {
        console.error('Webhook processing error (subscription.updated):', err.message);
      }
    }

    // ── Renewal payment failed ────────────────────────────────────────────────
    // Doesn't immediately revoke access (Stripe/your dunning settings decide
    // that via subscription.updated going past_due/unpaid) — this just logs
    // and emails so you have visibility when a renewal charge is declined.
    if (event.type === 'invoice.payment_failed') {
      try {
        const invoice = event.data.object;
        const customerEmail = invoice.customer_email || await getStripeCustomerEmail(stripe, invoice.customer);
        console.warn('Webhook: payment failed for:', customerEmail, 'invoice:', invoice.id);
      } catch (err) {
        console.error('Webhook processing error (invoice.payment_failed):', err.message);
      }
    }

    return res.json({ received: true });
  }

  // ── Create checkout session ──────────────────────────────────────────────────
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { type, questionCount, successUrl, cancelUrl, userEmail } = req.body;

    let session;

    if (type === 'subscription') {
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID, quantity: 1 }],
        ...(userEmail && { customer_email: userEmail }),
        success_url: successUrl || `${req.headers.origin}/subscribe?subscribed=true`,
        cancel_url: cancelUrl || `${req.headers.origin}/subscribe`,
        currency: 'aud',
        billing_address_collection: 'auto',
      });

    } else if (type === 'pdf') {
      const amountInCents = Math.round(questionCount * 15);
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'aud',
            unit_amount: amountInCents,
            product_data: {
              name: `ScholarPrep PDF Test — ${questionCount} questions`,
              description: `Professional exam-style PDF with answer key and explanations`,
            },
          },
          quantity: 1,
        }],
        ...(userEmail && { customer_email: userEmail }),
        success_url: successUrl || `${req.headers.origin}/pdf-generator?paid=true&questions=${questionCount}`,
        cancel_url: cancelUrl || `${req.headers.origin}/pdf-generator`,
      });

    } else if (type === 'practice-paper') {
      const { levelSlug, paperId } = req.body;
      const { getPaperServer } = require('./_practicePapersServer');
      const paper = getPaperServer(levelSlug, paperId);
      if (!paper || !paper.available) return res.status(400).json({ error: 'Paper not available' });

      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'aud',
            unit_amount: Math.round(paper.price * 100),
            product_data: {
              name: `ScholarPrep Practice Paper — ${paper.title} (Level ${levelSlug})`,
              description: `${paper.examStyle} · ${paper.questionCount} questions · Printable PDF with answer key`,
            },
          },
          quantity: 1,
        }],
        metadata: { productType: 'practice-paper', levelSlug, paperId: paper.id },
        ...(userEmail && { customer_email: userEmail }),
        success_url: successUrl || `${req.headers.origin}/practice-papers/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.origin}/practice-papers`,
      });

    } else if (type === 'practice-paper-bundle') {
      const { levelSlug } = req.body;
      const { getLevelServer } = require('./_practicePapersServer');
      const level = getLevelServer(levelSlug);
      if (!level) return res.status(400).json({ error: 'Level not found' });

      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'aud',
            unit_amount: Math.round(level.bundlePrice * 100),
            product_data: {
              name: `ScholarPrep Practice Paper Bundle — Level ${levelSlug} (5 papers)`,
              description: `All 5 papers · Printable PDFs with answer keys`,
            },
          },
          quantity: 1,
        }],
        metadata: { productType: 'practice-paper-bundle', levelSlug },
        ...(userEmail && { customer_email: userEmail }),
        success_url: successUrl || `${req.headers.origin}/practice-papers/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.origin}/practice-papers`,
      });

    } else {
      return res.status(400).json({ error: 'Invalid checkout type' });
    }

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function getSupabaseAdmin() {
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars');
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function findUserByEmail(supabaseAdmin, email) {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('listUsers error:', error.message);
    return null;
  }
  return users.find(u => u.email === email) || null;
}

// ── Send subscription confirmation email via Brevo ───────────────────────────
async function sendSubscriptionConfirmationEmail(email, name) {
  try {
    const firstName = name?.split(' ')[0] || 'there';
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'ScholarPrep', email: 'hello@scholarprep.com.au' },
        to: [{ email, name }],
        subject: 'Welcome to ScholarPrep — your subscription is active!',
        htmlContent: `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F5F7FF;">

  <!-- Header -->
  <div style="background: #3730A3; padding: 32px 40px; text-align: center;">
    <div style="font-family: 'Plus Jakarta Sans', Georgia, sans-serif; font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.5px;">
      Scholar<span style="color: #A5B4FC;">Prep</span>
    </div>
    <div style="font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 6px; letter-spacing: 0.1em; text-transform: uppercase;">
      ACER · AAST · EDUTEST · NAPLAN
    </div>
  </div>

  <!-- Body -->
  <div style="padding: 40px; background: #fff; margin: 24px; border-radius: 16px; border: 1px solid rgba(67,56,202,0.08); box-shadow: 0 4px 20px rgba(67,56,202,0.06);">
    <h1 style="font-family: 'Plus Jakarta Sans', Georgia, sans-serif; font-size: 26px; font-weight: 800; color: #111827; margin: 0 0 14px; letter-spacing: -0.5px;">
      You're subscribed! 🎉
    </h1>
    <p style="font-size: 16px; color: #6B7280; line-height: 1.7; margin: 0 0 20px; font-family: 'Inter', Arial, sans-serif;">
      Hi ${firstName}, welcome to ScholarPrep! Your subscription is now active and you have full access to everything.
    </p>

    <!-- What's included -->
    <div style="background: #1E1B4B; border-radius: 16px; padding: 28px 32px; margin: 24px 0;">
      <div style="font-size: 12px; font-weight: 700; color: #A5B4FC; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; font-family: 'Inter', Arial, sans-serif;">
        Your subscription includes
      </div>
      <div style="display: grid; gap: 10px;">
        <div style="color: rgba(255,255,255,0.75); font-size: 14px; font-family: 'Inter', Arial, sans-serif;">✓ &nbsp;Unlimited questions — fresh every session</div>
        <div style="color: rgba(255,255,255,0.75); font-size: 14px; font-family: 'Inter', Arial, sans-serif;">✓ &nbsp;All 4 subjects — Maths, Reading, General Ability & Writing</div>
        <div style="color: rgba(255,255,255,0.75); font-size: 14px; font-family: 'Inter', Arial, sans-serif;">✓ &nbsp;Full simulated timed exams — Years 1 to 11</div>
        <div style="color: rgba(255,255,255,0.75); font-size: 14px; font-family: 'Inter', Arial, sans-serif;">✓ &nbsp;Progress Report Dashboard — strengths & weaknesses</div>
        <div style="color: rgba(255,255,255,0.75); font-size: 14px; font-family: 'Inter', Arial, sans-serif;">✓ &nbsp;PDF test generator — just 15¢ per question</div>
        <div style="color: rgba(255,255,255,0.75); font-size: 14px; font-family: 'Inter', Arial, sans-serif;">✓ &nbsp;$9.99/month · cancel anytime</div>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 36px 0;">
      <a href="https://scholarprep.com.au/app" style="background: #4338CA; color: #ffffff; padding: 16px 40px; border-radius: 100px; font-size: 16px; font-weight: 700; text-decoration: none; display: inline-block; font-family: 'Inter', Arial, sans-serif; letter-spacing: -0.2px;">
        Start practising now →
      </a>
    </div>

    <p style="font-size: 14px; color: #6B7280; line-height: 1.7; margin: 0; font-family: 'Inter', Arial, sans-serif;">
      You can manage or cancel your subscription anytime from your
      <a href="https://scholarprep.com.au/profile" style="color: #4338CA; text-decoration: none; font-weight: 600;">Account page</a>.
    </p>
  </div>

  <!-- Footer -->
  <div style="padding: 20px 24px; text-align: center;">
    <div style="font-size: 12px; color: #9CA3AF; line-height: 1.6; font-family: 'Inter', Arial, sans-serif;">
      © 2026 ScholarPrep — a Go Circle Pty Ltd company<br/>
      Built for Australian primary and secondary school families<br/>
      <a href="https://scholarprep.com.au" style="color: #4338CA; text-decoration: none;">scholarprep.com.au</a>
    </div>
  </div>

</div>
        `
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Brevo email error:', err);
    } else {
      console.log('Subscription confirmation email sent to:', email);
    }
  } catch (err) {
    console.error('Failed to send confirmation email:', err.message);
  }
}

// ── Send practice paper download email via Brevo ──────────────────────────────
async function sendPracticePaperEmail(email, downloads) {
  try {
    const linksHtml = downloads.map(d => `
      <div style="margin-bottom: 10px;">
        <a href="${d.url}" style="display: inline-block; background: #4338CA; color: #fff; padding: 12px 24px; border-radius: 100px; font-size: 14px; font-weight: 700; text-decoration: none; font-family: 'Inter', Arial, sans-serif;">
          📄 Download ${d.title}
        </a>
      </div>
    `).join('');

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': process.env.BREVO_API_KEY },
      body: JSON.stringify({
        sender: { name: 'ScholarPrep', email: 'hello@scholarprep.com.au' },
        to: [{ email }],
        subject: 'Your ScholarPrep practice papers are ready!',
        htmlContent: `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F5F7FF;">
  <div style="background: #3730A3; padding: 32px 40px; text-align: center;">
    <div style="font-family: 'Plus Jakarta Sans', Georgia, sans-serif; font-size: 28px; font-weight: 900; color: #fff;">
      Scholar<span style="color: #A5B4FC;">Prep</span>
    </div>
  </div>
  <div style="padding: 40px; background: #fff; margin: 24px; border-radius: 16px; border: 1px solid rgba(67,56,202,0.08);">
    <h1 style="font-family: 'Plus Jakarta Sans', Georgia, sans-serif; font-size: 24px; font-weight: 800; color: #111827; margin: 0 0 14px;">
      Your practice papers are ready 📘
    </h1>
    <p style="font-size: 15px; color: #6B7280; line-height: 1.7; margin: 0 0 24px; font-family: 'Inter', Arial, sans-serif;">
      Thanks for your purchase! Click below to download your PDF${downloads.length > 1 ? 's' : ''}. Links are valid for 7 days.
    </p>
    ${linksHtml}
    <p style="font-size: 13px; color: #94A3B8; line-height: 1.7; margin: 24px 0 0; font-family: 'Inter', Arial, sans-serif;">
      Trouble downloading? Just reply to this email or visit our <a href="https://scholarprep.com.au/support" style="color: #4338CA;">support page</a>.
    </p>
  </div>
  <div style="padding: 20px 24px; text-align: center;">
    <div style="font-size: 12px; color: #9CA3AF; font-family: 'Inter', Arial, sans-serif;">
      © 2026 ScholarPrep — a Go Circle Pty Ltd company<br/>
      <a href="https://scholarprep.com.au" style="color: #4338CA; text-decoration: none;">scholarprep.com.au</a>
    </div>
  </div>
</div>
        `
      })
    });
    if (!response.ok) console.error('Brevo email error:', await response.text());
  } catch (err) {
    console.error('Failed to send practice paper email:', err.message);
  }
}

async function getStripeCustomerEmail(stripe, customerId) {
  if (!customerId) return null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer.email || null;
  } catch (e) {
    console.error('Could not retrieve Stripe customer:', e.message);
    return null;
  }
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}