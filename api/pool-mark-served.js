// ── Question pool "served" tracking (server-mediated writes) ────────────────
// Companion to pool-refill.js. The client can read question_pool directly
// (RLS allows any authenticated user to select) but cannot write to it —
// there is no client update policy on that table. This endpoint bumps
// served_count for a batch of rows that were just handed to a user, using
// the Supabase service-role key (bypasses RLS). Best-effort and non-critical
// by design: getPooledQuestions() in src/lib/progress.js calls this
// fire-and-forget, never awaiting it before showing the user their test.
//
// Same env-var assumption as pool-refill.js: SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY must be set in Vercel.

import { createClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 20
};

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MAX_IDS = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { authToken, poolIds } = req.body || {};

    // Same bar as pool-refill.js — any real logged-in session, not
    // admin-only, just enough to rule out an anonymous script hammering
    // this endpoint.
    if (!authToken) return res.status(401).json({ error: 'Missing auth token' });
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(authToken);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid session' });

    if (!Array.isArray(poolIds) || poolIds.length === 0) return res.status(400).json({ error: 'No poolIds supplied' });
    const ids = poolIds.filter(id => typeof id === 'string' && id.trim()).slice(0, MAX_IDS);
    if (ids.length === 0) return res.status(400).json({ error: 'No valid poolIds' });

    // Supabase JS has no atomic "increment by 1" without a Postgres RPC, and
    // this counter is a soft load-spreading signal rather than an exact
    // count, so a plain read-then-write is fine — a lost increment under a
    // race just leaves one row's served_count very slightly stale.
    const { data: rows, error: fetchErr } = await supabaseAdmin
      .from('question_pool').select('id, served_count').in('id', ids);
    if (fetchErr) return res.status(500).json({ error: fetchErr.message });

    await Promise.all((rows || []).map(row =>
      supabaseAdmin.from('question_pool')
        .update({ served_count: (row.served_count || 0) + 1 })
        .eq('id', row.id)
    ));

    res.json({ updated: (rows || []).length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
