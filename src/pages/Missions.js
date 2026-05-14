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
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

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
      (m.artisan?.full_name || '').toLowerCase().includes(search.toLowerCase());
    const matchFiltre = filtre === 'tous' || m.status === filtre;
    return matchSearch && matchFiltre;
  });

  const stats = {
    posted:     missions.filter(m => m.status === 'posted').length,
    in_progress: missions.filter(m => m.status === 'in_progress').length,
    validated:  missions.filter(m => m.status === 'validated').length,
    disputed:   missions.filter(m => m.status === 'disputed').length,
    total_fcfa: missions.filter(m => m.status === 'validated').reduce((s, m) => s + (m.quote_amount_fcfa || 0), 0),
  };

  const filtres = ['tous', 'posted', 'in_progress', 'completed', 'validated', 'cancelled', 'disputed'];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Gestion des Missions</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>{missions.length} missions au total</p>
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
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{m.title || '-'}{m.is_urgent && <span style={{ marginLeft: 6, backgroundColor: '#FEF0EE', color: '#E74C3C', fontSize: 10, padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>URGENT</span>}</td>
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