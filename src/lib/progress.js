// Local storage based progress tracking (upgrades to Supabase when connected)

const STORAGE_KEY = 'scholarprep_progress';

export const getProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultProgress();
  } catch {
    return getDefaultProgress();
  }
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

export const saveTestResult = (subject, yearLevel, correct, total, questions) => {
  const progress = getProgress();
  const session = {
    id: Date.now(),
    subject,
    yearLevel,
    correct,
    total,
    score: Math.round((correct / total) * 100),
    date: new Date().toISOString(),
    questions: questions || []
  };

  progress.sessions.unshift(session);
  if (progress.sessions.length > 100) progress.sessions = progress.sessions.slice(0, 100);

  if (!progress.subjectStats[subject]) {
    progress.subjectStats[subject] = { attempts: 0, totalCorrect: 0, totalQuestions: 0, topics: {} };
  }
  progress.subjectStats[subject].attempts += 1;
  progress.subjectStats[subject].totalCorrect += correct;
  progress.subjectStats[subject].totalQuestions += total;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return session;
};

export const saveWritingResult = (yearLevel, type, score, maxScore, feedback) => {
  const progress = getProgress();
  const session = {
    id: Date.now(),
    subject: 'writing',
    yearLevel,
    type,
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    date: new Date().toISOString(),
    feedback
  };

  progress.sessions.unshift(session);
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return session;
};

export const getSubjectAverage = (subject) => {
  const progress = getProgress();
  const stats = progress.subjectStats[subject];
  if (!stats || stats.totalQuestions === 0) return null;
  if (subject === 'writing') {
    if (stats.maxScore === 0) return null;
    return Math.round((stats.totalScore / stats.maxScore) * 100);
  }
  return Math.round((stats.totalCorrect / stats.totalQuestions) * 100);
};

export const getRecentSessions = (limit = 10) => {
  const progress = getProgress();
  return progress.sessions.slice(0, limit);
};

export const getWeeklyStats = () => {
  const progress = getProgress();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weekly = progress.sessions.filter(s => new Date(s.date) > oneWeekAgo);
  return {
    testsCompleted: weekly.length,
    avgScore: weekly.length > 0
      ? Math.round(weekly.reduce((sum, s) => sum + (s.score || s.percentage || 0), 0) / weekly.length)
      : 0,
    timeSpent: weekly.length * 15 // estimate 15 min per test
  };
};

export const clearProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
};
