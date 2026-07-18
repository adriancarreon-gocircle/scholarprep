import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// ── Exam data — all SEO content lives here ──────────────────────────────────
const EXAM_DATA = {
  'acer-selective': {
    name: 'ACER Selective Entry Test',
    shortName: 'ACER',
    state: 'National (VIC, NSW, QLD, SA, WA)',
    yearLevel: 'Year 6 → Year 7 (or Year 8 → Year 9 depending on school)',
    color: '#4338CA',
    lightBg: '#EEF2FF',
    icon: '🎓',
    metaTitle: 'ACER Selective Entry Test Preparation | Practice Tests & Simulated Exams',
    metaDesc: 'Prepare for the ACER selective entry exam with unlimited practice tests in Maths, Reading, General Ability and Writing. Full timed simulations matching the real ACER exam. Years 1–11.',
    keywords: 'ACER test, ACER practice test, ACER selective entry, ACER exam preparation, Melbourne High entrance, Mac.Robertson entrance, selective school test',
    heroLine: 'Prepare for the ACER selective entry exam with confidence.',
    intro: 'The ACER (Australian Council for Educational Research) selective entry test is the most widely used entrance exam for gifted and selective programs across Australia. It\'s used by Melbourne High School, Mac.Robertson Girls\' High, Suzanne Cory High, Nossal High, Brisbane State High and many independent schools for scholarship selection.',
    schools: ['Melbourne High School', "Mac.Robertson Girls' High", 'Suzanne Cory High', 'Nossal High', 'Brisbane State High', '100+ independent schools'],
    structure: [
      { name: 'Mathematics & Quantitative Reasoning', duration: '60 min', questions: '~65 questions', desc: 'Mathematical problem-solving, quantitative patterns, data interpretation. No calculator.' },
      { name: 'Reading & Verbal Reasoning', duration: '55 min', questions: '~65 questions', desc: 'Comprehension across fiction, non-fiction, poetry and visual texts. Inference and vocabulary in context.' },
      { name: 'Writing', duration: '40 min', questions: '1 task', desc: 'Creative or persuasive response to a prompt. Assessed on ideas, structure and expression.' },
    ],
    totalTime: '~3 hours including breaks',
    tips: [
      'Start preparation 6–12 months before the exam for best results',
      'Practice reasoning-style questions, not just curriculum maths — ACER tests thinking, not memorisation',
      'Build reading speed and inference skills across diverse text types',
      'Practice timed writing tasks weekly — 25–40 minutes per piece',
      'Sit full-length mock exams under real conditions to build stamina',
    ],
  },
  'aast-scholarship': {
    name: 'Australian Academic Scholarship Test (AAST)',
    shortName: 'AAST',
    state: 'National',
    yearLevel: 'Years 5–11 (varies by school)',
    color: '#059669',
    lightBg: '#ECFDF5',
    icon: '📚',
    metaTitle: 'AAST Scholarship Test Preparation | Practice Tests for Academic Scholarships',
    metaDesc: 'Prepare for the AAST (AAS) academic scholarship exam. Practice General Ability, Reading, Mathematics and Writing with unlimited questions and full timed simulations.',
    keywords: 'AAST test, AAS scholarship, AAST practice test, academic scholarship test, independent school scholarship, scholarship exam preparation',
    heroLine: 'Ace the AAST and win your academic scholarship.',
    intro: 'The Australian Academic Scholarship Test (AAST, also known as AAS) is used by many independent schools across Australia to award academic scholarships. It tests higher-order thinking across four components and is designed to identify students with strong reasoning and academic potential.',
    schools: ['Independent schools across VIC, NSW, QLD, SA and WA'],
    structure: [
      { name: 'General Ability', duration: '45 min', questions: '~60 questions', desc: 'Abstract reasoning, problem solving, pattern recognition.' },
      { name: 'Writing', duration: '25 min', questions: '2 prompts', desc: 'Creative and/or persuasive writing tasks.' },
      { name: 'Reading Comprehension', duration: '45 min', questions: '~45 questions', desc: 'Multiple passages across fiction, non-fiction and poetry.' },
      { name: 'Mathematics', duration: '45 min', questions: '~45 questions', desc: 'Mathematics achievement and reasoning. No calculator.' },
    ],
    totalTime: '~3.5 hours including breaks',
    tips: [
      'General Ability questions are unlike school work — practice abstract reasoning patterns regularly',
      'Read widely across genres to build comprehension speed',
      'For Writing, practise both creative and persuasive styles',
      'Time management is critical — practise answering within strict time limits',
    ],
  },
  'edutest-selective': {
    name: 'Edutest Scholarship & Selective Entry',
    shortName: 'Edutest',
    state: 'VIC, QLD, WA',
    yearLevel: 'Year 5 → Year 7 (most common)',
    color: '#F97316',
    lightBg: '#FFF7ED',
    icon: '🏫',
    metaTitle: 'Edutest Scholarship Test Preparation | Practice Tests & Exam Simulations',
    metaDesc: 'Prepare for the Edutest scholarship and selective entry exam with practice in Verbal Reasoning, Numerical Reasoning, Reading, Mathematics and Writing.',
    keywords: 'Edutest, Edutest practice test, Edutest scholarship, Edutest selective entry, Victorian scholarship exam, SEAL Edutest',
    heroLine: 'Get scholarship-ready with Edutest preparation.',
    intro: 'Edutest is one of Australia\'s leading providers of scholarship and selective entry assessments. Used by many Victorian independent schools and SEAL programs, the Edutest exam has five components testing both reasoning ability and academic achievement.',
    schools: ['Victorian independent schools', 'SEAL program schools (~39 accredited)', 'Select QLD and WA schools'],
    structure: [
      { name: 'Verbal Reasoning', duration: '30 min', questions: '~45 questions', desc: 'Vocabulary, analogies, and the ability to reason with words and language patterns.' },
      { name: 'Numerical Reasoning', duration: '30 min', questions: '~35 questions', desc: 'Pattern recognition, numerical sequences, quantitative reasoning.' },
      { name: 'Reading Comprehension', duration: '30 min', questions: '~30 questions', desc: 'Close-reading on fiction and non-fiction passages.' },
      { name: 'Mathematics', duration: '45 min', questions: '~35 questions', desc: 'Arithmetic, fractions, percentages, algebra, geometry. No calculator.' },
      { name: 'Written Expression', duration: '15–25 min', questions: '1 task', desc: 'Short written task assessing clarity, structure and expression.' },
    ],
    totalTime: '~3 hours including breaks',
    tips: [
      'Verbal Reasoning requires a strong vocabulary — read daily and learn new words in context',
      'Numerical Reasoning tests speed alongside logic — practice quick mental calculations',
      'Don\'t neglect Writing — it can make or break a borderline result',
      'Sit full mock exams under timed conditions to build endurance',
    ],
  },
  'naplan': {
    name: 'NAPLAN',
    shortName: 'NAPLAN',
    state: 'National (all states)',
    yearLevel: 'Years 3, 5, 7 and 9',
    color: '#7C3AED',
    lightBg: '#F5F3FF',
    icon: '📝',
    metaTitle: 'NAPLAN Practice Tests | Prepare for Years 3, 5, 7 & 9',
    metaDesc: 'Practise for NAPLAN with unlimited tests across Writing, Reading, Language Conventions and Numeracy. Full timed simulations for Years 3, 5, 7 and 9.',
    keywords: 'NAPLAN practice test, NAPLAN preparation, NAPLAN Year 3, NAPLAN Year 5, NAPLAN Year 7, NAPLAN Year 9, NAPLAN online practice',
    heroLine: 'Build confidence for NAPLAN test day.',
    intro: 'NAPLAN (National Assessment Program — Literacy and Numeracy) is the national standardised assessment for all Australian students in Years 3, 5, 7 and 9. While it doesn\'t determine school entry, strong NAPLAN results support applications for selective and gifted programs and give parents valuable insight into their child\'s academic progress.',
    schools: ['All Australian schools — mandatory national assessment'],
    structure: [
      { name: 'Writing', duration: '40 min', questions: '1 task', desc: 'Narrative or persuasive writing to a given prompt.' },
      { name: 'Reading', duration: '45 min', questions: '~45 questions', desc: 'Comprehension across multiple text types.' },
      { name: 'Conventions of Language', duration: '45 min', questions: '~50 questions', desc: 'Spelling, grammar, punctuation.' },
      { name: 'Numeracy', duration: '45 min', questions: '~36 questions', desc: 'Number, measurement, geometry, statistics. Calculator for some items in Year 7+.' },
    ],
    totalTime: '~3.5 hours across 2 days',
    tips: [
      'NAPLAN is not something to cram for — consistent practice over weeks works best',
      'Familiarise your child with the online test platform format',
      'For Writing, practise planning before writing — structure matters',
      'Read the questions carefully — many NAPLAN errors are from misreading, not misunderstanding',
    ],
  },
  'aset-gate-wa': {
    name: 'ASET / GATE — WA Gifted & Talented',
    shortName: 'ASET / GATE',
    state: 'Western Australia',
    yearLevel: 'Year 6 → Year 7',
    color: '#0EA5E9',
    lightBg: '#F0F9FF',
    icon: '🌊',
    metaTitle: 'ASET GATE Test Preparation WA | Perth Modern & GATE Program Practice Tests',
    metaDesc: 'Prepare for the WA Academic Selective Entrance Test (ASET) for GATE programs and Perth Modern School. Practice Reading, Writing, Quantitative and Abstract Reasoning.',
    keywords: 'ASET test, GATE WA, ASET practice test, Perth Modern entrance, GATE program, WA gifted and talented, ASET preparation, Academic Selective Entrance Test',
    heroLine: 'Your pathway to Perth Modern and WA GATE programs.',
    intro: 'The Academic Selective Entrance Test (ASET) is the WA government entrance exam for Gifted and Talented Education (GATE) selective programs, including the prestigious Perth Modern School. Developed by ACER, it assesses cognitive abilities across four equally weighted components. About 5,000 students sit the ASET each year for approximately 750 places.',
    schools: ['Perth Modern School (fully selective)', '23 other WA government schools with GATE streams'],
    structure: [
      { name: 'Reading Comprehension', duration: '35 min', questions: '35 questions', desc: 'Fiction, non-fiction, poetry, diagrams and charts. 1 minute per question.' },
      { name: 'Communicating Ideas in Writing', duration: '25 min', questions: '1 task', desc: 'Open response to an image or statement prompt. Double-marked by ACER.' },
      { name: 'Quantitative Reasoning', duration: '35 min', questions: '35 questions', desc: 'Mathematical thinking, not curriculum recall. Patterns, data, problem-solving.' },
      { name: 'Abstract Reasoning', duration: '20 min', questions: '35 questions', desc: 'Pattern recognition and visual sequences. Just 34 seconds per question — the fastest section.' },
    ],
    totalTime: '~2 hours 45 minutes',
    tips: [
      'Abstract Reasoning is the section where targeted practice yields the greatest improvement',
      'Writing must be original — pre-rehearsed stories are penalised',
      'For Quantitative Reasoning, focus on reasoning strategies, not rote calculations',
      'No calculator allowed — strengthen mental maths skills',
      'Perth Modern typically requires a TSS of ~244+ (top 1–2% of test-takers)',
    ],
  },
  'peac-wa': {
    name: 'PEAC — WA Primary Extension and Challenge',
    shortName: 'PEAC',
    state: 'Western Australia',
    yearLevel: 'Year 4 → Years 5–6 program',
    color: '#14B8A6',
    lightBg: '#F0FDFA',
    icon: '🌱',
    metaTitle: 'PEAC Test Preparation WA | Year 4 Gifted Program Practice Tests',
    metaDesc: 'Prepare your Year 4 child for the WA PEAC test. Practice verbal comprehension, mathematical reasoning and abstract reasoning questions.',
    keywords: 'PEAC test, PEAC WA, PEAC practice test, PEAC Year 4, WA gifted program, Primary Extension and Challenge',
    heroLine: 'Help your Year 4 child shine in the PEAC test.',
    intro: 'The Primary Extension and Challenge (PEAC) program is WA\'s gifted identification program for Year 4 students. All public school students in Year 4 are assessed, with approximately 880 students (top 3.5%) selected each year. The ACER-developed test consists of two papers covering language, reasoning and problem-solving abilities.',
    schools: ['WA PEAC centres across all regions'],
    structure: [
      { name: 'Language & Reasoning', duration: '~30 min', questions: '~30 questions', desc: 'Verbal comprehension, mathematical problem solving, verbal analysis and reasoning.' },
      { name: 'Relationships & Problem Solving', duration: '~20 min', questions: '~20 questions', desc: 'Abstract reasoning — seeing relationships, patterns and solving visual problems.' },
    ],
    totalTime: '~50 minutes',
    tips: [
      'The PEAC test is very different from school tests — expose your child to reasoning-style questions',
      'Build vocabulary through wide reading across fiction and non-fiction',
      'Practice abstract reasoning puzzles — these are rarely taught in school',
      'Keep preparation low-pressure — wellbeing matters more than test scores at this age',
    ],
  },
  'ignite-sa': {
    name: 'IGNITE Program Entrance Test (ACER HAST)',
    shortName: 'IGNITE',
    state: 'South Australia',
    yearLevel: 'Year 6 → Year 7 (or Year 7 → Year 8)',
    color: '#E11D48',
    lightBg: '#FFF1F2',
    icon: '🔥',
    metaTitle: 'IGNITE Program Test Preparation SA | Glenunga ACER HAST Practice Tests',
    metaDesc: 'Prepare for the SA IGNITE program entrance exam (ACER HAST). Practice Reading, Maths, Abstract Reasoning and Writing for Glenunga, Aberfoyle Park and The Heights.',
    keywords: 'IGNITE test, IGNITE SA, Glenunga entrance exam, ACER HAST, IGNITE program, South Australia gifted, Aberfoyle Park, The Heights School',
    heroLine: 'Earn your place in SA\'s IGNITE gifted program.',
    intro: 'The IGNITE program is South Australia\'s selective accelerated learning stream, offered at Glenunga International High School, Aberfoyle Park High School, and The Heights School. Entry is via the ACER HAST (Higher Ability Selection Test), which assesses reasoning ability across four components.',
    schools: ['Glenunga International High School', 'Aberfoyle Park High School', 'The Heights School'],
    structure: [
      { name: 'Reading Comprehension', duration: '45 min', questions: '~35 questions', desc: 'Comprehension across diverse text types. Inference and vocabulary in context.' },
      { name: 'Written Expression', duration: '30 min', questions: '1 task', desc: 'Creative or discursive writing task. Human double-marked.' },
      { name: 'Mathematical Reasoning', duration: '40 min', questions: '~35 questions', desc: 'Mathematical thinking and problem-solving, not curriculum recall.' },
      { name: 'Abstract Reasoning', duration: '40 min', questions: '~30 questions', desc: 'Pattern recognition, sequences and visual problem-solving.' },
    ],
    totalTime: '~3 hours including breaks',
    tips: [
      'The IGNITE test uses the ACER HAST — prepare with HAST-style materials',
      'Abstract Reasoning often separates the top scorers — practice daily',
      'Written Expression is human double-marked, so quality of thought matters more than length',
      'Start preparation in Year 5 for February Year 6 testing',
    ],
  },
  'seal-vic': {
    name: 'SEAL — Victorian Select Entry Accelerated Learning',
    shortName: 'SEAL',
    state: 'Victoria',
    yearLevel: 'Year 6 → Year 7',
    color: '#A855F7',
    lightBg: '#FAF5FF',
    icon: '⚡',
    metaTitle: 'SEAL Program Test Preparation VIC | Edutest Practice Tests for Year 7 Entry',
    metaDesc: 'Prepare for Victorian SEAL entrance exams (Edutest). Practice Verbal Reasoning, Numerical Reasoning, Reading, Mathematics and Writing.',
    keywords: 'SEAL test, SEAL VIC, SEAL program, Edutest SEAL, Victorian accelerated learning, SEAL Year 7 entry, select entry accelerated learning',
    heroLine: 'Accelerate your learning with a SEAL placement.',
    intro: 'The Select Entry Accelerated Learning (SEAL) program is Victoria\'s accelerated curriculum stream for gifted students, offered at approximately 39 accredited government secondary schools. Most SEAL schools use the Edutest entrance exam, which tests both reasoning ability and academic achievement across five timed components.',
    schools: ['~39 accredited Victorian government secondary schools', 'Including Balwyn High, Glen Eira College, Gleneagles SC and many more'],
    structure: [
      { name: 'Verbal Reasoning', duration: '30 min', questions: '~45 questions', desc: 'Verbal logic, vocabulary, analogies and language patterns.' },
      { name: 'Numerical Reasoning', duration: '30 min', questions: '~35 questions', desc: 'Pattern recognition, numerical sequences, quantitative reasoning.' },
      { name: 'Reading Comprehension', duration: '30 min', questions: '~30 questions', desc: 'Close-reading on fiction and non-fiction passages.' },
      { name: 'Mathematics', duration: '30 min', questions: '~35 questions', desc: 'Year-level maths applied to word problems and unfamiliar contexts.' },
      { name: 'Written Expression', duration: '15 min', questions: '1 task', desc: 'Short writing task — clarity and structure under tight time pressure.' },
    ],
    totalTime: '~3 hours including breaks',
    tips: [
      'SEAL Writing is only 15 minutes — practise concise, structured writing under tight time pressure',
      'Successful candidates typically rank in the top 10% of all applicants',
      'Schools may also interview shortlisted candidates after the exam',
      'Test dates vary by school (July–November) — check your target school early',
    ],
  },
  'sehs-vic': {
    name: 'SEHS — Victorian Selective Entry High Schools Exam',
    shortName: 'SEHS',
    state: 'Victoria',
    yearLevel: 'Year 8 → Year 9',
    color: '#DC2626',
    lightBg: '#FEF2F2',
    icon: '🏛️',
    metaTitle: 'SEHS Selective Entry Exam Preparation VIC | Melbourne High & Mac.Robertson Practice Tests',
    metaDesc: 'Prepare for the Victorian SEHS exam (ACER) for Melbourne High, Mac.Robertson, Nossal and Suzanne Cory. Practice Reading, Maths, Verbal & Quantitative Reasoning and Writing.',
    keywords: 'SEHS test, SEHS VIC, SEHS preparation, Melbourne High entrance, Mac.Robertson entrance, Nossal High, Suzanne Cory, Victorian selective entry, ACER SEHS',
    heroLine: 'Target Melbourne High, MacRob, Nossal or Suzanne Cory.',
    intro: 'The Victorian Selective Entry High School (SEHS) exam is the competitive entrance test for Year 9 entry into Victoria\'s four prestigious government selective schools: Melbourne High School, Mac.Robertson Girls\' High School, Nossal High School and Suzanne Cory High School. Administered by ACER, it assesses higher-order reasoning across five fast-paced components. About 5,000–6,000 students compete for roughly 1,000 places each year.',
    schools: ['Melbourne High School', "Mac.Robertson Girls' High School", 'Nossal High School', 'Suzanne Cory High School'],
    structure: [
      { name: 'Reading — Reasoning', duration: '35 min', questions: '~50 questions', desc: 'Reading comprehension with reasoning focus.' },
      { name: 'Mathematical Reasoning', duration: '30 min', questions: '~60 questions', desc: 'Extremely fast-paced — about 30 seconds per question. Problem-solving under pressure.' },
      { name: 'General Ability — Verbal', duration: '30 min', questions: '~60 questions', desc: 'Verbal reasoning, analogies, vocabulary.' },
      { name: 'General Ability — Quantitative', duration: '30 min', questions: '~50 questions', desc: 'Numerical patterns, data interpretation, spatial-numerical reasoning.' },
      { name: 'Writing', duration: '30 min', questions: '1 task', desc: 'Persuasive or creative writing. Assessed on clarity, originality and structure.' },
    ],
    totalTime: '~2.5 hours plus breaks',
    tips: [
      'This exam is extremely time-pressured — speed matters as much as accuracy',
      'Melbourne High typically requires scores in the 96th–99th percentile range',
      'Start preparation 12–18 months before the June Year 8 sitting',
      'Quantitative Reasoning is the area families most often underestimate',
      'The 4% school cap means you compete against your own school cohort too',
    ],
  },
  'oc-nsw': {
    name: 'NSW Opportunity Class Placement Test',
    shortName: 'OC Test',
    state: 'New South Wales',
    yearLevel: 'Year 4 → Year 5',
    color: '#2563EB',
    lightBg: '#EFF6FF',
    icon: '🎯',
    metaTitle: 'OC Test Preparation NSW | Opportunity Class Practice Tests Year 4',
    metaDesc: 'Prepare your Year 4 child for the NSW Opportunity Class placement test. Practice Reading, Mathematical Reasoning and Thinking Skills with unlimited questions.',
    keywords: 'OC test, Opportunity Class test, OC preparation, OC practice test, NSW OC Year 4, Opportunity Class placement, OC maths, OC thinking skills',
    heroLine: 'Prepare your child for NSW Opportunity Class placement.',
    intro: 'The Opportunity Class (OC) Placement Test is NSW\'s entrance exam for academically gifted Year 4 students seeking placement in Year 5–6 Opportunity Classes across 76+ public primary schools. It\'s a computer-based test with three components — Reading, Mathematical Reasoning and Thinking Skills — and notably has no Writing section. About 100 minutes of total testing time.',
    schools: ['76+ NSW public primary schools with OC programs'],
    structure: [
      { name: 'Reading', duration: '40 min', questions: '14 multi-part questions (33 answers)', desc: 'Diverse text types including fiction, non-fiction and poetry. Comprehension and inference.' },
      { name: 'Mathematical Reasoning', duration: '40 min', questions: '35 questions', desc: 'No calculator. Mental maths, word problems, patterns, geometry and data.' },
      { name: 'Thinking Skills', duration: '30 min', questions: '30 questions', desc: 'Critical thinking, logical reasoning and problem solving. Not taught in standard classrooms.' },
    ],
    totalTime: '~100 minutes (no writing section)',
    tips: [
      'Thinking Skills is the most distinctive component — logic puzzles and argument analysis that can\'t be learned from school revision alone',
      'No calculator allowed — build strong mental maths fluency',
      'The test is computer-based — practise on screen, not just on paper',
      'Coaching is not necessary according to the NSW Department of Education — consistent reasoning practice is what matters',
    ],
  },
  'hast': {
    name: 'HAST — Higher Ability Selection Test (ACER)',
    shortName: 'HAST',
    state: 'National (NSW, VIC, QLD, SA, WA)',
    yearLevel: 'Years 5–12 (Primary and Secondary levels)',
    color: '#D97706',
    lightBg: '#FFFBEB',
    icon: '🏆',
    metaTitle: 'HAST Test Preparation | ACER Higher Ability Selection Test Practice',
    metaDesc: 'Prepare for the ACER HAST with practice in Reading, Maths Reasoning, Abstract Reasoning and Writing. Used by 100+ selective and independent schools across Australia.',
    keywords: 'HAST test, HAST preparation, ACER HAST, Higher Ability Selection Test, HAST practice test, HAST Primary, HAST Secondary, selective school entry',
    heroLine: 'The gold standard for selective school entry across Australia.',
    intro: 'The Higher Ability Selection Test (HAST) is ACER\'s flagship cognitive ability test, used by more than 100 selective and independent schools across NSW, VIC, QLD, SA and WA. It assesses reasoning and thinking skills rather than curriculum knowledge, and is available at Primary level (Year 5–6 entry) and three Secondary levels (Junior, Middle, Senior). All HAST assessments are paper-based.',
    schools: ['100+ selective and independent schools across 5 states', 'Including Brisbane State High and many independent schools'],
    structure: [
      { name: 'Reading Comprehension', duration: '30–45 min', questions: '25–40 questions', desc: 'Comprehension across fiction, non-fiction, poetry, diagrams and charts.' },
      { name: 'Mathematical Reasoning', duration: '30–40 min', questions: '25–35 questions', desc: 'Mathematical thinking, not curriculum recall. Secondary levels integrate science.' },
      { name: 'Abstract Reasoning', duration: '30 min', questions: '~30 questions', desc: 'Pattern recognition, sequences, matrices. Non-verbal — useful for NESB students.' },
      { name: 'Written Expression', duration: '25–30 min', questions: '1–2 tasks', desc: 'Creative or discursive writing. Human double-marked by two independent assessors.' },
    ],
    totalTime: '~2–2.5 hours plus breaks',
    tips: [
      'HAST tests skills and aptitude, not retrieved knowledge — cramming facts won\'t help',
      'Abstract Reasoning is the area where practice yields the biggest gains',
      'Written Expression is human double-marked — quality of thought matters',
      'Schools choose their own test dates and component packages — confirm with your target school',
      'HAST is paper-based — develop handwriting endurance for the writing task',
    ],
  },
  'icas': {
    name: 'ICAS — International Competitions and Assessments for Schools',
    shortName: 'ICAS',
    state: 'International (41 countries)',
    yearLevel: 'Years 2–12',
    color: '#DB2777',
    lightBg: '#FDF2F8',
    icon: '🌏',
    metaTitle: 'ICAS Preparation | Practice Tests for English, Maths, Science & Writing',
    metaDesc: 'Prepare for ICAS assessments with practice in English, Mathematics and Writing. Aim for High Distinction across Years 2–12.',
    keywords: 'ICAS, ICAS practice test, ICAS preparation, ICAS English, ICAS Maths, ICAS Writing, ICAS Science, ICAS High Distinction, ICAS competition',
    heroLine: 'Aim for High Distinction in ICAS.',
    intro: 'ICAS (International Competitions and Assessments for Schools) is a globally recognised academic competition run across 41 countries, testing higher-order thinking across English, Mathematics, Science, Writing, Digital Technologies and Spelling Bee. Each subject is sat separately, with 30–60 minutes per test depending on year level. Results are benchmarked nationally and internationally.',
    schools: ['Participating schools worldwide — individual subject competitions'],
    structure: [
      { name: 'English', duration: '35–55 min', questions: '~40 questions', desc: 'Text comprehension, writer\'s craft, syntax and vocabulary.' },
      { name: 'Mathematics', duration: '45–60 min', questions: '~40 questions', desc: 'Number, algebra, geometry, chance and data. No calculator.' },
      { name: 'Writing', duration: '30 min', questions: '1 task', desc: 'Narrative or persuasive writing task.' },
      { name: 'Science', duration: '45–60 min', questions: '~40 questions', desc: 'Observation, interpretation, reasoning. (Separate competition — not covered in ScholarPrep simulation.)' },
    ],
    totalTime: 'Varies — each subject is a separate sitting',
    tips: [
      'ICAS questions go well beyond standard school assessments — expect to be challenged',
      'High Distinction = top 1%, Distinction = top 11% — every mark counts',
      'Focus on higher-order thinking: inference, analysis, multi-step reasoning',
      'Past ICAS papers are the best preparation resource',
    ],
  },
};

// ── The page component ──────────────────────────────────────────────────────
export default function ExamLandingPage() {
  const { slug } = useParams();
  const exam = EXAM_DATA[slug];

  if (!exam) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 24, color: '#0F172A', marginBottom: 8 }}>Exam not found</h1>
          <p style={{ color: '#64748B', marginBottom: 24 }}>We couldn't find that exam page.</p>
          <Link to="/" style={{ color: '#4338CA', fontWeight: 700, textDecoration: 'none' }}>← Back to ScholarPrep</Link>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${exam.name} Preparation — ScholarPrep`,
    "description": exam.metaDesc,
    "provider": { "@type": "Organization", "name": "ScholarPrep", "url": "https://scholarprep.com.au" },
    "offers": { "@type": "Offer", "price": "9.99", "priceCurrency": "AUD", "availability": "https://schema.org/InStock" },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <Helmet>
        <title>{exam.metaTitle} | ScholarPrep</title>
        <meta name="description" content={exam.metaDesc} />
        <meta name="keywords" content={exam.keywords} />
        <meta property="og:title" content={`${exam.metaTitle} | ScholarPrep`} />
        <meta property="og:description" content={exam.metaDesc} />
        <meta property="og:url" content={`https://scholarprep.com.au/exams/${slug}`} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://scholarprep.com.au/exams/${slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* ── Nav bar ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #F3F4F6', padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 900, color: '#0F172A' }}>Scholar<span style={{ color: '#4338CA' }}>Prep</span></span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login" style={{ fontSize: 14, color: '#64748B', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
          <Link to="/signup" style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: '#4338CA', padding: '8px 20px', borderRadius: 100, textDecoration: 'none' }}>Start free trial</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header style={{ background: `linear-gradient(135deg, ${exam.lightBg} 0%, #fff 100%)`, padding: '72px 40px 56px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${exam.color}30`, borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: 18 }}>{exam.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: exam.color, fontFamily: 'Inter, sans-serif' }}>{exam.state}</span>
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#0F172A', letterSpacing: -1, lineHeight: 1.15, marginBottom: 16 }}>
            {exam.name}<br />
            <span style={{ color: exam.color }}>Preparation & Practice Tests</span>
          </h1>
          <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.7, marginBottom: 32, maxWidth: 640 }}>{exam.heroLine}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 100, fontSize: 16, fontWeight: 700, color: '#fff', background: exam.color, textDecoration: 'none', boxShadow: `0 4px 16px ${exam.color}30` }}>
              Start 7-day free trial →
            </Link>
            <Link to="/pdf-generator" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 100, fontSize: 16, fontWeight: 700, color: exam.color, background: '#fff', border: `1.5px solid ${exam.color}40`, textDecoration: 'none' }}>
              Try a free PDF test
            </Link>
          </div>
        </div>
      </header>

      {/* ── About this exam ── */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '56px 40px' }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>About the {exam.shortName}</h2>
        <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 24 }}>{exam.intro}</p>

        {exam.schools.length > 0 && (
          <div style={{ background: exam.lightBg, borderRadius: 16, padding: '20px 24px', marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: exam.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Schools & Programs</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {exam.schools.map(s => (
                <span key={s} style={{ fontSize: 13, padding: '5px 14px', borderRadius: 100, background: '#fff', border: `1px solid ${exam.color}25`, color: '#334155', fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Exam structure ── */}
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 20 }}>Exam Structure</h2>
        <div style={{ marginBottom: 12 }}>
          {exam.structure.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #F3F4F6', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 80 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: exam.color }}>{s.duration}</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{s.questions}</div>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 14, color: '#94A3B8', fontStyle: 'italic', marginBottom: 48 }}>Total: {exam.totalTime}</div>

        {/* ── Preparation tips ── */}
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Preparation Tips</h2>
        <div style={{ marginBottom: 48 }}>
          {exam.tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 14, color: exam.color, fontWeight: 700, marginTop: 2 }}>✓</span>
              <span style={{ fontSize: 15, color: '#334155', lineHeight: 1.7 }}>{tip}</span>
            </div>
          ))}
        </div>

        {/* ── What ScholarPrep offers ── */}
        <div style={{ background: '#F8FAFC', borderRadius: 20, padding: '40px 32px', border: '1px solid #E5E7EB', marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 20, textAlign: 'center' }}>How ScholarPrep Prepares You</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { icon: '🔄', title: 'Unlimited Fresh Questions', desc: 'New questions every session — your child never sees the same test twice.' },
              { icon: '⏱️', title: 'Full Simulated Exams', desc: `Timed sections matching the real ${exam.shortName} exam structure and breaks.` },
              { icon: '📊', title: 'Progress Tracking', desc: 'See scores by topic and question type. Know exactly where to focus.' },
              { icon: '✍️', title: 'Writing Feedback', desc: 'Detailed scored criteria on every writing submission.' },
            ].map(f => (
              <div key={f.title} style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Start Preparing Today</h2>
          <p style={{ fontSize: 16, color: '#64748B', marginBottom: 28 }}>7-day free trial. No credit card required. Cancel anytime.</p>
          <Link to="/signup" style={{ display: 'inline-block', padding: '16px 40px', borderRadius: 100, fontSize: 17, fontWeight: 700, color: '#fff', background: exam.color, textDecoration: 'none', boxShadow: `0 6px 24px ${exam.color}30` }}>
            Start free trial — $9.99/month →
          </Link>
        </div>

        {/* ── Other exams ── */}
        <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Also prepare for</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(EXAM_DATA).filter(([k]) => k !== slug).map(([k, e]) => (
              <Link key={k} to={`/exams/${k}`} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 100, background: '#F8FAFC', border: '1px solid #E5E7EB', color: '#475569', fontWeight: 600, textDecoration: 'none' }}>
                {e.icon} {e.shortName}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#F8FAFC', borderTop: '1px solid #F3F4F6', padding: '32px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.8, maxWidth: 700, margin: '0 auto' }}>
          ScholarPrep is an independent educational platform and is not affiliated with, endorsed by, or associated with ACARA, ACER, Edutest, ICAS Assessments (Janison), or any government education department. Exam structures, question counts and durations shown are approximate, based on publicly available information, and may change. Always confirm details with the official testing body. ScholarPrep provides practice materials for educational purposes only and does not guarantee exam outcomes, scores, or placement results.
        </p>
        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 12 }}>© {new Date().getFullYear()} Go Circle Pty Ltd · <Link to="/" style={{ color: '#94A3B8' }}>scholarprep.com.au</Link></p>
      </footer>
    </div>
  );
}
