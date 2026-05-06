import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/supabase';

const navItems = [
  { to: '/app', icon: '🏠', label: 'Home', end: true },
  { to: '/app/maths', icon: '🔢', label: 'Mathematics' },
  { to: '/app/reading', icon: '📖', label: 'Reading' },
  { to: '/app/general', icon: '🧩', label: 'General Ability' },
  { to: '/app/writing', icon: '✏️', label: 'Writing' },
  { to: '/app/progress', icon: '📊', label: 'Progress' },
];

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const { user, yearLevel, setYearLevel, trialDaysLeft, isSubscribed, demoMode } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        className="mobile-menu-btn"
        aria-label="Toggle menu"
      >
        <span style={{ transform: sidebarOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
        <span style={{ opacity: sidebarOpen ? 0 : 1 }}></span>
        <span style={{ transform: sidebarOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
      </button>

      {/* Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ background: '#3730A3' }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
            Scholar<span style={{ color: '#A5B4FC' }}>Prep</span>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontFamily: 'Inter, DM Sans, sans-serif', letterSpacing: '0.05em' }}>
            ACER · AAST · Edutest · NAPLAN
          </div>
        </div>

        {/* Year level selector */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'Inter, DM Sans, sans-serif' }}>Year level</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(y => (
              <button key={y} onClick={() => { setYearLevel(y); closeSidebar(); }} style={{
                padding: '5px 0', borderRadius: 8, fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: yearLevel === y ? '#6366F1' : 'rgba(255,255,255,0.07)',
                color: yearLevel === y ? '#fff' : 'rgba(255,255,255,0.45)',
                fontFamily: 'Inter, DM Sans, sans-serif',
                boxShadow: yearLevel === y ? '0 2px 8px rgba(99,102,241,0.4)' : 'none',
              }}>Yr {y}</button>
            ))}
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: '12px 0', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 20px 4px', fontFamily: 'Inter, DM Sans, sans-serif' }}>Practice</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px', fontSize: 14, fontWeight: 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
                borderLeft: isActive ? '3px solid #A5B4FC' : '3px solid transparent',
                fontFamily: 'Inter, DM Sans, sans-serif',
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '16px 20px 4px', fontFamily: 'Inter, DM Sans, sans-serif' }}>More</div>

          <NavLink to="/pdf-generator" onClick={closeSidebar} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 20px', fontSize: 14, fontWeight: 500,
            color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
            textDecoration: 'none', transition: 'all 0.15s',
            borderLeft: isActive ? '3px solid #A5B4FC' : '3px solid transparent',
            fontFamily: 'Inter, DM Sans, sans-serif',
          })}>
            <span style={{ fontSize: 16 }}>📄</span> PDF Generator
          </NavLink>

          <NavLink to="/profile" onClick={closeSidebar} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 20px', fontSize: 14, fontWeight: 500,
            color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
            textDecoration: 'none', transition: 'all 0.15s',
            borderLeft: isActive ? '3px solid #A5B4FC' : '3px solid transparent',
            fontFamily: 'Inter, DM Sans, sans-serif',
          })}>
            <span style={{ fontSize: 16 }}>👤</span> My Account
          </NavLink>
        </div>

        {/* Trial banner */}
        {!demoMode && !isSubscribed && trialDaysLeft > 0 && (
          <div style={{ margin: '0 12px 12px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#FCD34D', marginBottom: 6, fontFamily: 'Inter, DM Sans, sans-serif' }}>
              Trial: {trialDaysLeft} days left
            </div>
            <button onClick={() => { navigate('/subscribe'); closeSidebar(); }} style={{
              fontSize: 12, fontWeight: 700, color: '#fff',
              background: '#F97316', border: 'none', borderRadius: 100,
              padding: '5px 14px', cursor: 'pointer',
              fontFamily: 'Inter, DM Sans, sans-serif',
              boxShadow: '0 2px 8px rgba(249,115,22,0.3)',
            }}>Upgrade →</button>
          </div>
        )}

        {/* User */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8, fontFamily: 'Inter, DM Sans, sans-serif' }}>
            {demoMode ? '👤 Demo user' : user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'}
          </div>
          <button onClick={handleSignOut} style={{
            fontSize: 12, color: 'rgba(255,255,255,0.3)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: 'Inter, DM Sans, sans-serif', transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}
          >
            Sign out →
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}