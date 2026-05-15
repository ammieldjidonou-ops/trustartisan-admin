import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

const CATEGORIES = ['Hébergement & Tech', 'Marketing & Pub', 'Salaires & RH', 'Juridique & Admin', 'Déplacements', 'Autre'];

export default function Comptabilite() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState('bilan');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ libelle: '', montant: '', categorie: 'Autre', date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const [filtreDepense, setFiltreDepense] = useState('toutes');

  const charger = () => {
    setLoading(true);
    fetch(API_URL + '/api/admin/comptabilite')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const ajouterDepense = async () => {
    if (!form.libelle || !form.montant) { alert('Libellé et montant requis'); return; }
    setSaving(true);
    try {
      const r = await fetch(API_URL + '/api/admin/depenses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const d = await r.json();
      if (d.success) { setShowForm(false); setForm({ libelle: '', montant: '', categorie: 'Autre', date: new Date().toISOString().split('T')[0] }); charger(); }
      else alert(d.error);
    } catch (e) { alert('Erreur serveur'); }
    setSaving(false);
  };

  const supprimerDepense = async (id) => {
    if (!window.confirm('Supprimer cette dépense ?')) return;
    await fetch(API_URL + '/api/admin/depenses/' + id, { method: 'DELETE' });
    charger();
  };

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ['Date', 'Type', 'Libellé', 'Montant (FCFA)'],
      ...data.commissions.map(c => [c.date?.split('T')[0], 'Commission', c.detail, c.montant]),
      ...data.depenses.map(d => [d.date, 'Dépense - ' + d.categorie, d.libelle, -d.montant]),
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'comptabilite_trustartisan.csv'; a.click();
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Chargement...</div>;

  const stats = data?.stats || {};
  const depensesFiltrees = (data?.depenses || []).filter(d => filtreDepense === 'toutes' || d.categorie === filtreDepense);

  // Regrouper commissions par mois
  const parMois = {};
  (data?.commissions || []).forEach(c => {
    const mois = c.date ? c.date.substring(0, 7) : 'Inconnu';
    parMois[mois] = (parMois[mois] || 0) + c.montant;
  });

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Comptabilité</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Suivi des revenus et dépenses TrustArtisan</p>
        </div>
        <button onClick={exportCSV} style={{ backgroundColor: '#0066CC', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          📥 Exporter CSV
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Commissions', value: (stats.total_commissions || 0).toLocaleString('fr-FR') + ' FCFA', color: '#1D9E75', bg: '#E1F5EE' },
          { label: 'Total Dépenses', value: (stats.total_depenses || 0).toLocaleString('fr-FR') + ' FCFA', color: '#E74C3C', bg: '#FEF0EE' },
          { label: 'Résultat Net', value: (stats.resultat_net || 0).toLocaleString('fr-FR') + ' FCFA', color: stats.resultat_net >= 0 ? '#1D9E75' : '#E74C3C', bg: stats.resultat_net >= 0 ? '#E1F5EE' : '#FEF0EE' },
          { label: 'Missions payées', value: stats.nb_missions_payees || 0, color: '#0066CC', bg: '#EEF4FF' },
          { label: 'Artisans actifs', value: stats.nb_artisans_actifs || 0, color: '#F5A623', bg: '#FEF6E7' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: s.bg, borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: i < 3 ? 14 : 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['bilan', '📊 Bilan mensuel'], ['commissions', '✅ Commissions'], ['depenses', '💸 Dépenses']].map(([key, label]) => (
          <button key={key} onClick={() => setOnglet(key)}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              backgroundColor: onglet === key ? '#1D9E75' : '#f0f0f0', color: onglet === key ? '#fff' : '#555' }}>
            {label}
          </button>
        ))}
      </div>

      {/* BILAN MENSUEL */}
      {onglet === 'bilan' && (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Commissions par mois</h3>
          {Object.keys(parMois).length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: 40 }}>Aucune commission enregistrée pour l instant</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ backgroundColor: '#f8f9fa' }}>
                {['Mois', 'Commissions (FCFA)', 'Dépenses (FCFA)', 'Résultat (FCFA)'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#666', borderBottom: '1px solid #eee' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {Object.entries(parMois).sort().reverse().map(([mois, montant]) => {
                  const depMois = (data?.depenses || []).filter(d => d.date && d.date.startsWith(mois)).reduce((s, d) => s + d.montant, 0);
                  const res = montant - depMois;
                  return (
                    <tr key={mois} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{new Date(mois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</td>
                      <td style={{ padding: '12px 16px', color: '#1D9E75', fontWeight: 700 }}>{montant.toLocaleString('fr-FR')}</td>
                      <td style={{ padding: '12px 16px', color: '#E74C3C' }}>{depMois.toLocaleString('fr-FR')}</td>
                      <td style={{ padding: '12px 16px', color: res >= 0 ? '#1D9E75' : '#E74C3C', fontWeight: 700 }}>{res >= 0 ? '+' : ''}{res.toLocaleString('fr-FR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* COMMISSIONS */}
      {onglet === 'commissions' && (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ backgroundColor: '#f8f9fa' }}>
              {['Date', 'Mission', 'Commission (FCFA)'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#666', borderBottom: '1px solid #eee' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {(data?.commissions || []).length === 0 ? (
                <tr><td colSpan={3} style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>Aucune commission pour l instant</td></tr>
              ) : (data?.commissions || []).map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>{c.date ? new Date(c.date).toLocaleDateString('fr-FR') : '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{c.detail}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1D9E75' }}>{c.montant.toLocaleString('fr-FR')} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DÉPENSES */}
      {onglet === 'depenses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['toutes', ...CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setFiltreDepense(cat)}
                  style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer', fontSize: 11,
                    backgroundColor: filtreDepense === cat ? '#1D9E75' : '#fff', color: filtreDepense === cat ? '#fff' : '#555' }}>
                  {cat === 'toutes' ? 'Toutes' : cat}
                </button>
              ))}
            </div>
            <button onClick={() => setShowForm(!showForm)}
              style={{ backgroundColor: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              + Ajouter une dépense
            </button>
          </div>

          {showForm && (
            <div style={{ backgroundColor: '#E1F5EE', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#0F6E56' }}>Nouvelle dépense</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <input placeholder="Libellé *" value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} />
                <input type="number" placeholder="Montant FCFA *" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} />
                <select value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowForm(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' }}>Annuler</button>
                <button onClick={ajouterDepense} disabled={saving}
                  style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: '#1D9E75', color: '#fff', fontWeight: 600 }}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ backgroundColor: '#f8f9fa' }}>
                {['Date', 'Libellé', 'Catégorie', 'Montant (FCFA)', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#666', borderBottom: '1px solid #eee' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {depensesFiltrees.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>Aucune dépense enregistrée</td></tr>
                ) : depensesFiltrees.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>{new Date(d.date).toLocaleDateString('fr-FR')}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{d.libelle}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: '#f0f0f0', padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{d.categorie}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#E74C3C' }}>{d.montant.toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => supprimerDepense(d.id)} style={{ backgroundColor: '#FEF0EE', color: '#E74C3C', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}