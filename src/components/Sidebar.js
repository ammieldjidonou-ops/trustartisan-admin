import React from 'react';
import { NavLink } from 'react-router-dom';

const MENU = [
  { path: '/dashboard', icon: '📊', label: 'Tableau de bord', roles: ['super_admin', 'moderateur', 'validateur'] },
  { path: '/artisans', icon: '🛠️', label: 'Artisans', roles: ['super_admin', 'moderateur', 'validateur'] },
  { path: '/clients', icon: '👤', label: 'Clients', roles: ['super_admin', 'moderateur'] },
  { path: '/missions', icon: '📋', label: 'Missions', roles: ['super_admin', 'moderateur', 'validateur'] },
  { path: '/paiements', icon: '💰', label: 'Paiements', roles: ['super_admin'] },
  { path: '/collaborateurs', icon: '👥', label: 'Collaborateurs', roles: ['super_admin'] },
  { path: '/signalements', icon: '🚨', label: 'Signalements', roles: ['super_admin', 'moderateur'] },
];

const ROLE_LABELS = {
  super_admin: { label: 'Super Admin', color: '#F5A623' },
  moderateur: { label: 'Moderateur', color: '#0066CC' },
  validateur: { label: 'Validateur', color: '#1D9E75' },
};

export default function Sidebar({ open, setOpen, admin, onLogout }) {
  const role = admin?.role || 'validateur';
  const menuFiltre = MENU.filter(item => item.roles.includes(role));

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
          {open ? '<-' : '->'}
        </button>
      </div>

      {open && admin && (
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {(admin.prenom || 'A').charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {admin.prenom} {admin.nom}
              </div>
              <span style={{ backgroundColor: ROLE_LABELS[role]?.color || '#888', color: '#fff', fontSize: 10, fontWeight: 600, padding: '1px 8px', borderRadius: 8 }}>
                {ROLE_LABELS[role]?.label || role}
              </span>
            </div>
          </div>
        </div>
      )}

      <nav style={{ flex: 1, paddingTop: 16 }}>
        {menuFiltre.map(item => (
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
        {open ? (
          <button onClick={onLogout} style={{ width: '100%', padding: '8px', backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
            Deconnexion
          </button>
        ) : (
          <button onClick={onLogout} style={{ width: '100%', padding: '8px', backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 18, cursor: 'pointer' }}>
            🚪
          </button>
        )}
        {open && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textAlign: 'center', marginTop: 8 }}>TrustArtisan v1.0.0</div>}
      </div>
    </div>
  );
}