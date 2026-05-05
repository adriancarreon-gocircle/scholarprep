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
      if (session.mode === 'subscription') {
        try {
          const { createClient } = require('@supabase/supabase-js');

          const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

          if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase env vars');
            return res.json({ received: true, warning: 'Missing Supabase config' });
          }

          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

          // Get email from customer_details
          const customerEmail =
            session.customer_details?.email ||
            session.customer_email ||
            await getStripeCustomerEmail(stripe, session.customer);

          const customerName = session.customer_details?.name || 'there';

          console.log('Webhook: processing subscription for:', customerEmail);

          if (customerEmail) {
            // 1. Update Supabase user metadata
            const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

            if (!listError) {
              const user = users.find(u => u.email === customerEmail);
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
              }
            }

            // 2. Send subscription confirmation email via Brevo
            await sendSubscriptionConfirmationEmail(customerEmail, customerName);
          }
        } catch (err) {
          console.error('Webhook processing error:', err.message);
        }
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

    } else {
      return res.status(400).json({ error: 'Invalid checkout type' });
    }

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
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
<div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6EE;">
  
  <!-- Header -->
  <div style="background: #0D1B2A; padding: 32px 40px; text-align: center;">
    <div style="font-family: Georgia, serif; font-size: 28px; font-weight: 900; color: #fff;">
      Scholar<span style="color: #E8B84B;">Prep</span>
    </div>
    <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px; letter-spacing: 0.1em;">
      ACER · AAST · EDUTEST · NAPLAN
    </div>
  </div>

  <!-- Body -->
  <div style="padding: 40px; background: #fff; margin: 24px; border-radius: 16px; border: 1px solid rgba(13,27,42,0.08);">
    <h1 style="font-family: Georgia, serif; font-size: 28px; font-weight: 900; color: #0D1B2A; margin: 0 0 16px;">
      You're subscribed! 🎉
    </h1>
    <p style="font-size: 16px; color: #5A6A7A; line-height: 1.7; margin: 0 0 16px;">
      Hi ${firstName}, welcome to ScholarPrep Unlimited! Your subscription is now active and you have full access to everything.
    </p>

    <!-- What's included -->
    <div style="background: #0D1B2A; border-radius: 16px; padding: 28px 32px; margin: 24px 0;">
      <div style="font-size: 13px; font-weight: 700; color: #E8B84B; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px;">
        Your subscription includes
      </div>
      <div style="display: grid; gap: 10px;">
        <div style="color: rgba(255,255,255,0.75); font-size: 14px;">✓ &nbsp;Unlimited questions from our AI question bank</div>
        <div style="color: rgba(255,255,255,0.75); font-size: 14px;">✓ &nbsp;All 4 subjects — Maths, Reading, General Ability & Writing</div>
        <div style="color: rgba(255,255,255,0.75); font-size: 14px;">✓ &nbsp;Full simulated timed exams — Years 1 to 11</div>
        <div style="color: rgba(255,255,255,0.75); font-size: 14px;">✓ &nbsp;AI personalised strengths & weaknesses analysis</div>
        <div style="color: rgba(255,255,255,0.75); font-size: 14px;">✓ &nbsp;Progress Report Dashboard</div>
        <div style="color: rgba(255,255,255,0.75); font-size: 14px;">✓ &nbsp;PDF test generator — just 15¢ per question</div>
        <div style="color: rgba(255,255,255,0.75); font-size: 14px;">✓ &nbsp;$9.99/month · cancel anytime</div>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://www.scholarprep.com.au/app" style="background: #E8B84B; color: #0D1B2A; padding: 16px 40px; border-radius: 100px; font-size: 16px; font-weight: 700; text-decoration: none; display: inline-block;">
        Start practising now →
      </a>
    </div>

    <p style="font-size: 14px; color: #5A6A7A; line-height: 1.7; margin: 0;">
      You can manage or cancel your subscription anytime from your 
      <a href="https://www.scholarprep.com.au/profile" style="color: #E8B84B; text-decoration: none; font-weight: 600;">Account page</a>.
    </p>
  </div>

  <!-- Footer -->
  <div style="padding: 20px 24px; text-align: center;">
    <div style="font-size: 12px; color: #9AA5B0; line-height: 1.6;">
      © 2026 ScholarPrep — a Go Circle Pty Ltd company<br/>
      Built for Australian primary and secondary school families<br/>
      <a href="https://www.scholarprep.com.au" style="color: #E8B84B; text-decoration: none;">www.scholarprep.com.au</a>
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