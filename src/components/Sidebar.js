import React from 'react';
import { NavLink } from 'react-router-dom';

const MENU = [
  { path: '/dashboard', icon: '📊', label: 'Tableau de bord' },
  { path: '/artisans', icon: '🛠️', label: 'Artisans' },
  { path: '/clients', icon: '👤', label: 'Clients' },
  { path: '/missions', icon: '📋', label: 'Missions' },
  { path: '/paiements', icon: '💰', label: 'Paiements' },
];

export default function Sidebar({ open, setOpen }) {
  return (
    <div style={{
      width: open ? 250 : 70,
      minHeight: '100vh',
      backgroundColor: '#1D9E75',
      position: 'fixed',
      left: 0, top: 0,
      transition: 'width 0.3s',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      overflow: 'hidden'
    }}>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {open && (
          <div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>TrustArtisan</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Admin Dashboard</div>
          </div>
        )}
        <button onClick={() => setOpen(!open)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#fff', fontSize: 16 }}>
          {open ? '←' : '→'}
        </button>
      </div>

      <nav style={{ flex: 1, paddingTop: 16 }}>
        {MENU.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
              backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '400',
              fontSize: 14,
              borderLeft: isActive ? '3px solid #fff' : '3px solid transparent',
              transition: 'all 0.2s'
            })}
          >
            <span style={{ fontSize: 20, minWidth: 24, textAlign: 'center' }}>{item.icon}</span>
            {open && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        {open && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'center' }}>TrustArtisan v1.0.0</div>}
      </div>
    </div>
  );
}
