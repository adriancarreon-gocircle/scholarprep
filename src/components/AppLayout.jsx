import React from 'react';
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <div style={{
        width: 220, background: '#0D1B2A',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 50, overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 900, color: '#fff' }}>
            Scholar<span style={{ color: '#E8B84B' }}>Prep</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>ACER · AAST · Edutest</div>
        </div>

        {/* Year level selector */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Year level</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {[1,2,3,4,5,6].map(y => (
              <button key={y} onClick={() => setYearLevel(y)} style={{
                padding: '5px 0', borderRadius: 6, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: yearLevel === y ? '#E8B84B' : 'rgba(255,255,255,0.06)',
                color: yearLevel === y ? '#0D1B2A' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.15s'
              }}>Yr {y}</button>
            ))}
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: '12px 0', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 20px 4px' }}>Practice</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', fontSize: 14, fontWeight: 500,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
              borderLeft: isActive ? '3px solid #E8B84B' : '3px solid transparent'
            })}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '16px 20px 4px' }}>More</div>
          <NavLink to="/pdf-generator" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 20px', fontSize: 14, fontWeight: 500,
            color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
            textDecoration: 'none', transition: 'all 0.15s',
            borderLeft: isActive ? '3px solid #E8B84B' : '3px solid transparent'
          })}>
            <span style={{ fontSize: 16 }}>📄</span> PDF Generator
          </NavLink>
        </div>

        {/* Trial/subscription status */}
        {!demoMode && !isSubscribed && trialDaysLeft > 0 && (
          <div style={{ margin: '0 12px 12px', background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#E8B84B', marginBottom: 4 }}>Trial: {trialDaysLeft} days left</div>
            <button onClick={() => navigate('/subscribe')} style={{ fontSize: 11, fontWeight: 700, color: '#0D1B2A', background: '#E8B84B', border: 'none', borderRadius: 100, padding: '4px 12px', cursor: 'pointer' }}>Upgrade →</button>
          </div>
        )}

        {/* User / signout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            {demoMode ? '👤 Demo user' : user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'}
          </div>
          <button onClick={handleSignOut} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Sign out →
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft: 220, flex: 1, minHeight: '100vh', background: '#FAF6EE' }}>
        {children}
      </div>
    </div>
  );
}
