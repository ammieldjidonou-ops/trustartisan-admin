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
  const [jeton2fa, setJeton2fa] = useState(null); // mot de passe accepte, code a 6 chiffres attendu
  const [code2fa, setCode2fa] = useState('');

  const changerMotDePasse = async () => {
    if (!ancienMdp || !nouveauMdp || !confirmMdp) { setMsgMdp('Tous les champs sont requis'); return; }
    if (nouveauMdp !== confirmMdp) { setMsgMdp('Les mots de passe ne correspondent pas'); return; }
    if (nouveauMdp.length < 12) { setMsgMdp('Minimum 12 caracteres'); return; }
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
    if (!email || !password) { setErreur('Identifiant et mot de passe requis'); return; }
    setLoading(true);
    setErreur('');
    try {
      const response = await fetch(API_URL + '/api/admin-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifiant: email.trim(), password })
      });
      const data = await response.json();
      if (data.success && data.etape === '2fa') {
        setJeton2fa(data.jeton_2fa); setCode2fa(''); setPassword('');
      } else if (data.success) {
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

  const validerCode = async () => {
    if (!code2fa.trim()) { setErreur('Saisissez le code de votre application'); return; }
    setLoading(true); setErreur('');
    try {
      const r = await fetch(API_URL + '/api/admin-auth/login/2fa', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jeton_2fa: jeton2fa, code: code2fa.trim() })
      });
      const data = await r.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        onLogin(data.admin);
      } else {
        if (data.code === 'JETON_2FA_EXPIRE') setJeton2fa(null);
        setErreur(data.error || 'Code incorrect');
      }
    } catch (e) { setErreur('Impossible de contacter le serveur'); }
    setLoading(false);
  };

  // Etape 2 : code de l'application d'authentification (ou code de secours)
  if (jeton2fa) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 40, width: 400, maxWidth: '90vw', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#333', margin: '0 0 8px' }}>Vérification en deux étapes</h1>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.5, margin: '0 0 20px' }}>
            Ouvrez votre application d’authentification et saisissez le code à 6 chiffres de « TrustArtisan Admin ».
          </p>
          {erreur && <div style={{ backgroundColor: '#FEF0EE', border: '1px solid #E74C3C', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#E74C3C', fontSize: 13, textAlign: 'left' }}>{erreur}</div>}
          <input autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={11} placeholder="123456"
            value={code2fa} onChange={e => setCode2fa(e.target.value)} onKeyDown={e => e.key === 'Enter' && validerCode()}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 24, letterSpacing: 6, textAlign: 'center', boxSizing: 'border-box', marginBottom: 16 }} />
          <button onClick={validerCode} disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#aaa' : '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Vérification...' : 'Valider'}
          </button>
          <p style={{ color: '#888', fontSize: 12, marginTop: 16, lineHeight: 1.5 }}>Téléphone perdu ? Saisissez l’un de vos codes de secours (format XXXXX-XXXXX).</p>
          <p onClick={() => { setJeton2fa(null); setErreur(''); }} style={{ color: '#1D9E75', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>← Revenir à l’identification</p>
        </div>
      </div>
    );
  }

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
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Identifiant TrustArtisan (ou e-mail)</label>
          <input
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            placeholder="ex. ammiel.admin"
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
            autoComplete="current-password"
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