export const config = {
  maxDuration: 30
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { createClient } = require('@supabase/supabase-js');
  const { getLevelServer, getPaperServer } = require('./_practicePapersServer');

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed yet. If you were just charged, please wait a moment and refresh.' });
    }

    const productType = session.metadata?.productType;
    if (productType !== 'practice-paper' && productType !== 'practice-paper-bundle') {
      return res.status(400).json({ error: 'This session is not a practice paper purchase.' });
    }

    const { levelSlug, paperId } = session.metadata;
    let papersToServe = [];
    if (productType === 'practice-paper-bundle') {
      const level = getLevelServer(levelSlug);
      papersToServe = (level?.papers || []).filter(p => p.available);
    } else {
      const paper = getPaperServer(levelSlug, paperId);
      if (paper) papersToServe = [paper];
    }

    if (papersToServe.length === 0) {
      return res.status(404).json({ error: 'No papers found for this purchase.' });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const downloads = [];
    for (const paper of papersToServe) {
      const { data, error } = await supabaseAdmin.storage
        .from('practice-papers')
        .createSignedUrl(paper.file, 60 * 60 * 24 * 7); // 7-day link
      if (!error && data) {
        downloads.push({ title: `${paper.title} (${paper.examStyle})`, url: data.signedUrl });
      }
    }

    if (downloads.length === 0) {
      return res.status(500).json({ error: 'Could not generate download links. Please contact support.' });
    }

    res.json({
      email: session.customer_details?.email || session.customer_email,
      downloads,
    });
  } catch (error) {
    console.error('paper-download error:', error);
    res.status(500).json({ error: 'Could not verify your purchase. Please contact support.' });
  }
}
