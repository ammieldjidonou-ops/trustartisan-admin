import React, { useState } from 'react';

const PAIEMENTS = [
  { id: 1, reference: 'PAY-354065', client: 'Ammiel Djidonou', artisan: 'Fatouma Sekpe', mission: 'Installation prise électrique', montant: 8000, mode: 'moov', statut: 'success', date: '20/04/2026' },
  { id: 2, reference: 'PAY-123456', client: 'Rosine Houeto', artisan: 'Kodjo Agossou', mission: 'Fuite eau cuisine', montant: 25000, mode: 'mtn', statut: 'success', date: '18/04/2026' },
  { id: 3, reference: 'PAY-789012', client: 'Sylvie Kpade', artisan: 'Jean Adjovi', mission: 'Réparation toiture', montant: 35000, mode: 'mtn', statut: 'success', date: '15/04/2026' },
  { id: 4, reference: 'PAY-345678', client: 'Patrick Agbota', artisan: 'Marie Dossou', mission: 'Peinture chambre', montant: 12000, mode: 'moov', statut: 'failed', date: '10/04/2026' },
  { id: 5, reference: 'PAY-901234', client: 'Georges Mensah', artisan: 'Kodjo Agossou', mission: 'Débouchage évier', montant: 15000, mode: 'mtn', statut: 'pending', date: '23/04/2026' },
];

const MODE_CONFIG = {
  mtn: { label: 'MTN MoMo', className: 'badge-warning' },
  moov: { label: 'Moov Money', className: 'badge-info' },
};

const STATUT_CONFIG = {
  success: { label: 'Réussi', className: 'badge-success' },
  failed: { label: 'Échoué', className: 'badge-danger' },
  pending: { label: 'En attente', className: 'badge-warning' },
};

export default function Paiements() {
  const [filtre, setFiltre] = useState('tous');

  const totalReussi = PAIEMENTS.filter(p => p.statut === 'success').reduce((s, p) => s + p.montant, 0);

  const filtres = PAIEMENTS.filter(p => filtre === 'tous' || p.statut === filtre);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Paiements</h1>
        <p style={{ color: '#888', fontSize: 14 }}>{PAIEMENTS.length} transactions au total</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1D9E75' }}>{totalReussi.toLocaleString('fr-FR')} FCFA</div>
          <div style={{ color: '#888', fontSize: 13 }}>Volume réussi</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#FFCC00' }}>{PAIEMENTS.filter(p => p.mode === 'mtn' && p.statut === 'success').reduce((s, p) => s + p.montant, 0).toLocaleString('fr-FR')} FCFA</div>
          <div style={{ color: '#888', fontSize: 13 }}>MTN MoMo</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0066CC' }}>{PAIEMENTS.filter(p => p.mode === 'moov' && p.statut === 'success').reduce((s, p) => s + p.montant, 0).toLocaleString('fr-FR')} FCFA</div>
          <div style={{ color: '#888', fontSize: 13 }}>Moov Money</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#E74C3C' }}>{PAIEMENTS.filter(p => p.statut === 'failed').length}</div>
          <div style={{ color: '#888', fontSize: 13 }}>Transactions échouées</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <select value={filtre} onChange={e => setFiltre(e.target.value)}>
          <option value="tous">Tous les statuts</option>
          <option value="success">Réussis</option>
          <option value="pending">En attente</option>
          <option value="failed">Échoués</option>
        </select>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Client</th>
              <th>Artisan</th>
              <th>Mission</th>
              <th>Montant</th>
              <th>Mode</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtres.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#888' }}>{p.reference}</td>
                <td>{p.client}</td>
                <td>{p.artisan}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.mission}</td>
                <td style={{ fontWeight: 600, color: '#1D9E75' }}>{p.montant.toLocaleString('fr-FR')} FCFA</td>
                <td><span className={'badge ' + MODE_CONFIG[p.mode].className}>{MODE_CONFIG[p.mode].label}</span></td>
                <td><span className={'badge ' + STATUT_CONFIG[p.statut].className}>{STATUT_CONFIG[p.statut].label}</span></td>
                <td style={{ color: '#888' }}>{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
