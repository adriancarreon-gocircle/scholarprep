import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ── ScholarPrep eBooks — catalogue + cart ───────────────────────────────────
// The 4th revenue offering: full-length practice books (44 mini-tests + 4
// full simulated exams per volume) sold as one-off PDF purchases, separate
// from the subscription, the $0.15/question PDF generator, and the
// Printable Practice Test Papers. Approved as an HTML mockup first, this is
// that same design ported to a real React page.
//
// Checkout now goes through the SAME shared endpoint your Practice Papers
// page uses — POST /api/stripe with { type: 'ebook', skus, successUrl,
// cancelUrl } — instead of a standalone endpoint, so there's one consistent
// way this app talks to Stripe for one-off purchases. successUrl uses
// Stripe's {CHECKOUT_SESSION_ID} placeholder (Stripe fills it in), landing
// on /ebooks/success, which — like /practice-papers/success — verifies the
// session server-side via GET /api/ebook-download?session_id=... rather
// than trusting a query-param flag. That download endpoint (mirroring
// api/paper-download.js) is the remaining piece to build once the file
// hosting/signing approach is confirmed.

const FULL_KIND = 'Selective Entry, Scholarship & NAPLAN-style Tests';
const CART_STORAGE_KEY = 'scholarprep_ebook_cart_v1';

const CATALOGUE = [
  {
    id: 3, label: 'Year 3', accent: '#059669', accentSoft: '#DCFCE7', kind: FULL_KIND,
    volumes: [
      { vol: 1, pages: 215, price: 14.95, status: 'available', cover: '/ebook-covers/year3-vol1.jpg', sku: 'y3v1' },
      { vol: 2, pages: 220, price: 14.95, status: 'available', cover: '/ebook-covers/year3-vol2.jpg', sku: 'y3v2' },
      { vol: 3, pages: 219, price: 14.95, status: 'available', cover: '/ebook-covers/year3-vol3.jpg', sku: 'y3v3' },
    ],
  },
  {
    id: 5, label: 'Year 5', accent: '#0EA5E9', accentSoft: '#E0F2FE', kind: FULL_KIND,
    volumes: [
      { vol: 1, pages: 257, price: 14.95, status: 'available', cover: '/ebook-covers/year5-vol1.jpg', sku: 'y5v1' },
      { vol: 2, pages: 248, price: 14.95, status: 'available', cover: '/ebook-covers/year5-vol2.jpg', sku: 'y5v2' },
      { vol: 3, pages: 244, price: 14.95, status: 'available', cover: '/ebook-covers/year5-vol3.jpg', sku: 'y5v3' },
    ],
  },
  {
    id: 7, label: 'Year 7', accent: '#F97316', accentSoft: '#FFEDD5', kind: FULL_KIND,
    volumes: [
      { vol: 1, pages: 264, price: 14.95, status: 'available', cover: '/ebook-covers/year7-vol1.jpg', sku: 'y7v1' },
      { vol: 2, pages: null, price: 14.95, status: 'soon', cover: null, sku: 'y7v2' },
      { vol: 3, pages: null, price: 14.95, status: 'soon', cover: null, sku: 'y7v3' },
    ],
  },
];

const FILTERS = [
  { key: 'all', label: 'All books' },
  { key: '3', label: 'Year 3' },
  { key: '5', label: 'Year 5' },
  { key: '7', label: 'Year 7' },
];

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // best-effort only — a full/blocked localStorage should never break the page
  }
}

function coverGradient(accent) {
  return `linear-gradient(150deg, ${accent}, #1e1b4b)`;
}

function BookCover({ year, volume }) {
  const soon = volume.status === 'soon';
  const baseStyle = {
    aspectRatio: '3 / 4',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 16,
    color: '#fff',
    filter: soon ? 'grayscale(0.35)' : 'none',
  };
  const bgStyle = volume.cover
    ? { backgroundImage: `url(${volume.cover})`, backgroundSize: 'cover', backgroundPosition: 'top center' }
    : { background: coverGradient(year.accent) };

  return (
    <div style={{ ...baseStyle, ...bgStyle }}>
      {volume.cover && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(8,10,26,0.88) 0%, rgba(8,10,26,0.42) 52%, rgba(8,10,26,0.04) 78%)',
        }} />
      )}
      {soon && (
        <div style={{
          position: 'absolute', top: 14, right: -32, transform: 'rotate(40deg)',
          background: '#0F172A', color: '#F5F7FF', fontSize: 10.5, fontWeight: 800,
          letterSpacing: '0.05em', textTransform: 'uppercase', padding: '4px 40px',
        }}>Coming soon</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85 }}>ScholarPrep&reg;</div>
        <div style={{ fontSize: 10.5, fontWeight: 800, background: 'rgba(255,255,255,0.22)', padding: '3px 9px', borderRadius: 100 }}>Vol {volume.vol} / 3</div>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', opacity: 0.9, textTransform: 'uppercase' }}>{year.label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.05, marginTop: 2 }}>Volume {volume.vol}</div>
        <div style={{ fontSize: 10.5, marginTop: 6, opacity: 0.92, lineHeight: 1.42, maxWidth: '27ch', fontWeight: 600 }}>{year.kind}</div>
      </div>
    </div>
  );
}

function Chip({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: '#475569', background: '#FBFCFF',
      border: '1px solid rgba(67,56,202,0.09)', padding: '4px 9px', borderRadius: 8,
      display: 'flex', alignItems: 'center', gap: 4,
    }}>{children}</div>
  );
}

function BookCard({ year, volume, inCart, onToggle }) {
  const soon = volume.status === 'soon';
  return (
    <div
      style={{
        background: '#fff', border: '1px solid rgba(67,56,202,0.09)', borderRadius: 18,
        padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
        boxShadow: '0 1px 3px rgba(67,56,202,0.06), 0 10px 24px -12px rgba(67,56,202,0.12)',
        opacity: soon ? 0.72 : 1,
      }}
    >
      <BookCover year={year} volume={volume} />
      <h3 style={{ fontSize: 15.5, fontWeight: 800, margin: 0, letterSpacing: '-0.1px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {year.label} — Volume {volume.vol}
      </h3>
      <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: -6, lineHeight: 1.4 }}>{year.kind}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <Chip>📝 44 mini-tests</Chip>
        <Chip>🎯 4 full exams</Chip>
        <Chip>🔢 600+ Qs</Chip>
        <Chip>📄 {volume.pages ? `${volume.pages} pages` : 'TBC'}</Chip>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', paddingTop: 2 }}>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
          {soon ? '—' : `$${volume.price.toFixed(2)}`}
        </div>
        {soon ? (
          <button disabled style={{
            marginLeft: 'auto', border: 'none', borderRadius: 100, fontWeight: 700, fontSize: 12.5,
            padding: '9px 15px', background: '#FBFCFF', color: '#94A3B8', cursor: 'not-allowed',
          }}>Notify me</button>
        ) : (
          <button
            onClick={onToggle}
            style={{
              marginLeft: 'auto', border: 'none', borderRadius: 100, fontWeight: 700, fontSize: 12.5,
              padding: '9px 15px', cursor: 'pointer',
              background: inCart ? '#DCFCE7' : '#4338CA',
              color: inCart ? '#059669' : '#fff',
            }}
          >
            {inCart ? '✓ In cart' : 'Add to cart'}
          </button>
        )}
      </div>
    </div>
  );
}

const BOOK_PREVIEWS = [
  {
    src: '/book-preview/preview-contents.jpg',
    title: 'A complete table of contents',
    caption: '44 practice mini-tests, 4 full-length simulated exams, plus a Writing section with a marking checklist — every page mapped out from the start.',
  },
  {
    src: '/book-preview/preview-reading-minitest.jpg',
    title: 'Original comprehension passages',
    caption: 'Real, original short stories and non-fiction passages — never recycled public-domain text — paired with exam-style comprehension questions.',
  },
  {
    src: '/book-preview/preview-english-minitest.jpg',
    title: 'Conventions of Language',
    caption: 'Vocabulary, spelling, punctuation and grammar — the exact skills tested in Selective Entry and Scholarship English papers.',
  },
  {
    src: '/book-preview/preview-maths-minitest.jpg',
    title: 'Mathematical Reasoning',
    caption: 'Word problems, place value, data interpretation and more, with fully worked answers explained at the back — not just an answer key.',
  },
];

export default function EbookCataloguePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [cart, setCart] = useState(() => loadCart());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [toast, setToast] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const nextPreview = () => setPreviewIndex(i => (i + 1) % BOOK_PREVIEWS.length);
  const prevPreview = () => setPreviewIndex(i => (i - 1 + BOOK_PREVIEWS.length) % BOOK_PREVIEWS.length);

  useEffect(() => { saveCart(cart); }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const allBooks = useMemo(() => {
    const rows = [];
    CATALOGUE.forEach(year => year.volumes.forEach(volume => rows.push({ year, volume })));
    return rows;
  }, []);

  const bySku = useMemo(() => {
    const map = {};
    allBooks.forEach(({ year, volume }) => { map[volume.sku] = { year, volume }; });
    return map;
  }, [allBooks]);

  const visibleYears = filter === 'all' ? CATALOGUE : CATALOGUE.filter(y => String(y.id) === filter);
  const cartItems = Object.keys(cart).map(sku => ({ sku, ...cart[sku] }));
  const subtotal = cartItems.reduce((s, item) => s + item.price, 0);

  const toggleCart = useCallback((year, volume) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[volume.sku]) {
        delete next[volume.sku];
      } else {
        next[volume.sku] = { label: `${year.label} — Vol ${volume.vol}`, price: volume.price };
        setToast(`${year.label} — Volume ${volume.vol} added to cart`);
      }
      return next;
    });
  }, []);

  const removeFromCart = useCallback((sku) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[sku];
      return next;
    });
  }, []);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckingOut(true);
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ebook',
          skus: cartItems.map(i => i.sku),
          successUrl: `${window.location.origin}/ebooks/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/ebooks`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout — please try again.');
      window.location.href = data.url;
    } catch (e) {
      console.error('Ebook checkout error:', e);
      setToast(e.message || 'Something went wrong starting checkout.');
      setCheckingOut(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF', fontFamily: 'Inter, sans-serif', color: '#0F172A' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(67,56,202,0.09)', display: 'flex', alignItems: 'center', gap: 16, padding: '14px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4338CA, #6D5DF0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800,
            fontSize: 16, fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>SP</div>
          <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.2px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Scholar<span style={{ color: '#4338CA' }}>Prep</span>
          </div>
        </div>
        <nav style={{ marginLeft: 6, fontSize: 13, color: '#94A3B8', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
          <span style={{ opacity: 0.5 }}>/</span>
          <span style={{ color: '#0F172A', fontWeight: 600 }}>eBooks</span>
        </nav>
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            marginLeft: 'auto', position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', border: '1.5px solid rgba(67,56,202,0.09)', color: '#0F172A', fontWeight: 600,
            fontSize: 13.5, padding: '9px 16px 9px 14px', borderRadius: 100, cursor: 'pointer',
          }}
        >
          🛒 Cart
          <span style={{
            background: '#4338CA', color: '#fff', fontSize: 11, fontWeight: 800, minWidth: 18, height: 18,
            borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
          }}>{cartItems.length}</span>
        </button>
      </header>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '44px 28px 8px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase', color: '#4338CA', background: '#EEF2FF',
          padding: '5px 12px', borderRadius: 100, marginBottom: 14,
        }}>📚 Practice Book Library</div>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 10px', maxWidth: '20ch', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Full-length practice books, ready to download tonight.
        </h1>
        <p style={{ fontSize: 15.5, color: '#475569', maxWidth: '62ch', lineHeight: 1.65, margin: 0 }}>
          Every volume packs 44 practice mini-tests and 4 full-length simulated exams into one PDF — a complete,
          self-marking prep course for Reading, English, General Ability and Mathematical Reasoning. Buy once,
          print or study on screen forever.
        </p>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginTop: 26 }}>
          {[['3', 'year levels'], ['44', 'mini-tests / volume'], ['4', 'full exams / volume'], ['600+', 'questions / volume']].map(([n, label]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <b style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', fontVariantNumeric: 'tabular-nums' }}>{n}</b>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHY THESE BOOKS ARE DIFFERENT ── */}
      <div style={{ maxWidth: 1180, margin: '48px auto 0', padding: '0 28px' }}>
        <div style={{
          background: '#fff', border: '1px solid rgba(67,56,202,0.09)', borderRadius: 20,
          padding: '32px 28px', boxShadow: '0 1px 3px rgba(67,56,202,0.06), 0 10px 24px -12px rgba(67,56,202,0.1)',
        }}>
          <h2 style={{ fontSize: 'clamp(20px,2.6vw,26px)', fontWeight: 800, margin: '0 0 10px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Why these books are different
          </h2>
          <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.75, maxWidth: '82ch', margin: 0 }}>
            Most practice books you'll find in a bookshop or on Amazon pack in 30–50 short tests for $25–35 — and there's
            rarely a way to see what's actually inside before you buy. Every ScholarPrep volume gives you <strong>44 practice
              mini-tests plus 4 full-length simulated exams</strong> — over 600 original questions across Reading, English,
            General Ability and Mathematical Reasoning — with a complete worked answer key at the back explaining every
            answer, not just listing it. It's the equivalent of 3–4 typical practice books bound into one, at a fraction of
            the combined price. Below is a genuine look inside one of our books, so you know exactly what you're getting.
          </p>
        </div>
      </div>

      {/* ── LOOK INSIDE — real book preview carousel ── */}
      <div style={{ maxWidth: 1180, margin: '28px auto 0', padding: '0 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', color: '#4338CA', background: '#EEF2FF',
            padding: '5px 12px', borderRadius: 100, marginBottom: 14,
          }}>👀 Look inside</div>
          <h3 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, margin: '0 0 8px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Real pages from ScholarPrep — Year 3, Volume 1
          </h3>
          <p style={{ fontSize: 14, color: '#94A3B8', maxWidth: 560, margin: '0 auto' }}>
            Every volume follows the same structure — the specific questions differ by year level.
          </p>
        </div>

        <div style={{ position: 'relative', maxWidth: 620, margin: '0 auto' }}>
          <div style={{
            background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(67,56,202,0.09)',
            boxShadow: '0 1px 3px rgba(67,56,202,0.06), 0 20px 44px -16px rgba(67,56,202,0.18)',
          }}>
            <img
              src={BOOK_PREVIEWS[previewIndex].src}
              alt={BOOK_PREVIEWS[previewIndex].title}
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </div>
          <button
            onClick={prevPreview}
            aria-label="Previous page"
            style={{
              position: 'absolute', top: '50%', left: -18, transform: 'translateY(-50%)',
              width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(67,56,202,0.09)', background: '#fff',
              boxShadow: '0 8px 20px rgba(15,23,42,0.14)', cursor: 'pointer', fontSize: 17, color: '#374151',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >‹</button>
          <button
            onClick={nextPreview}
            aria-label="Next page"
            style={{
              position: 'absolute', top: '50%', right: -18, transform: 'translateY(-50%)',
              width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(67,56,202,0.09)', background: '#fff',
              boxShadow: '0 8px 20px rgba(15,23,42,0.14)', cursor: 'pointer', fontSize: 17, color: '#374151',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >›</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, padding: '0 20px' }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: '#0F172A', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {BOOK_PREVIEWS[previewIndex].title}
          </div>
          <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            {BOOK_PREVIEWS[previewIndex].caption}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18 }}>
          {BOOK_PREVIEWS.map((p, i) => (
            <button
              key={p.src}
              onClick={() => setPreviewIndex(i)}
              aria-label={`Go to page ${i + 1}`}
              style={{
                width: i === previewIndex ? 20 : 8, height: 8, borderRadius: 100, border: 'none',
                background: i === previewIndex ? '#4338CA' : '#E2E8F0', cursor: 'pointer', transition: 'all 0.2s', padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{
        maxWidth: 1180, margin: '30px auto 0', padding: '10px 28px', display: 'flex', gap: 8, flexWrap: 'wrap',
        alignItems: 'center', position: 'sticky', top: 65, zIndex: 15, background: 'rgba(245,247,255,0.92)', backdropFilter: 'blur(6px)',
      }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              border: '1.5px solid rgba(67,56,202,0.09)', background: filter === f.key ? '#4338CA' : '#fff',
              color: filter === f.key ? '#fff' : '#475569', fontWeight: 600, fontSize: 13, padding: '8px 16px',
              borderRadius: 100, cursor: 'pointer',
            }}
          >{f.label}</button>
        ))}
      </div>

      {visibleYears.map(year => {
        const allAvailable = year.volumes.every(v => v.status === 'available');
        return (
          <React.Fragment key={year.id}>
            <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '38px 0 16px', flexWrap: 'wrap' }}>
                <div style={{ width: 10, height: 10, borderRadius: 100, background: year.accent }} />
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{year.label}</h2>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{year.kind}</span>
                {allAvailable && (
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#059669', background: '#DCFCE7', padding: '4px 12px', borderRadius: 100 }}>
                    Bundle all 3 &amp; save $15
                  </span>
                )}
              </div>
            </div>
            <div style={{
              maxWidth: 1180, margin: '0 auto', padding: '0 28px 40px', display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(252px,1fr))', gap: 22,
            }}>
              {year.volumes.map(volume => (
                <BookCard
                  key={volume.sku}
                  year={year}
                  volume={volume}
                  inCart={!!cart[volume.sku]}
                  onToggle={() => toggleCart(year, volume)}
                />
              ))}
            </div>
          </React.Fragment>
        );
      })}

      <footer style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px 60px', fontSize: 11, color: '#94A3B8', lineHeight: 1.6, borderTop: '1px solid rgba(67,56,202,0.09)' }}>
        <p style={{ margin: '14px 0 0' }}>
          NAPLAN&reg; is a registered trademark of the Australian Curriculum, Assessment and Reporting Authority (ACARA).
          ScholarPrep and Go Circle Pty Ltd are not affiliated with, endorsed by, or sponsored by ACARA, ACER, Edutest Pty Ltd,
          Academic Assessment Services Pty Ltd, any Selective Entry or Opportunity Class testing authority, any independent
          school Scholarship testing provider, or any state or territory education department. References to "NAPLAN-style",
          "Selective Entry" and "Scholarship" describe only the style and format of the practice material, and do not imply
          any official endorsement.
        </p>
      </footer>

      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.32)', backdropFilter: 'blur(2px)', zIndex: 30 }}
        />
      )}
      <aside style={{
        position: 'fixed', top: 0, right: 0, height: '100%', width: 'min(400px,92vw)', background: '#fff',
        borderLeft: '1px solid rgba(67,56,202,0.09)', boxShadow: '-20px 0 50px rgba(15,23,42,0.18)',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .25s cubic-bezier(.2,.8,.2,1)',
        zIndex: 31, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 20px', borderBottom: '1px solid rgba(67,56,202,0.09)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Your cart</h3>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{ marginLeft: 'auto', background: '#FBFCFF', border: 'none', width: 30, height: 30, borderRadius: 100, color: '#475569', fontSize: 15, cursor: 'pointer' }}
          >✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cartItems.length === 0 ? (
            <div style={{ color: '#94A3B8', fontSize: 13.5, textAlign: 'center', padding: '60px 10px' }}>
              Your cart is empty.<br />Add a volume to get started.
            </div>
          ) : cartItems.map(item => {
            const entry = bySku[item.sku];
            return (
              <div key={item.sku} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10, border: '1px solid rgba(67,56,202,0.09)', borderRadius: 12 }}>
                <div style={{
                  width: 38, height: 50, borderRadius: 5, flex: 'none',
                  background: entry ? coverGradient(entry.year.accent) : '#4338CA',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>${item.price.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => removeFromCart(item.sku)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}
                >Remove</button>
              </div>
            );
          })}
        </div>
        {cartItems.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(67,56,202,0.09)', padding: '16px 20px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', marginBottom: 6 }}>
              <span>Subtotal ({cartItems.length} item{cartItems.length === 1 ? '' : 's'})</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, marginTop: 8 }}>
              <span>Total</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              style={{
                width: '100%', marginTop: 14, padding: 13, border: 'none', borderRadius: 12, background: '#4338CA',
                color: '#fff', fontWeight: 800, fontSize: 14, cursor: checkingOut ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: checkingOut ? 0.7 : 1,
              }}
            >{checkingOut ? 'Starting checkout…' : 'Checkout with Stripe →'}</button>
            <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
              Secure payment via Stripe · instant download link by email
            </div>
          </div>
        )}
      </aside>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)', background: '#0F172A',
          color: '#F5F7FF', fontSize: 13, fontWeight: 600, padding: '12px 20px', borderRadius: 12, zIndex: 40,
          boxShadow: '0 20px 40px -16px rgba(15,23,42,0.4)', maxWidth: '88vw', textAlign: 'center',
        }}>{toast}</div>
      )}
    </div>
  );
}