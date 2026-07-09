import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

const PLATEFORMES = [
  { key: 'facebook',  label: 'Facebook',  icon: 'f',  couleur: '#1877F2' },
  { key: 'instagram', label: 'Instagram', icon: 'IG', couleur: '#E1306C' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: 'in', couleur: '#0A66C2' },
  { key: 'tiktok',    label: 'TikTok',    icon: 'TT', couleur: '#010101' },
  { key: 'youtube',   label: 'YouTube',   icon: 'YT', couleur: '#FF0000' },
];

const IDEES = [
  'Presenter le paiement securise par sequestre aux clients',
  'Recruter des artisans plombiers a Cotonou',
  'Expliquer comment un artisan est verifie sur TrustArtisan',
  'Mettre en avant les avis clients verifies',
  'Annoncer le lancement prochain de l application',
];

export default function CommunityManager() {
  const [theme, setTheme] = useState('');
  const [selection, setSelection] = useState({ facebook: true, instagram: true, linkedin: false, tiktok: false, youtube: false });
  const [posts, setPosts] = useState({});        // { plateforme: { statut, texte, error } }
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [copie, setCopie] = useState('');

  const togglePlateforme = (k) => setSelection(s => ({ ...s, [k]: !s[k] }));

  const plateformesChoisies = () => PLATEFORMES.filter(p => selection[p.key]).map(p => p.key);

  const genererUne = async (plateforme, themeUtilise) => {
    setPosts(prev => ({ ...prev, [plateforme]: { statut: 'chargement', texte: '', error: '' } }));
    try {
      const r = await fetch(API_URL + '/api/social/generer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeUtilise, plateforme })
      });
      const data = await r.json();
      if (data.success) {
        setPosts(prev => ({ ...prev, [plateforme]: { statut: 'ok', texte: data.post, error: '' } }));
      } else {
        setPosts(prev => ({ ...prev, [plateforme]: { statut: 'erreur', texte: '', error: data.error || 'Echec de la generation' } }));
      }
    } catch (e) {
      setPosts(prev => ({ ...prev, [plateforme]: { statut: 'erreur', texte: '', error: 'Erreur reseau' } }));
    }
  };

  const genererTout = async () => {
    if (!theme.trim()) return;
    const choix = plateformesChoisies();
    if (choix.length === 0) return;
    setLoadingGlobal(true);
    await Promise.all(choix.map(p => genererUne(p, theme.trim())));
    setLoadingGlobal(false);
  };

  const copier = (plateforme, texte) => {
    navigator.clipboard.writeText(texte).then(() => {
      setCopie(plateforme);
      setTimeout(() => setCopie(''), 1500);
    });
  };

  const modifierTexte = (plateforme, valeur) => {
    setPosts(prev => ({ ...prev, [plateforme]: { ...prev[plateforme], texte: valeur } }));
  };

  const choix = plateformesChoisies();

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Community Manager IA</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Generez des propositions de posts adaptees a chaque reseau. Vous validez avant toute publication.</p>
      </div>

      {/* Bloc de saisie */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 8 }}>Theme / sujet du post</label>
        <textarea
          value={theme}
          onChange={e => setTheme(e.target.value)}
          placeholder="Ex : Presenter le paiement securise par sequestre aux clients"
          rows={2}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
        />

        {/* Idees rapides */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {IDEES.map(idee => (
            <button key={idee} onClick={() => setTheme(idee)}
              style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid #ddd', backgroundColor: '#f8f9fa', color: '#555', cursor: 'pointer', fontSize: 12 }}>
              {idee}
            </button>
          ))}
        </div>

        {/* Choix des plateformes */}
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#555', margin: '18px 0 8px' }}>Plateformes</label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {PLATEFORMES.map(p => {
            const actif = selection[p.key];
            return (
              <button key={p.key} onClick={() => togglePlateforme(p.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  border: actif ? '2px solid ' + p.couleur : '2px solid #e5e5e5',
                  backgroundColor: actif ? p.couleur + '12' : '#fff',
                  color: actif ? p.couleur : '#888'
                }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: p.couleur, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{p.icon}</span>
                {p.label}
                {actif && <span style={{ marginLeft: 2 }}>&#10003;</span>}
              </button>
            );
          })}
        </div>

        {/* Bouton generer */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={genererTout} disabled={loadingGlobal || !theme.trim() || choix.length === 0}
            style={{
              padding: '11px 28px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700,
              cursor: (loadingGlobal || !theme.trim() || choix.length === 0) ? 'not-allowed' : 'pointer',
              backgroundColor: (loadingGlobal || !theme.trim() || choix.length === 0) ? '#ccc' : '#1D9E75', color: '#fff'
            }}>
            {loadingGlobal ? 'Generation en cours...' : 'Generer les posts (' + choix.length + ')'}
          </button>
          {!theme.trim() && <span style={{ fontSize: 12, color: '#aaa' }}>Saisissez un theme pour commencer</span>}
          {theme.trim() && choix.length === 0 && <span style={{ fontSize: 12, color: '#E74C3C' }}>Choisissez au moins une plateforme</span>}
        </div>
      </div>

      {/* Resultats */}
      {choix.length > 0 && Object.keys(posts).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {PLATEFORMES.filter(p => posts[p.key]).map(p => {
            const etat = posts[p.key];
            return (
              <div key={p.key} style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* En-tete carte */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: p.couleur, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{p.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#333' }}>{p.label}</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    <button onClick={() => genererUne(p.key, theme.trim())} title="Regenerer"
                      style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #ddd', backgroundColor: '#fff', color: '#555', cursor: 'pointer', fontSize: 12 }}>
                      Regenerer
                    </button>
                    {etat.statut === 'ok' && (
                      <button onClick={() => copier(p.key, etat.texte)}
                        style={{ padding: '5px 10px', borderRadius: 6, border: 'none', backgroundColor: copie === p.key ? '#1D9E75' : '#0066CC', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        {copie === p.key ? 'Copie !' : 'Copier'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Corps carte */}
                <div style={{ padding: 16, flex: 1 }}>
                  {etat.statut === 'chargement' && (
                    <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>Redaction en cours...</div>
                  )}
                  {etat.statut === 'erreur' && (
                    <div style={{ color: '#E74C3C', fontSize: 13, padding: '12px 0' }}>
                      {etat.error}
                      <div style={{ marginTop: 8 }}>
                        <button onClick={() => genererUne(p.key, theme.trim())} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #E74C3C', backgroundColor: '#fff', color: '#E74C3C', cursor: 'pointer', fontSize: 12 }}>Reessayer</button>
                      </div>
                    </div>
                  )}
                  {etat.statut === 'ok' && (
                    <>
                      <textarea
                        value={etat.texte}
                        onChange={e => modifierTexte(p.key, e.target.value)}
                        rows={10}
                        style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #eee', fontSize: 13, lineHeight: 1.5, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', color: '#333', backgroundColor: '#fafafa' }}
                      />
                      <div style={{ marginTop: 6, fontSize: 11, color: '#aaa', textAlign: 'right' }}>{etat.texte.length} caracteres &middot; modifiable</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note bas de page */}
      <div style={{ marginTop: 24, padding: 14, backgroundColor: '#FEF6E7', border: '1px solid #F5A623', borderRadius: 10, fontSize: 12, color: '#8a6d1a' }}>
        <strong>Mode semi-automatique :</strong> l&apos;IA prepare les propositions, vous les relisez et modifiez, puis vous publiez vous-meme (copier-coller) sur chaque reseau. La publication automatique et la generation d&apos;images arriveront dans les prochaines etapes.
      </div>
    </div>
  );
}
