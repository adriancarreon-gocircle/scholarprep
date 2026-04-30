const CLAUDE_API_URL = '/api/claude';

const callClaude = async (systemPrompt, userPrompt) => {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt })
  });
  const data = await response.json();
  return data.text;
};

export const generateMathsQuestions = async (yearLevel, count) => {
  const system = `You are an expert Australian primary school mathematics exam writer for scholarship tests (ACER, AAST, Edutest). Create challenging multiple-choice maths questions in the exact style of these exams. Always respond with ONLY valid JSON, no other text.`;
  const user = `Generate ${count} mathematics multiple-choice questions for Year ${yearLevel} Australian primary school scholarship exam. Style: real-world word problems involving money, time, distance, fractions, percentages, geometry, averages, order of operations. Each question has exactly 4 options (A,B,C,D), one correct answer, and a clear explanation. Return ONLY this JSON: {"questions":[{"id":1,"question":"text","options":{"A":"opt","B":"opt","C":"opt","D":"opt"},"correct":"A","explanation":"explanation"}]}`;
  const raw = await callClaude(system, user);
  const parsed = JSON.parse(raw);
  return parsed.questions;
};

export const generateReadingQuestions = async (yearLevel, count) => {
  const system = `You are an expert Australian primary school English exam writer for scholarship tests. Create reading comprehension passages and questions in the exact style of ACER, AAST, Edutest exams. Always respond with ONLY valid JSON, no other text.`;
  const user = `Generate a reading comprehension test for Year ${yearLevel} Australian primary school scholarship exam. Create an interesting passage (150-300 words, Australian context where possible), then ${count} multiple-choice questions testing literal comprehension, inference, vocabulary, main idea, and author's purpose. Return ONLY this JSON: {"passage":{"title":"title","text":"passage text with paragraph breaks"},"questions":[{"id":1,"question":"text","options":{"A":"opt","B":"opt","C":"opt","D":"opt"},"correct":"A","explanation":"explanation"}]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

export const generateGeneralAbilityQuestions = async (yearLevel, count) => {
  const system = `You are an expert Australian primary school general ability exam writer for scholarship tests (ACER, AAST, Edutest). Create verbal and non-verbal reasoning questions. Always respond with ONLY valid JSON, no other text.`;
  const user = `Generate ${count} general ability multiple-choice questions for Year ${yearLevel} Australian primary school scholarship exam. Mix these types: verbal analogies, number sequences, letter patterns, odd one out, logic problems, word relationships, coding problems. Each has exactly 4 options (A,B,C,D), one correct answer, and a clear explanation. Return ONLY this JSON: {"questions":[{"id":1,"question":"text","options":{"A":"opt","B":"opt","C":"opt","D":"opt"},"correct":"A","explanation":"explanation"}]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw).questions;
};

export const generateWritingPrompt = async (type, yearLevel) => {
  const system = `You are an Australian primary school writing exam designer. Always respond with ONLY valid JSON, no other text.`;
  const user = `Generate a ${type} writing prompt for Year ${yearLevel} Australian primary school scholarship exam. Return ONLY this JSON: {"prompt":"the full writing prompt","type":"${type}","time":25,"criteria":["Ideas and content","Structure and organisation","Language and vocabulary","Sentence structure","Punctuation and spelling"]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

export const assessWriting = async (studentText, prompt, type, yearLevel) => {
  const system = `You are an expert Australian primary school writing assessor for scholarship exams. Assess Year ${yearLevel} student writing with detailed constructive feedback. Always respond with ONLY valid JSON, no other text.`;
  const user = `Assess this Year ${yearLevel} student ${type} writing for a scholarship exam.\n\nPrompt: "${prompt}"\n\nStudent response: "${studentText}"\n\nScore each criterion out of 5: Ideas and content, Structure and organisation, Language and vocabulary, Sentence structure, Punctuation and spelling. Return ONLY this JSON: {"criteria":[{"name":"Ideas and content","score":4,"maxScore":5,"feedback":"feedback"},{"name":"Structure and organisation","score":3,"maxScore":5,"feedback":"feedback"},{"name":"Language and vocabulary","score":4,"maxScore":5,"feedback":"feedback"},{"name":"Sentence structure","score":3,"maxScore":5,"feedback":"feedback"},{"name":"Punctuation and spelling","score":4,"maxScore":5,"feedback":"feedback"}],"totalScore":18,"maxTotal":25,"overallFeedback":"overall comment","improvements":["improvement 1","improvement 2","improvement 3"]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

export const generatePDFQuestions = async (subject, count, yearLevel) => {
  if (subject === 'mathematics') return await generateMathsQuestions(yearLevel, count);
  if (subject === 'reading') return await generateReadingQuestions(yearLevel, count);
  if (subject === 'general') return await generateGeneralAbilityQuestions(yearLevel, count);
  return [];
};