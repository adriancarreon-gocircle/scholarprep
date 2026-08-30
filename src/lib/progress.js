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

// Normalise topic key: lowercase, trim, collapse spaces — so AI-generated topics
// match the progress config keys regardless of casing/spacing differences
const normaliseTopicKey = (topic) => {
  if (!topic) return null;
  return topic.trim().toLowerCase().replace(/\s+/g, '');
};

// Extract per-topic correct/total from a questions array
const extractTopicScores = (questions, selected) => {
  const topicMap = {};
  questions.forEach((q, i) => {
    const topic = normaliseTopicKey(q.topic);
    if (!topic) return;
    if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0 };
    topicMap[topic].total += 1;
    if (selected && selected[i] === q.correct) topicMap[topic].correct += 1;
    else if (!selected) {
      topicMap[topic].correct += 0;
    }
  });
  return topicMap;
};

// Normalise question type names — only fix spacing/capitalisation/dash variants
// Do NOT aggressively remap — preserves distinct types like "Word problem" vs "Fractions"
const normaliseQType = (qtype, topic) => {
  if (!qtype) return null;
  return qtype
    .trim()
    .replace(/\s*[-–—]\s*/g, ' - ')  // standardise dashes
    .replace(/\s+/g, ' ')             // collapse multiple spaces
    .replace(/^\w/, c => c.toUpperCase()); // capitalise first letter
};

// Extract per-question-type correct/total: { 'topicKey::normalisedQType': {correct,total} }
const extractQuestionTypeScores = (questions, selected) => {
  const qtMap = {};
  questions.forEach((q, i) => {
    const topic = normaliseTopicKey(q.topic);
    const rawQtype = q.questionType;
    if (!topic || !rawQtype) return;
    const qtype = normaliseQType(rawQtype, topic);
    if (!qtype) return;
    const key = `${topic}::${qtype}`;
    if (!qtMap[key]) qtMap[key] = { correct: 0, total: 0, topic, questionType: qtype };
    qtMap[key].total += 1;
    if (selected && selected[i] === q.correct) qtMap[key].correct += 1;
  });
  return qtMap;
};

// Save per-topic per-session scores to history table (for trend line charts)
const saveTopicScoreHistory = async (userId, subject, topicMap, sessionDate) => {
  if (!userId || !topicMap || Object.keys(topicMap).length === 0) return;
  try {
    const rows = Object.entries(topicMap).map(([topicKey, scores]) => ({
      user_id: userId,
      subject,
      topic_key: topicKey,
      correct: scores.correct,
      total: scores.total,
      score_pct: scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0,
      session_date: sessionDate || new Date().toISOString(),
    }));
    await supabase.from('topic_score_history').insert(rows);
  } catch (e) {
    console.error('saveTopicScoreHistory error:', e);
  }
};

// Save question type scores to Supabase (question_type_scores table)
const saveQuestionTypeScores = async (userId, subject, qtMap) => {
  if (!userId || !qtMap || Object.keys(qtMap).length === 0) return;
  try {
    for (const [key, scores] of Object.entries(qtMap)) {
      const { topic, questionType, correct, total } = scores;
      const { data: existing } = await supabase
        .from('question_type_scores')
        .select('id, correct, total')
        .eq('user_id', userId)
        .eq('subject', subject)
        .eq('topic_key', topic)
        .eq('question_type', questionType)
        .single();
      if (existing) {
        await supabase.from('question_type_scores').update({
          correct: existing.correct + correct,
          total: existing.total + total,
          updated_at: new Date().toISOString(),
        }).eq('id', existing.id);
      } else {
        await supabase.from('question_type_scores').insert({
          user_id: userId, subject, topic_key: topic,
          question_type: questionType, correct, total,
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch (e) {
    console.error('saveQuestionTypeScores error:', e);
  }
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

export const saveTestResult = async (subject, yearLevel, correct, total, questions, selected, sessionDate) => {
  const session = {
    subject,
    yearLevel,
    correct,
    total,
    score: Math.round((correct / total) * 100),
    date: sessionDate || new Date().toISOString(),
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

        // Save per-session topic history for accurate trend charts
        await saveTopicScoreHistory(user.id, subject, topicMap, session.date);

        // Also save per-question-type scores
        const qtMap = extractQuestionTypeScores(questions, selected);
        await saveQuestionTypeScores(user.id, subject, qtMap);
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

// ── Update test result after disputes ────────────────────────────────────────
// Applies score corrections for questions that were marked "correct" via the
// Disagree-with-answer dispute panel AFTER the test was originally saved.
// Only counts questions where the original selected answer was WRONG and a
// dispute now marks it as correct (i.e. a net +1 to "correct" for that question).
//
// disputeFlags: { [questionIndex]: true } — indices (within `questions`) that
// should now count as correct. Pass only NEWLY-resolved disputes (not ones
// already applied in a previous Update Results click) to avoid double-counting.
export const updateTestResult = async (subject, yearLevel, questions, originalSelected, disputeFlags, sessionDate) => {
  try {
    const user = await getCurrentUser();
    if (!user || !sessionDate) return null;

    // Only questions that were originally WRONG and are now disputed-correct count as a delta
    const flippedIndices = [];
    (questions || []).forEach((q, i) => {
      if (disputeFlags?.[i] && originalSelected?.[i] !== q.correct) flippedIndices.push(i);
    });
    if (flippedIndices.length === 0) return null;
    const deltaCorrect = flippedIndices.length;

    // 1. Update the progress_sessions row for this test
    const { data: sessionRow } = await supabase
      .from('progress_sessions')
      .select('id, correct, total')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('date', sessionDate)
      .single();
    if (sessionRow) {
      const newCorrect = sessionRow.correct + deltaCorrect;
      const newScore = sessionRow.total > 0 ? Math.round((newCorrect / sessionRow.total) * 100) : 0;
      await supabase.from('progress_sessions').update({ correct: newCorrect, score: newScore }).eq('id', sessionRow.id);
    }

    // 2. Topic score deltas (topic_scores + topic_score_history)
    const topicDelta = {};
    flippedIndices.forEach(i => {
      const topic = normaliseTopicKey(questions[i].topic);
      if (!topic) return;
      topicDelta[topic] = (topicDelta[topic] || 0) + 1;
    });
    for (const [topicKey, delta] of Object.entries(topicDelta)) {
      const { data: ts } = await supabase
        .from('topic_scores')
        .select('id, correct, total')
        .eq('user_id', user.id).eq('subject', subject).eq('topic_key', topicKey).single();
      if (ts) {
        await supabase.from('topic_scores')
          .update({ correct: ts.correct + delta, updated_at: new Date().toISOString() })
          .eq('id', ts.id);
      }

      const { data: tsh } = await supabase
        .from('topic_score_history')
        .select('id, correct, total')
        .eq('user_id', user.id).eq('subject', subject).eq('topic_key', topicKey).eq('session_date', sessionDate).single();
      if (tsh) {
        const newCorrect = tsh.correct + delta;
        const newPct = tsh.total > 0 ? Math.round((newCorrect / tsh.total) * 100) : 0;
        await supabase.from('topic_score_history')
          .update({ correct: newCorrect, score_pct: newPct })
          .eq('id', tsh.id);
      }
    }

    // 3. Question type score deltas (question_type_scores)
    const qtDelta = {};
    flippedIndices.forEach(i => {
      const q = questions[i];
      const topic = normaliseTopicKey(q.topic);
      const qtype = normaliseQType(q.questionType, topic);
      if (!topic || !qtype) return;
      const key = `${topic}::${qtype}`;
      if (!qtDelta[key]) qtDelta[key] = { topic, questionType: qtype, delta: 0 };
      qtDelta[key].delta += 1;
    });
    for (const { topic, questionType, delta } of Object.values(qtDelta)) {
      const { data: qts } = await supabase
        .from('question_type_scores')
        .select('id, correct, total')
        .eq('user_id', user.id).eq('subject', subject).eq('topic_key', topic).eq('question_type', questionType).single();
      if (qts) {
        await supabase.from('question_type_scores')
          .update({ correct: qts.correct + delta, updated_at: new Date().toISOString() })
          .eq('id', qts.id);
      }
    }

    return { appliedCount: deltaCorrect };
  } catch (e) {
    console.error('updateTestResult error:', e);
    return null;
  }
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
        total: 25, // writing is out of 25
        correct: score, // store raw score for consistency
        percentage: session.percentage,
        feedback: JSON.stringify(feedback || {}),
        date: session.date,
      });

      // Save writing criteria as topic scores
      if (feedback?.criteria) {
        // Normalise criteria names from all writing paths
        const topicKeyMap = {
          // Typed writing — assessWriting (WritingPage)
          'Ideas and content': 'ideas',
          'Structure and organisation': 'structure',
          'Language and vocabulary': 'language',
          'Sentence structure': 'sentences',
          'Punctuation and spelling': 'punctuation',
          // Photo/handwriting — assessHandwritingPhoto (HandwritingFeedbackPage)
          'Ideas & Content': 'ideas',
          'Structure & Organisation': 'structure',
          'Language & Vocabulary': 'language',
          'Sentence Structure': 'sentences',
          'Spelling & Punctuation': 'punctuation',
          // Mixed case variants
          'Ideas & content': 'ideas',
          'Structure & organisation': 'structure',
          'Language & vocabulary': 'language',
          'Sentence & Structure': 'sentences',
          'Punctuation & Spelling': 'punctuation',
        };
        // Fuzzy fallback: match by first word of criteria name
        const fuzzyMap = {
          'ideas': 'ideas', 'structure': 'structure',
          'language': 'language', 'sentence': 'sentences',
          'punctuation': 'punctuation', 'spelling': 'punctuation',
        };
        const topicMap = {};
        feedback.criteria.forEach(c => {
          const key = topicKeyMap[c.name]
            || fuzzyMap[c.name?.toLowerCase().split(/[\s&]/)[0]];
          if (key) topicMap[key] = { correct: c.score, total: c.maxScore };
        });
        await saveTopicScores(user.id, 'writing', topicMap);
        // Also save per-session history for trend chart
        await saveTopicScoreHistory(user.id, 'writing', topicMap, session.date);
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
        // For writing, use percentage as the display score; for others use score
        score: row.subject === 'writing' ? (row.percentage || row.score || 0) : (row.score || 0),
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

// Get per-topic score history for trend charts: { topicKey: [{date, score, correct, total}] }
export const getTopicScoreHistory = async (subject) => {
  try {
    const user = await getCurrentUser();
    if (!user) return {};
    const { data, error } = await supabase
      .from('topic_score_history')
      .select('topic_key, score_pct, correct, total, session_date')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .order('session_date', { ascending: true });
    if (error || !data) return {};
    const result = {};
    data.forEach(row => {
      // Normalise topic key on read to match config keys
      const topicKey = row.topic_key ? row.topic_key.trim().toLowerCase().replace(/\s+/g, '') : row.topic_key;
      if (!result[topicKey]) result[topicKey] = [];
      result[topicKey].push({
        date: row.session_date,
        score: row.score_pct,
        correct: row.correct,
        total: row.total,
      });
    });
    return result;
  } catch (e) {
    console.error('getTopicScoreHistory error:', e);
    return {};
  }
};

// Get question type scores for a subject: { topicKey: { questionType: { correct, total, pct } } }
export const getQuestionTypeScoresForSubject = async (subject) => {
  try {
    const user = await getCurrentUser();
    if (!user) return {};
    const { data, error } = await supabase
      .from('question_type_scores')
      .select('topic_key, question_type, correct, total')
      .eq('user_id', user.id)
      .eq('subject', subject);
    if (error || !data) return {};
    const result = {};
    // Normalise both topic_key and question_type on read
    data.forEach(row => {
      // Normalise topic key: lowercase, no spaces — matches normaliseTopicKey() used on save
      const topicKey = row.topic_key ? row.topic_key.trim().toLowerCase().replace(/\s+/g, '') : row.topic_key;
      if (!result[topicKey]) result[topicKey] = {};
      const normQtype = normaliseQType(row.question_type, topicKey);
      const key = normQtype || row.question_type;
      if (result[topicKey][key]) {
        result[topicKey][key].correct += row.correct;
        result[topicKey][key].total += row.total;
        result[topicKey][key].pct = result[topicKey][key].total > 0
          ? Math.round((result[topicKey][key].correct / result[topicKey][key].total) * 100)
          : 0;
      } else {
        result[topicKey][key] = {
          correct: row.correct,
          total: row.total,
          pct: row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0,
        };
      }
    });
    return result;
  } catch (e) {
    console.error('getQuestionTypeScoresForSubject error:', e);
    return {};
  }
};

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
      const topicKey = row.topic_key ? row.topic_key.trim().toLowerCase().replace(/\s+/g, '') : row.topic_key;
      if (row.total > 0) {
        result[topicKey] = Math.round((row.correct / row.total) * 100);
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
        progress.subjectStats.writing = { attempts: 0, totalPercentage: 0 };
      }
      progress.subjectStats.writing.attempts += 1;
      progress.subjectStats.writing.totalPercentage += (s.percentage || s.score || 0);
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
        // Use totalPercentage (sum of % scores) if available, else fall back to totalScore/maxScore
        if (stats.totalPercentage != null && stats.attempts > 0) {
          return Math.round(stats.totalPercentage / stats.attempts);
        }
        if (stats.maxScore) return Math.round((stats.totalScore / stats.maxScore) * 100);
        return null;
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
        // For writing sessions use percentage (0-100); for others use score
        score: row.subject === 'writing' ? (row.percentage || row.score || 0) : (row.score || 0),
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


// ── Custom Builder Tests (synced to Supabase) ────────────────────────────────
export const syncCustomBuilderTests = async (tests) => {
  // Save the full array as a single JSON blob per user (simpler than per-row)
  try {
    const user = await getCurrentUser();
    if (!user) return;
    const { data: existing } = await supabase
      .from('custom_tests')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (existing) {
      await supabase.from('custom_tests').update({
        tests: tests,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('custom_tests').insert({
        user_id: user.id,
        tests: tests,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.error('syncCustomBuilderTests error:', e);
  }
};

export const loadCustomBuilderTests = async () => {
  try {
    const user = await getCurrentUser();
    if (user) {
      const { data } = await supabase
        .from('custom_tests')
        .select('tests')
        .eq('user_id', user.id)
        .single();
      if (data?.tests && Array.isArray(data.tests)) {
        // Merge with localStorage — Supabase wins
        localStorage.setItem('scholarprep_custom_tests', JSON.stringify(data.tests));
        return data.tests;
      }
    }
  } catch (e) {
    console.error('loadCustomBuilderTests error:', e);
  }
  // Fallback to localStorage
  try {
    return JSON.parse(localStorage.getItem('scholarprep_custom_tests') || '[]');
  } catch {
    return [];
  }
};

// ── Custom Question Templates ─────────────────────────────────────────────────
// Save a custom question template to Supabase (and localStorage as fallback)
//
// IMPORTANT FAILURE MODE this function used to hide completely: if the
// Supabase insert/update throws (most commonly because the `row` payload
// references a column that doesn't exist yet in custom_question_templates —
// e.g. a migration like the focus_guidance one below was never run), the
// old code silently swallowed it, still returned a "successful"-looking
// template with a synthetic `local_...` id, and the caller (and the admin)
// had no way to know the save never actually reached Supabase. That
// template would then look fine for the rest of the session, but the NEXT
// getCustomTemplates() call (e.g. after a page refresh) would overwrite
// localStorage with the real Supabase list — which never contained it —
// and it would vanish for good. This is now surfaced instead of hidden:
// template._unsynced is set to true whenever a logged-in save didn't reach
// Supabase, so a caller (see handleSaveTemplate in AdminPaperBuilderPage)
// can warn the admin immediately rather than let it silently disappear
// later.
export const saveCustomTemplate = async (template) => {
  // Captured before any id reassignment below — if this save recovers from
  // a previous local-only save (e.g. retried after fixing a missing-column
  // migration) and gets a real id back, this lets us remove the stale
  // local_... localStorage entry instead of leaving it behind as a
  // permanent duplicate alongside the newly-synced real one.
  const priorLocalId = template.id && String(template.id).startsWith('local_') ? template.id : null;
  const row = {
    name: template.name,
    subject: template.subject,
    question_type: template.questionType || null,
    example_question: template.exampleQuestion,
    template_description: template.templateDescription || null,
    focus_guidance: template.focusGuidance || null,
    passage: template.passage || null,
    is_as_is: template.isAsIs || false,
    questions: template.questions,
    question_count: template.questions.length,
    updated_at: new Date().toISOString(),
  };

  template._unsynced = false;
  try {
    const user = await getCurrentUser();
    if (user) {
      if (template.id && !String(template.id).startsWith('local_')) {
        // Update existing
        const { error } = await supabase.from('custom_question_templates')
          .update(row)
          .eq('id', template.id)
          .eq('user_id', user.id);
        if (error) { console.error('saveCustomTemplate update error (check custom_question_templates columns match the app — see the *_add_*.sql migration files):', error); template._unsynced = true; }
      } else {
        // Insert new (also covers "was local-only, now retrying" — a
        // previous local_... id is never sent as a real Supabase id)
        const { data, error } = await supabase.from('custom_question_templates')
          .insert({ ...row, user_id: user.id })
          .select('id')
          .single();
        if (error) { console.error('saveCustomTemplate insert error (check custom_question_templates columns match the app — see the *_add_*.sql migration files):', error); template._unsynced = true; }
        if (data?.id) template.id = data.id;
      }
    }
  } catch (e) {
    console.error('saveCustomTemplate error:', e);
    template._unsynced = true;
  }

  // A failed/offline save never got a real id back above — assign the local
  // fallback id to `template` itself (not just to the localStorage copy), so
  // the object this function returns is immediately usable in the same
  // session (e.g. selecting this template for a paper right after creating
  // it) instead of carrying an id of `undefined` until the next refresh.
  if (!template.id) template.id = `local_${Date.now()}`;

  // Always save to localStorage as fallback
  try {
    let stored = JSON.parse(localStorage.getItem('sp_custom_templates') || '[]');
    // Recovered from local-only to a real synced id this time — drop the
    // old local_... copy so it doesn't linger as a duplicate.
    if (priorLocalId && priorLocalId !== template.id) {
      stored = stored.filter(t => t.id !== priorLocalId);
    }
    const existing = stored.findIndex(t => t.id === template.id);
    if (existing >= 0) stored[existing] = template;
    else stored.unshift(template);
    localStorage.setItem('sp_custom_templates', JSON.stringify(stored.slice(0, 50)));
  } catch { }

  return template;
};

// Load all custom question templates for the current user. Merges in any
// locally-saved-but-never-synced templates (id starts with "local_", or
// flagged _unsynced by saveCustomTemplate above) instead of letting a fresh
// Supabase fetch blindly overwrite them — that overwrite is exactly what
// made a just-created template "disappear on refresh" whenever its save had
// silently failed against Supabase.
export const getCustomTemplates = async () => {
  let localOnly = [];
  try {
    const stored = JSON.parse(localStorage.getItem('sp_custom_templates') || '[]');
    localOnly = stored.filter(t => t && (String(t.id || '').startsWith('local_') || t._unsynced));
  } catch { }

  try {
    const user = await getCurrentUser();
    if (user) {
      const { data, error } = await supabase
        .from('custom_question_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) {
        console.error('getCustomTemplates error:', error);
      } else if (data) {
        const mapped = data.map(row => ({
          id: row.id,
          name: row.name,
          subject: row.subject,
          questionType: row.question_type,
          exampleQuestion: row.example_question,
          templateDescription: row.template_description,
          focusGuidance: row.focus_guidance || null,
          passage: row.passage || null,
          isAsIs: row.is_as_is || false,
          questions: row.questions,
          createdAt: row.created_at,
        }));
        // Local-only entries go first (most-recently-created, unsynced —
        // the admin should notice them) followed by the confirmed Supabase
        // set. A template that successfully synced on a later save already
        // has a real id in `mapped`, so it won't double up here.
        const merged = [...localOnly, ...mapped];
        localStorage.setItem('sp_custom_templates', JSON.stringify(merged));
        return merged;
      }
    }
  } catch (e) {
    console.error('getCustomTemplates error:', e);
  }
  // Fallback to localStorage (offline / logged out / Supabase read failed)
  try {
    const stored = JSON.parse(localStorage.getItem('sp_custom_templates') || '[]');
    return stored;
  } catch {
    return [];
  }
};

// Delete a custom question template
export const deleteCustomTemplate = async (id) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      await supabase.from('custom_question_templates').delete()
        .eq('id', id).eq('user_id', user.id);
    }
  } catch (e) {
    console.error('deleteCustomTemplate error:', e);
  }
  try {
    const stored = JSON.parse(localStorage.getItem('sp_custom_templates') || '[]');
    localStorage.setItem('sp_custom_templates', JSON.stringify(stored.filter(t => t.id !== id)));
  } catch { }
};

// ── Admin Paper Tests (saved printable papers — Admin Paper Builder) ─────────
// Same insert-vs-update-by-id shape as saveCustomTemplate. Admin-only feature,
// so no localStorage fallback — without a real Supabase user there is nothing
// meaningful to save or load.
export const savePaperTest = async (paper) => {
  const row = {
    title: paper.title?.trim() || 'Untitled Paper',
    year_level: paper.yearLevel,
    questions: paper.questions,
    passage_groups: paper.passageGroups || [],
    questions_per_passage: paper.questionsPerPassage || null,
    question_count: (paper.questions || []).length,
    selection: paper.selection || {},
    passages: paper.passages || null,
    updated_at: new Date().toISOString(),
  };

  try {
    const user = await getCurrentUser();
    if (!user) return paper;
    if (paper.id) {
      // Update existing
      await supabase.from('admin_paper_tests')
        .update(row)
        .eq('id', paper.id)
        .eq('user_id', user.id);
    } else {
      // Insert new
      const { data } = await supabase.from('admin_paper_tests')
        .insert({ ...row, user_id: user.id })
        .select('id, created_at')
        .single();
      if (data?.id) { paper.id = data.id; paper.createdAt = data.created_at; }
    }
  } catch (e) {
    console.error('savePaperTest error:', e);
  }

  return paper;
};

// Load all saved paper tests for the current user
export const getPaperTests = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('admin_paper_tests')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error || !data) return [];
    return data.map(row => ({
      id: row.id,
      title: row.title,
      yearLevel: row.year_level,
      questions: row.questions,
      passageGroups: row.passage_groups || [],
      questionsPerPassage: row.questions_per_passage,
      selection: row.selection || {},
      passages: row.passages,
      questionCount: row.question_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (e) {
    console.error('getPaperTests error:', e);
    return [];
  }
};

// Delete a saved paper test
export const deletePaperTest = async (id) => {
  try {
    const user = await getCurrentUser();
    if (!user) return;
    await supabase.from('admin_paper_tests').delete()
      .eq('id', id).eq('user_id', user.id);
  } catch (e) {
    console.error('deletePaperTest error:', e);
  }
};

// ── Shared question pool (Phase 2 — cross-user reuse of generated questions) ──
// Reads go straight through Supabase (RLS allows any authenticated user to
// select from question_pool). Writes are NOT done from the client at all —
// question_pool has no client write policy, so refillPoolBucket always goes
// through the /api/pool-refill serverless endpoint, which validates the
// batch and inserts with the service-role key. Every function here is
// best-effort: a failure just means the caller falls back to (or stays on)
// live AI generation for that request, never a broken test.

// Fetch up to `count` pooled questions for one bucket. Pulls a window of
// candidates ordered by served_count (least-served rows first, so the pool
// spreads load across its content instead of always handing back whatever
// happens to sort first), shuffles WITHIN each same-served-count group so
// we don't always serve the same row first, and — new — filters out any
// row whose fingerprint is in `excludeFingerprints` (the caller's
// already-seen list for this session/paper), so a bucket that's been
// served to this same person recently doesn't just repeat itself. If
// filtering would leave nothing (small bucket, everything's been seen),
// falls back to the unfiltered set rather than forcing a live-generation
// call for what's still a perfectly fine served-again question.
export const getPooledQuestions = async (subject, topicKey, questionTypeKey, yearLevel, count, excludeFingerprints = []) => {
  try {
    let query = supabase.from('question_pool').select('id, question, fingerprint, served_count')
      .eq('subject', subject).eq('topic_key', topicKey).eq('year_level', yearLevel)
      .order('served_count', { ascending: true });
    query = questionTypeKey ? query.eq('question_type_key', questionTypeKey) : query.is('question_type_key', null);
    const { data, error } = await query.limit(200);
    if (error || !data || data.length === 0) return [];
    const excludeSet = new Set(excludeFingerprints);
    const filtered = excludeSet.size > 0 ? data.filter(row => !excludeSet.has(row.fingerprint)) : data;
    const pool = filtered.length > 0 ? filtered : data;
    // Shuffle within each served_count tier (rows are already ordered by
    // served_count ascending) so ties don't always resolve the same way.
    const result = [];
    let i = 0;
    while (i < pool.length && result.length < count) {
      let j = i;
      while (j < pool.length && pool[j].served_count === pool[i].served_count) j++;
      const tier = pool.slice(i, j).sort(() => Math.random() - 0.5);
      result.push(...tier);
      i = j;
    }
    return result.slice(0, count).map(row => ({ ...row.question, _poolId: row.id }));
  } catch (e) {
    console.error('getPooledQuestions error:', e);
    return [];
  }
};

// Best-effort: tell the pool a batch of rows were just served to someone, so
// future getPooledQuestions calls bias away from them (via the served_count
// ordering above) toward less-frequently-served content. Fire-and-forget —
// never awaited by callers before showing the user their test/paper.
export const markPoolQuestionsServed = async (poolIds) => {
  try {
    const ids = (poolIds || []).filter(Boolean);
    if (ids.length === 0) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return; // not logged in — skip silently
    await fetch('/api/pool-mark-served', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authToken: session.access_token, poolIds: ids }),
    });
  } catch (e) {
    console.error('markPoolQuestionsServed error:', e);
  }
};

// How many questions are currently sitting in one bucket — used to decide
// whether it's worth topping the pool up in the background.
export const getPoolBucketDepth = async (subject, topicKey, questionTypeKey, yearLevel) => {
  try {
    let query = supabase.from('question_pool').select('id', { count: 'exact', head: true })
      .eq('subject', subject).eq('topic_key', topicKey).eq('year_level', yearLevel);
    query = questionTypeKey ? query.eq('question_type_key', questionTypeKey) : query.is('question_type_key', null);
    const { count } = await query;
    return count || 0;
  } catch (e) {
    return 0;
  }
};

// Contribute freshly AI/locally-generated questions to a bucket, via the
// server-mediated endpoint. Fire-and-forget by design — the caller should
// never await this before showing the user their test; it's purely to help
// the NEXT person who hits this bucket.
export const refillPoolBucket = async (subject, topicKey, questionTypeKey, yearLevel, questions) => {
  try {
    if (!questions || questions.length === 0) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return; // not logged in — skip silently, generation itself is unaffected
    await fetch('/api/pool-refill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authToken: session.access_token, subject, topicKey, questionTypeKey, yearLevel, questions }),
    });
  } catch (e) {
    console.error('refillPoolBucket error:', e);
  }
};