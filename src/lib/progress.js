// Progress tracking — saves to Supabase for logged-in users, localStorage for demo mode
import { supabase } from './supabase';

const STORAGE_KEY = 'scholarprep_progress';
const MIGRATED_KEY = 'scholarprep_migrated';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

const getDefaultProgress = () => ({
  sessions: [],
  subjectStats: {
    mathematics: { attempts: 0, totalCorrect: 0, totalQuestions: 0, topics: {} },
    reading: { attempts: 0, totalCorrect: 0, totalQuestions: 0, topics: {} },
    general: { attempts: 0, totalCorrect: 0, totalQuestions: 0, topics: {} },
    writing: { attempts: 0, totalScore: 0, maxScore: 0, submissions: [] }
  }
});

// ── localStorage fallback (demo mode / offline) ───────────────────────────────

const getLocalProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultProgress();
  } catch {
    return getDefaultProgress();
  }
};

const saveLocalProgress = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// ── One-time migration: localStorage → Supabase ───────────────────────────────

export const migrateLocalToSupabase = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    // Only migrate once per device
    const alreadyMigrated = localStorage.getItem(MIGRATED_KEY);
    if (alreadyMigrated) return;

    const local = getLocalProgress();
    if (!local.sessions || local.sessions.length === 0) {
      // Nothing to migrate — mark as done so we don't check again
      localStorage.setItem(MIGRATED_KEY, 'true');
      return;
    }

    console.log(`Migrating ${local.sessions.length} sessions to Supabase...`);

    // Upload each local session to Supabase
    const rows = local.sessions.map(s => ({
      user_id: user.id,
      subject: s.subject || 'mathematics',
      year_level: s.yearLevel || 5,
      correct: s.correct ?? null,
      total: s.total ?? null,
      score: s.score ?? null,
      percentage: s.percentage ?? null,
      type: s.type ?? null,
      feedback: s.feedback ? JSON.stringify(s.feedback) : null,
      questions: s.questions ? JSON.stringify(s.questions) : null,
      date: s.date || new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('progress_sessions')
      .insert(rows);

    if (error) {
      console.error('Migration error:', error);
      return;
    }

    // Mark migration done and clear localStorage sessions
    localStorage.setItem(MIGRATED_KEY, 'true');
    localStorage.removeItem(STORAGE_KEY);
    console.log('Migration complete — localStorage data moved to Supabase.');
  } catch (e) {
    console.error('Migration failed:', e);
  }
};

// ── Save test result ──────────────────────────────────────────────────────────

export const saveTestResult = async (subject, yearLevel, correct, total, questions) => {
  const session = {
    subject,
    yearLevel,
    correct,
    total,
    score: Math.round((correct / total) * 100),
    date: new Date().toISOString(),
    questions: questions || []
  };

  try {
    const user = await getCurrentUser();

    if (user) {
      // Save to Supabase
      const { error } = await supabase.from('progress_sessions').insert({
        user_id: user.id,
        subject,
        year_level: yearLevel,
        correct,
        total,
        score: session.score,
        questions: JSON.stringify(questions || []),
        date: session.date,
      });
      if (error) console.error('Supabase save error:', error);
    } else {
      // Fallback to localStorage for demo mode
      const progress = getLocalProgress();
      progress.sessions.unshift({ id: Date.now(), ...session });
      if (progress.sessions.length > 100) progress.sessions = progress.sessions.slice(0, 100);
      if (!progress.subjectStats[subject]) {
        progress.subjectStats[subject] = { attempts: 0, totalCorrect: 0, totalQuestions: 0, topics: {} };
      }
      progress.subjectStats[subject].attempts += 1;
      progress.subjectStats[subject].totalCorrect += correct;
      progress.subjectStats[subject].totalQuestions += total;
      saveLocalProgress(progress);
    }
  } catch (e) {
    console.error('saveTestResult error:', e);
  }

  return session;
};

// ── Save writing result ───────────────────────────────────────────────────────

export const saveWritingResult = async (yearLevel, type, score, maxScore, feedback) => {
  const session = {
    subject: 'writing',
    yearLevel,
    type,
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    date: new Date().toISOString(),
    feedback
  };

  try {
    const user = await getCurrentUser();

    if (user) {
      const { error } = await supabase.from('progress_sessions').insert({
        user_id: user.id,
        subject: 'writing',
        year_level: yearLevel,
        type,
        score,
        percentage: session.percentage,
        feedback: JSON.stringify(feedback || {}),
        date: session.date,
      });
      if (error) console.error('Supabase writing save error:', error);
    } else {
      const progress = getLocalProgress();
      progress.sessions.unshift({ id: Date.now(), ...session });
      if (!progress.subjectStats.writing) {
        progress.subjectStats.writing = { attempts: 0, totalScore: 0, maxScore: 0, submissions: [] };
      }
      progress.subjectStats.writing.attempts += 1;
      progress.subjectStats.writing.totalScore += score;
      progress.subjectStats.writing.maxScore += maxScore;
      progress.subjectStats.writing.submissions.unshift(session);
      if (progress.subjectStats.writing.submissions.length > 20) {
        progress.subjectStats.writing.submissions = progress.subjectStats.writing.submissions.slice(0, 20);
      }
      saveLocalProgress(progress);
    }
  } catch (e) {
    console.error('saveWritingResult error:', e);
  }

  return session;
};

// ── Get all sessions (Supabase or localStorage) ───────────────────────────────

const getAllSessions = async () => {
  try {
    const user = await getCurrentUser();

    if (user) {
      const { data, error } = await supabase
        .from('progress_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Supabase fetch error:', error);
        return getLocalProgress().sessions;
      }

      // Normalise Supabase rows to match local session shape
      return (data || []).map(row => ({
        id: row.id,
        subject: row.subject,
        yearLevel: row.year_level,
        correct: row.correct,
        total: row.total,
        score: row.score,
        percentage: row.percentage,
        type: row.type,
        feedback: row.feedback ? (typeof row.feedback === 'string' ? JSON.parse(row.feedback) : row.feedback) : null,
        questions: row.questions ? (typeof row.questions === 'string' ? JSON.parse(row.questions) : row.questions) : [],
        date: row.date,
      }));
    } else {
      return getLocalProgress().sessions;
    }
  } catch (e) {
    console.error('getAllSessions error:', e);
    return getLocalProgress().sessions;
  }
};

// ── Public API ────────────────────────────────────────────────────────────────

export const getProgress = async () => {
  const sessions = await getAllSessions();
  const progress = getDefaultProgress();
  progress.sessions = sessions;

  // Rebuild subjectStats from sessions
  sessions.forEach(s => {
    const subj = s.subject;
    if (subj === 'writing') {
      if (!progress.subjectStats.writing) {
        progress.subjectStats.writing = { attempts: 0, totalScore: 0, maxScore: 0, submissions: [] };
      }
      progress.subjectStats.writing.attempts += 1;
      progress.subjectStats.writing.totalScore += (s.score || 0);
      progress.subjectStats.writing.maxScore += (s.maxScore || 25);
      if (progress.subjectStats.writing.submissions.length < 20) {
        progress.subjectStats.writing.submissions.push(s);
      }
    } else {
      if (!progress.subjectStats[subj]) {
        progress.subjectStats[subj] = { attempts: 0, totalCorrect: 0, totalQuestions: 0, topics: {} };
      }
      progress.subjectStats[subj].attempts += 1;
      progress.subjectStats[subj].totalCorrect += (s.correct || 0);
      progress.subjectStats[subj].totalQuestions += (s.total || 0);
    }
  });

  return progress;
};

export const getSubjectAverage = async (subject) => {
  try {
    const user = await getCurrentUser();

    if (user) {
      const { data, error } = await supabase
        .from('progress_sessions')
        .select('correct, total, score, percentage, subject')
        .eq('user_id', user.id)
        .eq('subject', subject);

      if (error || !data || data.length === 0) return null;

      if (subject === 'writing') {
        const valid = data.filter(r => r.percentage != null);
        if (valid.length === 0) return null;
        return Math.round(valid.reduce((sum, r) => sum + r.percentage, 0) / valid.length);
      }

      const valid = data.filter(r => r.total > 0);
      if (valid.length === 0) return null;
      const totalCorrect = valid.reduce((sum, r) => sum + (r.correct || 0), 0);
      const totalQs = valid.reduce((sum, r) => sum + (r.total || 0), 0);
      return Math.round((totalCorrect / totalQs) * 100);
    } else {
      // Fallback for demo mode
      const progress = getLocalProgress();
      const stats = progress.subjectStats[subject];
      if (!stats) return null;
      if (subject === 'writing') {
        if (!stats.maxScore) return null;
        return Math.round((stats.totalScore / stats.maxScore) * 100);
      }
      if (!stats.totalQuestions) return null;
      return Math.round((stats.totalCorrect / stats.totalQuestions) * 100);
    }
  } catch (e) {
    console.error('getSubjectAverage error:', e);
    return null;
  }
};

export const getRecentSessions = async (limit = 10) => {
  try {
    const user = await getCurrentUser();

    if (user) {
      const { data, error } = await supabase
        .from('progress_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) return getLocalProgress().sessions.slice(0, limit);

      return (data || []).map(row => ({
        id: row.id,
        subject: row.subject,
        yearLevel: row.year_level,
        correct: row.correct,
        total: row.total,
        score: row.score,
        percentage: row.percentage,
        type: row.type,
        date: row.date,
      }));
    } else {
      return getLocalProgress().sessions.slice(0, limit);
    }
  } catch (e) {
    return getLocalProgress().sessions.slice(0, limit);
  }
};

export const getWeeklyStats = async () => {
  try {
    const user = await getCurrentUser();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    if (user) {
      const { data, error } = await supabase
        .from('progress_sessions')
        .select('score, percentage, date')
        .eq('user_id', user.id)
        .gte('date', oneWeekAgo.toISOString());

      if (error || !data) return { testsCompleted: 0, avgScore: 0, timeSpent: 0 };

      const scores = data.map(s => s.score || s.percentage || 0).filter(s => s > 0);
      return {
        testsCompleted: data.length,
        avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        timeSpent: data.length * 15,
      };
    } else {
      const progress = getLocalProgress();
      const weekly = progress.sessions.filter(s => new Date(s.date) > oneWeekAgo);
      return {
        testsCompleted: weekly.length,
        avgScore: weekly.length > 0
          ? Math.round(weekly.reduce((sum, s) => sum + (s.score || s.percentage || 0), 0) / weekly.length)
          : 0,
        timeSpent: weekly.length * 15,
      };
    }
  } catch (e) {
    return { testsCompleted: 0, avgScore: 0, timeSpent: 0 };
  }
};

export const clearProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(MIGRATED_KEY);
};