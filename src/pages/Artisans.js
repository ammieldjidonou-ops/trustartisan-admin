import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

export default function Artisans() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    fetch(API_URL + '/api/admin/artisans')
      .then(r => r.json())
      .then(data => {
        if (data.success) setArtisans(data.artisans);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtres = [
    { key: 'tous', label: 'Tous' },
    { key: 'en_attente_validation', label: 'En attente' },
    { key: 'actif', label: 'Actifs' },
    { key: 'suspendu', label: 'Suspendus' },
  ];

  const artisansFiltres = artisans.filter(a => {
    const matchFiltre = filtre === 'tous' || a.statut === filtre;
    const matchRecherche = !recherche || 
      (a.full_name || '').toLowerCase().includes(recherche.toLowerCase()) ||
      (a.phone || '').includes(recherche) ||
      (a.primary_specialty || '').toLowerCase().includes(recherche.toLowerCase());
    return matchFiltre && matchRecherche;
  });

  const valider = async (id) => {
    try {
      const r = await fetch(API_URL + '/api/admin/artisans/' + id + '/valider', { method: 'POST' });
      const data = await r.json();
      if (data.success) {
        setArtisans(prev => prev.map(a => a.id === id ? { ...a, statut: 'actif' } : a));
      }
    } catch (e) { alert('Erreur lors de la validation'); }
  };

  const suspendre = async (id) => {
    try {
      const r = await fetch(API_URL + '/api/admin/artisans/' + id + '/suspendre', { method: 'POST' });
      const data = await r.json();
      if (data.success) {
        setArtisans(prev => prev.map(a => a.id === id ? { ...a, statut: 'suspendu' } : a));
      }
    } catch (e) { alert('Erreur lors de la suspension'); }
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.titre}>Gestion des Artisans</h1>
        <span style={styles.badge}>{artisans.length} artisans</span>
      </div>

      <div style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="Rechercher par nom, telephone, specialite..."
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
        />
        <div style={styles.filtres}>
          {filtres.map(f => (
            <button
              key={f.key}
              style={{ ...styles.filtreBtn, ...(filtre === f.key ? styles.filtreBtnActif : {}) }}
              onClick={() => setFiltre(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Telephone</th>
              <th style={styles.th}>Specialite</th>
              <th style={styles.th}>Commune</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Date inscription</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {artisansFiltres.length === 0 ? (
              <tr><td colSpan={7} style={styles.empty}>Aucun artisan trouve</td></tr>
            ) : artisansFiltres.map(a => (
              <tr key={a.id} style={styles.tr}>
                <td style={styles.td}><strong>{a.full_name || (a.prenom + ' ' + a.nom)}</strong></td>
                <td style={styles.td}>{a.phone}</td>
                <td style={styles.td}>{a.primary_specialty || '-'}</td>
                <td style={styles.td}>{a.commune || '-'}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.statut, backgroundColor: a.statut === 'actif' ? '#d4edda' : a.statut === 'en_attente_validation' ? '#fff3cd' : '#f8d7da', color: a.statut === 'actif' ? '#155724' : a.statut === 'en_attente_validation' ? '#856404' : '#721c24' }}>
                    {a.statut === 'actif' ? 'Actif' : a.statut === 'en_attente_validation' ? 'En attente' : 'Suspendu'}
                  </span>
                </td>
                <td style={styles.td}>{new Date(a.created_at).toLocaleDateString('fr-FR')}</td>
                <td style={styles.td}>
                  {a.statut === 'en_attente_validation' && (
                    <button style={styles.btnValider} onClick={() => valider(a.id)}>Valider</button>
                  )}
                  {a.statut === 'actif' && (
                    <button style={styles.btnSuspendre} onClick={() => suspendre(a.id)}>Suspendre</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px' },
  header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  titre: { fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  badge: { backgroundColor: '#1D9E75', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '14px' },
  toolbar: { display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  search: { flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  filtres: { display: 'flex', gap: '8px' },
  filtreBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff', fontSize: '13px' },
  filtreBtnActif: { backgroundColor: '#1D9E75', color: '#fff', borderColor: '#1D9E75' },
  tableContainer: { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f8f9fa' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666', borderBottom: '1px solid #eee' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#333' },
  statut: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  btnValider: { backgroundColor: '#1D9E75', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginRight: '6px' },
  btnSuspendre: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  empty: { textAlign: 'center', padding: '40px', color: '#999' },
  loading: { padding: '40px', textAlign: 'center', color: '#666' },
};
