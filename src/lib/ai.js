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

// ── Maths question blueprint by year level ────────────────────────────────────
// Based on ScholarPrep Question Bank document (Levels 1-6 from spreadsheet, 7-11 extended)

const getMathsBlueprint = (yearLevel) => {
  if (yearLevel <= 2) return `
QUESTION TYPES FOR YEAR ${yearLevel} (Level 1-2):
Draw questions from these types — vary the mix each session:

Numbers & Counting:
- Even or odd numbers (e.g. "Is 45 even or odd?")
- Write numbers in word form up to 3 digits (e.g. "Write 565 in words")
- Write word form as numbers (e.g. "Three hundred and forty eight in number form is?")
- Arrange numbers smallest to largest (e.g. "Arrange 373, 678, 145 from smallest to largest")
- Largest/smallest number from given digits (e.g. "What is the largest number you can make with 3,8,4,5?")
- Greater than / less than (e.g. "Which number is greater, 114 or 259?", "Complete: 36 _ 56 with > or <")
- Which is the smallest/largest from a list of 3 numbers

Addition:
- Add 1-digit numbers (e.g. "3 + 2 = ?")
- Add 2-digit numbers (e.g. "14 + 42 = ?")
- Worded addition: "Rachel has 10 oranges and Thomas has 12 oranges. How many do they have together?"
- Worded addition: "120 kids went to the shop on Monday. 145 more kids went on Tuesday. How many more went on Tuesday?"

Subtraction:
- Subtract 1-digit from 1-digit (e.g. "5 - 2 = ?")
- Subtract 1-digit from 2-digit (e.g. "50 - 2 = ?")
- Worded subtraction: "Max bought 20 balls. If 4 were blue, how many were red?"
- Worded subtraction: "Matthew had 30 lollies. He gave 5 to William. How many left?"

Shapes:
- Name 2D shapes (square, circle, rectangle, triangle, oval, octagon, pentagon, hexagon, diamond)
- How many sides does a [shape] have?
- How many corners does a [shape] have?

IMPORTANT: All questions must be in text form only (no images needed). For shape questions, name the shape in the question text itself.`;

  if (yearLevel <= 4) return `
QUESTION TYPES FOR YEAR ${yearLevel} (Level 3-4):
Draw questions from these types — vary the mix each session:

Numbers & Counting:
- Write numbers in word form up to 5 digits (e.g. "Write 50,434 in words")
- Place value (e.g. "What does the 3 represent in 3,770?" — answer: 3 thousands)
- Rounding to nearest 10, 100, 1000 (e.g. "Round 789 to the nearest hundred")
- Order/compare 4-digit and 5-digit numbers
- Greater than/less than with 4-5 digit numbers

Addition & Subtraction:
- Add 3-digit numbers (e.g. "104 + 402 = ?")
- Add mixed digit sizes (e.g. "10 + 203 = ?", "3 + 403 = ?")
- Add 4-digit numbers (e.g. "3362 + 4203 = ?")
- Subtract 3-digit numbers (e.g. "378 - 204 = ?")
- Subtract with zeros (e.g. "100 - 5", "200 - 25")
- Subtract 4-digit numbers (e.g. "5362 - 4203 = ?")
- Worded problems: "Group A made 364 sandcastles. Group B made 25 more than Group A. How many did Group B make?"
- Worded problems using "difference" and "sum"

Multiplication:
- Times tables 2x, 3x, 5x, 10x (e.g. "3 x 5 = ?")
- Multiply 2-digit by 1-digit (e.g. "23 x 4 = ?")
- Worded: "There are 5 bags with 12 apples each. How many apples in total?"

Division:
- Simple division facts (e.g. "15 ÷ 3 = ?")
- Division with remainders (e.g. "17 ÷ 3 = ?")
- Worded: "24 students split into groups of 4. How many groups?"

Fractions:
- What fraction is shaded? (described in text: e.g. "A pizza cut into 4 equal slices, 1 is eaten. What fraction remains?")
- Simple equivalent fractions (e.g. "1/2 = ?/4")
- Compare fractions (e.g. "Which is larger: 1/3 or 1/4?")

Shapes:
- 3D shape properties (e.g. "How many edges does a cube have?", "How many faces does a cylinder have?")
- 3D shape names: cylinder, cone, cube, sphere, square pyramid, triangular pyramid, rectangular prism
- Symmetry (e.g. "A shape has 2 lines of symmetry. What shape could it be?")

Measurement & Time:
- Reading time (e.g. "What time is it if the hour hand is on 3 and minute hand on 12?")
- Time calculations (e.g. "A lesson starts at 9:15am and goes for 45 minutes. When does it end?")
- Length comparisons (e.g. "Convert 3km to metres")
- Money: making change (e.g. "You buy a book for $3.50 and pay $5. What change do you get?")

Factors:
- Is X a factor of Y? (e.g. "Is 3 a factor of 27?")
- Find factors of a number (e.g. "What is a factor of 20?")
- Common factors (e.g. "What is a common factor of 30 and 20?")`;

  if (yearLevel <= 6) return `
QUESTION TYPES FOR YEAR ${yearLevel} (Level 5-6):
Draw questions from these types — vary the mix each session:

Numbers:
- Write numbers in word form up to 10 million
- Place value for 6-7 digit numbers (e.g. "What does the 3 represent in 3,129,400?")
- Rounding large numbers (e.g. "Round 17,895 to the nearest thousand")
- Worded number problems: "Sam has 4 cards: 3, 7, 6, 2. What is the biggest odd number he can form?"
- Complex ordering: "What is 63 more than 8 tens and 42 ones?"

Multiplication & Division:
- Times tables up to 12x12
- Multiply 3-digit by 2-digit (e.g. "234 x 12 = ?")
- Long division (e.g. "756 ÷ 12 = ?")
- Worded multi-step: "A car travels at 70 km/h for 3 hours. How far does it travel?"

Fractions, Decimals & Percentages:
- Write fractions as decimals (e.g. "Write 1 3/4 as a decimal")
- Write decimals as fractions (e.g. "Write 3.75 as a mixed fraction")
- Compare decimals (e.g. "Which is larger: 45.421 or 45.4215?")
- Add/subtract decimals (e.g. "12.50 - 6.5 = ?")
- Multiply decimals (e.g. "0.25 x 4 = ?")
- Percentage of a number (e.g. "What is 50% of $40?")
- Write fraction as percentage (e.g. "Write 25/100 as a percentage")
- Worded percentage: "A computer costs $500. It is on 25% sale. What is the new price?"

Rates:
- Speed/distance/time (e.g. "A car drove for 3 hours at 60 km/h. How far did it travel?")
- Pay rate (e.g. "A person earns $25 per hour and works 8 hours. How much do they earn?")

Area & Perimeter:
- Rectangle perimeter (e.g. "A rectangle has length 12cm and width 4cm. What is the perimeter?")
- Find missing side from perimeter (e.g. "A rectangle has perimeter 40 and length 15. What is the width?")
- Rectangle area (e.g. "A rectangle is 12cm long and 4cm wide. What is the area?")

Averages:
- Mean average (e.g. "What is the average of 20, 42, 3, 14?")
- Worded average: "A class scored 40, 30, 20 and 55 out of 100. What is the average score?"

Factors & Multiples:
- Common multiples (e.g. "What is a common multiple of 21 and 3?")
- List factors of a number

Circles:
- Circumference using formula (e.g. "A circle has diameter 10cm. What is its circumference? Use π = 3.14")
- Diameter from circumference

Angles:
- Angles on a straight line (e.g. "One angle is 110°. What is the other angle on the straight line?")
- Angles in a right angle (e.g. "One angle is 35°. What is the other angle in the right angle?")
- Angles in a triangle (e.g. "A triangle has angles of 65° and 70°. What is the third angle?")`;

  // Years 7-11
  return `
QUESTION TYPES FOR YEAR ${yearLevel} (Level 7-11 — Secondary):
Draw questions from these types — vary the mix each session:

Algebra:
- Simplify expressions (e.g. "Simplify b + b + b", "Simplify 3x + 2x - x")
- Solve for x (e.g. "5x = 35, find x", "3x + 7 = 22, find x")
- Expand brackets (e.g. "Expand 3(y + 2)", "Expand 5x(y + 2)")
- Substitute values (e.g. "Find the value of 3y + 2 when y = 4")
- Write algebraic formulas (e.g. "Write 'a number plus 10' as an algebraic expression")
- Factorise expressions (e.g. "Factorise 6x + 9", Year 9+: "Factorise x² + 5x + 6")
${yearLevel >= 9 ? `- Quadratic equations (e.g. "Solve x² - 5x + 6 = 0")
- Simultaneous equations (e.g. "Solve: 2x + y = 10 and x - y = 2")` : ''}

Geometry & Angles:
- Angles in parallel lines (co-interior, alternate, corresponding)
- Angles in polygons (e.g. "What is the sum of interior angles of a pentagon?")
- Angles in isosceles triangles
- Angles in parallelograms and rhombuses
- Pythagoras theorem (e.g. "A right triangle has sides 3cm and 4cm. What is the hypotenuse?")
${yearLevel >= 9 ? `- Trigonometry: sin, cos, tan (e.g. "Find angle x in a right triangle with opposite 5 and hypotenuse 10")` : ''}

Area & Volume:
- Area of triangles (e.g. "A triangle has base 8cm and height 5cm. What is the area?")
- Area of compound shapes (e.g. combined rectangles and triangles)
- Volume of rectangular prisms (e.g. "A box is 5cm × 4cm × 3cm. What is its volume?")
- Circumference and area of circles
${yearLevel >= 9 ? `- Surface area of 3D shapes
- Volume of cylinders, cones and spheres` : ''}

Fractions, Decimals & Percentages:
- Complex percentage problems (e.g. "Archie invests $1000 at 10% per year. What is the total after 2 years?")
- Percentage increase/decrease
- Ratio and proportion (e.g. "Share $60 in the ratio 2:3")
- GST calculations (e.g. "A item costs $80 + 10% GST. What is the total price?")

Statistics & Data:
- Mean, median, mode, range from a data set
- Worded average problems
- Reading graphs (described in text: e.g. "A survey shows 40% prefer football, 35% prefer cricket, 25% prefer basketball. How many more prefer football than basketball if 200 students were surveyed?")

Rates & Proportion:
- Speed, distance, time calculations
- Unit rate problems
- Direct and inverse proportion

${yearLevel >= 9 ? `Advanced (Year 9-11):
- Standard form / scientific notation (e.g. "Write 0.000045 in scientific notation")
- Surds (e.g. "Simplify √48")
- Linear graphs (e.g. "What is the gradient of the line y = 3x + 2?")
- Probability (e.g. "A bag has 3 red and 5 blue balls. What is the probability of picking red?")` : ''}`;
};

// ── Generate Maths Questions ──────────────────────────────────────────────────

export const generateMathsQuestions = async (yearLevel, count) => {
  const blueprint = getMathsBlueprint(yearLevel);
  const system = `You are an expert Australian ${schoolLevel(yearLevel)} mathematics exam writer for scholarship and selective entry tests (ACER, AAST, Edutest, NAPLAN). You generate questions that closely match the style and types specified in the question bank blueprint. Always respond with ONLY valid JSON, no other text.`;

  const user = `Generate ${count} mathematics multiple-choice questions for Year ${yearLevel} Australian ${schoolLevel(yearLevel)} students.

${blueprint}

RULES:
- Use the question types above as your guide — generate fresh variations of these types
- Vary the mix of question types across the ${count} questions (don't repeat the same type more than 2-3 times)
- Difficulty must be appropriate for Year ${yearLevel}
- All questions must be answerable from text only (no images needed)
- Each question has exactly 4 options (A, B, C, D), one correct answer, a concise explanation, and a topic tag

TOPIC TAGS — assign exactly one to each question:
- "number" — counting, place value, ordering, rounding, even/odd
- "addition" — addition, worded addition
- "subtraction" — subtraction, worded subtraction
- "multiplication" — multiplication, times tables
- "division" — division, remainders
- "fractions" — fractions, equivalent fractions
- "decimals" — decimals, converting decimals
- "percentages" — percentages, percentage problems
- "geometry" — shapes, 2D, 3D, symmetry, angles
- "measurement" — length, area, perimeter, volume, time, money
- "algebra" — algebra, expressions, equations
- "statistics" — averages, mean, median, mode, data
- "wordproblems" — multi-step worded problems

EXPLANATION RULES:
- State the answer in 1-2 sentences maximum
- Show the key calculation step(s) directly
- Never second-guess or re-check — be direct and confident

Return ONLY this JSON: {"questions":[{"id":1,"question":"text","options":{"A":"opt","B":"opt","C":"opt","D":"opt"},"correct":"A","explanation":"explanation","topic":"number"}]}`;

  const raw = await callClaude(system, user);
  const parsed = JSON.parse(raw);
  return parsed.questions;
};

// ── Generate Reading Questions ────────────────────────────────────────────────

// ── Generate Reading Questions ────────────────────────────────────────────────

const READING_THEMES = [
  'Environment (e.g. climate change, wildlife conservation, ecosystems, pollution)',
  'Science (e.g. space exploration, the human body, inventions, experiments)',
  'Technology (e.g. robots, the internet, artificial intelligence, gadgets)',
  'Social Studies (e.g. communities, cultures, traditions, how society works)',
  'Poetry (a short poem with questions about meaning, imagery and language)',
  'History (e.g. ancient civilisations, historical events, famous people from the past)',
  'Fiction / Narrative (a short story with characters, setting, conflict and resolution)',
  'Geography (e.g. landforms, countries, weather patterns, natural wonders)',
  'Sports (e.g. an athlete biography, a sports event, sporting rules or history)',
  'Arts (e.g. music, painting, dance, theatre, a famous artist or performer)',
];

export const generateReadingQuestions = async (yearLevel, count) => {
  // Pick a random theme each call so passages always vary
  const theme = READING_THEMES[Math.floor(Math.random() * READING_THEMES.length)];

  const system = `You are an expert Australian ${schoolLevel(yearLevel)} English exam writer for scholarship and selective entry tests (ACER, AAST, Edutest, NAPLAN). Create reading comprehension passages and questions in the exact style of these exams. Always respond with ONLY valid JSON, no other text.`;
  const user = `Generate a reading comprehension test for Year ${yearLevel} Australian ${schoolLevel(yearLevel)} scholarship and selective entry exam.

THEME FOR THIS PASSAGE: ${theme}
You MUST write the passage on this specific theme. Do NOT default to common topics like the Great Barrier Reef, kangaroos or typical Australian wildlife unless the theme specifically calls for it.

Create an original, engaging passage (${yearLevel <= 6 ? '150-300' : '250-450'} words) on the theme above, written at a difficulty appropriate for Year ${yearLevel}. Then write ${count} multiple-choice questions testing a mix of question types.

TOPIC TAGS — assign exactly one of these to each question:
- "literal" — directly stated facts from the passage
- "inference" — reading between the lines, implied meaning
- "vocabulary" — word meaning, synonyms, context clues
- "mainidea" — main idea, theme, summary
- "purpose" — author's purpose, tone, perspective
- "texttype" — text structure, features, genre

EXPLANATION RULES:
- State why the correct answer is right in 1-2 sentences maximum
- Reference the specific part of the passage that supports the answer
- Be direct and confident

Return ONLY this JSON: {"passage":{"title":"title","text":"passage text with paragraph breaks using \\n\\n"},"questions":[{"id":1,"question":"text","options":{"A":"opt","B":"opt","C":"opt","D":"opt"},"correct":"A","explanation":"explanation","topic":"literal"}]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

// ── Generate General Ability Questions ────────────────────────────────────────

export const generateGeneralAbilityQuestions = async (yearLevel, count) => {
  const system = `You are an expert Australian ${schoolLevel(yearLevel)} general ability exam writer for scholarship and selective entry tests (ACER, AAST, Edutest, NAPLAN). Create verbal and non-verbal reasoning questions. Always respond with ONLY valid JSON, no other text.`;
  const user = `Generate ${count} general ability multiple-choice questions for Year ${yearLevel} Australian ${schoolLevel(yearLevel)} scholarship and selective entry exam.

QUESTION TYPES — use the following from the question bank:

Number Patterns (vary these):
- Count on by ones, twos, fives, tens, hundreds, thousands (e.g. "525, 526, 527, ___?")
- Count on by tens (e.g. "717, 727, 737, ___?")
- Count on by hundreds (e.g. "380, 480, 580, ___?")
- Fill in missing numbers (e.g. "436, 438, ___, 442, ___, 446")
- Complex patterns up to 100,000 (e.g. "30,800, 40,800, 50,800, ___?")
- Patterns that go up or down by different amounts

Verbal Reasoning (vary these):
- Word analogies (e.g. "Hot is to cold as day is to ___?")
- Odd one out from a list of words
- Word relationships (e.g. "Doctor is to hospital as teacher is to ___?")
- Letter patterns (e.g. "A, C, E, G, ___?")

Logic Problems:
- Simple deduction (e.g. "All cats are animals. Fluffy is a cat. Is Fluffy an animal?")
- Coding (e.g. "If A=1, B=2, C=3, what word is represented by 8-5-12-12-15?")
- Logic grids (e.g. "Tom is taller than Sam. Sam is taller than Ben. Who is shortest?")

TOPIC TAGS — assign exactly one:
- "sequences" — number sequences and patterns
- "analogies" — word analogies and relationships
- "letters" — letter patterns and sequences
- "oddoneout" — odd one out
- "logic" — logic problems and deduction
- "coding" — coding and decoding

EXPLANATION RULES:
- State the pattern or rule clearly in 1-2 sentences
- Be direct and confident

Return ONLY this JSON: {"questions":[{"id":1,"question":"text","options":{"A":"opt","B":"opt","C":"opt","D":"opt"},"correct":"A","explanation":"explanation","topic":"sequences"}]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw).questions;
};

// ── Writing ───────────────────────────────────────────────────────────────────

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

// ── Ideal Answer ──────────────────────────────────────────────────────────────

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
- Write at the level of an excellent Year ${yearLevel} student
- Aim for approximately ${wordCount} words
- For narrative: strong opening hook, vivid description, clear structure, satisfying resolution
- For persuasive: clear thesis, 2-3 well-reasoned arguments with evidence/examples, strong conclusion
- Use varied sentence structure and rich vocabulary appropriate for Year ${yearLevel}

Return ONLY this JSON: {"title":"a title for the response","text":"the full ideal response as a single string with paragraph breaks using \\n\\n","wordCount":${wordCount},"highlights":["key strength 1","key strength 2","key strength 3","key strength 4"]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

// ── PDF Questions ─────────────────────────────────────────────────────────────

export const generatePDFQuestions = async (subject, count, yearLevel) => {
  if (subject === 'mathematics') return await generateMathsQuestions(yearLevel, count);
  if (subject === 'reading') return await generateReadingQuestions(yearLevel, count);
  if (subject === 'general') return await generateGeneralAbilityQuestions(yearLevel, count);
  return [];
};