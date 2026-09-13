// ── Server-side eBook catalogue ──────────────────────────────────────────────
// Single source of truth linking a SKU to its Stripe Price env var (the real
// Price IDs you created in the Stripe Dashboard at $14.95 AUD each) and its
// file path inside the Supabase Storage 'ebooks' bucket. Mirrors the shape
// of _practicePapersServer.js — both api/stripe.js (checkout + webhook) and
// api/ebook-download.js import from here instead of duplicating this map.
//
// Setup needed in Supabase: create a bucket named exactly "ebooks" (private,
// not public) in Storage, then upload the 7 PDFs using the exact file names
// below (case-sensitive).

const EBOOKS = {
  y3v1: { title: 'ScholarPrep Year 3 — Volume 1', priceEnvVar: 'STRIPE_PRICE_Y3V1', file: 'year3-vol1.pdf', available: true },
  y3v2: { title: 'ScholarPrep Year 3 — Volume 2', priceEnvVar: 'STRIPE_PRICE_Y3V2', file: 'year3-vol2.pdf', available: true },
  y3v3: { title: 'ScholarPrep Year 3 — Volume 3', priceEnvVar: 'STRIPE_PRICE_Y3V3', file: 'year3-vol3.pdf', available: true },
  y5v1: { title: 'ScholarPrep Year 5 — Volume 1', priceEnvVar: 'STRIPE_PRICE_Y5V1', file: 'year5-vol1.pdf', available: true },
  y5v2: { title: 'ScholarPrep Year 5 — Volume 2', priceEnvVar: 'STRIPE_PRICE_Y5V2', file: 'year5-vol2.pdf', available: true },
  y5v3: { title: 'ScholarPrep Year 5 — Volume 3', priceEnvVar: 'STRIPE_PRICE_Y5V3', file: 'year5-vol3.pdf', available: true },
  y7v1: { title: 'ScholarPrep Year 7 — Volume 1', priceEnvVar: 'STRIPE_PRICE_Y7V1', file: 'year7-vol1.pdf', available: true },
  // y7v2 / y7v3 deliberately absent — not built yet, "Coming soon" on the
  // catalogue page, so there is nothing to sell or serve for those SKUs.
};

function getEbookServer(sku) {
  return EBOOKS[sku] || null;
}

module.exports = { EBOOKS, getEbookServer };