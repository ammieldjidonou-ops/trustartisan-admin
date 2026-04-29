import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

export default function Notifications({ admin }) {
  const [titre, setTitre] = useState('');
  const [corps, setCorps] = useState('');
  const [role, setRole] = useState('tous');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [erreur, setErreur] = useState('');

  const token = localStorage.getItem('admin_token');

  const envoyerBroadcast = async () => {
    if (!titre || !corps) { setErreur('Titre et message requis'); return; }
    setSending(true); setErreur(''); setMsg('');
    try {
      const resp = await fetch(API_URL + '/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          titre,
          corps,
          role: role === 'tous' ? null : role,
          data: { screen: 'Home' }
        })
      });
      const data = await resp.json();
      if (data.success) {
        setMsg('Notification envoyee a ' + data.envoyes + ' utilisateur(s) !');
        setTitre(''); setCorps('');
        setTimeout(() => setMsg(''), 4000);
      } else { setErreur(data.error || 'Erreur envoi'); }
    } catch (e) { setErreur('Erreur serveur'); }
    setSending(false);
  };

  const TEMPLATES = [
    { titre: 'Nouvelle mise a jour', corps: 'TrustArtisan a ete mis a jour avec de nouvelles fonctionnalites !' },
    { titre: 'Offre speciale', corps: 'Profitez de nos services premium a prix reduit ce mois-ci !' },
    { titre: 'Rappel', corps: 'Vous avez des missions en attente sur TrustArtisan. Connectez-vous !' },
    { titre: 'Maintenance terminee', corps: 'TrustArtisan est de nouveau disponible. Merci de votre patience !' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Notifications Push</h1>
        <p style={{ color: '#888', fontSize: 14 }}>Envoyez des notifications a vos utilisateurs</p>
      </div>

      {msg && <div style={{ background: '#E1F5EE', border: '1px solid #1D9E75', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#0F6E56', fontWeight: 600 }}>{msg}</div>}
      {erreur && <div style={{ background: '#FEF0EE', border: '1px solid #E74C3C', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#E74C3C' }}>{erreur}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 20 }}>Envoyer une notification</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Destinataires</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
              <option value="tous">Tous les utilisateurs</option>
              <option value="client">Clients uniquement</option>
              <option value="artisan">Artisans uniquement</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Titre</label>
            <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Ex: Nouvelle fonctionnalite"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Message</label>
            <textarea value={corps} onChange={e => setCorps(e.target.value)} placeholder="Votre message..." rows={4}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ color: '#aaa', fontSize: 11, textAlign: 'right', marginTop: 4 }}>{corps.length}/200</div>
          </div>

          <div style={{ backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8, fontWeight: 600 }}>Apercu</div>
            <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, border: '1px solid #eee' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{titre || 'Titre de la notification'}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{corps || 'Contenu du message...'}</div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={envoyerBroadcast} disabled={sending} style={{ width: '100%', fontSize: 15 }}>
            {sending ? 'Envoi en cours...' : 'Envoyer la notification'}
          </button>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Templates rapides</h3>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Cliquez pour pre-remplir le formulaire</p>
          {TEMPLATES.map((t, i) => (
            <div key={i} onClick={() => { setTitre(t.titre); setCorps(t.corps); }}
              style={{ padding: 14, borderRadius: 10, border: '1px solid #eee', marginBottom: 10, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1D9E75'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#eee'}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t.titre}</div>
              <div style={{ color: '#888', fontSize: 12 }}>{t.corps}</div>
            </div>
          ))}

          <div style={{ marginTop: 20, padding: 14, backgroundColor: '#EEF4FF', borderRadius: 10 }}>
            <div style={{ fontWeight: 600, color: '#0066CC', fontSize: 13, marginBottom: 8 }}>Comment ca marche</div>
            <div style={{ color: '#555', fontSize: 12, lineHeight: 1.6 }}>
              Les notifications sont envoyees via Expo Push API directement sur les appareils des utilisateurs ayant accepte les notifications.
              Seuls les utilisateurs connectes avec un token enregistre recevront la notification.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}