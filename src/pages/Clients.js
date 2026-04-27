import React, { useState } from 'react';

const CLIENTS = [
  { id: 1, nom: 'Ammiel Djidonou', phone: '+22997123456', commune: 'Porto-Novo', missions: 3, depenses: 45000, date: '22/04/2026' },
  { id: 2, nom: 'Rosine Houeto', phone: '+22996234567', commune: 'Cotonou', missions: 7, depenses: 128000, date: '15/03/2026' },
  { id: 3, nom: 'Patrick Agbota', phone: '+22995345678', commune: 'Akpakpa', missions: 2, depenses: 22000, date: '10/03/2026' },
  { id: 4, nom: 'Sylvie Kpade', phone: '+22994456789', commune: 'Abomey-Calavi', missions: 5, depenses: 87000, date: '01/02/2026' },
  { id: 5, nom: 'Georges Mensah', phone: '+22993567890', commune: 'Cadjehoun', missions: 1, depenses: 15000, date: '20/04/2026' },
];

export default function Clients() {
  const [search, setSearch] = useState('');

  const filtres = CLIENTS.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.commune.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Clients</h1>
        <p style={{ color: '#888', fontSize: 14 }}>{CLIENTS.length} clients inscrits</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#0066CC' }}>{CLIENTS.length}</div>
          <div style={{ color: '#888', fontSize: 13 }}>Total clients</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1D9E75' }}>{CLIENTS.reduce((s, c) => s + c.missions, 0)}</div>
          <div style={{ color: '#888', fontSize: 13 }}>Missions passées</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#F5A623' }}>{CLIENTS.reduce((s, c) => s + c.depenses, 0).toLocaleString('fr-FR')} FCFA</div>
          <div style={{ color: '#888', fontSize: 13 }}>Volume total</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <input placeholder="🔍 Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Téléphone</th>
              <th>Commune</th>
              <th>Missions</th>
              <th>Dépenses</th>
              <th>Inscrit le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtres.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.nom}</td>
                <td style={{ color: '#888' }}>{c.phone}</td>
                <td>{c.commune}</td>
                <td>{c.missions}</td>
                <td style={{ color: '#1D9E75', fontWeight: 600 }}>{c.depenses.toLocaleString('fr-FR')} FCFA</td>
                <td style={{ color: '#888' }}>{c.date}</td>
                <td>
                  <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>Voir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
