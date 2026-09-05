// ── Shared question / test QA checker ───────────────────────────────────────
// Applied to every generated question before it reaches a student, an
// admin's printed paper, or a custom test — across ALL generation paths
// (live subject tests, the Custom Test Generator, the Admin Paper Builder,
// the PDF Generator, and the shared question pool). See ai.js's
// repairInvalidQuestions() for where this gets wired into generation.
//
// Deliberately dependency-free — no import from ai.js, progress.js, or any
// React file — so it can be imported from anywhere (including a future
// server-side endpoint) without any risk of a circular import. ai.js imports
// FROM this module; this module never imports from ai.js.
//
// IMPORTANT SCOPE NOTE: this module can only check STRUCTURE — well-formed
// options, a real "correct" key, no duplicate-looking answer choices, no
// duplicate questions within one test/paper. It has no way to independently
// verify that an AI-written answer is factually/mathematically correct for
// open-ended content, because there is no subject-matter oracle for
// free-form English/General-Ability/Reading questions the way there is for
// the four deterministic local maths generators (see verifyLocalMathsAnswer
// below, which DOES independently re-derive the arithmetic from the question
// text itself — never trusting the generator's own working, the same
// standard used throughout this project). For everything else, "correct" is
// only as good as the model that wrote it — this checker's job is to make
// sure a bad model output at least never reaches a student/paper unnoticed,
// and to give a human reviewer (see the flagged_questions pipeline in
// progress.js) somewhere real to look.

const LETTERS = ['A', 'B', 'C', 'D'];

const normalizeText = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');

// ── Duplicate-looking picture-pattern answer options ────────────────────────
// A picture-pattern/quadrant-pattern question's real "answer" lives in
// visual.answerFrames (or a quadrant transform), not in q.options (which are
// deliberately identical-looking placeholder labels like "Option A"/"Option
// B"). Two options that RENDER as the exact same picture are just as broken
// as two identical text options elsewhere — most commonly caused by rotating
// a symmetric shape (circle/square/diamond/cross) by two values that are
// actually visually indistinguishable (a plain square repeats every 90°, a
// circle looks the same at any angle at all).
const SHAPE_ROTATION_PERIOD = {
  circle: 1, circle_thick: 1,                              // identical at any angle
  square: 90, square_small: 90, diamond: 90, cross_x: 90,  // repeats every 90°
};

function normalizeShapeForCompare(sh) {
  if (!sh || typeof sh !== 'object') return sh;
  const period = SHAPE_ROTATION_PERIOD[sh.type];
  const rotation = period ? (period === 1 ? 0 : ((sh.rotation || 0) % period)) : (sh.rotation || 0);
  return { ...sh, rotation };
}

// Only normalizes the "picturepattern" frame shape (a {shapes:[...]} list,
// optionally with bgShape) — the {polygonSides,elements} vertex-rotation
// frame variant and quadrantpattern's {rotation,flip} transforms are
// compared as-is (no known symmetry trap reported for those).
function normalizeFrameForCompare(frame) {
  if (!frame || typeof frame !== 'object') return frame;
  if (Array.isArray(frame.shapes)) return { shapes: frame.shapes.map(normalizeShapeForCompare), bgShape: frame.bgShape || null };
  return frame;
}

export function hasDuplicateAnswerOptions(q) {
  const frames = q?.visual?.answerFrames;
  if (!frames) return false;
  if (LETTERS.some(l => frames[l] === undefined)) return false;
  const keys = LETTERS.map(l => JSON.stringify(normalizeFrameForCompare(frames[l])));
  return new Set(keys).size < LETTERS.length;
}

// ── Per-question structural validation ──────────────────────────────────────
// Returns { ok, issues } — issues always lists every problem found. When
// there are no hard issues but explanation text is missing, ok is still true
// but issues carries a single "(warning) ..." entry so a caller can log soft
// quality gaps without treating them as a reason to regenerate.
export function validateQuestion(q) {
  if (!q || typeof q !== 'object') return { ok: false, issues: ['question is missing / not an object'] };

  const issues = [];
  if (!q.question || !String(q.question).trim()) issues.push('empty question text');

  const opts = q.options;
  if (!opts || typeof opts !== 'object') {
    issues.push('missing options object');
  } else {
    const missing = LETTERS.filter(l => !(l in opts));
    if (missing.length > 0) issues.push(`missing option(s): ${missing.join(', ')}`);

    const empty = LETTERS.filter(l => l in opts && !String(opts[l] ?? '').trim());
    if (empty.length > 0) issues.push(`empty option(s): ${empty.join(', ')}`);

    // Duplicate option TEXT — skipped for picture-pattern questions, where
    // every option's "text" is deliberately the same style of placeholder
    // label and the real content lives in visual.answerFrames instead.
    const isPicturePattern = !!q.visual?.answerFrames;
    if (!isPicturePattern && missing.length === 0) {
      const norm = LETTERS.map(l => normalizeText(opts[l]));
      if (new Set(norm).size < LETTERS.length) issues.push('duplicate answer option text');
    }
  }

  if (!q.correct || !LETTERS.includes(q.correct)) {
    issues.push(`"correct" is not a valid letter: ${JSON.stringify(q.correct)}`);
  } else if (opts && typeof opts === 'object') {
    if (!(q.correct in opts)) issues.push(`"correct" (${q.correct}) does not match any option`);
    else if (!String(opts[q.correct] ?? '').trim()) issues.push(`"correct" (${q.correct}) points at an empty option`);
  }

  if (hasDuplicateAnswerOptions(q)) issues.push('duplicate-looking picture-pattern answer options');

  if (issues.length === 0 && (!q.explanation || !String(q.explanation).trim())) {
    return { ok: true, issues: ['(warning) missing explanation'] };
  }
  return { ok: issues.length === 0, issues };
}

// ── Set-level duplicate detection ───────────────────────────────────────────
// Flags any two questions in the SAME test/paper that look like duplicates —
// same topic/type tag and (after light normalisation) the same first ~12
// words. This mirrors the anti-repeat fingerprint the generation prompts
// already ask the model to avoid (see fingerprintQuestion in ai.js) but is
// enforced HERE as a hard, independently-computed check rather than relying
// on the model having actually followed a "please don't repeat" instruction.
function defaultSignature(q) {
  if (!q) return '';
  const text = normalizeText(q?.question).replace(/[^a-z0-9 ]+/g, '').split(' ').filter(Boolean).slice(0, 12).join(' ');
  if (!text) return '';
  return `${q.questionType || q.topic || ''}::${text}`;
}

export function validateQuestionSet(questions, { signatureFn = defaultSignature } = {}) {
  const issues = [];
  const bySignature = new Map();
  const duplicateIndexPairs = [];
  (questions || []).forEach((q, i) => {
    const sig = signatureFn(q);
    if (!sig) return;
    if (bySignature.has(sig)) {
      duplicateIndexPairs.push([bySignature.get(sig), i]);
      issues.push(`questions #${bySignature.get(sig) + 1} and #${i + 1} look like duplicates`);
    } else {
      bySignature.set(sig, i);
    }
  });
  return { ok: issues.length === 0, issues, duplicateIndexPairs };
}

// ── Independent arithmetic re-verification (deterministic local maths only) ─
// The ONLY question types this checker can verify are actually CORRECT (not
// just well-formed) — everything else in this app is free-form AI content
// with no independent oracle to check against. Matches the exact question
// text produced by localAddition/localSubtraction/localMultiplication/
// localDivision in ai.js; returns {ok:true} (nothing to check) for anything
// that doesn't match one of those patterns, rather than guessing.
export function verifyLocalMathsAnswer(q) {
  if (!q || !q.question || !q.options || !q.correct || !(q.correct in q.options)) return { ok: true, issues: [] };
  const text = String(q.question).trim();
  const correctText = String(q.options[q.correct] ?? '').trim();

  const checkNumericMatch = (expected) => {
    const got = Number(String(correctText).replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(got) || got !== expected) {
      return { ok: false, issues: [`"${text}" — marked-correct answer is "${correctText}", independently re-derived answer is ${expected}`] };
    }
    return { ok: true, issues: [] };
  };

  let m;
  if ((m = text.match(/^(-?\d+)\s*\+\s*(-?\d+)\s*=\s*\?$/))) return checkNumericMatch(Number(m[1]) + Number(m[2]));
  if ((m = text.match(/^(-?\d+)\s*-\s*(-?\d+)\s*=\s*\?$/))) return checkNumericMatch(Number(m[1]) - Number(m[2]));
  if ((m = text.match(/^(-?\d+)\s*x\s*(-?\d+)\s*=\s*\?$/i))) return checkNumericMatch(Number(m[1]) * Number(m[2]));
  if ((m = text.match(/^(-?\d+)\s*÷\s*(-?\d+)\s*=\s*\?$/))) return checkNumericMatch(Number(m[1]) / Number(m[2]));
  if ((m = text.match(/^Divide (-?\d+) by (-?\d+)\.\s*What is the remainder\?$/i))) {
    const dividend = Number(m[1]), divisor = Number(m[2]);
    if (!divisor) return { ok: true, issues: [] };
    return checkNumericMatch(((dividend % divisor) + divisor) % divisor);
  }
  return { ok: true, issues: [] }; // not a recognised local-generator pattern — nothing to check
}