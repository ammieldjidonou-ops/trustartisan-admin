import React, { useState } from 'react';

const ARTISANS = [
  { id: 1, nom: 'Kodjo Agossou', specialite: 'Plomberie', commune: 'Cotonou', note: 4.5, missions: 23, badge: 'elite', statut: 'actif', phone: '+22997123456', date: '15/01/2026' },
  { id: 2, nom: 'Fatouma Sekpe', specialite: 'Electricité', commune: 'Akpakpa', note: 4.8, missions: 41, badge: 'elite', statut: 'actif', phone: '+22996234567', date: '20/01/2026' },
  { id: 3, nom: 'Jean Adjovi', specialite: 'Maçonnerie', commune: 'Cadjehoun', note: 3.9, missions: 12, badge: 'confirme', statut: 'actif', phone: '+22995345678', date: '05/02/2026' },
  { id: 4, nom: 'Marie Dossou', specialite: 'Peinture', commune: 'Porto-Novo', note: 4.2, missions: 18, badge: 'confirme', statut: 'actif', phone: '+22994456789', date: '10/02/2026' },
  { id: 5, nom: 'Gbessi Rodrigue', specialite: 'Plomberie', commune: 'Cotonou', note: 0, missions: 0, badge: 'nouveau', statut: 'attente', phone: '+22993567890', date: '23/04/2026' },
  { id: 6, nom: 'Ahounou Claire', specialite: 'Coiffure femme', commune: 'Porto-Novo', note: 0, missions: 0, badge: 'nouveau', statut: 'attente', phone: '+22992678901', date: '22/04/2026' },
];

const BADGE_CONFIG = {
  elite: { label: 'Elite', className: 'badge-warning' },
  confirme: { label: 'Confirmé', className: 'badge-success' },
  nouveau: { label: 'Nouveau', className: 'badge-info' },
};

const STATUT_CONFIG = {
  actif: { label: 'Actif', className: 'badge-success' },
  attente: { label: 'En attente', className: 'badge-warning' },
  suspendu: { label: 'Suspendu', className: 'badge-danger' },
};

export default function Artisans() {
  const [search, setSearch] = useState('');
  const [filtre, setFiltre] = useState('tous');

  const filtres = ARTISANS.filter(a => {
    const matchSearch = a.nom.toLowerCase().includes(search.toLowerCase()) || a.specialite.toLowerCase().includes(search.toLowerCase());
    const matchFiltre = filtre === 'tous' || a.statut === filtre;
    return matchSearch && matchFiltre;
  });

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Artisans</h1>
          <p style={{ color: '#888', fontSize: 14 }}>{ARTISANS.length} artisans inscrits</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input placeholder="🔍 Rechercher un artisan..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <select value={filtre} onChange={e => setFiltre(e.target.value)}>
            <option value="tous">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="attente">En attente</option>
            <option value="suspendu">Suspendus</option>
          </select>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Artisan</th>
              <th>Spécialité</th>
              <th>Commune</th>
              <th>Note</th>
              <th>Missions</th>
              <th>Badge</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtres.map(a => (
              <tr key={a.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{a.nom}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{a.phone}</div>
                </td>
                <td>{a.specialite}</td>
                <td>{a.commune}</td>
                <td>{a.note > 0 ? '★ ' + a.note : '-'}</td>
                <td>{a.missions}</td>
                <td><span className={'badge ' + BADGE_CONFIG[a.badge].className}>{BADGE_CONFIG[a.badge].label}</span></td>
                <td><span className={'badge ' + STATUT_CONFIG[a.statut].className}>{STATUT_CONFIG[a.statut].label}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {a.statut === 'attente' && <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 10px' }}>Valider</button>}
                    {a.statut === 'actif' && <button className="btn btn-warning" style={{ fontSize: 12, padding: '4px 10px' }}>Suspendre</button>}
                    <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>Voir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
