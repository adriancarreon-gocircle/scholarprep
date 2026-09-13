import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EXAM_LINKS } from '../data/examLinks';

// ── Shared site header ───────────────────────────────────────────────────
// The same nav (desktop + mobile) is used on Landing.jsx and every other
// public page (eBooks catalogue, etc.) so navigation is identical and
// stays in sync everywhere — one place to update instead of copies that
// drift apart. Fully self-contained (its own <style> block, its own
// dropdown/menu state) so it never depends on the host page's styles.
//
// Anchor links use a leading slash (e.g. "/#features") so they resolve
// correctly from any route, not just "/" — clicking one while already on
// the home page is still a same-document navigation (no reload), and
// clicking one from another page like /ebooks goes home and jumps to
// the section.
//
// Props:
//   rightSlot — optional node rendered before "Log in" / "Start free
//               trial" on desktop, and above the mobile CTA button on
//               small screens (e.g. the eBooks page's Cart button).

const PRODUCT_LINKS = [
  { key: 'subscription', label: 'Monthly Subscription', desc: 'Unlimited practice · $9.99/mo', icon: '⭐', href: '/#pricing' },
  { key: 'pdf-generator', label: 'PDF Test Generator', desc: '15¢ per question · instant PDF', icon: '📄', to: '/pdf-generator' },
  { key: 'ebooks', label: 'eBooks', desc: 'Full practice books · $14.95', icon: '📚', to: '/ebooks' },
];

export default function SiteHeader({ rightSlot }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [examsMenuOpen, setExamsMenuOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        .sh-nav-link { font-size: 14px; font-weight: 500; color: #6B7280; text-decoration: none; transition: color 0.15s; font-family: 'Inter', sans-serif; }
        .sh-nav-link:hover { color: #111827; }
        .sh-cta-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: #4338CA; color: #fff;
          padding: 10px 20px; border-radius: 100px;
          font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;
          border: none; cursor: pointer; text-decoration: none;
          box-shadow: 0 4px 20px rgba(67,56,202,0.3); transition: all 0.2s;
        }
        .sh-cta-primary:hover { background: #3730A3; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(67,56,202,0.4); }
        @media (max-width: 768px) {
          .sh-nav-links-d { display: none !important; }
          .sh-nav-cta-d { display: none !important; }
          .sh-nav-burger { display: flex !important; }
        }
        @media (min-width: 769px) { .sh-nav-burger { display: none !important; } }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 60,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <Link to="/" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 900, color: '#111827', letterSpacing: -0.5, textDecoration: 'none' }}>
          Scholar<span style={{ color: '#4338CA' }}>Prep</span>
        </Link>
        <div className="sh-nav-links-d" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="/#features" className="sh-nav-link">Features</a>
          <a href="/#subjects" className="sh-nav-link">Subjects</a>
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setProductsMenuOpen(true)}
            onMouseLeave={() => setProductsMenuOpen(false)}
          >
            <span className="sh-nav-link" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Products
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: productsMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {productsMenuOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                paddingTop: 14, zIndex: 200,
              }}>
                <div style={{
                  background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)', padding: 12,
                  display: 'flex', flexDirection: 'column', gap: 2,
                  width: 260,
                }}>
                  {PRODUCT_LINKS.map(p => {
                    const rowStyle = {
                      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                      borderRadius: 10, textDecoration: 'none', color: '#374151',
                      fontFamily: 'Inter, sans-serif', transition: 'background 0.12s',
                    };
                    const inner = (
                      <>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{p.label}</div>
                          <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 1 }}>{p.desc}</div>
                        </div>
                      </>
                    );
                    return p.to ? (
                      <Link key={p.key} to={p.to} style={rowStyle}
                        onMouseEnter={ev => ev.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                      >{inner}</Link>
                    ) : (
                      <a key={p.key} href={p.href} style={rowStyle}
                        onMouseEnter={ev => ev.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                      >{inner}</a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setExamsMenuOpen(true)}
            onMouseLeave={() => setExamsMenuOpen(false)}
          >
            <span className="sh-nav-link" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Exams
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: examsMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {examsMenuOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                paddingTop: 14, zIndex: 200,
              }}>
                <div style={{
                  background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)', padding: 12,
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2,
                  width: 420,
                }}>
                  {EXAM_LINKS.map(e => (
                    <Link key={e.slug} to={`/exams/${e.slug}`} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                      borderRadius: 10, textDecoration: 'none', color: '#374151',
                      fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                      transition: 'background 0.12s',
                    }}
                      onMouseEnter={ev => ev.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: 16 }}>{e.icon}</span>
                      {e.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <a href="/support" className="sh-nav-link">Support</a>
        </div>
        <div className="sh-nav-cta-d" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {rightSlot}
          <Link to="/login" style={{ background: 'none', border: 'none', fontSize: 14, fontWeight: 600, color: '#6B7280', cursor: 'pointer', padding: '8px 14px', fontFamily: 'Inter, sans-serif', textDecoration: 'none' }}>Log in</Link>
          <Link to="/signup" className="sh-cta-primary">Start free trial</Link>
        </div>
        <button className="sh-nav-burger" onClick={() => setMenuOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', flexDirection: 'column', gap: 5, padding: 4 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: 22, height: 2, background: '#111827', borderRadius: 2 }} />)}
        </button>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, bottom: 0, zIndex: 99, background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflowY: 'auto' }}>
          <a href="/#features" onClick={() => setMenuOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: '#111827', textDecoration: 'none' }}>Features</a>
          <a href="/#subjects" onClick={() => setMenuOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: '#111827', textDecoration: 'none' }}>Subjects</a>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Products</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PRODUCT_LINKS.map(p => (
                p.to ? (
                  <Link key={p.key} to={p.to} onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151', textDecoration: 'none', padding: '8px 0' }}>
                    <span>{p.icon}</span>{p.label}
                  </Link>
                ) : (
                  <a key={p.key} href={p.href} onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151', textDecoration: 'none', padding: '8px 0' }}>
                    <span>{p.icon}</span>{p.label}
                  </a>
                )
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Exams we prepare you for</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {EXAM_LINKS.map(e => (
                <Link key={e.slug} to={`/exams/${e.slug}`} onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151', textDecoration: 'none', padding: '8px 0' }}>
                  <span>{e.icon}</span>{e.label}
                </Link>
              ))}
            </div>
          </div>
          {rightSlot && (
            <div onClick={() => setMenuOpen(false)}>{rightSlot}</div>
          )}
          <Link to="/signup" onClick={() => setMenuOpen(false)} className="sh-cta-primary" style={{ justifyContent: 'center' }}>Start free trial</Link>
        </div>
      )}
    </>
  );
}
