export const config = {
  maxDuration: 30
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Missing Supabase config' });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // ── Authenticate the requester and confirm they're an admin ─────────────────
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  const { data: { user: requester }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !requester) return res.status(401).json({ error: 'Invalid session' });
  if (requester.user_metadata?.is_admin !== true) return res.status(403).json({ error: 'Admin access required' });

  // ── Fetch all users (paginated) ──────────────────────────────────────────────
  try {
    let allUsers = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      allUsers = allUsers.concat(data.users);
      if (data.users.length < perPage) break;
      page++;
      if (page > 20) break; // safety cap at 20,000 users
    }

    const now = new Date();
    const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

    const isAdminUser = (u) => u.user_metadata?.is_admin === true;
    const isSubscribed = (u) => u.user_metadata?.subscribed === true;
    const isTrialActive = (u) => {
      const start = u.user_metadata?.trial_start;
      if (!start) return false;
      const diffDays = (now - new Date(start)) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    };

    const nonAdminUsers = allUsers.filter(u => !isAdminUser(u));

    const stats = {
      totalUsers: nonAdminUsers.length,
      newSignups7d: nonAdminUsers.filter(u => new Date(u.created_at) >= daysAgo(7)).length,
      newSignups30d: nonAdminUsers.filter(u => new Date(u.created_at) >= daysAgo(30)).length,
      activeLastLogin7d: nonAdminUsers.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= daysAgo(7)).length,
      activeLastLogin30d: nonAdminUsers.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= daysAgo(30)).length,
      neverLoggedIn: nonAdminUsers.filter(u => !u.last_sign_in_at).length,
      subscribedCount: nonAdminUsers.filter(isSubscribed).length,
      trialActiveCount: nonAdminUsers.filter(u => !isSubscribed(u) && isTrialActive(u)).length,
      trialExpiredCount: nonAdminUsers.filter(u => !isSubscribed(u) && !isTrialActive(u)).length,
      recentSignups: nonAdminUsers
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 25)
        .map(u => ({
          email: u.email,
          name: u.user_metadata?.name || null,
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at || null,
          subscribed: isSubscribed(u),
          trialActive: isTrialActive(u),
        })),
      // Signups per day for the last 14 days, for a simple trend view
      signupsByDay: Array.from({ length: 14 }).map((_, i) => {
        const dayStart = new Date(daysAgo(13 - i).toDateString());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        const count = nonAdminUsers.filter(u => {
          const c = new Date(u.created_at);
          return c >= dayStart && c < dayEnd;
        }).length;
        return { date: dayStart.toISOString().slice(0, 10), count };
      }),
    };

    res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
}
