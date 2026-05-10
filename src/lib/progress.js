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

// ── Topic score helpers ───────────────────────────────────────────────────────

// Extract per-topic correct/total from a questions array
const extractTopicScores = (questions, selected) => {
  const topicMap = {};
  questions.forEach((q, i) => {
    const topic = q.topic;
    if (!topic) return;
    if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0 };
    topicMap[topic].total += 1;
    if (selected && selected[i] === q.correct) topicMap[topic].correct += 1;
    else if (!selected) {
      // If no selected map (simulated exam finish), count all as attempted
      topicMap[topic].correct += 0;
    }
  });
  return topicMap;
};

// Upsert topic scores to Supabase (increment existing counts)
const saveTopicScores = async (userId, subject, topicMap) => {
  if (!userId || !topicMap || Object.keys(topicMap).length === 0) return;
  try {
    for (const [topicKey, scores] of Object.entries(topicMap)) {
      // Try to get existing row
      const { data: existing } = await supabase
        .from('topic_scores')
        .select('id, correct, total')
        .eq('user_id', userId)
        .eq('subject', subject)
        .eq('topic_key', topicKey)
        .single();

      if (existing) {
        // Update — increment counts
        await supabase
          .from('topic_scores')
          .update({
            correct: existing.correct + scores.correct,
            total: existing.total + scores.total,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Insert new
        await supabase
          .from('topic_scores')
          .insert({
            user_id: userId,
            subject,
            topic_key: topicKey,
            correct: scores.correct,
            total: scores.total,
            updated_at: new Date().toISOString(),
          });
      }
    }
  } catch (e) {
    console.error('saveTopicScores error:', e);
  }
};

// ── One-time migration: localStorage → Supabase ───────────────────────────────

export const migrateLocalToSupabase = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const alreadyMigrated = localStorage.getItem(MIGRATED_KEY);
    if (alreadyMigrated) return;

    const local = getLocalProgress();
    if (!local.sessions || local.sessions.length === 0) {
      localStorage.setItem(MIGRATED_KEY, 'true');
      return;
    }

    console.log(`Migrating ${local.sessions.length} sessions to Supabase...`);

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

    const { error } = await supabase.from('progress_sessions').insert(rows);
    if (error) { console.error('Migration error:', error); return; }

    localStorage.setItem(MIGRATED_KEY, 'true');
    localStorage.removeItem(STORAGE_KEY);
    console.log('Migration complete.');
  } catch (e) {
    console.error('Migration failed:', e);
  }
};

// ── Save test result ──────────────────────────────────────────────────────────

export const saveTestResult = async (subject, yearLevel, correct, total, questions, selected) => {
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
      // Save session
      await supabase.from('progress_sessions').insert({
        user_id: user.id,
        subject,
        year_level: yearLevel,
        correct,
        total,
        score: session.score,
        questions: JSON.stringify(questions || []),
        date: session.date,
      });

      // Save per-topic scores if questions have topic tags
      if (questions && questions.length > 0 && questions[0]?.topic) {
        const topicMap = extractTopicScores(questions, selected);
        await saveTopicScores(user.id, subject, topicMap);
      }
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
      await supabase.from('progress_sessions').insert({
        user_id: user.id,
        subject: 'writing',
        year_level: yearLevel,
        type,
        score,
        percentage: session.percentage,
        feedback: JSON.stringify(feedback || {}),
        date: session.date,
      });

      // Save writing criteria as topic scores
      if (feedback?.criteria) {
        const topicKeyMap = {
          'Ideas and content': 'ideas',
          'Structure and organisation': 'structure',
          'Language and vocabulary': 'language',
          'Sentence structure': 'sentences',
          'Punctuation and spelling': 'punctuation',
        };
        const topicMap = {};
        feedback.criteria.forEach(c => {
          const key = topicKeyMap[c.name];
          if (key) topicMap[key] = { correct: c.score, total: c.maxScore };
        });
        await saveTopicScores(user.id, 'writing', topicMap);
      }
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

// ── Get all sessions ──────────────────────────────────────────────────────────

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

      if (error) return getLocalProgress().sessions;

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
    return getLocalProgress().sessions;
  }
};

// ── Get topic scores for a subject ───────────────────────────────────────────

export const getTopicScoresForSubject = async (subject) => {
  try {
    const user = await getCurrentUser();
    if (!user) return {};

    const { data, error } = await supabase
      .from('topic_scores')
      .select('topic_key, correct, total')
      .eq('user_id', user.id)
      .eq('subject', subject);

    if (error || !data) return {};

    const result = {};
    data.forEach(row => {
      if (row.total > 0) {
        result[row.topic_key] = Math.round((row.correct / row.total) * 100);
      }
    });
    return result;
  } catch (e) {
    console.error('getTopicScoresForSubject error:', e);
    return {};
  }
};

// ── Public API ────────────────────────────────────────────────────────────────

export const getProgress = async () => {
  const sessions = await getAllSessions();
  const progress = getDefaultProgress();
  progress.sessions = sessions;

  sessions.forEach(s => {
    const subj = s.subject;
    if (subj === 'writing') {
      if (!progress.subjectStats.writing) {
        progress.subjectStats.writing = { attempts: 0, totalScore: 0, maxScore: 0, submissions: [] };
      }
      progress.subjectStats.writing.attempts += 1;
      progress.subjectStats.writing.totalScore += (s.score || 0);
      progress.subjectStats.writing.maxScore += (s.maxScore || 25);
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
        .select('correct, total, score, percentage')
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