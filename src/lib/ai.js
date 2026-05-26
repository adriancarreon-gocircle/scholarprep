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

export const generateMathsQuestions = async (yearLevel, count, questionTypeFocus) => {
  const blueprint = getMathsBlueprint(yearLevel);
  const system = `You are an expert Australian ${schoolLevel(yearLevel)} mathematics exam writer for scholarship and selective entry tests (ACER, AAST, Edutest, NAPLAN). You generate questions that closely match the style and types specified in the question bank blueprint. Always respond with ONLY valid JSON, no other text.`;

  const focusInstruction = questionTypeFocus
    ? `\nCRITICAL FOCUS — YOU MUST FOLLOW THIS: ${questionTypeFocus}. Do NOT generate questions about any other topic unless explicitly listed above.`
    : '';

  const user = `Generate ${count} mathematics multiple-choice questions for Year ${yearLevel} Australian ${schoolLevel(yearLevel)} students.
${focusInstruction}
${blueprint}

VISUAL QUESTIONS — for certain question types, include a "visual" field with structured data to render a diagram. Use visuals for these types:

For STATISTICS questions (bar charts, line graphs, pie charts):
{"visual":{"type":"barchart","title":"Books Read Per Month","data":[{"label":"Jan","value":4},{"label":"Feb","value":7},{"label":"Mar","value":10},{"label":"Apr","value":6}],"yLabel":"Books","color":"#4338CA"}}

{"visual":{"type":"linegraph","title":"Temperature Over a Week","data":[{"label":"Mon","value":18},{"label":"Tue","value":22},{"label":"Wed","value":25},{"label":"Thu","value":20},{"label":"Fri","value":16}],"yLabel":"°C","color":"#059669"}}

{"visual":{"type":"piechart","title":"Favourite Sports","data":[{"label":"Soccer","value":40},{"label":"Cricket","value":25},{"label":"Tennis","value":20},{"label":"Other","value":15}]}}

For GEOMETRY/PERIMETER questions — vary shapes by year level:
- Year 1-2: rectangles and squares ONLY
- Year 3-4: triangles or irregular quadrilaterals
- Year 5+: compound shapes — choose a template randomly from: lshape, rlshape, ushape, staircase
- NEVER generate only rectangles — always vary the shape type

{"visual":{"type":"shape","shape":"rectangle","title":"Find the perimeter","dimensions":{"width":8,"height":5},"color":"#4338CA"}}
{"visual":{"type":"shape","shape":"triangle","title":"Find the perimeter","dimensions":{"base":9,"height":6},"color":"#4338CA"}}
{"visual":{"type":"shape","shape":"quadrilateral","title":"Find the perimeter","dimensions":{"sides":[8,5,6,4]},"color":"#4338CA"}}
{"visual":{"type":"lshape","title":"Find the perimeter","dimensions":{"template":"lshape","sides":["7cm","4cm","3cm","2.5cm","3cm","9cm"]},"color":"#4338CA"}}
{"visual":{"type":"lshape","title":"Find the perimeter","dimensions":{"template":"rlshape","sides":["6cm","5cm","4cm","3cm","2cm","2cm"]},"color":"#4338CA"}}
{"visual":{"type":"lshape","title":"Find the perimeter","dimensions":{"template":"ushape","sides":["4cm","6cm","4cm","8cm","12cm","8cm"]},"color":"#4338CA"}}
{"visual":{"type":"lshape","title":"Find the perimeter","dimensions":{"template":"staircase","sides":["6cm","10cm","10cm","4cm","2cm","2cm","2cm","2cm"]},"color":"#4338CA"}}

For Year 5+ perimeter questions, optionally hide 1-2 sides (hiddenSides array of indices) so students must calculate the unknown side. Show hidden sides as "?" in the sides array:
{"visual":{"type":"lshape","title":"Find the missing side","dimensions":{"template":"rlshape","sides":["9cm","6cm","?","3cm","?","4cm"],"hiddenSides":[2,4]},"color":"#4338CA"}}

IMPORTANT: sides array length must match template (lshape=6, rlshape=6, ushape=6, tshape=8, staircase=8). For perimeter questions, correct answer = sum of all sides.

For COUNTING CUBES questions — always include a visual:
{"visual":{"type":"cubes","title":"How many cubes are there?","dimensions":{"length":4,"width":3,"height":2},"color":"#4338CA"}}

For THERMOMETER questions — always include a visual:
{"visual":{"type":"thermometer","title":"What temperature is shown?","value":35,"unit":"C","min":0,"max":50,"color":"#EF4444"}}
{"visual":{"type":"thermometer","title":"What temperature is shown?","value":98,"unit":"F","min":32,"max":120,"color":"#EF4444"}}

CRITICAL — Chart question text: ALWAYS write "the bar chart ABOVE" or "the chart ABOVE" — NEVER "below", because the visual renders ABOVE the question text.

For MONEY questions (Year 1-6):
{"visual":{"type":"money","title":"How much money is shown?","coins":[{"denom":"$1","count":2},{"denom":"50c","count":1},{"denom":"20c","count":2}],"notes":[]}}
{"visual":{"type":"money","title":"Count the money","notes":[{"denom":"$10","count":1},{"denom":"$5","count":1}],"coins":[{"denom":"$2","count":1},{"denom":"50c","count":2}]}}

For COUNTING questions (Year 1-4):
{"visual":{"type":"counting","title":"How many apples are there?","object":"apple","groups":[{"count":5,"showCount":false},{"count":3,"showCount":false}]}}
{"visual":{"type":"counting","title":"Count the objects in each group","groups":[{"label":"Group A","count":4,"emoji":"⭐","showCount":false},{"label":"Group B","count":7,"emoji":"⭐","showCount":false}]}}

RULES FOR VISUALS:
- Only add a visual when it genuinely helps the question (statistics, geometry shapes, money, counting)
- Do NOT add visuals to algebra, number operations, fractions without shapes, or worded time problems
- Make sure the question text references the visual (e.g. "Using the bar chart above..." or "Look at the shape below...")
- The correct answer must be determinable from the visual data provided


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

Return ONLY this JSON: {"questions":[{"id":1,"question":"text","options":{"A":"opt","B":"opt","C":"opt","D":"opt"},"correct":"A","explanation":"explanation","topic":"number","visual":null}]}

For questions with visuals, replace null with the visual object. For questions without visuals, use null or omit the field.`;

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

export const generateReadingQuestions = async (yearLevel, count, themeOverride) => {
  // Use the provided theme or pick a random one
  const theme = themeOverride
    ? READING_THEMES.find(t => t.startsWith(themeOverride)) || themeOverride
    : READING_THEMES[Math.floor(Math.random() * READING_THEMES.length)];

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

export const generateGeneralAbilityQuestions = async (yearLevel, count, questionTypeFocus) => {
  const system = `You are an expert Australian ${schoolLevel(yearLevel)} general ability exam writer for scholarship and selective entry tests (ACER, AAST, Edutest, NAPLAN). Create verbal and non-verbal reasoning questions. Always respond with ONLY valid JSON, no other text.`;

  const focusInstruction = questionTypeFocus
    ? `\nCRITICAL FOCUS — YOU MUST FOLLOW THIS: Generate questions ONLY about this specific topic: "${questionTypeFocus}". Every single one of the ${count} questions must be about this topic. Do NOT generate questions about any other topic.\n`
    : '';

  const user = `Generate ${count} general ability multiple-choice questions for Year ${yearLevel} Australian ${schoolLevel(yearLevel)} scholarship and selective entry exam.
${focusInstruction}
QUESTION TYPES — use the following from the question bank. CRITICALLY IMPORTANT: vary the mix — do NOT generate all the same type:

Number Patterns — MUST USE A VARIETY of these pattern types, not just +100:
- Single digit steps: go up by 2,3,4,5,6,7,8,9 (e.g. "25, 32, 39, 46, ___?" goes up by 7; "13, 17, 21, 25, ___?" goes up by 4)
- Doubling: multiply by 2 each time (e.g. "4, 8, 16, 32, ___?")
- Tripling: multiply by 3 each time (e.g. "4, 12, 36, 108, ___?")
- Up and down: alternating add and subtract (e.g. "3, 6, 5, 8, 7, 10, ___?" goes +3,-1,+3,-1; "2, 5, 4, 7, 6, 9, ___?")
- Fibonacci-style: add previous two numbers (e.g. "1, 1, 2, 3, 5, 8, ___?")
- Subtract steps: go down by 3,4,5,6,7 (e.g. "50, 44, 38, 32, ___?" goes down by 6)
- Fill in missing: "436, 438, ___, 442, ___, 446" (goes up by 2)
- Hundreds/thousands only when mixing with other types

STRICT RULE: If generating ${count} pattern questions, use AT LEAST 3 different pattern types above. Never generate more than 2 questions with the same pattern type (e.g. never 3 +100 questions in a row).

Verbal Reasoning (vary these):
- Word analogies (e.g. "Hot is to cold as day is to ___?")
- Odd one out from a list of words
- Word relationships (e.g. "Doctor is to hospital as teacher is to ___?")
- Synonyms (e.g. "What word means the same as 'large'?")
- Antonyms (e.g. "What is the opposite of 'brave'?")
- Letter patterns (e.g. "A, C, E, G, ___?")

Logic Problems:
- Draw conclusions (e.g. "All boys play soccer. Sam is a boy. What can we conclude?")
- Coding (e.g. "If A=1, B=2, C=3, what word is 8-5-12-12-15?")
- Order steps (e.g. "Put these in order: Boil water, Add tea, Pour into cup, Stir")
- Find information from text (e.g. "Car A is 4m. Car B is 2m. Car C is 1m longer than A. Which is longest?")

PICTURE PATTERN QUESTIONS — CRITICAL RULES:
For picture pattern questions, the answer options MUST be rendered as actual shape frames (not text descriptions), because text descriptions are ambiguous and students need to see the actual shapes.

You MUST provide an "answerFrames" field in the visual containing the 4 answer option frames. The correct answer frame must logically continue the pattern. The other 3 frames must be plausible distractors (wrong direction, wrong fill, wrong count, etc).

Available shape types: triangle, triangle_down, square, circle, diamond, star, arrow_right, arrow_down, smiley, sad, cross_x, square_small, circle_thick
Fill: "none" (hollow), "#374151" (solid dark), "#4338CA" (solid blue), "#F97316" (solid orange)

COMPLETE example — alternating hollow/solid arrows rotating right→down→right→down:
{"visual":{"type":"picturepattern","title":"What comes next?",
  "frames":[
    {"shapes":[{"type":"arrow_right","x":0.5,"y":0.5,"size":0.35,"fill":"none","stroke":"#374151"}]},
    {"shapes":[{"type":"arrow_down","x":0.5,"y":0.5,"size":0.35,"fill":"#374151","stroke":"#374151"}]},
    {"shapes":[{"type":"arrow_right","x":0.5,"y":0.5,"size":0.35,"fill":"none","stroke":"#374151"}]},
    {"shapes":[{"type":"arrow_down","x":0.5,"y":0.5,"size":0.35,"fill":"#374151","stroke":"#374151"}]},
    {"isBlank":true}
  ],
  "answerFrames":{
    "A":{"shapes":[{"type":"arrow_down","x":0.5,"y":0.5,"size":0.35,"fill":"#374151","stroke":"#374151"}]},
    "B":{"shapes":[{"type":"arrow_right","x":0.5,"y":0.5,"size":0.35,"fill":"none","stroke":"#374151"}]},
    "C":{"shapes":[{"type":"arrow_down","x":0.5,"y":0.5,"size":0.35,"fill":"none","stroke":"#374151"}]},
    "D":{"shapes":[{"type":"arrow_right","x":0.5,"y":0.5,"size":0.35,"fill":"#374151","stroke":"#374151"}]}
  }
}}

In this example, correct="A" because the pattern needs a solid arrow pointing down next.

The text options (A/B/C/D in the "options" field) should just be short labels like "Option A", "Option B", "Option C", "Option D" — the actual visual frames in answerFrames are what students see.

PATTERN TYPES to use (vary these):
1. Direction rotation: arrow_right → arrow_down → arrow_right → arrow_down → ?
2. Fill progression: hollow → half → solid → hollow → ?  
3. Count increase: 1 shape → 2 shapes → 3 shapes → ?
4. Shape alternating: triangle → circle → triangle → circle → ?
5. Size change: small → medium → large → ?
6. Combination: rotating AND filling at same time

IMPORTANT: The correct answer frame in answerFrames MUST exactly match what logically continues the sequence shown in frames. Double-check your pattern before writing the correct letter.


- "sequences" — number sequences and patterns
- "picturepatterns" — visual/shape pattern sequences (requires visual field)
- "analogies" — word analogies and relationships
- "letters" — letter patterns and sequences
- "oddoneout" — odd one out
- "logic" — logic problems, deduction, ordering, find info
- "coding" — coding and decoding
- "synonyms" — synonyms
- "antonyms" — antonyms

EXPLANATION RULES:
- State the pattern or rule clearly in 1-2 sentences
- Be direct and confident

Return ONLY this JSON: {"questions":[{"id":1,"question":"text","options":{"A":"opt","B":"opt","C":"opt","D":"opt"},"correct":"A","explanation":"explanation","topic":"sequences","visual":null}]}

For picture pattern questions, replace null with the visual object. For text-only questions, use null or omit the field.`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw).questions;
};

// ── Writing ───────────────────────────────────────────────────────────────────

const WRITING_THEMES = [
  { theme: 'Environment', narrative: 'a story involving nature, wildlife, or an environmental challenge', persuasive: 'argue for or against an environmental issue such as recycling, protecting forests, or reducing plastic' },
  { theme: 'Science', narrative: 'a story involving a scientific discovery, experiment, or invention', persuasive: 'argue for or against a scientific topic such as space exploration, genetic engineering, or renewable energy' },
  { theme: 'Technology', narrative: 'a story involving technology — robots, computers, the future, or a new invention', persuasive: 'argue for or against a technology topic such as screen time limits, social media, or self-driving cars' },
  { theme: 'Community & Social', narrative: 'a story about helping others, community spirit, or making a difference', persuasive: 'argue for or against a social issue such as volunteering, school uniforms, or community projects' },
  { theme: 'History & Adventure', narrative: 'a historical fiction story or an adventure set in the past', persuasive: 'argue why learning history is important or whether a historical event was right or wrong' },
  { theme: 'Sport & Competition', narrative: 'a story about a sports event, a competition, or overcoming a challenge', persuasive: 'argue for or against a topic related to sport such as competitive sport for children, e-sports, or physical education' },
  { theme: 'Friendship & Belonging', narrative: 'a story about friendship, fitting in, or overcoming loneliness', persuasive: 'argue for or against a social topic such as the importance of friendship, teamwork, or inclusion' },
  { theme: 'Animals & Nature', narrative: 'a story told from an animal\'s perspective or about a child and an animal', persuasive: 'argue for or against keeping animals in zoos, animal rights, or protecting endangered species' },
  { theme: 'Mystery & Imagination', narrative: 'a mystery story or an imaginative tale involving fantasy, magic, or the unknown', persuasive: 'argue for or against the value of imagination, reading fiction, or creative thinking in schools' },
  { theme: 'Travel & Discovery', narrative: 'a story about an exciting journey, exploring a new place, or making an unexpected discovery', persuasive: 'argue for or against travel, cultural exchange, or studying overseas' },
];

export const generateWritingPrompt = async (type, yearLevel, themeOverride) => {
  // Use override theme if provided, otherwise pick a random one
  const themeObj = themeOverride
    ? WRITING_THEMES.find(t => t.theme === themeOverride) || WRITING_THEMES[Math.floor(Math.random() * WRITING_THEMES.length)]
    : WRITING_THEMES[Math.floor(Math.random() * WRITING_THEMES.length)];
  const themeInstruction = type === 'narrative'
    ? `The prompt must be about: ${themeObj.narrative}`
    : `The prompt must be about: ${themeObj.persuasive}`;

  const system = `You are an Australian ${schoolLevel(yearLevel)} writing exam designer for scholarship and selective entry tests. Always respond with ONLY valid JSON, no other text.`;
  const user = `Generate a ${type} writing prompt for Year ${yearLevel} Australian ${schoolLevel(yearLevel)} scholarship and selective entry exam.

THEME: ${themeObj.theme}
${themeInstruction}

The prompt must be original, engaging and appropriate for Year ${yearLevel}. Do NOT use vegetable gardens, lemonade stands, or other overused generic prompts.

Return ONLY this JSON: {"prompt":"the full writing prompt","type":"${type}","time":25,"criteria":["Ideas and content","Structure and organisation","Language and vocabulary","Sentence structure","Punctuation and spelling"]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

export const assessWriting = async (studentText, prompt, type, yearLevel) => {
  const system = `You are an expert Australian ${schoolLevel(yearLevel)} writing assessor for scholarship and selective entry exams. Assess Year ${yearLevel} student writing with detailed constructive feedback. Always respond with ONLY valid JSON, no other text.`;
  const user = `Assess this Year ${yearLevel} student ${type} writing for a scholarship and selective entry exam.\n\nPrompt: "${prompt}"\n\nStudent response: "${studentText}"\n\nScore each criterion out of 5: Ideas and content, Structure and organisation, Language and vocabulary, Sentence structure, Punctuation and spelling. Return ONLY this JSON: {"criteria":[{"name":"Ideas and content","score":4,"maxScore":5,"feedback":"feedback"},{"name":"Structure and organisation","score":3,"maxScore":5,"feedback":"feedback"},{"name":"Language and vocabulary","score":4,"maxScore":5,"feedback":"feedback"},{"name":"Sentence structure","score":3,"maxScore":5,"feedback":"feedback"},{"name":"Punctuation and spelling","score":4,"maxScore":5,"feedback":"feedback"}],"totalScore":18,"maxTotal":25,"overallFeedback":"overall comment","improvements":["improvement 1","improvement 2","improvement 3"]}`;
  const raw = await callClaude(system, user);
  return JSON.parse(raw);
};

// ── Handwriting Photo Assessment ──────────────────────────────────────────────

export const assessHandwritingPhoto = async (base64Image, mediaType, yearLevel, writingType) => {
  const system = `You are an expert Australian ${schoolLevel(yearLevel)} writing teacher and assessor. You transcribe student handwriting from photos and provide rich, detailed feedback. Always respond with ONLY valid JSON, no other text.`;

  const user = `A Year ${yearLevel} student has submitted a handwritten ${writingType || 'writing'} piece. Please:
1. Transcribe the handwritten text accurately (if illegible in parts, do your best)
2. Assess it across the 5 criteria
3. Provide detailed improvement suggestions at the word and sentence level

Return ONLY this JSON (no other text):
{
  "transcribedText": "the full transcribed text, preserving paragraphs with \\n\\n",
  "wordCount": 150,
  "criteria": [
    {"name": "Ideas & Content", "score": 4, "maxScore": 5, "percent": 80, "feedback": "detailed feedback", "strengths": ["strength 1"], "improvements": ["improvement 1"]},
    {"name": "Structure & Organisation", "score": 3, "maxScore": 5, "percent": 60, "feedback": "detailed feedback", "strengths": ["strength 1"], "improvements": ["improvement 1"]},
    {"name": "Language & Vocabulary", "score": 4, "maxScore": 5, "percent": 80, "feedback": "detailed feedback", "strengths": ["strength 1"], "improvements": ["improvement 1"]},
    {"name": "Sentence Structure", "score": 3, "maxScore": 5, "percent": 60, "feedback": "detailed feedback", "strengths": ["strength 1"], "improvements": ["improvement 1"]},
    {"name": "Spelling & Punctuation", "score": 4, "maxScore": 5, "percent": 80, "feedback": "detailed feedback", "strengths": ["strength 1"], "improvements": ["improvement 1"]}
  ],
  "totalScore": 18,
  "maxTotal": 25,
  "totalPercent": 72,
  "overallFeedback": "2-3 sentence overall comment",
  "spellingErrors": [
    {"original": "misspelled word in context", "correction": "correct spelling", "rule": "spelling rule explanation"}
  ],
  "grammarErrors": [
    {"original": "original sentence with error", "corrected": "corrected sentence", "explanation": "grammar rule"}
  ],
  "vocabularyUpgrades": {
    "adjectives": [
      {"sentence": "exact sentence from the text", "original": "weak adjective", "options": ["stronger option 1", "stronger option 2", "stronger option 3"], "why": "brief reason"}
    ],
    "verbs": [
      {"sentence": "exact sentence from the text", "original": "weak verb", "options": ["stronger verb 1", "stronger verb 2", "stronger verb 3"], "why": "brief reason"}
    ],
    "adverbs": [
      {"sentence": "exact sentence from the text", "original": "weak adverb or missing", "options": ["better adverb 1", "better adverb 2", "better adverb 3"], "why": "brief reason"}
    ]
  },
  "sentenceStructureUpgrades": [
    {
      "technique": "Simile",
      "original": "exact sentence from the text",
      "options": ["rewritten version 1 using this technique", "rewritten version 2 using this technique"],
      "explanation": "how this technique improves the writing"
    },
    {
      "technique": "Metaphor",
      "original": "exact sentence from the text",
      "options": ["rewritten version 1", "rewritten version 2"],
      "explanation": "how this technique improves the writing"
    },
    {
      "technique": "Alliteration",
      "original": "exact sentence from the text",
      "options": ["rewritten version 1", "rewritten version 2"],
      "explanation": "how this technique improves the writing"
    },
    {
      "technique": "Rhetorical Question",
      "original": "exact sentence from the text",
      "options": ["rewritten version 1", "rewritten version 2"],
      "explanation": "how this technique improves the writing"
    },
    {
      "technique": "Complex Sentence",
      "original": "exact sentence from the text",
      "options": ["rewritten version 1 as a complex sentence", "rewritten version 2"],
      "explanation": "how this technique improves the writing"
    }
  ]
}

Provide 2-4 items in each vocabulary section and 4-6 sentence structure upgrades covering varied techniques from: Simile, Metaphor, Alliteration, Personification, Imagery, Rhetorical Question, Complex Sentence, Conditional Sentence, Parallel Structure, Contrast, Emphasis, Relative Clause, Appositive, Cause and Effect, Conjunction, Inverted Order.`;

  // Call Claude API directly with vision capability
  const response = await fetch('/api/claude-vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, mediaType, systemPrompt: system, userPrompt: user })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  const text = data.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
};



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