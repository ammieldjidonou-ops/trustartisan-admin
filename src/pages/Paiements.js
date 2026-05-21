import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

const STATUT_CONFIG = {
  validated: { label: 'Validee', color: '#1D9E75', bg: '#E1F5EE' },
  in_progress: { label: 'En cours', color: '#0066CC', bg: '#EEF4FF' },
  posted: { label: 'En attente', color: '#F5A623', bg: '#FEF6E7' },
  completed: { label: 'Terminee', color: '#9B59B6', bg: '#F4ECF7' },
  cancelled: { label: 'Annulee', color: '#aaa', bg: '#f5f5f5' },
};

const PAYMENT_CONFIG = {
  en_attente: { label: 'En attente paiement', color: '#F5A623', bg: '#FEF6E7' },
  en_sequestre: { label: 'En sequestre', color: '#0066CC', bg: '#EEF4FF' },
  libere: { label: 'Libere a l artisan', color: '#1D9E75', bg: '#E1F5EE' },
  rembourse: { label: 'Rembourse au client', color: '#E74C3C', bg: '#FEF0EE' },
};

export default function Paiements() {
  const [missions, setMissions] = useState([]);
  const [sequestres, setSequestres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [search, setSearch] = useState('');
  const [onglet, setOnglet] = useState('sequestres');
  const [actionMsg, setActionMsg] = useState('');

  const chargerDonnees = () => {
    fetch(API_URL + '/api/admin/missions')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const avecMontant = (data.missions || []).filter(m => m.quote_amount_fcfa > 0 || m.status === 'validated');
          setMissions(avecMontant);
        }
      }).catch(() => {});
    fetch(API_URL + '/api/admin/sequestres')
      .then(r => r.json())
      .then(data => { if (data.success) setSequestres(data.sequestres || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { chargerDonnees(); }, []);

  const libererSequestre = async (id) => {
    if (!window.confirm('Liberer ce montant vers l artisan ? Cette action confirme que la mission est correctement realisee.')) return;
    try {
      const resp = await fetch(API_URL + '/api/admin/missions/' + id + '/liberer-sequestre', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
      });
      const data = await resp.json();
      if (data.success) { setActionMsg('Sequestre libere vers l artisan.'); chargerDonnees(); }
      else { setActionMsg('Erreur : ' + (data.error || 'libration impossible')); }
      setTimeout(() => setActionMsg(''), 4000);
    } catch (e) { setActionMsg('Erreur serveur'); }
  };

  const rembourserSequestre = async (id, montantPaye) => {
    const saisie = window.prompt('Montant a rembourser au client (max ' + montantPaye + ' FCFA). Laissez vide pour rembourser la totalite :', String(montantPaye));
    if (saisie === null) return;
    const montant = saisie.trim() === '' ? montantPaye : parseInt(saisie.replace(/[^0-9]/g, ''), 10);
    if (isNaN(montant) || montant < 0 || montant > montantPaye) { alert('Montant invalide'); return; }
    const note = window.prompt('Motif du remboursement (litige, mission non effectuee, etc.) :', '');
    if (note === null) return;
    try {
      const resp = await fetch(API_URL + '/api/admin/missions/' + id + '/rembourser-sequestre', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montant, note })
      });
      const data = await resp.json();
      if (data.success) { setActionMsg('Remboursement de ' + data.montant_rembourse.toLocaleString('fr-FR') + ' FCFA enregistre.'); chargerDonnees(); }
      else { setActionMsg('Erreur : ' + (data.error || 'remboursement impossible')); }
      setTimeout(() => setActionMsg(''), 4000);
    } catch (e) { setActionMsg('Erreur serveur'); }
  };

  const filtrees = missions.filter(m => {
    const matchSearch = !search ||
      (m.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.client?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.artisan?.full_name || '').toLowerCase().includes(search.toLowerCase());
    const matchFiltre = filtre === 'tous' || m.status === filtre;
    return matchSearch && matchFiltre;
  });

  const totalValide = missions.filter(m => m.status === 'validated').reduce((s, m) => s + (m.quote_amount_fcfa || 0), 0);
  const commission = Math.round(totalValide * 0.08);
  const nbValide = missions.filter(m => m.status === 'validated').length;

  const enSequestre = sequestres.filter(s => s.payment_status === 'en_sequestre');
  const montantEnSequestre = enSequestre.reduce((s, m) => s + (m.montant_paye_fcfa || 0), 0);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Paiements & Sequestre</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Gestion des paiements securises et des transactions</p>
      </div>

      {actionMsg && (
        <div style={{ background: '#E1F5EE', border: '1px solid #1D9E75', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#0F6E56', fontWeight: 600 }}>{actionMsg}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Montant en sequestre', value: montantEnSequestre.toLocaleString('fr-FR') + ' FCFA', color: '#0066CC' },
          { label: 'Missions en sequestre', value: enSequestre.length, color: '#3498DB' },
          { label: 'Volume total valide', value: totalValide.toLocaleString('fr-FR') + ' FCFA', color: '#1D9E75' },
          { label: 'Commission (8%)', value: commission.toLocaleString('fr-FR') + ' FCFA', color: '#0F6E56' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: typeof s.value === 'string' && s.value.length > 8 ? 16 : 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['sequestres', 'Sequestres a gerer'], ['transactions', 'Toutes les transactions']].map(([k, label]) => (
          <button key={k} onClick={() => setOnglet(k)}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              backgroundColor: onglet === k ? '#1D9E75' : '#f0f0f0', color: onglet === k ? '#fff' : '#555' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Chargement...</div>
      ) : onglet === 'sequestres' ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                {['Mission', 'Montant paye', 'Part artisan', 'Commission', 'Statut paiement', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#666', borderBottom: '1px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sequestres.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Aucune mission en sequestre</td></tr>
              ) : sequestres.map(m => {
                const pc = PAYMENT_CONFIG[m.payment_status] || PAYMENT_CONFIG.en_attente;
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{m.title || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700 }}>{(m.montant_paye_fcfa || 0).toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#1D9E75', fontWeight: 600 }}>{(m.montant_artisan_fcfa || 0).toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#0F6E56' }}>{(m.commission_fcfa || 0).toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: pc.bg, color: pc.color, padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{pc.label}</span>
                      {m.montant_rembourse_fcfa ? <div style={{ fontSize: 11, color: '#E74C3C', marginTop: 4 }}>Rembourse : {m.montant_rembourse_fcfa.toLocaleString('fr-FR')} FCFA</div> : null}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {m.payment_status === 'en_sequestre' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => libererSequestre(m.id)}
                            style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, backgroundColor: '#1D9E75', color: '#fff' }}>
                            Liberer
                          </button>
                          <button onClick={() => rembourserSequestre(m.id, m.montant_paye_fcfa)}
                            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E74C3C', cursor: 'pointer', fontSize: 12, fontWeight: 600, backgroundColor: '#fff', color: '#E74C3C' }}>
                            Retroceder
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#aaa' }}>Traite</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <input style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
                placeholder="Rechercher par mission, client, artisan..." value={search} onChange={e => setSearch(e.target.value)} />
              <div style={{ display: 'flex', gap: 8 }}>
                {['tous', 'validated', 'in_progress', 'completed', 'cancelled'].map(f => (
                  <button key={f} onClick={() => setFiltre(f)}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', fontSize: 12,
                      backgroundColor: filtre === f ? '#1D9E75' : '#fff', color: filtre === f ? '#fff' : '#555', fontWeight: filtre === f ? 700 : 400 }}>
                    {f === 'tous' ? 'Tous' : (STATUT_CONFIG[f]?.label || f)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  {['Mission', 'Client', 'Artisan', 'Montant', 'Commission (8%)', 'Statut', 'Date validation'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#666', borderBottom: '1px solid #eee' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrees.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Aucune transaction trouvee</td></tr>
                ) : filtrees.map(m => {
                  const st = STATUT_CONFIG[m.status] || STATUT_CONFIG.posted;
                  const comm = m.quote_amount_fcfa ? Math.round(m.quote_amount_fcfa * 0.08) : 0;
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{m.title || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{m.client?.full_name || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{m.artisan?.full_name || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1D9E75' }}>{m.quote_amount_fcfa ? m.quote_amount_fcfa.toLocaleString('fr-FR') + ' FCFA' : '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#0F6E56' }}>{comm ? comm.toLocaleString('fr-FR') + ' FCFA' : '-'}</td>
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
        </>
      )}
    </div>
  );
}