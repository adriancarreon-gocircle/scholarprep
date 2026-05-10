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

const schoolLevel = (yearLevel) => yearLevel <= 6 ? 'primary school' : 'secondary school';

export const generateMathsQuestions = async (yearLevel, count) => {
  const system = `You are an expert Australian ${schoolLevel(yearLevel)} mathematics exam writer for scholarship and selective entry tests (ACER, AAST, Edutest, NAPLAN). Create challenging multiple-choice maths questions in the exact style of these exams. Always respond with ONLY valid JSON, no other text.`;
  const user = `Generate ${count} mathematics multiple-choice questions for Year ${yearLevel} Australian ${schoolLevel(yearLevel)} scholarship and selective entry exam. Style: real-world word problems involving money, time, distance, fractions, percentages, geometry, averages, order of operations. Difficulty must be appropriate for Year ${yearLevel}. Each question has exactly 4 options (A,B,C,D), one correct answer, a concise explanation, and a topic tag.

TOPIC TAGS — assign exactly one of these to each question:
- "number" — number operations, addition, subtraction, multiplication, division, averages, order of operations
- "fractions" — fractions, decimals, mixed numbers
- "percentages" — percentages, ratios, proportions
- "geometry" — shapes, area, perimeter, angles, 2D/3D figures
- "measurement" — time, money, length, mass, volume, temperature, conversion
- "wordproblems" — multi-step word problems combining multiple operations

EXPLANATION RULES — follow these exactly:
- State the answer in 1-2 sentences maximum
- Show the key calculation step(s) directly
- Never second-guess or re-check your own working
- Be direct and confident — just state the method and the result

Return ONLY this JSON: {"questions":[{"id":1,"question":"text","options":{"A":"opt","B":"opt","C":"opt","D":"opt"},"correct":"A","explanation":"explanation","topic":"number"}]}`;
  const raw = await callClaude(system, user);
  const parsed = JSON.parse(raw);
  return parsed.questions;
};

export const generateReadingQuestions = async (yearLevel, count) => {
  const system = `You are an expert Australian ${schoolLevel(yearLevel)} English exam writer for scholarship and selective entry tests (ACER, AAST, Edutest, NAPLAN). Create reading comprehension passages and questions in the exact style of these exams. Always respond with ONLY valid JSON, no other text.`;
  const user = `Generate a reading comprehension test for Year ${yearLevel} Australian ${schoolLevel(yearLevel)} scholarship and selective entry exam. Create an interesting passage (${yearLevel <= 6 ? '150-300' : '250-450'} words, Australian context where possible) at a difficulty appropriate for Year ${yearLevel}, then ${count} multiple-choice questions testing literal comprehension, inference, vocabulary, main idea, and author's purpose.

TOPIC TAGS — assign exactly one of these to each question:
- "literal" — directly stated facts from the passage
- "inference" — reading between the lines, implied meaning
- "vocabulary" — word meaning, synonyms, context clues
- "mainidea" — main idea, theme, summary
- "purpose" — author's purpose, tone, perspective
- "texttype" — text structure, features, genre

EXPLANATION RULES — follow these exactly:
- State why the correct answer is right in 1-2 sentences maximum
- Reference the specific part of the passage that supports the answer
- Be direct and confident

Return ONLY this JSON: {"passage":{"title":"title","text":"passage text with paragraph breaks"},"questions":[{"id":1,"question":"text","options":{"A":"opt","B":"opt","C":"opt","D":"opt"},"correct":"A","explanation":"explanation","topic":"literal"}]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

export const generateGeneralAbilityQuestions = async (yearLevel, count) => {
  const system = `You are an expert Australian ${schoolLevel(yearLevel)} general ability exam writer for scholarship and selective entry tests (ACER, AAST, Edutest, NAPLAN). Create verbal and non-verbal reasoning questions. Always respond with ONLY valid JSON, no other text.`;
  const user = `Generate ${count} general ability multiple-choice questions for Year ${yearLevel} Australian ${schoolLevel(yearLevel)} scholarship and selective entry exam. Mix these types: verbal analogies, number sequences, letter patterns, odd one out, logic problems, spatial reasoning. Difficulty must be appropriate for Year ${yearLevel}. Each has exactly 4 options (A,B,C,D), one correct answer, a concise explanation, and a topic tag.

TOPIC TAGS — assign exactly one of these to each question:
- "analogies" — verbal analogies, word relationships
- "sequences" — number sequences, patterns in numbers
- "letters" — letter patterns, alphabet sequences
- "oddoneout" — odd one out, which does not belong
- "logic" — logic problems, deductive reasoning, coding problems
- "spatial" — spatial reasoning, visual patterns, rotating shapes

EXPLANATION RULES — follow these exactly:
- State the pattern or rule, then confirm the answer in 1-2 sentences maximum
- Never second-guess or re-check your own reasoning
- Be direct and confident

Return ONLY this JSON: {"questions":[{"id":1,"question":"text","options":{"A":"opt","B":"opt","C":"opt","D":"opt"},"correct":"A","explanation":"explanation","topic":"analogies"}]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw).questions;
};

export const generateWritingPrompt = async (type, yearLevel) => {
  const system = `You are an Australian ${schoolLevel(yearLevel)} writing exam designer for scholarship and selective entry tests. Always respond with ONLY valid JSON, no other text.`;
  const user = `Generate a ${type} writing prompt for Year ${yearLevel} Australian ${schoolLevel(yearLevel)} scholarship and selective entry exam. Return ONLY this JSON: {"prompt":"the full writing prompt","type":"${type}","time":25,"criteria":["Ideas and content","Structure and organisation","Language and vocabulary","Sentence structure","Punctuation and spelling"]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

export const assessWriting = async (studentText, prompt, type, yearLevel) => {
  const system = `You are an expert Australian ${schoolLevel(yearLevel)} writing assessor for scholarship and selective entry exams. Assess Year ${yearLevel} student writing with detailed constructive feedback. Always respond with ONLY valid JSON, no other text.`;
  const user = `Assess this Year ${yearLevel} student ${type} writing for a scholarship and selective entry exam.\n\nPrompt: "${prompt}"\n\nStudent response: "${studentText}"\n\nScore each criterion out of 5: Ideas and content, Structure and organisation, Language and vocabulary, Sentence structure, Punctuation and spelling. Return ONLY this JSON: {"criteria":[{"name":"Ideas and content","score":4,"maxScore":5,"feedback":"feedback"},{"name":"Structure and organisation","score":3,"maxScore":5,"feedback":"feedback"},{"name":"Language and vocabulary","score":4,"maxScore":5,"feedback":"feedback"},{"name":"Sentence structure","score":3,"maxScore":5,"feedback":"feedback"},{"name":"Punctuation and spelling","score":4,"maxScore":5,"feedback":"feedback"}],"totalScore":18,"maxTotal":25,"overallFeedback":"overall comment","improvements":["improvement 1","improvement 2","improvement 3"]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

// Word count targets by time allocation
const wordCountForMins = (mins) => {
  if (mins <= 15) return 200;
  if (mins <= 20) return 280;
  if (mins <= 30) return 400;
  return 550;
};

export const generateIdealAnswer = async (prompt, type, yearLevel, timeMins) => {
  const wordCount = wordCountForMins(timeMins);
  const system = `You are an expert Australian ${schoolLevel(yearLevel)} writing teacher and examiner for scholarship and selective entry tests (ACER, AAST, Edutest, NAPLAN). You write model answers demonstrating what a top-scoring Year ${yearLevel} student response looks like. Always respond with ONLY valid JSON, no other text.`;
  const user = `Write an ideal ${type} response for a Year ${yearLevel} Australian scholarship exam writing task.

Writing prompt: "${prompt}"

This is a model answer for a ${timeMins}-minute writing task (approximately ${wordCount} words).

Requirements:
- Write at the level of an excellent Year ${yearLevel} student — not a university student, but the very best Year ${yearLevel} writing
- Aim for approximately ${wordCount} words
- For narrative: strong opening hook, vivid description, clear structure, satisfying resolution
- For persuasive: clear thesis, 2-3 well-reasoned arguments with evidence/examples, strong conclusion
- Use varied sentence structure and rich vocabulary appropriate for Year ${yearLevel}
- Score worthy on all 5 criteria: Ideas & content, Structure, Language, Sentence structure, Punctuation

Return ONLY this JSON: {"title":"a title for the response (required for narrative, optional for persuasive)","text":"the full ideal response as a single string with paragraph breaks using \\n\\n","wordCount":${wordCount},"highlights":["key strength 1 — what makes this response excellent","key strength 2","key strength 3","key strength 4"]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

export const generatePDFQuestions = async (subject, count, yearLevel) => {
  if (subject === 'mathematics') return await generateMathsQuestions(yearLevel, count);
  if (subject === 'reading') return await generateReadingQuestions(yearLevel, count);
  if (subject === 'general') return await generateGeneralAbilityQuestions(yearLevel, count);
  return [];
};