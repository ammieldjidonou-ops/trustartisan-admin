import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(API_URL + '/api/admin/clients')
      .then(r => r.json())
      .then(data => {
        if (data.success) setClients(data.clients || []);
        else setErreur('Erreur chargement clients');
      })
      .catch(() => setErreur('Impossible de contacter le serveur'))
      .finally(() => setLoading(false));
  }, []);

  const filtres = clients.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.full_name || '').toLowerCase().includes(q) ||
      (c.prenom || '').toLowerCase().includes(q) ||
      (c.nom || '').toLowerCase().includes(q) ||
      (c.commune || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    );
  });

  const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('fr-FR');
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Clients</h1>
        <p style={{ color: '#888', fontSize: 14 }}>
          {loading ? 'Chargement...' : clients.length + ' clients inscrits'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#0066CC' }}>
            {loading ? '...' : clients.length}
          </div>
          <div style={{ color: '#888', fontSize: 13 }}>Total clients</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1D9E75' }}>
            {loading ? '...' : clients.filter(c => c.statut === 'actif').length}
          </div>
          <div style={{ color: '#888', fontSize: 13 }}>Clients actifs</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#F5A623' }}>
            {loading ? '...' : clients.filter(c => {
              const d = new Date(c.created_at);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </div>
          <div style={{ color: '#888', fontSize: 13 }}>Nouveaux ce mois</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <input
          placeholder="Rechercher un client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div className="card">
        {loading && <p style={{ textAlign: 'center', color: '#888' }}>Chargement des clients...</p>}
        {erreur && <p style={{ textAlign: 'center', color: '#E74C3C' }}>{erreur}</p>}
        {!loading && !erreur && (
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Telephone</th>
                <th>Commune</th>
                <th>Statut</th>
                <th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {filtres.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>Aucun client trouve</td></tr>
              )}
              {filtres.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>
                    {c.full_name || ((c.prenom || '') + ' ' + (c.nom || '')).trim() || '-'}
                  </td>
                  <td style={{ color: '#888' }}>{c.phone || '-'}</td>
                  <td>{c.commune || '-'}</td>
                  <td>
                    <span style={{
                      backgroundColor: c.statut === 'actif' ? '#E1F5EE' : '#FEF0EE',
                      color: c.statut === 'actif' ? '#0F6E56' : '#E74C3C',
                      padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600
                    }}>
                      {c.statut || 'inconnu'}
                    </span>
                  </td>
                  <td style={{ color: '#888' }}>{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}