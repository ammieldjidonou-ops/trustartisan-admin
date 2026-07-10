import React, { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

const PLATEFORMES = {
  facebook:  { label: 'Facebook',  icon: 'f',  couleur: '#1877F2' },
  instagram: { label: 'Instagram', icon: 'IG', couleur: '#E1306C' },
  linkedin:  { label: 'LinkedIn',  icon: 'in', couleur: '#0A66C2' },
  tiktok:    { label: 'TikTok',    icon: 'TT', couleur: '#010101' },
  youtube:   { label: 'YouTube',   icon: 'YT', couleur: '#FF0000' },
};

const MOIS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function ymd(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function CalendrierEditorial() {
  const [curseur, setCurseur] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [selection, setSelection] = useState(null); // post clique

  const annee = curseur.getFullYear();
  const mois = curseur.getMonth(); // 0-11
  const moisStr = annee + '-' + String(mois + 1).padStart(2, '0');

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const r = await fetch(API_URL + '/api/social/posts?mois=' + moisStr, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('admin_token') } });
      const data = await r.json();
      if (data.success) setPosts(data.posts || []);
    } catch (e) { /* silencieux */ }
    setChargement(false);
  }, [moisStr]);

  useEffect(() => { charger(); }, [charger]);

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer ce post du calendrier ?')) return;
    try {
      const r = await fetch(API_URL + '/api/social/posts/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('admin_token') } });
      const data = await r.json();
      if (data.success) { setSelection(null); charger(); }
    } catch (e) { /* silencieux */ }
  };

  const marquerPublie = async (id) => {
    try {
      const r = await fetch(API_URL + '/api/social/posts/' + id, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('admin_token') },
        body: JSON.stringify({ statut: 'publie' })
      });
      const data = await r.json();
      if (data.success) { setSelection(data.post); charger(); }
    } catch (e) { /* silencieux */ }
  };

  // Construire la grille du mois (lundi -> dimanche)
  const premier = new Date(annee, mois, 1);
  let decalage = premier.getDay() - 1; // 0=dimanche -> on veut lundi en tete
  if (decalage < 0) decalage = 6;
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  const cases = [];
  for (let i = 0; i < decalage; i++) cases.push(null);
  for (let j = 1; j <= nbJours; j++) cases.push(new Date(annee, mois, j));

  const postsDuJour = (d) => posts.filter(p => p.date_prevue === ymd(d));
  const aujourdHui = ymd(new Date());

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Calendrier editorial</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Vos posts programmes, mois par mois. Cliquez un post pour le consulter, le marquer publie ou le supprimer.</p>
      </div>

      {/* Navigation mois */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <button onClick={() => setCurseur(new Date(annee, mois - 1, 1))}
          style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontSize: 14 }}>&#8249; Precedent</button>
        <span style={{ fontSize: 18, fontWeight: 700, minWidth: 180, textAlign: 'center' }}>{MOIS[mois]} {annee}</span>
        <button onClick={() => setCurseur(new Date(annee, mois + 1, 1))}
          style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontSize: 14 }}>Suivant &#8250;</button>
        <button onClick={() => setCurseur(new Date())}
          style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #1D9E75', backgroundColor: '#fff', color: '#1D9E75', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Aujourd hui</button>
        {chargement && <span style={{ color: '#aaa', fontSize: 13 }}>Chargement...</span>}
      </div>

      {/* Grille calendrier */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
          {JOURS.map(j => <div key={j} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#888', padding: '4px 0' }}>{j}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {cases.map((d, i) => {
            if (!d) return <div key={'v' + i} style={{ minHeight: 90 }} />;
            const liste = postsDuJour(d);
            const estAujourdHui = ymd(d) === aujourdHui;
            return (
              <div key={ymd(d)} style={{
                minHeight: 90, border: '1px solid ' + (estAujourdHui ? '#1D9E75' : '#f0f0f0'),
                borderRadius: 8, padding: 6, backgroundColor: estAujourdHui ? '#1D9E7508' : '#fff', display: 'flex', flexDirection: 'column', gap: 4
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: estAujourdHui ? '#1D9E75' : '#555' }}>{d.getDate()}</div>
                {liste.map(p => {
                  const pf = PLATEFORMES[p.plateforme] || { label: p.plateforme, icon: '?', couleur: '#888' };
                  return (
                    <button key={p.id} onClick={() => setSelection(p)} title={p.theme || p.texte}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '3px 6px', borderRadius: 5, border: 'none', cursor: 'pointer',
                        backgroundColor: pf.couleur + '18', width: '100%', textAlign: 'left',
                        opacity: p.statut === 'publie' ? 0.55 : 1
                      }}>
                      <span style={{ width: 15, height: 15, borderRadius: 4, backgroundColor: pf.couleur, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{pf.icon}</span>
                      <span style={{ fontSize: 10, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.statut === 'publie' ? '\u2713 ' : ''}{(p.theme || p.texte).slice(0, 18)}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {posts.length === 0 && !chargement && (
        <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center', marginTop: 20 }}>Aucun post programme ce mois-ci. Generez et enregistrez des posts depuis l&apos;onglet Community Manager.</p>
      )}

      {/* Panneau detail du post selectionne */}
      {selection && (
        <div onClick={() => setSelection(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: 12, maxWidth: 460, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              {(() => { const pf = PLATEFORMES[selection.plateforme] || { label: selection.plateforme, icon: '?', couleur: '#888' };
                return <><span style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: pf.couleur, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{pf.icon}</span>
                  <span style={{ fontWeight: 700 }}>{pf.label}</span></>; })()}
              <span style={{ marginLeft: 'auto', fontSize: 12, padding: '3px 10px', borderRadius: 20, backgroundColor: selection.statut === 'publie' ? '#1D9E7520' : '#F5A62320', color: selection.statut === 'publie' ? '#1D9E75' : '#8a6d1a', fontWeight: 600 }}>
                {selection.statut === 'publie' ? 'Publie' : 'Programme'}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Prevu le {selection.date_prevue}</div>
            {selection.image_base64 && (
              // eslint-disable-next-line jsx-a11y/img-redundant-alt
              <img src={selection.image_base64} alt="Visuel du post" style={{ width: '100%', borderRadius: 8, marginBottom: 12, border: '1px solid #eee' }} />
            )}
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.5, color: '#333', backgroundColor: '#fafafa', borderRadius: 8, padding: 12, border: '1px solid #eee' }}>{selection.texte}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => { navigator.clipboard.writeText(selection.texte); }}
                style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid #ddd', backgroundColor: '#fff', color: '#555', cursor: 'pointer', fontSize: 13 }}>Copier le texte</button>
              {selection.statut !== 'publie' && (
                <button onClick={() => marquerPublie(selection.id)}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', backgroundColor: '#1D9E75', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Marquer publie</button>
              )}
              <button onClick={() => supprimer(selection.id)}
                style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #E74C3C', backgroundColor: '#fff', color: '#E74C3C', cursor: 'pointer', fontSize: 13 }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
