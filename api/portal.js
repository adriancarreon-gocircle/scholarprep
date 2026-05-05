export const config = {
  maxDuration: 30
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  try {
    const { customerId, returnUrl } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || 'https://www.scholarprep.com.au/profile',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: error.message });
  }
}
