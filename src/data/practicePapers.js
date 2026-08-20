// ── Practice Paper catalog ───────────────────────────────────────────────────
// Metadata for the storefront. Actual PDF files live in Supabase Storage
// (bucket: practice-papers) under the `file` path shown below.
// To add a new paper: write its content as JSON (see /scripts/paper-1.json for
// the format), generate the PDF via generate_paper_pdf.py, upload the PDF to
// Supabase Storage, then add an entry here and to the sitemap.

export const PRACTICE_PAPER_LEVELS = [
  {
    level: '3-5',
    label: 'Level 3–5',
    description: 'For students in Years 3 to 5 preparing for early selective entry and gifted programs (PEAC, OC preliminary practice, general selective readiness).',
    papers: [
      {
        id: 'level-3-5-paper-1',
        title: 'Paper 1',
        examStyle: 'ACER-style',
        questionCount: 58,
        price: 12.99,
        file: 'level-3-5/scholarprep-paper-1-level-3-5.pdf',
        available: true,
      },
      {
        id: 'level-3-5-paper-2',
        title: 'Paper 2',
        examStyle: 'Edutest-style',
        questionCount: 58,
        price: 12.99,
        file: null,
        available: false,
      },
      {
        id: 'level-3-5-paper-3',
        title: 'Paper 3',
        examStyle: 'OC-style',
        questionCount: 58,
        price: 12.99,
        file: null,
        available: false,
      },
      {
        id: 'level-3-5-paper-4',
        title: 'Paper 4',
        examStyle: 'AAST-style',
        questionCount: 58,
        price: 12.99,
        file: null,
        available: false,
      },
      {
        id: 'level-3-5-paper-5',
        title: 'Paper 5',
        examStyle: 'General selective entry',
        questionCount: 58,
        price: 12.99,
        file: null,
        available: false,
      },
    ],
    bundlePrice: 49.99,
    bundleId: 'level-3-5-bundle',
  },
];

export function getLevel(levelSlug) {
  return PRACTICE_PAPER_LEVELS.find(l => l.level === levelSlug);
}

export function getPaper(levelSlug, paperId) {
  const level = getLevel(levelSlug);
  return level?.papers.find(p => p.id === paperId);
}
