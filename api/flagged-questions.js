// ── flagged_questions admin review endpoint (server-mediated) ──────────────
// flagged_questions has no client SELECT/UPDATE policy at all (see
// flagged_questions.sql) — every read and status change goes through here,
// using the Supabase service-role key, after checking the caller is actually
// an admin. Same shape as pool-refill.js/pool-mark-served.js (authToken
// passed from the client session, verified via supabaseAdmin.auth.getUser),
// with one extra check those two don't need: this data spans every user, so
// only an admin account may read or resolve it, not just any logged-in user.
//
// NOTE: this assumes SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are already
// set in Vercel (pool-refill.js/pool-mark-served.js already depend on the
// same two env vars). Admin detection mirrors src/lib/supabase.js's isAdmin()
// helper — user.user_metadata.is_admin === true, set via the raw_user_meta_data
// SQL update described in this project's own admin-account docs. If your
// admin-stats.js endpoint already does this check with a different helper,
// prefer keeping this one in sync with that rather than the other way round.

import { createClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 20
};

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MAX_LIST = 200;
const VALID_STATUSES = ['open', 'resolved', 'dismissed'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { authToken, action } = req.body || {};

    if (!authToken) return res.status(401).json({ error: 'Missing auth token' });
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(authToken);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid session' });
    if (userData.user.user_metadata?.is_admin !== true) return res.status(403).json({ error: 'Admin access required' });

    if (action === 'list') {
      const { status } = req.body || {};
      let query = supabaseAdmin.from('flagged_questions').select('*').order('created_at', { ascending: false }).limit(MAX_LIST);
      if (status && VALID_STATUSES.includes(status)) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ rows: data || [] });
    }

    if (action === 'update') {
      const { id, status } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Missing id' });
      if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
      const { error } = await supabaseAdmin.from('flagged_questions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}