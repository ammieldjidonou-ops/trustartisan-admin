import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

const STATUT_CONFIG = {
  posted:           { label: 'En attente',      color: '#F5A623', bg: '#FEF6E7' },
  quote_sent:       { label: 'Devis envoyé',    color: '#854F0B', bg: '#FEF6E7' },
  quote_accepted:   { label: 'Devis accepté',   color: '#0066CC', bg: '#EEF4FF' },
  in_progress:      { label: 'En cours',        color: '#0066CC', bg: '#EEF4FF' },
  completed:        { label: 'À valider',       color: '#9B59B6', bg: '#F5EEF8' },
  validated:        { label: 'Terminée',        color: '#1D9E75', bg: '#E1F5EE' },
  cancelled:        { label: 'Annulée',         color: '#aaa',    bg: '#f5f5f5' },
  disputed:         { label: 'Litige',          color: '#E74C3C', bg: '#FEF0EE' },
};

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [filtrePhase, setFiltrePhase] = useState('tous');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showExpirees, setShowExpirees] = useState(false);
  const [annulationEnCours, setAnnulationEnCours] = useState(false);

  useEffect(() => {
    fetch(API_URL + '/api/admin/missions')
      .then(r => r.json())
      .then(data => { if (data.success) setMissions(data.missions || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtrees = missions.filter(m => {
    const matchSearch = !search ||
      (m.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.client?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.artisan?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.specialty || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.commune || '').toLowerCase().includes(search.toLowerCase());
    const matchFiltre = filtre === 'tous' || m.status === filtre;
    const phase = m.phase_creation || 'production';
    const matchPhase = filtrePhase === 'tous'
      || (filtrePhase === 'plateforme' && phase === 'production')
      || (filtrePhase === 'hors_plateforme' && phase === 'pre_api');
    return matchSearch && matchFiltre && matchPhase;
  });

  const stats = {
    posted:     missions.filter(m => m.status === 'posted').length,
    in_progress: missions.filter(m => m.status === 'in_progress').length,
    validated:  missions.filter(m => m.status === 'validated').length,
    disputed:   missions.filter(m => m.status === 'disputed').length,
    total_fcfa: missions.filter(m => m.status === 'validated').reduce((s, m) => s + (m.quote_amount_fcfa || 0), 0),
  };

  const maintenant = new Date();
  const missionsExpirees = missions.filter(m => {
    if (m.status !== 'posted') return false;
    const joursEcoules = (maintenant - new Date(m.created_at)) / (1000 * 60 * 60 * 24);
    return joursEcoules > 5;
  });

  const annulerMissionsExpirees = async (ids) => {
    if (!window.confirm('Annuler ' + ids.length + ' mission(s) expirée(s) ? Les clients recevront une notification.')) return;
    setAnnulationEnCours(true);
    try {
      for (const id of ids) {
        await fetch(API_URL + '/api/missions/' + id + '/annuler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raison: 'Mission expiree automatiquement - Aucun artisan disponible apres 5 jours. Merci de renouveler votre demande.' })
        });
      }
      setMissions(prev => prev.map(m => ids.includes(m.id) ? { ...m, status: 'cancelled' } : m));
      setShowExpirees(false);
      alert('Missions annulées avec succès. Les clients ont été notifiés.');
    } catch (e) {
      alert('Erreur lors de l annulation');
    } finally {
      setAnnulationEnCours(false);
    }
  };

  const filtres = ['tous', 'posted', 'in_progress', 'completed', 'validated', 'cancelled', 'disputed'];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Gestion des Missions</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <p style={{ color: '#888', fontSize: 14, margin: 0 }}>{missions.length} missions au total</p>
          {missionsExpirees.length > 0 && (
            <button onClick={() => setShowExpirees(true)}
              style={{ backgroundColor: '#E74C3C', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              ⚠️ {missionsExpirees.length} mission(s) expirée(s) &gt; 5 jours
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'En attente', value: stats.posted, color: '#F5A623' },
          { label: 'En cours', value: stats.in_progress, color: '#0066CC' },
          { label: 'Terminées', value: stats.validated, color: '#1D9E75' },
          { label: 'Litiges', value: stats.disputed, color: '#E74C3C' },
          { label: 'Volume validé (FCFA)', value: stats.total_fcfa.toLocaleString('fr-FR'), color: '#1D9E75' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: i === 4 ? 18 : 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
            placeholder="Rechercher par titre, client, artisan..." value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {filtres.map(f => (
              <button key={f} onClick={() => setFiltre(f)}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', fontSize: 12,
                  backgroundColor: filtre === f ? '#1D9E75' : '#fff', color: filtre === f ? '#fff' : '#555', fontWeight: filtre === f ? 700 : 400 }}>
                {f === 'tous' ? 'Toutes' : (STATUT_CONFIG[f]?.label || f)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>Phase :</span>
          {[['tous', 'Toutes'], ['plateforme', 'Plateforme (Moov/MTN)'], ['hors_plateforme', 'Hors plateforme']].map(([k, label]) => (
            <button key={k} onClick={() => setFiltrePhase(k)}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer', fontSize: 11,
                backgroundColor: filtrePhase === k ? '#F5A623' : '#fff', color: filtrePhase === k ? '#fff' : '#555', fontWeight: filtrePhase === k ? 700 : 400 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Chargement...</div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                {['Titre', 'Client', 'Artisan', 'Spécialité', 'Commune', 'Montant', 'Statut', 'Date', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#666', borderBottom: '1px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrees.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Aucune mission trouvée</td></tr>
              ) : filtrees.map(m => {
                const st = STATUT_CONFIG[m.status] || STATUT_CONFIG.posted;
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{m.title || '-'}{m.is_urgent && <span style={{ marginLeft: 6, backgroundColor: '#FEF0EE', color: '#E74C3C', fontSize: 10, padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>URGENT</span>}{m.phase_creation === 'pre_api' && <span style={{ marginLeft: 6, backgroundColor: '#FEF6E7', color: '#F5A623', fontSize: 10, padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>HORS PLATEFORME</span>}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{m.client?.full_name || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{m.artisan?.full_name || <span style={{ color: '#aaa' }}>Non assigné</span>}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{m.specialty || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{m.commune || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1D9E75' }}>{m.quote_amount_fcfa ? m.quote_amount_fcfa.toLocaleString('fr-FR') + ' FCFA' : '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: st.bg, color: st.color, padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#888' }}>{new Date(m.created_at).toLocaleDateString('fr-FR')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setSelected(m)} style={{ backgroundColor: '#1D9E75', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Détails</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showExpirees && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 32, width: 680, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowExpirees(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#E74C3C' }}>⚠️ Missions expirées ({missionsExpirees.length})</h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Ces missions sont en attente depuis plus de 5 jours sans artisan assigné. Vous pouvez les annuler en masse ou individuellement.</p>
            <div style={{ marginBottom: 16 }}>
              <button onClick={() => annulerMissionsExpirees(missionsExpirees.map(m => m.id))} disabled={annulationEnCours}
                style={{ backgroundColor: '#E74C3C', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginRight: 10 }}>
                {annulationEnCours ? 'Annulation...' : 'Tout annuler (' + missionsExpirees.length + ')'}
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  {['Mission', 'Client', 'Commune', 'Jours écoulés', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#666', borderBottom: '1px solid #eee' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {missionsExpirees.map(m => {
                  const jours = Math.floor((maintenant - new Date(m.created_at)) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>{m.title}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{m.client?.full_name || '-'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{m.commune || '-'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ backgroundColor: '#FEF0EE', color: '#E74C3C', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>{jours} jours</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => annulerMissionsExpirees([m.id])} disabled={annulationEnCours}
                          style={{ backgroundColor: '#E74C3C', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}>
                          Annuler
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 32, width: 560, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
            <h2 style={{ margin: '0 0 20px', fontSize: 18 }}>{selected.title}</h2>
            {[
              ['Statut', <span style={{ backgroundColor: STATUT_CONFIG[selected.status]?.bg, color: STATUT_CONFIG[selected.status]?.color, padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>{STATUT_CONFIG[selected.status]?.label}</span>],
              ['Client', selected.client?.full_name || '-'],
              ['Artisan', selected.artisan?.full_name || 'Non assigné'],
              ['Spécialité', selected.specialty || '-'],
              ['Commune', selected.commune || '-'],
              ['Montant', selected.quote_amount_fcfa ? selected.quote_amount_fcfa.toLocaleString('fr-FR') + ' FCFA' : 'Non défini'],
              ['Urgent', selected.is_urgent ? 'Oui' : 'Non'],
              ['Description', selected.description || '-'],
              ['Créée le', new Date(selected.created_at).toLocaleDateString('fr-FR')],
              ['Acceptée le', selected.quote_accepted_at ? new Date(selected.quote_accepted_at).toLocaleDateString('fr-FR') : '-'],
              ['Terminée le', selected.validated_at ? new Date(selected.validated_at).toLocaleDateString('fr-FR') : '-'],
              ['Note artisan', selected.note_artisan ? '⭐'.repeat(selected.note_artisan) + ' ' + selected.note_artisan + '/5' : '-'],
              ['Commentaire', selected.commentaire_artisan || '-'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', padding: '8px 0' }}>
                <span style={{ width: 140, color: '#888', fontSize: 13, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}