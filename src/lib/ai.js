// Claude API integration for question generation and writing assessment

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const callClaude = async (systemPrompt, userPrompt) => {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });
  const data = await response.json();
  const text = data.content?.map(c => c.text || '').join('') || '';
  // Strip markdown fences if present
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
};

// ─── MATHEMATICS ────────────────────────────────────────────────────────────

export const generateMathsQuestions = async (yearLevel, count) => {
  const system = `You are an expert Australian primary school mathematics exam writer for scholarship tests (ACER, AAST, Edutest).
You create challenging, engaging multiple-choice maths questions in the exact style of these exams.
Always respond with ONLY valid JSON, no other text.`;

  const topics = {
    1: 'addition, subtraction to 20, basic shapes, counting, simple patterns',
    2: 'addition/subtraction to 100, simple multiplication, basic fractions, time to hour',
    3: 'multiplication tables, division, fractions, measurement, time, money',
    4: 'multi-digit operations, fractions/decimals, area/perimeter, time problems, word problems',
    5: 'fractions/decimals/percentages, ratios, algebra basics, geometry, time/distance/speed, averages',
    6: 'complex percentages, ratios, algebra, geometry/measurement, data interpretation, multi-step word problems'
  };

  const user = `Generate ${count} mathematics multiple-choice questions for Year ${yearLevel} Australian primary school scholarship exam.

Topics appropriate for Year ${yearLevel}: ${topics[yearLevel] || topics[5]}

Style guide (match these real examples):
- "If 6 lollies cost $1.50, how much will 5 lollies cost?" (proportional reasoning)
- "Adam's car travels at 70 km per hour. How far from 9am to 3:30pm?" (time/distance)
- "A TV's regular price was $650. If you get 5% discount paying cash, how much do you pay?" (percentages)
- "Jenny scored 45, 46 and 50 out of 50. What was her average?" (averages)
- "(42-8) ÷ 2 × (3-1) = ?" (order of operations)
- "A box of a dozen pigeon eggs weighs 50 grams. What is the closest average egg weight?" (estimation)
- Questions involving tables of data, geometric figures, or missing number problems

Each question must have exactly 4 options (A, B, C, D), one correct answer, and a clear explanation.

Return ONLY this JSON structure:
{
  "questions": [
    {
      "id": 1,
      "question": "question text here",
      "options": {"A": "option", "B": "option", "C": "option", "D": "option"},
      "correct": "A",
      "explanation": "Step-by-step explanation of how to solve this"
    }
  ]
}`;

  const raw = await callClaude(system, user);
  const parsed = JSON.parse(raw);
  return parsed.questions;
};

// ─── READING COMPREHENSION ───────────────────────────────────────────────────

export const generateReadingQuestions = async (yearLevel, count) => {
  const system = `You are an expert Australian primary school English exam writer for scholarship tests (ACER, AAST, Edutest).
You create reading comprehension passages and questions in the exact style of these exams.
Always respond with ONLY valid JSON, no other text.`;

  const passageTypes = [
    'factual/informational article (like about ants, Thomas Edison, or a city)',
    'narrative story (like a fable or adventure)',
    'poem with 3-4 stanzas',
    'tourist brochure or travel description',
    'biography or personal narrative'
  ];
  const pType = passageTypes[Math.floor(Math.random() * passageTypes.length)];

  const user = `Generate a reading comprehension test for Year ${yearLevel} Australian primary school scholarship exam.

Create a ${pType} passage, then ${count} multiple-choice questions about it.

Passage style guide: 150-300 words, age-appropriate for Year ${yearLevel}, interesting and engaging. 
Australian context where possible (Sydney, Melbourne, Australian animals/history).

Question types to include (mix of these):
- Literal comprehension ("What does X do?")
- Inference ("Why did the character feel...?")
- Vocabulary in context ("The word '___' in the passage means...")
- Author's purpose ("Why did the author write this?")
- Text type identification ("This passage is best described as...")
- Main idea ("What is the main idea of this passage?")
- Sequencing ("Which of the following lists events in order?")

Style match these real questions:
- "Which of the following best describes how the boy felt when he saw his name on the list?"
- "The underlined word 'self-educated' in paragraph two means..."
- "From what type of book are we most likely to read this passage from?"
- "What can you do in Hyde Park?" (literal)
- "Occasionally in the last line of this passage means..."

Return ONLY this JSON:
{
  "passage": {
    "title": "passage title",
    "text": "full passage text here with paragraph breaks using \\n\\n"
  },
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "options": {"A": "option", "B": "option", "C": "option", "D": "option"},
      "correct": "A",
      "explanation": "Why this answer is correct, referencing the passage"
    }
  ]
}`;

  const raw = await callClaude(system, user);
  const parsed = JSON.parse(raw);
  return parsed;
};

// ─── GENERAL ABILITY ─────────────────────────────────────────────────────────

export const generateGeneralAbilityQuestions = async (yearLevel, count) => {
  const system = `You are an expert Australian primary school general ability exam writer for scholarship tests (ACER, AAST, Edutest).
You create verbal and non-verbal reasoning questions in the exact style of these exams.
Always respond with ONLY valid JSON, no other text.`;

  const user = `Generate ${count} general ability multiple-choice questions for Year ${yearLevel} Australian primary school scholarship exam.

Mix these question types:
1. Verbal analogies: "Hot is to Cold as Day is to ___" (A: Sun B: Night C: Warm D: Sky)
2. Odd one out: "Which word does NOT belong: apple, banana, carrot, orange?"
3. Word relationships: "Choose the word most similar in meaning to 'enormous'"
4. Number sequences: "2, 4, 8, 16, ___ What comes next?"
5. Letter patterns: "A, C, E, G, ___ What comes next?"
6. Logic problems: "All dogs are animals. Rex is a dog. Therefore Rex is ___"
7. Spatial reasoning (described in words): "A shape has 4 equal sides and 4 right angles. What is it?"
8. Coding: "If CAT = 3-1-20, what does DOG equal?"
9. Verbal reasoning: "Find the word that can follow all three: fire___, book___, story___"
10. Classification: "Which group does a whale belong to?"

Each question must have exactly 4 options (A, B, C, D), one correct answer, and a clear explanation.

Return ONLY this JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "options": {"A": "option", "B": "option", "C": "option", "D": "option"},
      "correct": "A",
      "explanation": "Clear explanation of the reasoning"
    }
  ]
}`;

  const raw = await callClaude(system, user);
  const parsed = JSON.parse(raw);
  return parsed.questions;
};

// ─── WRITING ASSESSMENT ──────────────────────────────────────────────────────

export const generateWritingPrompt = async (type, yearLevel) => {
  const system = `You are an Australian primary school writing exam designer. Generate engaging writing prompts for Year ${yearLevel} students.
Always respond with ONLY valid JSON, no other text.`;

  const user = `Generate a ${type} writing prompt for Year ${yearLevel} Australian primary school scholarship exam.

${type === 'narrative' ? `
Narrative prompts should:
- Be imaginative and engaging for children
- Often start with a scenario or first sentence
- Examples: "Write a story about a day when everything went wrong — but turned out better than expected."
  "You discover a hidden door in your school. Write a story about what happens next."
  "Use this picture as the base for your writing..." (describe an evocative scene)
` : `
Persuasive prompts should:
- Ask students to argue a clear position
- Be relevant to children's lives
- Examples: "Should students be allowed to use mobile phones at school? Write a persuasive letter to your principal."
  "Write a persuasive essay arguing whether homework should be banned."
  "Your local council wants to build a car park on your suburb's last park. Write to convince them not to."
`}

Return ONLY this JSON:
{
  "prompt": "The full writing prompt text",
  "type": "${type}",
  "time": 25,
  "criteria": ["Ideas and content", "Structure and organisation", "Language and vocabulary", "Sentence structure", "Punctuation and spelling"]
}`;

  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

export const assessWriting = async (studentText, prompt, type, yearLevel) => {
  const system = `You are an expert Australian primary school writing assessor for scholarship exams (ACER, AAST, Edutest).
You assess Year ${yearLevel} student writing with detailed, constructive feedback.
Always respond with ONLY valid JSON, no other text.`;

  const user = `Assess the following Year ${yearLevel} student ${type} writing response for a scholarship exam.

Writing prompt: "${prompt}"

Student response:
"${studentText}"

Assess against these 5 criteria (score each out of 5):
1. Ideas and content (originality, relevance, development)
2. Structure and organisation (clear beginning/middle/end, paragraphing, logical flow)
3. Language and vocabulary (word choice, descriptive language, variety)
4. Sentence structure (variety of sentences, complexity, fluency)
5. Punctuation and spelling (accuracy, appropriate use)

Provide:
- Specific, encouraging feedback for each criterion
- An overall written comment (3-4 sentences) that is warm and constructive
- Specific suggestions for improvement with examples
- A total score out of 25

Return ONLY this JSON:
{
  "criteria": [
    {
      "name": "Ideas and content",
      "score": 4,
      "maxScore": 5,
      "feedback": "Specific feedback here"
    },
    {
      "name": "Structure and organisation",
      "score": 3,
      "maxScore": 5,
      "feedback": "Specific feedback here"
    },
    {
      "name": "Language and vocabulary",
      "score": 4,
      "maxScore": 5,
      "feedback": "Specific feedback here"
    },
    {
      "name": "Sentence structure",
      "score": 3,
      "maxScore": 5,
      "feedback": "Specific feedback here"
    },
    {
      "name": "Punctuation and spelling",
      "score": 4,
      "maxScore": 5,
      "feedback": "Specific feedback here"
    }
  ],
  "totalScore": 18,
  "maxTotal": 25,
  "overallFeedback": "Warm, constructive overall comment here",
  "improvements": ["Specific improvement suggestion 1", "Specific improvement suggestion 2", "Specific improvement suggestion 3"]
}`;

  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

// ─── PDF TEST GENERATION ─────────────────────────────────────────────────────

export const generatePDFQuestions = async (subject, count, yearLevel) => {
  if (subject === 'mathematics') return await generateMathsQuestions(yearLevel, count);
  if (subject === 'reading') {
    const data = await generateReadingQuestions(yearLevel, count);
    return { passage: data.passage, questions: data.questions };
  }
  if (subject === 'general') return await generateGeneralAbilityQuestions(yearLevel, count);
  return [];
};
