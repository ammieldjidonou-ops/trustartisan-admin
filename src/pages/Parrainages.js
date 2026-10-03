import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

const STATUT = {
  en_attente: { label: 'En attente', bg: '#FEF6E7', color: '#F5A623' },
  valide: { label: 'Valide', bg: '#E1F5EE', color: '#1D9E75' },
  annule: { label: 'Annule', bg: '#f0f0f0', color: '#999' },
};
const STATUT_BON = {
  disponible: { label: 'disponible', color: '#1D9E75' },
  reserve: { label: 'en cours', color: '#F5A623' },
  utilise: { label: 'utilise', color: '#0066CC' },
  expire: { label: 'expire', color: '#aaa' },
  annule: { label: 'retire', color: '#E74C3C' },
};
const ROLE = { artisan: '🛠️ Artisan', client: '👤 Client' };

const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const libelleBon = (b) => (b.type === 'reduction_abonnement' ? '-' + b.valeur + ' % abonnement' : '1 contact offert');

function Personne({ u, code }) {
  if (!u) return <span style={{ color: '#aaa' }}>Compte introuvable</span>;
  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{u.full_name || '-'}</div>
      <div style={{ color: '#888', fontSize: 12 }}>
        {ROLE[u.role] || u.role}{code && u.code_parrainage ? ' · ' + u.code_parrainage : ''}
        {['suspendu', 'supprime'].includes(u.statut) ? <span style={{ color: '#E74C3C' }}> · {u.statut}</span> : null}
      </div>
    </div>
  );
}

function ModalDetail({ p, onClose, onAction, peutModerer, enCours }) {
  if (!p) return null;
  const bonsDe = (userId) => p.bons.filter(b => b.user_id === userId);
  const Bloc = ({ titre, u }) => (
    <div style={{ flex: 1, backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>{titre}</div>
      <Personne u={u} code />
      {u && <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{u.phone}{u.commune ? ' · ' + u.commune : ''}<br />Inscrit le {date(u.created_at)}</div>}
      <div style={{ marginTop: 10 }}>
        {u && bonsDe(u.id).length === 0 && <div style={{ fontSize: 12, color: '#aaa' }}>Aucun bon</div>}
        {u && bonsDe(u.id).map(b => (
          <div key={b.id} style={{ fontSize: 12, marginBottom: 4 }}>
            🎁 {libelleBon(b)} — <span style={{ color: STATUT_BON[b.statut]?.color, fontWeight: 600 }}>{STATUT_BON[b.statut]?.label || b.statut}</span>
            {b.statut === 'disponible' ? <span style={{ color: '#888' }}> (jusqu'au {date(b.expire_at)})</span> : null}
            {b.statut === 'utilise' ? <span style={{ color: '#888' }}> le {date(b.utilise_at)}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 28, width: 640, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>x</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Parrainage</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18, fontSize: 12, color: '#888' }}>
          <span style={{ backgroundColor: STATUT[p.statut]?.bg, color: STATUT[p.statut]?.color, padding: '2px 10px', borderRadius: 10, fontWeight: 600 }}>{STATUT[p.statut]?.label || p.statut}</span>
          <span>Inscription le {date(p.created_at)}</span>
          {p.valide_at && <span>· valide le {date(p.valide_at)}</span>}
        </div>

        {p.alertes.length > 0 && (
          <div style={{ backgroundColor: '#FEF0EE', border: '1px solid #F5C6C0', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            {p.alertes.map((a, i) => <div key={i} style={{ fontSize: 13, color: '#C0392B' }}>⚠️ {a}</div>)}
            <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>Signal a verifier, pas forcement un abus : un artisan qui parraine son propre client, par exemple, est normal.</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <Bloc titre="Parrain" u={p.parrain} />
          <Bloc titre="Filleul" u={p.filleul} />
        </div>

        <div style={{ fontSize: 12, color: '#888', marginBottom: 18 }}>
          Condition de validation : {p.filleul_role === 'artisan' ? 'dossier artisan valide par l equipe' : 'premiere mission terminee et notee par le client'}.
        </div>

        {peutModerer && p.statut !== 'annule' && (
          <div style={{ display: 'flex', gap: 10 }}>
            {p.statut === 'en_attente' && (
              <button className="btn btn-primary" disabled={enCours} style={{ flex: 1 }}
                onClick={() => onAction(p, 'valider')}>Valider manuellement</button>
            )}
            <button className="btn" disabled={enCours} style={{ flex: 1, backgroundColor: '#E74C3C', color: '#fff' }}
              onClick={() => onAction(p, 'annuler')}>Annuler (abus)</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Parrainages({ admin }) {
  const [donnees, setDonnees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [filtre, setFiltre] = useState('tous');
  const [recherche, setRecherche] = useState('');
  const [selection, setSelection] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const peutModerer = ['super_admin', 'moderateur'].includes(admin?.role);

  const charger = () => {
    setLoading(true);
    fetch(API_URL + '/api/admin/parrainages')
      .then(r => r.json())
      .then(d => { if (d.success) { setDonnees(d); setErreur(''); } else setErreur(d.error || 'Erreur'); })
      .catch(() => setErreur('Connexion impossible'))
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { charger(); }, []);

  const action = async (p, type) => {
    const message = type === 'annuler'
      ? 'Annuler ce parrainage ? Les bons non utilises du parrain et du filleul seront retires.'
      : 'Valider ce parrainage maintenant ? Les bons seront crees pour le parrain et le filleul.';
    if (!window.confirm(message)) return;
    setEnCours(true);
    try {
      const r = await fetch(API_URL + '/api/admin/parrainages/' + p.id + '/' + type, { method: 'POST' });
      const d = await r.json();
      if (!d.success) alert(d.error || 'Erreur');
      else { setSelection(null); charger(); }
    } catch (e) { alert('Erreur serveur'); }
    setEnCours(false);
  };

  const liste = donnees?.parrainages || [];
  const s = donnees?.stats || {};
  const q = recherche.trim().toLowerCase();
  const filtres = liste
    .filter(p => filtre === 'tous' || (filtre === 'alertes' ? p.alertes.length > 0 : p.statut === filtre))
    .filter(p => !q || [p.parrain?.full_name, p.parrain?.code_parrainage, p.parrain?.phone, p.filleul?.full_name, p.filleul?.phone]
      .some(v => String(v || '').toLowerCase().includes(q)));

  return (
    <div>
      <ModalDetail p={selection} onClose={() => setSelection(null)} onAction={action} peutModerer={peutModerer} enCours={enCours} />

      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Parrainages</h1>
          <p style={{ color: '#888', fontSize: 14 }}>
            Artisan : -{donnees?.regles?.reductionAbonnementPct ?? 25} % sur un mois d'abonnement · Client : 1 contact offert ·
            plafond {donnees?.regles?.plafondAnnuelParrain ?? 10} parrainages recompenses / parrain / an · bons valables {donnees?.regles?.validiteMois ?? 12} mois
          </p>
        </div>
        <button className="btn btn-secondary" onClick={charger} disabled={loading}>Actualiser</button>
      </div>

      {erreur && <div className="card" style={{ color: '#E74C3C', marginBottom: 16 }}>{erreur}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Parrainages', v: s.total, color: '#0066CC' },
          { label: 'Valides', v: s.valides, color: '#1D9E75' },
          { label: 'En attente', v: s.en_attente, color: '#F5A623' },
          { label: 'Croises', v: s.croises, color: '#8E44AD', aide: 'artisan ↔ client' },
          { label: 'Bons utilises', v: s.bons_utilises, color: '#0C3B2E', aide: (s.contacts_offerts_utilises || 0) + ' contacts · ' + (s.reductions_utilisees || 0) + ' reductions' },
          { label: 'Alertes', v: s.avec_alerte, color: '#E74C3C' },
        ].map((c, i) => (
          <div key={i} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.color }}>{loading && !donnees ? '...' : (c.v || 0)}</div>
            <div style={{ color: '#888', fontSize: 13 }}>{c.label}</div>
            {c.aide && <div style={{ color: '#aaa', fontSize: 11, marginTop: 2 }}>{c.aide}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            {[['tous', 'Tous'], ['en_attente', 'En attente'], ['valide', 'Valides'], ['annule', 'Annules'], ['alertes', '⚠️ Alertes']].map(([k, l]) => (
              <button key={k} onClick={() => setFiltre(k)} className="btn"
                style={{ background: filtre === k ? '#1D9E75' : '#f0f0f0', color: filtre === k ? '#fff' : '#555', fontSize: 12 }}>{l}</button>
            ))}
            <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Nom, code ou telephone"
              style={{ marginLeft: 'auto', padding: '7px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: 220 }} />
          </div>

          <div className="card">
            {loading && !donnees ? <p style={{ textAlign: 'center', color: '#888' }}>Chargement...</p> : (
              <table>
                <thead>
                  <tr><th>Date</th><th>Parrain</th><th>Filleul</th><th>Statut</th><th>Bons</th><th></th></tr>
                </thead>
                <tbody>
                  {filtres.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>Aucun parrainage</td></tr>
                  )}
                  {filtres.map(p => (
                    <tr key={p.id} style={p.alertes.length ? { backgroundColor: '#FFFAF9' } : null}>
                      <td style={{ color: '#888', fontSize: 13 }}>{date(p.created_at)}</td>
                      <td><Personne u={p.parrain} code /></td>
                      <td><Personne u={p.filleul} /></td>
                      <td>
                        <span style={{ backgroundColor: STATUT[p.statut]?.bg, color: STATUT[p.statut]?.color, padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                          {STATUT[p.statut]?.label || p.statut}
                        </span>
                        {p.alertes.length > 0 && <span title={p.alertes.join('\n')} style={{ marginLeft: 6, cursor: 'help' }}>⚠️</span>}
                      </td>
                      <td style={{ fontSize: 12, color: '#666' }}>
                        {p.bons.length === 0 ? '-' : p.bons.filter(b => b.statut === 'utilise').length + ' / ' + p.bons.length + ' utilise(s)'}
                      </td>
                      <td>
                        <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setSelection(p)}>Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🏆 Meilleurs parrains</h3>
          {(donnees?.classement || []).length === 0 && <p style={{ color: '#aaa', fontSize: 13 }}>Aucun parrain pour le moment.</p>}
          {(donnees?.classement || []).map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f3f3' }}>
              <div style={{ width: 22, color: '#aaa', fontWeight: 700, fontSize: 13 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}><Personne u={c.parrain} code /></div>
              <div style={{ textAlign: 'right', fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: '#1D9E75' }}>{c.valides} valide(s)</div>
                <div style={{ color: '#888' }}>{c.en_attente} en attente{c.alertes ? ' · ⚠️ ' + c.alertes : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
