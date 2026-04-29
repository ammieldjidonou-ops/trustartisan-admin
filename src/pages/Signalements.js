import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

const STATUT_COLORS = {
  nouveau: { bg: '#FEF0EE', color: '#E74C3C' },
  en_cours: { bg: '#FEF6E7', color: '#F5A623' },
  resolu: { bg: '#E1F5EE', color: '#1D9E75' },
  ferme: { bg: '#f0f0f0', color: '#aaa' },
};

const PRIORITE_COLORS = {
  basse: '#aaa', normale: '#0066CC', haute: '#F5A623', urgente: '#E74C3C'
};

function ModalSignalement({ signalement, onClose, onUpdate }) {
  const [reponse, setReponse] = useState(signalement?.reponse_admin || '');
  const [statut, setStatut] = useState(signalement?.statut || 'nouveau');
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('admin_token');

  if (!signalement) return null;

  const sauvegarder = async () => {
    setSaving(true);
    try {
      await fetch(API_URL + '/api/signalements/' + signalement.id + '/repondre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ reponse, statut })
      });
      onUpdate();
      onClose();
    } catch (e) {}
    setSaving(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, width: 560, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>x</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Signalement</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <span style={{ backgroundColor: STATUT_COLORS[signalement.statut]?.bg, color: STATUT_COLORS[signalement.statut]?.color, padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>{signalement.statut}</span>
          <span style={{ color: PRIORITE_COLORS[signalement.priorite], fontWeight: 600, fontSize: 12 }}>Priorite {signalement.priorite}</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <tbody>
            {[
              ['Type', signalement.type],
              ['Sujet', signalement.sujet],
              ['Signale par', signalement.users?.full_name || 'Anonyme'],
              ['Telephone', signalement.users?.phone || '-'],
              ['Date', new Date(signalement.created_at).toLocaleDateString('fr-FR')],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px 0', color: '#888', fontSize: 13, width: 140 }}>{label}</td>
                <td style={{ padding: '8px 0', fontWeight: 500, fontSize: 13 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ backgroundColor: '#f9f9f9', borderRadius: 8, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Description</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{signalement.description}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Statut</label>
          <select value={statut} onChange={e => setStatut(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: '100%' }}>
            <option value="nouveau">Nouveau</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Resolu</option>
            <option value="ferme">Ferme</option>
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Reponse admin (optionnel)</label>
          <textarea value={reponse} onChange={e => setReponse(e.target.value)} placeholder="Votre reponse au signalement..." rows={4}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <button className="btn btn-primary" onClick={sauvegarder} disabled={saving} style={{ width: '100%' }}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}

export default function Signalements({ admin }) {
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filtre, setFiltre] = useState('tous');

  const charger = () => {
    fetch(API_URL + '/api/signalements')
      .then(r => r.json())
      .then(data => { if (data.success) setSignalements(data.signalements || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { charger(); }, []);

  const filtres = filtre === 'tous' ? signalements : signalements.filter(s => s.statut === filtre);
  const nouveaux = signalements.filter(s => s.statut === 'nouveau').length;

  return (
    <div>
      <ModalSignalement signalement={selected} onClose={() => setSelected(null)} onUpdate={charger} />
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Signalements</h1>
          <p style={{ color: '#888', fontSize: 14 }}>{signalements.length} signalement(s) au total</p>
        </div>
        {nouveaux > 0 && (
          <div style={{ backgroundColor: '#FEF0EE', border: '1px solid #E74C3C', borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🚨</span>
            <div>
              <div style={{ fontWeight: 600, color: '#E74C3C', fontSize: 13 }}>{nouveaux} nouveau(x)</div>
              <div style={{ color: '#E74C3C', fontSize: 11 }}>A traiter rapidement</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Nouveaux', count: signalements.filter(s => s.statut === 'nouveau').length, color: '#E74C3C', bg: '#FEF0EE' },
          { label: 'En cours', count: signalements.filter(s => s.statut === 'en_cours').length, color: '#F5A623', bg: '#FEF6E7' },
          { label: 'Resolus', count: signalements.filter(s => s.statut === 'resolu').length, color: '#1D9E75', bg: '#E1F5EE' },
          { label: 'Total', count: signalements.length, color: '#0066CC', bg: '#EEF4FF' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{loading ? '...' : s.count}</div>
            <div style={{ color: '#888', fontSize: 13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['tous', 'nouveau', 'en_cours', 'resolu', 'ferme'].map(f => (
          <button key={f} onClick={() => setFiltre(f)} className="btn"
            style={{ background: filtre === f ? '#1D9E75' : '#f0f0f0', color: filtre === f ? '#fff' : '#555', fontSize: 12 }}>
            {f === 'tous' ? 'Tous' : f === 'en_cours' ? 'En cours' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <p style={{ textAlign: 'center', color: '#888' }}>Chargement...</p> : (
          <table>
            <thead>
              <tr>
                <th>Sujet</th>
                <th>Type</th>
                <th>Signale par</th>
                <th>Priorite</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>Aucun signalement</td></tr>
              )}
              {filtres.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sujet}</td>
                  <td><span style={{ backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: 8, fontSize: 12 }}>{s.type}</span></td>
                  <td style={{ color: '#888', fontSize: 13 }}>{s.users?.full_name || 'Anonyme'}</td>
                  <td><span style={{ color: PRIORITE_COLORS[s.priorite], fontWeight: 600, fontSize: 12 }}>{s.priorite}</span></td>
                  <td><span style={{ backgroundColor: STATUT_COLORS[s.statut]?.bg, color: STATUT_COLORS[s.statut]?.color, padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>{s.statut}</span></td>
                  <td style={{ color: '#888', fontSize: 13 }}>{new Date(s.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setSelected(s)}>
                      Traiter
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