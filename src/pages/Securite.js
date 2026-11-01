// Securite du compte administrateur : double authentification (application d'authentification)
import React, { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';
const appel = async (chemin, corps) => {
  try {
    const r = await fetch(API_URL + '/api/admin-auth' + chemin, {
      method: corps === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('admin_token') },
      body: corps === undefined ? undefined : JSON.stringify(corps),
    });
    return await r.json();
  } catch (e) { return { success: false, error: 'Impossible de contacter le serveur' }; }
};

const carte = { backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: 640, marginBottom: 20 };
const champ = { width: 180, padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 20, letterSpacing: 4, textAlign: 'center', boxSizing: 'border-box' };
const bouton = (couleur = '#1D9E75') => ({ padding: '10px 18px', borderRadius: 8, border: 'none', backgroundColor: couleur, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' });
const lienBtn = { background: 'none', border: 'none', color: '#1D9E75', cursor: 'pointer', fontSize: 13, padding: 0, textDecoration: 'underline' };

function CodesSecours({ codes, onFini }) {
  const texte = 'Codes de secours TrustArtisan Admin (usage unique)\n\n' + codes.join('\n');
  const telecharger = () => {
    const url = URL.createObjectURL(new Blob([texte], { type: 'text/plain' }));
    const a = document.createElement('a'); a.href = url; a.download = 'trustartisan-admin-codes-secours.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div style={{ ...carte, borderLeft: '4px solid #F5A623' }}>
      <h3 style={{ marginTop: 0 }}>Vos codes de secours</h3>
      <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6 }}>
        Si vous perdez votre téléphone, chacun de ces codes permet <strong>une</strong> connexion à la place du code à 6 chiffres.
        Ils ne seront <strong>plus jamais affichés</strong> : téléchargez-les ou notez-les, et rangez-les hors de cet ordinateur.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontFamily: 'monospace', fontSize: 17, backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, margin: '12px 0' }}>
        {codes.map(c => <span key={c}>{c}</span>)}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button style={bouton('#0F6E56')} onClick={telecharger}>Télécharger (.txt)</button>
        <button style={bouton()} onClick={onFini}>J’ai rangé mes codes</button>
      </div>
    </div>
  );
}

export default function Securite({ admin, onMaj }) {
  const [etat, setEtat] = useState(null);
  const [config, setConfig] = useState(null);      // { qr, cle } pendant la configuration
  const [code, setCode] = useState('');
  const [mdp, setMdp] = useState('');
  const [codes, setCodes] = useState(null);         // codes de secours a afficher (une seule fois)
  const [mode, setMode] = useState(null);           // 'desactiver' | 'regenerer'
  const [msg, setMsg] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => { const d = await appel('/2fa'); if (d.success) setEtat(d); }, []);
  useEffect(() => { charger(); }, [charger]);
  const majAdmin = (actif) => {
    try { const u = JSON.parse(localStorage.getItem('admin_user') || '{}'); localStorage.setItem('admin_user', JSON.stringify({ ...u, totp_actif: actif })); } catch (e) { /* sans effet */ }
    if (onMaj) onMaj({ ...admin, totp_actif: actif });
  };

  const commencer = async () => {
    setMsg(null); setEnvoi(true);
    const d = await appel('/2fa/initialiser', {});
    setEnvoi(false);
    if (d.success) { setConfig(d); setCode(''); } else setMsg({ erreur: true, texte: d.error });
  };
  const activer = async () => {
    setEnvoi(true);
    const d = await appel('/2fa/activer', { code });
    setEnvoi(false);
    if (d.success) { setConfig(null); setCode(''); setCodes(d.codes_secours); majAdmin(true); charger(); }
    else setMsg({ erreur: true, texte: d.error });
  };
  const desactiver = async () => {
    setEnvoi(true);
    const d = await appel('/2fa/desactiver', { mot_de_passe: mdp, code });
    setEnvoi(false);
    if (d.success) { setMode(null); setMdp(''); setCode(''); majAdmin(false); setMsg({ texte: 'Double authentification désactivée.' }); charger(); }
    else setMsg({ erreur: true, texte: d.error });
  };
  const regenerer = async () => {
    setEnvoi(true);
    const d = await appel('/2fa/codes-secours', { code });
    setEnvoi(false);
    if (d.success) { setMode(null); setCode(''); setCodes(d.codes_secours); charger(); }
    else setMsg({ erreur: true, texte: d.error });
  };

  const champCode = (
    <input style={champ} inputMode="numeric" autoComplete="one-time-code" maxLength={11} placeholder="123456"
      value={code} onChange={e => setCode(e.target.value)} />
  );

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Sécurité de mon compte</h1>
      {msg && <div style={{ ...carte, padding: 14, backgroundColor: msg.erreur ? '#FEF0EE' : '#E1F5EE', color: msg.erreur ? '#B42318' : '#0F6E56' }}>{msg.texte}</div>}
      {codes && <CodesSecours codes={codes} onFini={() => setCodes(null)} />}

      <div style={carte}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Double authentification</h3>
          {etat && <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, backgroundColor: etat.actif ? '#E1F5EE' : '#FDECEA', color: etat.actif ? '#0F6E56' : '#B42318' }}>{etat.actif ? 'Activée' : 'Désactivée'}</span>}
        </div>
        <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6 }}>
          En plus du mot de passe, un code à 6 chiffres affiché par une application sur votre téléphone
          (Google Authenticator, Microsoft Authenticator…) est demandé à chaque connexion.
          Même avec votre mot de passe, personne ne peut entrer sans votre téléphone.
        </p>

        {etat && !etat.actif && !config && (
          <button style={bouton()} onClick={commencer} disabled={envoi}>{envoi ? 'Préparation…' : 'Activer la double authentification'}</button>
        )}

        {config && (
          <div>
            <ol style={{ color: '#333', fontSize: 14, lineHeight: 1.8, paddingLeft: 18 }}>
              <li>Installez <strong>Google Authenticator</strong> (ou Microsoft Authenticator) sur votre téléphone.</li>
              <li>Dans l’application, touchez <strong>+</strong> puis <strong>Scanner un code QR</strong>, et scannez le code ci-dessous.</li>
              <li>Saisissez le code à 6 chiffres affiché par l’application, puis validez.</li>
            </ol>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', margin: '12px 0' }}>
              <img src={config.qr} alt="QR code de configuration" width={200} height={200} style={{ border: '1px solid #eee', borderRadius: 8 }} />
              <div style={{ fontSize: 13, color: '#666', maxWidth: 300 }}>
                Impossible de scanner ? Choisissez « Saisir une clé » dans l’application :<br />
                Compte : <strong>{config.compte}</strong><br />
                Clé : <code style={{ fontSize: 14, wordBreak: 'break-all' }}>{config.cle}</code>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {champCode}
              <button style={bouton()} onClick={activer} disabled={envoi || code.replace(/\s/g, '').length !== 6}>{envoi ? 'Vérification…' : 'Valider et activer'}</button>
              <button style={lienBtn} onClick={() => { setConfig(null); setCode(''); }}>Annuler</button>
            </div>
          </div>
        )}

        {etat && etat.actif && !mode && (
          <div>
            <p style={{ fontSize: 14, color: etat.codes_secours_restants <= 2 ? '#B42318' : '#555' }}>
              Codes de secours restants : <strong>{etat.codes_secours_restants}</strong>
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button style={lienBtn} onClick={() => { setMode('regenerer'); setCode(''); setMsg(null); }}>Générer de nouveaux codes de secours</button>
              <button style={{ ...lienBtn, color: '#B42318' }} onClick={() => { setMode('desactiver'); setCode(''); setMdp(''); setMsg(null); }}>Désactiver</button>
            </div>
          </div>
        )}

        {mode === 'regenerer' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14 }}>Code de l’application :</span>{champCode}
            <button style={bouton()} onClick={regenerer} disabled={envoi}>Générer</button>
            <button style={lienBtn} onClick={() => setMode(null)}>Annuler</button>
          </div>
        )}

        {mode === 'desactiver' && (
          <div>
            <p style={{ fontSize: 13, color: '#B42318' }}>Votre compte ne sera plus protégé que par le mot de passe.</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="password" autoComplete="current-password" placeholder="Mot de passe" value={mdp} onChange={e => setMdp(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
              {champCode}
              <button style={bouton('#B42318')} onClick={desactiver} disabled={envoi}>Désactiver</button>
              <button style={lienBtn} onClick={() => setMode(null)}>Annuler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
