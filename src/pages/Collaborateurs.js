import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

const ROLE_OPTIONS = [
  { value: 'validateur', label: 'Validateur', desc: 'Peut valider/refuser les dossiers artisans' },
  { value: 'moderateur', label: 'Moderateur', desc: 'Peut gerer artisans, clients et missions' },
  { value: 'super_admin', label: 'Super Admin', desc: 'Acces complet a toutes les fonctionnalites' },
];

export default function Collaborateurs({ admin }) {
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', nom: '', prenom: '', role: 'validateur' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [erreur, setErreur] = useState('');

  const token = localStorage.getItem('admin_token');

  const charger = () => {
    fetch(API_URL + '/api/admin-auth/collaborateurs', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => { if (data.success) setCollaborateurs(data.collaborateurs || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, [token]);

  const creerCollaborateur = async () => {
    if (!form.email || !form.password || !form.nom || !form.prenom) { setErreur('Tous les champs sont requis'); return; }
    setSaving(true); setErreur('');
    try {
      const resp = await fetch(API_URL + '/api/admin-auth/collaborateurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(form)
      });
      const data = await resp.json();
      if (data.success) {
        setMsg('Collaborateur cree avec succes !');
        setShowForm(false);
        setForm({ email: '', password: '', nom: '', prenom: '', role: 'validateur' });
        charger();
        setTimeout(() => setMsg(''), 3000);
      } else { setErreur(data.error || 'Erreur creation'); }
    } catch (e) { setErreur('Erreur serveur'); }
    setSaving(false);
  };

  const toggleActif = async (id) => {
    try {
      await fetch(API_URL + '/api/admin-auth/collaborateurs/' + id + '/toggle', {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + token }
      });
      charger();
    } catch (e) {}
  };

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR') : 'Jamais';

  const ROLE_COLORS = { super_admin: '#F5A623', moderateur: '#0066CC', validateur: '#1D9E75' };
  const ROLE_LABELS = { super_admin: 'Super Admin', moderateur: 'Moderateur', validateur: 'Validateur' };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Collaborateurs</h1>
          <p style={{ color: '#888', fontSize: 14 }}>{collaborateurs.length} compte(s) admin</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouveau collaborateur'}
        </button>
      </div>

      {msg && <div style={{ background: '#E1F5EE', border: '1px solid #1D9E75', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#0F6E56', fontWeight: 600 }}>{msg}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Nouveau collaborateur</h3>
          {erreur && <div style={{ color: '#E74C3C', fontSize: 13, marginBottom: 12 }}>{erreur}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Prenom</label>
              <input value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} placeholder="Jean" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Nom</label>
              <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} placeholder="DUPONT" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jean@trustartisan.bj" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Mot de passe</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" style={{ width: '100%' }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 8 }}>Role</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {ROLE_OPTIONS.map(r => (
                <div key={r.value} onClick={() => setForm({...form, role: r.value})}
                  style={{ flex: 1, padding: 12, borderRadius: 8, border: '2px solid ' + (form.role === r.value ? ROLE_COLORS[r.value] : '#eee'), cursor: 'pointer', backgroundColor: form.role === r.value ? '#f9f9f9' : '#fff' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: ROLE_COLORS[r.value] }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={creerCollaborateur} disabled={saving}>
            {saving ? 'Creation...' : 'Creer le collaborateur'}
          </button>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Chargement...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Collaborateur</th>
                <th>Email</th>
                <th>Role</th>
                <th>Derniere connexion</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collaborateurs.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.prenom} {c.nom}</td>
                  <td style={{ color: '#888' }}>{c.email}</td>
                  <td>
                    <span style={{ backgroundColor: ROLE_COLORS[c.role] + '22', color: ROLE_COLORS[c.role], padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                      {ROLE_LABELS[c.role] || c.role}
                    </span>
                  </td>
                  <td style={{ color: '#888', fontSize: 13 }}>{formatDate(c.last_login)}</td>
                  <td>
                    <span style={{ backgroundColor: c.is_active ? '#E1F5EE' : '#f0f0f0', color: c.is_active ? '#0F6E56' : '#aaa', padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                      {c.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    {c.id !== admin?.id && (
                      <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => toggleActif(c.id)}>
                        {c.is_active ? 'Suspendre' : 'Reactiver'}
                      </button>
                    )}
                    {c.id === admin?.id && <span style={{ color: '#aaa', fontSize: 12 }}>Vous</span>}
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