// ── Shared exam directory ────────────────────────────────────────────────
// Single source of truth for the 12 exams ScholarPrep prepares students
// for. Used by SiteHeader.jsx (nav "Exams" dropdown + mobile menu) and by
// Landing.jsx (the #exams grid section and footer "Popular/More Tests"
// columns) so every page lists the same exams in the same order.

export const EXAM_LINKS = [
  { slug: 'acer-selective', label: 'ACER Selective Entry', icon: '🎓' },
  { slug: 'aast-scholarship', label: 'AAST Scholarship', icon: '📚' },
  { slug: 'edutest-selective', label: 'Edutest', icon: '🏫' },
  { slug: 'naplan', label: 'NAPLAN', icon: '📝' },
  { slug: 'aset-gate-wa', label: 'ASET / GATE (WA)', icon: '🌊' },
  { slug: 'peac-wa', label: 'PEAC (WA)', icon: '🌱' },
  { slug: 'ignite-sa', label: 'IGNITE (SA)', icon: '🔥' },
  { slug: 'seal-vic', label: 'SEAL (VIC)', icon: '⚡' },
  { slug: 'sehs-vic', label: 'SEHS (VIC)', icon: '🏛️' },
  { slug: 'oc-nsw', label: 'OC Test (NSW)', icon: '🎯' },
  { slug: 'hast', label: 'HAST', icon: '🏆' },
  { slug: 'icas', label: 'ICAS', icon: '🌏' },
];