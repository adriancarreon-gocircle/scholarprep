// ── Server-side (CommonJS) mirror of src/data/practicePapers.js ─────────────
// Kept in sync manually. This file is required by API routes (stripe.js,
// paper-download.js) which use CommonJS require(), while the React app uses
// the ES module version in src/data/practicePapers.js for the storefront UI.
// When you add a new paper, update BOTH files.

const PRACTICE_PAPER_LEVELS = [
  {
    level: '3-5',
    papers: [
      { id: 'level-3-5-paper-1', title: 'Paper 1', examStyle: 'ACER-style', questionCount: 58, price: 12.99, file: 'level-3-5/scholarprep-paper-1-level-3-5.pdf', available: true },
      { id: 'level-3-5-paper-2', title: 'Paper 2', examStyle: 'Edutest-style', questionCount: 58, price: 12.99, file: null, available: false },
      { id: 'level-3-5-paper-3', title: 'Paper 3', examStyle: 'OC-style', questionCount: 58, price: 12.99, file: null, available: false },
      { id: 'level-3-5-paper-4', title: 'Paper 4', examStyle: 'AAST-style', questionCount: 58, price: 12.99, file: null, available: false },
      { id: 'level-3-5-paper-5', title: 'Paper 5', examStyle: 'General selective entry', questionCount: 58, price: 12.99, file: null, available: false },
    ],
    bundlePrice: 49.99,
    bundleId: 'level-3-5-bundle',
  },
];

function getLevelServer(levelSlug) {
  return PRACTICE_PAPER_LEVELS.find(l => l.level === levelSlug);
}

function getPaperServer(levelSlug, paperId) {
  const level = getLevelServer(levelSlug);
  return level?.papers.find(p => p.id === paperId);
}

module.exports = { PRACTICE_PAPER_LEVELS, getLevelServer, getPaperServer };
