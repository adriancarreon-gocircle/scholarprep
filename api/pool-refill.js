// ── Question pool refill (server-mediated writes) ───────────────────────────
// The client can read question_pool directly (RLS allows any authenticated
// user to select). It CANNOT write to it directly — there is no client
// insert/update/delete policy on that table at all. This endpoint is the
// only way rows get added: it validates the batch, then inserts using the
// Supabase service-role key, which bypasses RLS.
//
// NOTE: this assumes your Supabase URL and service-role key are available as
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel's env vars. If your
// existing api/admin-stats.js (which already does cross-user reads) uses
// different env var names for these, use the same names here instead —
// I don't have that file in this session, so I've used the conventional
// names rather than guess at yours.

import { createClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 30
};

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MAX_BATCH = 30;
const VALID_SUBJECTS = ['mathematics', 'english', 'general'];

function isValidQuestion(q) {
  if (!q || typeof q !== 'object') return false;
  if (typeof q.question !== 'string' || !q.question.trim()) return false;
  if (!q.options || typeof q.options !== 'object') return false;
  if (!['A', 'B', 'C', 'D'].every(k => k in q.options && typeof q.options[k] === 'string')) return false;
  if (!['A', 'B', 'C', 'D'].includes(q.correct)) return false;
  return true;
}

function fingerprintForRow(q) {
  const text = (q.question || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').slice(0, 12).join(' ');
  return `${q.questionType || q.topic || ''}::${text}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { authToken, subject, topicKey, questionTypeKey, yearLevel, questions } = req.body || {};

    // Require a real logged-in session — not admin-only, any authenticated
    // subscriber's browser can contribute while generating their own test —
    // just enough to rule out an anonymous script hammering this endpoint.
    if (!authToken) return res.status(401).json({ error: 'Missing auth token' });
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(authToken);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid session' });

    if (!VALID_SUBJECTS.includes(subject)) return res.status(400).json({ error: 'Invalid subject' });
    if (!topicKey || typeof topicKey !== 'string') return res.status(400).json({ error: 'Invalid topicKey' });
    if (!Number.isInteger(yearLevel) || yearLevel < 1 || yearLevel > 11) return res.status(400).json({ error: 'Invalid yearLevel' });
    if (!Array.isArray(questions) || questions.length === 0) return res.status(400).json({ error: 'No questions supplied' });

    const clean = questions.slice(0, MAX_BATCH).filter(isValidQuestion);
    if (clean.length === 0) return res.status(400).json({ error: 'No valid questions in batch' });

    const rows = clean.map(q => ({
      subject,
      topic_key: topicKey,
      question_type_key: questionTypeKey || null,
      year_level: yearLevel,
      question: q,
      fingerprint: fingerprintForRow(q),
    }));

    const { error } = await supabaseAdmin.from('question_pool').insert(rows);
    if (error) return res.status(500).json({ error: error.message });

    res.json({ inserted: rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}