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

    // Handle successful subscription payment
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

          // Get email from customer_details (populated after checkout)
          // Falls back to customer_email or Stripe customer lookup
          const customerEmail =
            session.customer_details?.email ||
            session.customer_email ||
            await getStripeCustomerEmail(stripe, session.customer);

          console.log('Processing subscription for email:', customerEmail);

          if (customerEmail) {
            const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

            if (listError) {
              console.error('Error listing users:', listError);
              return res.json({ received: true, error: 'Could not list users' });
            }

            const user = users.find(u => u.email === customerEmail);

            if (user) {
              const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
                user_metadata: {
                  ...user.user_metadata,
                  subscribed: true,
                  stripe_customer_id: session.customer,
                  subscription_id: session.subscription,
                  subscribed_at: new Date().toISOString()
                }
              });

              if (updateError) {
                console.error('Error updating user:', updateError);
              } else {
                console.log('Successfully subscribed user:', customerEmail);
              }
            } else {
              console.error('No Supabase user found with email:', customerEmail);
            }
          } else {
            console.error('Could not determine customer email from session');
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
    const { type, questionCount, successUrl, cancelUrl } = req.body;

    let session;

    if (type === 'subscription') {
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
            quantity: 1,
          },
        ],
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
        line_items: [
          {
            price_data: {
              currency: 'aud',
              unit_amount: amountInCents,
              product_data: {
                name: `ScholarPrep PDF Test — ${questionCount} questions`,
                description: `Professional exam-style PDF with answer key and explanations`,
              },
            },
            quantity: 1,
          },
        ],
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

// Get customer email from Stripe if not in session
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

// Helper to get raw body for webhook signature verification
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}