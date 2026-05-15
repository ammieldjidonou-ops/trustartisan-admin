import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [showChangeMdp, setShowChangeMdp] = useState(false);
  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [msgMdp, setMsgMdp] = useState('');
  const [loadingMdp, setLoadingMdp] = useState(false);

  const changerMotDePasse = async () => {
    if (!ancienMdp || !nouveauMdp || !confirmMdp) { setMsgMdp('Tous les champs sont requis'); return; }
    if (nouveauMdp !== confirmMdp) { setMsgMdp('Les mots de passe ne correspondent pas'); return; }
    if (nouveauMdp.length < 8) { setMsgMdp('Minimum 8 caracteres'); return; }
    setLoadingMdp(true);
    try {
      const token = localStorage.getItem('admin_token');
      const r = await fetch(API_URL + '/api/admin-auth/changer-mot-de-passe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ ancien_mdp: ancienMdp, nouveau_mdp: nouveauMdp })
      });
      const data = await r.json();
      if (data.success) {
        setMsgMdp('✅ Mot de passe modifie avec succes !');
        setTimeout(() => { setShowChangeMdp(false); setAncienMdp(''); setNouveauMdp(''); setConfirmMdp(''); setMsgMdp(''); }, 2000);
      } else { setMsgMdp('❌ ' + (data.error || 'Erreur')); }
    } catch (e) { setMsgMdp('❌ Erreur serveur'); }
    setLoadingMdp(false);
  };

  const handleLogin = async () => {
    if (!email || !password) { setErreur('Email et mot de passe requis'); return; }
    setLoading(true);
    setErreur('');
    try {
      const response = await fetch(API_URL + '/api/admin-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        onLogin(data.admin);
      } else {
        setErreur(data.error || 'Identifiants incorrects');
      }
    } catch (e) {
      setErreur('Impossible de contacter le serveur');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 40, width: 400, maxWidth: '90vw', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {showChangeMdp && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 32, width: 400, maxWidth: '90vw' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: 18 }}>🔒 Modifier le mot de passe</h2>
              {['Ancien mot de passe', 'Nouveau mot de passe', 'Confirmer le nouveau'].map((label, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6 }}>{label}</label>
                  <input type='password' style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }}
                    value={i === 0 ? ancienMdp : i === 1 ? nouveauMdp : confirmMdp}
                    onChange={e => i === 0 ? setAncienMdp(e.target.value) : i === 1 ? setNouveauMdp(e.target.value) : setConfirmMdp(e.target.value)} />
                </div>
              ))}
              {msgMdp && <p style={{ color: msgMdp.includes('✅') ? '#1D9E75' : '#E74C3C', fontSize: 13, marginBottom: 12 }}>{msgMdp}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowChangeMdp(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#f5f5f5' }}>Annuler</button>
                <button onClick={changerMotDePasse} disabled={loadingMdp} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: '#1D9E75', color: '#fff', fontWeight: 600 }}>
                  {loadingMdp ? 'En cours...' : 'Modifier'}
                </button>
              </div>
            </div>
          </div>
        )}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>🛠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#333', margin: 0 }}>TrustArtisan</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Espace Administration</p>
        </div>

        {erreur && (
          <div style={{ backgroundColor: '#FEF0EE', border: '1px solid #E74C3C', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#E74C3C', fontSize: 13 }}>
            {erreur}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            placeholder="admin@trustartisan.bj"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Mot de passe</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#aaa' : '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        <p style={{ textAlign: 'center', color: '#aaa', fontSize: 12, marginTop: 20 }}>
          TrustArtisan Admin v1.0 — Acces restreint
        </p>
        <p onClick={() => setShowChangeMdp(true)} style={{ textAlign: 'center', color: '#1D9E75', fontSize: 13, cursor: 'pointer', marginTop: 16 }}>
          🔒 Modifier mon mot de passe admin
        </p>
      </div>
    </div>
  );
}