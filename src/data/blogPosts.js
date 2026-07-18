// ── Blog post data ───────────────────────────────────────────────────────────
// To add a new post: copy an existing object below, give it a unique `slug`,
// fill in the fields, and add it to the BLOG_POSTS array. It will automatically
// appear on /blog and be reachable at /blog/<slug>. Remember to also add the
// new URL to public/sitemap.xml so Google finds it.
//
// `body` is an array of content blocks rendered in order. Supported types:
//   { type: 'p', text: '...' }                      — paragraph
//   { type: 'h2', text: '...' }                      — section heading
//   { type: 'list', items: ['...', '...'] }          — bullet list
//   { type: 'quote', text: '...' }                   — highlighted callout box

export const BLOG_POSTS = [
  {
    slug: 'how-to-prepare-for-oc-test-year-4',
    title: 'How to Prepare for the OC Test in Year 4: A Parent\'s Guide',
    metaDescription: 'A practical, step-by-step guide to preparing your Year 4 child for the NSW Opportunity Class placement test — what to expect, how to practise, and common mistakes to avoid.',
    keywords: 'OC test preparation, Opportunity Class Year 4, OC test tips, NSW OC exam, how to prepare for OC test',
    author: 'ScholarPrep Team',
    date: '2026-07-15',
    readTime: '7 min read',
    category: 'OC Test (NSW)',
    excerpt: 'Everything you need to know about preparing your Year 4 child for the NSW Opportunity Class placement test — without the stress.',
    body: [
      { type: 'p', text: 'If your child is in Year 4 and you\'re considering an Opportunity Class (OC) placement for Year 5, you\'ve probably got questions. When should preparation start? What does the test actually cover? And how much coaching is really necessary? This guide breaks down exactly what the OC test involves and how to help your child prepare with confidence, not pressure.' },
      { type: 'h2', text: 'What is the OC test?' },
      { type: 'p', text: 'The Opportunity Class Placement Test is a computer-based assessment used by the NSW Department of Education to identify academically gifted Year 4 students for placement in Year 5–6 Opportunity Classes at 76+ public primary schools. Unlike many other selective exams, the OC test has no writing component — it\'s built entirely around three areas: Reading, Mathematical Reasoning, and Thinking Skills.' },
      { type: 'h2', text: 'The three components' },
      { type: 'list', items: [
        'Reading (40 minutes) — comprehension across fiction, non-fiction and poetry, delivered as 14 multi-part questions worth 33 total answers.',
        'Mathematical Reasoning (40 minutes) — no calculator allowed. Expect word problems, patterns, geometry and data interpretation rather than straightforward arithmetic.',
        'Thinking Skills (30 minutes) — the most distinctive section. This tests critical thinking and logical reasoning through puzzle-style questions that aren\'t taught in a typical classroom.',
      ]},
      { type: 'quote', text: 'The NSW Department of Education states that coaching is not necessary to succeed in the OC test — but consistent, low-pressure exposure to reasoning-style questions genuinely helps children feel comfortable with the format on test day.' },
      { type: 'h2', text: 'When should preparation start?' },
      { type: 'p', text: 'Most families begin light preparation in Term 3 or 4 of Year 3, ramping up through Term 1 of Year 4 before the test (usually held in May). Starting too early can lead to burnout; starting too late doesn\'t give your child time to get comfortable with the unusual question styles — especially Thinking Skills, which few students have encountered before.' },
      { type: 'h2', text: '5 practical preparation tips' },
      { type: 'list', items: [
        'Practise Thinking Skills specifically — it\'s the section least like regular schoolwork, so dedicated exposure matters most here.',
        'Since there\'s no calculator, build mental maths fluency through everyday practice (times tables, quick addition/subtraction, estimating).',
        'The test is computer-based, so let your child practise answering on a screen, not just on paper — the format itself takes some getting used to.',
        'Read widely and often. Strong reading comprehension underpins performance across all three sections, not just the Reading component.',
        'Keep sessions short and low-pressure — 20–30 minutes a few times a week beats long cramming sessions, especially for a 9-year-old.',
      ]},
      { type: 'h2', text: 'How ScholarPrep helps' },
      { type: 'p', text: 'ScholarPrep offers unlimited practice questions across Reading, Mathematical Reasoning and General Ability (which covers Thinking Skills-style reasoning), plus full timed simulated OC exams that match the real test\'s structure and timing. Because every question is freshly generated, your child never repeats the same question twice — building genuine skill rather than memorised answers.' },
    ],
  },
  {
    slug: 'aset-vs-hast-whats-the-difference',
    title: 'ASET vs HAST: What\'s the Difference and Which One Does Your School Use?',
    metaDescription: 'Confused between ASET and HAST for WA selective entry? This guide breaks down the key differences in structure, timing, and which schools use each test.',
    keywords: 'ASET vs HAST, ASET test, HAST test, WA selective entry test, GATE test WA, Perth Modern entrance exam',
    author: 'ScholarPrep Team',
    date: '2026-07-10',
    readTime: '6 min read',
    category: 'ASET / GATE (WA)',
    excerpt: 'ASET and HAST are both used for selective entry in WA — but they\'re not the same test. Here\'s exactly how they differ.',
    body: [
      { type: 'p', text: 'If you\'re researching selective school entry in Western Australia, you\'ve likely come across both "ASET" and "HAST" — and it\'s easy to assume they\'re the same thing. They\'re not. While both are developed by ACER and test similar underlying skills, they serve different purposes and have different structures. Here\'s how to tell them apart.' },
      { type: 'h2', text: 'ASET (Academic Selective Entrance Test)' },
      { type: 'p', text: 'ASET is the WA Department of Education\'s specific entrance test for Gifted and Talented Education (GATE) programs — most notably Perth Modern School, WA\'s only fully selective government high school. Roughly 5,000 students sit the ASET each year competing for around 750 places.' },
      { type: 'list', items: [
        'Reading Comprehension — 35 minutes, 35 questions',
        'Communicating Ideas in Writing — 25 minutes, 1 task',
        'Quantitative Reasoning — 35 minutes, 35 questions',
        'Abstract Reasoning — 20 minutes, 35 questions (the fastest-paced section — about 34 seconds per question)',
      ]},
      { type: 'h2', text: 'HAST (Higher Ability Selection Test)' },
      { type: 'p', text: 'HAST is a broader, national ACER product used by more than 100 selective and independent schools across five states — not just WA. It comes in different versions depending on year level (Primary, Junior, Middle, Senior Secondary), and individual schools choose which components to include.' },
      { type: 'list', items: [
        'Reading Comprehension — 30–45 minutes depending on level',
        'Mathematical Reasoning — 30–40 minutes',
        'Abstract Reasoning — around 30 minutes',
        'Written Expression — 25–30 minutes, human double-marked',
      ]},
      { type: 'quote', text: 'Key takeaway: ASET is WA-specific and used only for GATE/Perth Modern entry. HAST is used nationally by many different independent and selective schools, each of which sets its own combination of components and test date.' },
      { type: 'h2', text: 'How to know which one your target school uses' },
      { type: 'p', text: 'If you\'re aiming for Perth Modern School or a WA government GATE stream, it\'s ASET. If you\'re applying to an independent school or a selective school outside WA that mentions ACER testing, it\'s most likely a HAST variant — but always confirm directly with the school\'s enrolment office, since exact components and dates vary.' },
      { type: 'h2', text: 'How ScholarPrep helps' },
      { type: 'p', text: 'ScholarPrep offers separate, accurately structured simulated exams for both ASET and HAST — matching each test\'s real section order, question counts, durations and breaks — so your child practises for the exact test they\'ll actually sit, not a generic approximation.' },
    ],
  },
];

export function getPostBySlug(slug) {
  return BLOG_POSTS.find(p => p.slug === slug);
}
