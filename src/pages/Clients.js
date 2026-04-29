import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

function ModalClient({ client, onClose }) {
  if (!client) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, width: 480, maxWidth: '90vw', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#0F6E56' }}>
            {(client.full_name || 'C').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{client.full_name || (client.prenom + ' ' + client.nom)}</h2>
            <span style={{ backgroundColor: client.statut === 'actif' ? '#E1F5EE' : '#FEF0EE', color: client.statut === 'actif' ? '#0F6E56' : '#E74C3C', padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
              {client.statut || 'inconnu'}
            </span>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              ['Téléphone', client.phone],
              ['Email', client.email || '-'],
              ['Commune', client.commune || '-'],
              ['Prénom', client.prenom || '-'],
              ['Nom', client.nom || '-'],
              ['Vérifié', client.is_verified ? 'Oui' : 'Non'],
              ['Actif', client.is_active ? 'Oui' : 'Non'],
              ['Inscrit le', new Date(client.created_at).toLocaleDateString('fr-FR')],
              ['Dernière MAJ', new Date(client.updated_at).toLocaleDateString('fr-FR')],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px 0', color: '#888', fontSize: 13, width: 140 }}>{label}</td>
                <td style={{ padding: '8px 0', fontWeight: 500, fontSize: 13 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

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
      <ModalClient client={selected} onClose={() => setSelected(null)} />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Clients</h1>
        <p style={{ color: '#888', fontSize: 14 }}>
          {loading ? 'Chargement...' : clients.length + ' clients inscrits'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#0066CC' }}>{loading ? '...' : clients.length}</div>
          <div style={{ color: '#888', fontSize: 13 }}>Total clients</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1D9E75' }}>{loading ? '...' : clients.filter(c => c.statut === 'actif').length}</div>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>Aucun client trouve</td></tr>
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
                  <td>
                    <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setSelected(c)}>
                      Voir profil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}