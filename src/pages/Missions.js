import React, { useState } from 'react';

const MISSIONS = [
  { id: 1, titre: 'Fuite eau salle de bain', client: 'Ammiel Djidonou', artisan: 'Kodjo Agossou', specialite: 'Plomberie', commune: 'Cotonou', statut: 'en_cours', montant: 15000, date: '23/04/2026' },
  { id: 2, titre: 'Installation prise électrique', client: 'Rosine Houeto', artisan: 'Fatouma Sekpe', specialite: 'Electricité', commune: 'Akpakpa', statut: 'termine', montant: 8000, date: '20/04/2026' },
  { id: 3, titre: 'Peinture salon', client: 'Patrick Agbota', artisan: 'En attente', specialite: 'Peinture', commune: 'Cadjehoun', statut: 'en_attente', montant: 0, date: '22/04/2026' },
  { id: 4, titre: 'Réparation toiture', client: 'Sylvie Kpade', artisan: 'Jean Adjovi', specialite: 'Maçonnerie', commune: 'Abomey-Calavi', statut: 'termine', montant: 35000, date: '15/04/2026' },
  { id: 5, titre: 'Coiffure domicile', client: 'Georges Mensah', artisan: 'En attente', specialite: 'Coiffure femme', commune: 'Cotonou', statut: 'en_attente', montant: 0, date: '23/04/2026' },
];

const STATUT_CONFIG = {
  en_attente: { label: 'En attente', className: 'badge-warning' },
  en_cours: { label: 'En cours', className: 'badge-info' },
  termine: { label: 'Terminé', className: 'badge-success' },
};

export default function Missions() {
  const [filtre, setFiltre] = useState('tous');
  const [search, setSearch] = useState('');

  const filtres = MISSIONS.filter(m => {
    const matchSearch = m.titre.toLowerCase().includes(search.toLowerCase()) || m.client.toLowerCase().includes(search.toLowerCase());
    const matchFiltre = filtre === 'tous' || m.statut === filtre;
    return matchSearch && matchFiltre;
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Missions</h1>
        <p style={{ color: '#888', fontSize: 14 }}>{MISSIONS.length} missions au total</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#F5A623' }}>{MISSIONS.filter(m => m.statut === 'en_attente').length}</div>
          <div style={{ color: '#888', fontSize: 13 }}>En attente</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#0066CC' }}>{MISSIONS.filter(m => m.statut === 'en_cours').length}</div>
          <div style={{ color: '#888', fontSize: 13 }}>En cours</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1D9E75' }}>{MISSIONS.filter(m => m.statut === 'termine').length}</div>
          <div style={{ color: '#888', fontSize: 13 }}>Terminées</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <select value={filtre} onChange={e => setFiltre(e.target.value)}>
            <option value="tous">Tous</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminées</option>
          </select>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Mission</th>
              <th>Client</th>
              <th>Artisan</th>
              <th>Spécialité</th>
              <th>Commune</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtres.map(m => (
              <tr key={m.id}>
                <td style={{ fontWeight: 600 }}>{m.titre}</td>
                <td>{m.client}</td>
                <td style={{ color: m.artisan === 'En attente' ? '#aaa' : '#333' }}>{m.artisan}</td>
                <td>{m.specialite}</td>
                <td>{m.commune}</td>
                <td style={{ color: '#1D9E75', fontWeight: 600 }}>{m.montant > 0 ? m.montant.toLocaleString('fr-FR') + ' FCFA' : '-'}</td>
                <td><span className={'badge ' + STATUT_CONFIG[m.statut].className}>{STATUT_CONFIG[m.statut].label}</span></td>
                <td style={{ color: '#888' }}>{m.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
