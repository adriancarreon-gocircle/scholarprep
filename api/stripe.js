export const config = {
  maxDuration: 30
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  try {
    const { type, questionCount, successUrl, cancelUrl } = req.body;

    let session;

    if (type === 'subscription') {
      // $9.99/month subscription
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: successUrl || `${req.headers.origin}/app?subscribed=true`,
        cancel_url: cancelUrl || `${req.headers.origin}/app`,
        currency: 'aud',
      });
    } else if (type === 'pdf') {
      // Dynamic price: 15 cents per question
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
