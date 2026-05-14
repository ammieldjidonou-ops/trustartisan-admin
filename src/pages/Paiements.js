import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

const STATUT_CONFIG = {
  validated: { label: 'Validée', color: '#1D9E75', bg: '#E1F5EE' },
  in_progress: { label: 'En cours', color: '#0066CC', bg: '#EEF4FF' },
  posted: { label: 'En attente', color: '#F5A623', bg: '#FEF6E7' },
  cancelled: { label: 'Annulée', color: '#aaa', bg: '#f5f5f5' },
  disputed: { label: 'Litige', color: '#E74C3C', bg: '#FEF0EE' },
};

export default function Paiements() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(API_URL + '/api/admin/missions')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const avecMontant = (data.missions || []).filter(m => m.quote_amount_fcfa > 0 || m.status === 'validated');
          setMissions(avecMontant);
        }
      })
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

  const totalValide = missions.filter(m => m.status === 'validated').reduce((s, m) => s + (m.quote_amount_fcfa || 0), 0);
  const commission = Math.round(totalValide * 0.10);
  const nbValide = missions.filter(m => m.status === 'validated').length;
  const nbLitige = missions.filter(m => m.status === 'disputed').length;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Paiements & Transactions</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>{missions.length} transactions avec montant</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Volume total validé', value: totalValide.toLocaleString('fr-FR') + ' FCFA', color: '#1D9E75' },
          { label: 'Commission TrustArtisan (10%)', value: commission.toLocaleString('fr-FR') + ' FCFA', color: '#0F6E56' },
          { label: 'Missions payées', value: nbValide, color: '#0066CC' },
          { label: 'Litiges', value: nbLitige, color: '#E74C3C' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: i < 2 ? 16 : 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
            placeholder="Rechercher par mission, client, artisan..." value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display: 'flex', gap: 8 }}>
            {['tous', 'validated', 'in_progress', 'disputed', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFiltre(f)}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', fontSize: 12,
                  backgroundColor: filtre === f ? '#1D9E75' : '#fff', color: filtre === f ? '#fff' : '#555', fontWeight: filtre === f ? 700 : 400 }}>
                {f === 'tous' ? 'Tous' : (STATUT_CONFIG[f]?.label || f)}
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
                {['Mission', 'Client', 'Artisan', 'Montant', 'Commission (10%)', 'Statut', 'Date validation'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#666', borderBottom: '1px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrees.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Aucune transaction trouvée</td></tr>
              ) : filtrees.map(m => {
                const st = STATUT_CONFIG[m.status] || STATUT_CONFIG.posted;
                const commission = m.quote_amount_fcfa ? Math.round(m.quote_amount_fcfa * 0.10) : 0;
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{m.title || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{m.client?.full_name || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{m.artisan?.full_name || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1D9E75' }}>{m.quote_amount_fcfa ? m.quote_amount_fcfa.toLocaleString('fr-FR') + ' FCFA' : '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#0F6E56' }}>{commission ? commission.toLocaleString('fr-FR') + ' FCFA' : '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: st.bg, color: st.color, padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#888' }}>{m.validated_at ? new Date(m.validated_at).toLocaleDateString('fr-FR') : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 16, padding: 16, backgroundColor: '#E1F5EE', borderRadius: 10, fontSize: 12, color: '#0F6E56' }}>
        ℹ️ Les montants de commission seront automatiquement calculés sur les missions validées une fois MTN MoMo activé en production.
      </div>
    </div>
  );
}