import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

const DATA_MISSIONS = [
  { mois: 'Jan', missions: 0 }, { mois: 'Fev', missions: 0 }, { mois: 'Mar', missions: 0 },
  { mois: 'Avr', missions: 0 }, { mois: 'Mai', missions: 0 }, { mois: 'Juin', missions: 0 },
];
const DATA_REVENUS = [
  { mois: 'Jan', commission: 0, tva: 0 }, { mois: 'Fev', commission: 0, tva: 0 },
  { mois: 'Mar', commission: 0, tva: 0 }, { mois: 'Avr', commission: 0, tva: 0 },
  { mois: 'Mai', commission: 0, tva: 0 }, { mois: 'Juin', commission: 0, tva: 0 },
];

const CATEGORIES_CONFIG = [
  { id: 1, nom: 'Plomberie', active: true }, { id: 2, nom: 'Electricite', active: true },
  { id: 3, nom: 'Reparation telephone', active: true }, { id: 4, nom: 'Reparation ordinateur', active: true },
  { id: 5, nom: 'Maconnerie', active: false }, { id: 6, nom: 'Peinture', active: false },
  { id: 7, nom: 'Menuiserie', active: false }, { id: 8, nom: 'Climatisation', active: false },
  { id: 9, nom: 'Ferronnerie', active: false }, { id: 10, nom: 'Carrelage', active: false },
  { id: 11, nom: 'Toiture', active: false }, { id: 12, nom: 'Vitrerie', active: false },
  { id: 13, nom: 'Mecanique auto', active: false }, { id: 14, nom: 'Mecanique moto', active: false },
  { id: 15, nom: 'Electricite auto', active: false }, { id: 16, nom: 'Vulcanisation', active: false },
  { id: 17, nom: 'Coiffure homme', active: false }, { id: 18, nom: 'Coiffure femme', active: false },
  { id: 19, nom: 'Barbier', active: false }, { id: 20, nom: 'Esthetique', active: false },
  { id: 21, nom: 'Jardinage', active: false }, { id: 22, nom: 'Demenagement', active: false },
  { id: 23, nom: 'Nettoyage', active: false }, { id: 24, nom: 'Gardiennage', active: false },
  { id: 25, nom: 'Couture', active: false }, { id: 26, nom: 'Broderie', active: false },
  { id: 27, nom: 'Poterie', active: false }, { id: 28, nom: 'Vannerie', active: false },
  { id: 29, nom: 'Sculpture bois', active: false }, { id: 30, nom: 'Cuisine Traiteur', active: false },
];

const COMMUNES_CONFIG = [
  { id: 1, nom: 'Cotonou', active: true, region: 'Littoral' },
  { id: 2, nom: 'Abomey-Calavi', active: true, region: 'Atlantique' },
  { id: 3, nom: 'Porto-Novo', active: false, region: 'Oueme' },
  { id: 4, nom: 'Akpakpa', active: false, region: 'Littoral' },
  { id: 5, nom: 'Cadjehoun', active: false, region: 'Littoral' },
  { id: 6, nom: 'Fidjrosse', active: false, region: 'Littoral' },
  { id: 7, nom: 'Agla', active: false, region: 'Littoral' },
  { id: 8, nom: 'Parakou', active: false, region: 'Borgou' },
  { id: 9, nom: 'Ouidah', active: false, region: 'Atlantique' },
  { id: 10, nom: 'Bohicon', active: false, region: 'Zou' },
  { id: 11, nom: 'Abomey', active: false, region: 'Zou' },
  { id: 12, nom: 'Natitingou', active: false, region: 'Atacora' },
  { id: 13, nom: 'Lokossa', active: false, region: 'Mono' },
  { id: 14, nom: 'Kandi', active: false, region: 'Alibori' },
  { id: 15, nom: 'Djougou', active: false, region: 'Donga' },
  { id: 16, nom: 'Save', active: false, region: 'Collines' },
  { id: 17, nom: 'Allada', active: false, region: 'Atlantique' },
  { id: 18, nom: 'Dogbo', active: false, region: 'Couffo' },
  { id: 19, nom: 'Aplahoue', active: false, region: 'Couffo' },
  { id: 20, nom: 'Bassila', active: false, region: 'Donga' },
  { id: 21, nom: 'Nikki', active: false, region: 'Borgou' },
  { id: 22, nom: 'Malanville', active: false, region: 'Alibori' },
];

const MONETISATION_CONFIG = {
  periode_gratuite: true, jours_restants: 14,
  abonnement_artisan_actif: false, deblocage_contact_actif: false, commission_actif: false,
  prix_contact_unique: 500, prix_abonnement_mensuel: 5000, taux_commission: 10,
};

export default function Dashboard() {
  const [onglet, setOnglet] = useState('stats');
  const [categories, setCategories] = useState(CATEGORIES_CONFIG);
  const [communes, setCommunes] = useState(COMMUNES_CONFIG);
  const [monetisation, setMonetisation] = useState(MONETISATION_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveMsgTab, setSaveMsgTab] = useState('');

  // Stats reelles
  const [stats, setStats] = useState(null);
  const [artisansAttente, setArtisansAttente] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(API_URL + '/api/admin/artisans').then(r => r.json()),
      fetch(API_URL + '/api/admin/clients').then(r => r.json()),
    ]).then(([artisansData, clientsData]) => {
      const artisans = artisansData.artisans || [];
      const clients = clientsData.clients || [];
      const now = new Date();
      setStats({
        artisans_actifs: artisans.filter(a => a.statut === 'actif').length,
        artisans_total: artisans.length,
        clients_total: clients.length,
        clients_actifs: clients.filter(c => c.statut === 'actif').length,
        en_attente: artisans.filter(a => a.statut === 'en_attente_validation').length,
        nouveaux_artisans_mois: artisans.filter(a => {
          const d = new Date(a.created_at);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length,
        nouveaux_clients_mois: clients.filter(c => {
          const d = new Date(c.created_at);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length,
      });
      setArtisansAttente(artisans.filter(a => a.statut === 'en_attente_validation'));
    }).catch(e => console.error(e))
      .finally(() => setLoadingStats(false));
  }, []);

  const validerArtisan = async (id) => {
    try {
      await fetch(API_URL + '/api/admin/artisans/' + id + '/valider', { method: 'POST' });
      setArtisansAttente(prev => prev.filter(a => a.id !== id));
      setStats(prev => ({ ...prev, artisans_actifs: prev.artisans_actifs + 1, en_attente: prev.en_attente - 1 }));
      setActionMsg('Artisan valide avec succes !');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) { setActionMsg('Erreur lors de la validation'); }
  };

  const refuserArtisan = async (id) => {
    try {
      await fetch(API_URL + '/api/admin/artisans/' + id + '/refuser', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Dossier incomplet' }) });
      setArtisansAttente(prev => prev.filter(a => a.id !== id));
      setStats(prev => ({ ...prev, en_attente: prev.en_attente - 1 }));
      setActionMsg('Artisan refuse.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) { setActionMsg('Erreur lors du refus'); }
  };

  const toggleCategorie = (id) => setCategories(categories.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const toggleCommune = (id) => setCommunes(communes.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const toggleMonetisation = (key) => setMonetisation({ ...monetisation, [key]: !monetisation[key] });

  const sauvegarderFiltres = async () => {
    setSaving(true);
    try {
      const response = await fetch(API_URL + '/api/config/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories_actives: categories.filter(c => c.active).map(c => c.nom),
          communes_actives: communes.filter(c => c.active).map(c => c.nom),
        })
      });
      const data = await response.json();
      if (data.success) { setSaveMsg('Filtres mis a jour !'); setSaveMsgTab('filtres'); setTimeout(() => { setSaveMsg(''); setSaveMsgTab(''); }, 4000); }
    } catch (e) { setSaveMsg('Erreur : serveur inaccessible'); }
    setSaving(false);
  };

  const sauvegarderMonetisation = async () => {
    setSaving(true);
    try {
      const response = await fetch(API_URL + '/api/config/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monetisation })
      });
      const data = await response.json();
      if (data.success) { setSaveMsg('Monetisation mise a jour !'); setTimeout(() => setSaveMsg(''), 4000); }
    } catch (e) { setSaveMsg('Erreur : serveur inaccessible'); }
    setSaving(false);
  };

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR') : '-';

  const STATS_CARDS = stats ? [
    { label: 'Artisans actifs', value: stats.artisans_actifs, icon: '🛠️', color: '#1D9E75', bg: '#E1F5EE', sub: stats.artisans_total + ' au total' },
    { label: 'Clients inscrits', value: stats.clients_total, icon: '👤', color: '#0066CC', bg: '#EEF4FF', sub: stats.clients_actifs + ' actifs' },
    { label: 'En attente validation', value: stats.en_attente, icon: '⏳', color: '#F5A623', bg: '#FEF6E7', sub: 'Dossiers a traiter' },
    { label: 'Nouveaux ce mois', value: stats.nouveaux_artisans_mois + stats.nouveaux_clients_mois, icon: '🆕', color: '#E74C3C', bg: '#FEF0EE', sub: stats.nouveaux_artisans_mois + ' artisans / ' + stats.nouveaux_clients_mois + ' clients' },
  ] : [];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>Tableau de bord</h1>
          <p style={{ color: '#888', fontSize: 14 }}>TrustArtisan Admin - Bienvenue</p>
        </div>
        {monetisation.periode_gratuite && (
          <div style={{ background: '#FEF6E7', border: '1px solid #F5A623', borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 600, color: '#854F0B', fontSize: 13 }}>Periode gratuite</div>
              <div style={{ color: '#F5A623', fontSize: 12 }}>{monetisation.jours_restants} jours restants</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['stats', 'filtres', 'monetisation'].map(o => (
          <button key={o} onClick={() => setOnglet(o)} className="btn" style={{ background: onglet === o ? '#1D9E75' : '#f0f0f0', color: onglet === o ? '#fff' : '#555' }}>
            {o === 'stats' ? '📊 Stats' : o === 'filtres' ? '📍 Filtres' : '💰 Monetisation'}
          </button>
        ))}
      </div>

      {onglet === 'stats' && (
        <>
          {actionMsg && <div style={{ background: '#E1F5EE', border: '1px solid #1D9E75', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#0F6E56', fontWeight: 600 }}>{actionMsg}</div>}

          {loadingStats ? (
            <p style={{ color: '#888', textAlign: 'center', padding: 32 }}>Chargement des statistiques...</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {STATS_CARDS.map((s, i) => (
                  <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div className="card">
                  <h3 style={{ marginBottom: 16, fontSize: 15 }}>Missions par mois</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={DATA_MISSIONS}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="missions" stroke="#1D9E75" strokeWidth={2} dot={{ fill: '#1D9E75' }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 8 }}>Disponible quand les missions seront actives</p>
                </div>
                <div className="card">
                  <h3 style={{ marginBottom: 16, fontSize: 15 }}>Repartition artisans / clients</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats ? [
                      { label: 'Actifs', artisans: stats.artisans_actifs, clients: stats.clients_actifs },
                      { label: 'Total', artisans: stats.artisans_total, clients: stats.clients_total },
                      { label: 'Ce mois', artisans: stats.nouveaux_artisans_mois, clients: stats.nouveaux_clients_mois },
                    ] : []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="artisans" fill="#1D9E75" name="Artisans" radius={[4,4,0,0]} />
                      <Bar dataKey="clients" fill="#0066CC" name="Clients" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15 }}>Artisans en attente - Validation manuelle</h3>
                  <span className="badge badge-warning">{artisansAttente.length} en attente</span>
                </div>
                {artisansAttente.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>Aucun artisan en attente de validation</p>
                ) : (
                  <table>
                    <thead><tr><th>Nom</th><th>Specialite</th><th>Commune</th><th>Date</th><th>Documents</th><th>Actions</th></tr></thead>
                    <tbody>
                      {artisansAttente.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 600 }}>{a.full_name || ((a.prenom || '') + ' ' + (a.nom || ''))}</td>
                          <td>{a.primary_specialty || '-'}</td>
                          <td>{a.commune || '-'}</td>
                          <td style={{ color: '#888' }}>{formatDate(a.created_at)}</td>
                          <td>
                            <span className={a.photo_profil && a.piece_identite ? 'badge badge-success' : 'badge badge-warning'}>
                              {a.photo_profil && a.piece_identite ? 'Complets' : 'Incomplets'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => validerArtisan(a.id)}>Valider</button>
                              <button className="btn btn-danger" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => refuserArtisan(a.id)}>Refuser</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </>
      )}

      {onglet === 'filtres' && (
        <>
          {saveMsg && saveMsgTab === 'filtres' && <div style={{ background: '#E1F5EE', border: '1px solid #1D9E75', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#0F6E56', fontWeight: 600 }}>{saveMsg}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <h3 style={{ marginBottom: 4, fontSize: 15 }}>Categories actives</h3>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Seules les categories actives sont visibles dans l app</p>
              {categories.map(cat => (
                <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: 14, color: cat.active ? '#333' : '#aaa' }}>{cat.nom}</span>
                  <button onClick={() => toggleCategorie(cat.id)} className="btn" style={{ background: cat.active ? '#1D9E75' : '#f0f0f0', color: cat.active ? '#fff' : '#888', padding: '4px 14px', fontSize: 12 }}>
                    {cat.active ? 'Actif' : 'Inactif'}
                  </button>
                </div>
              ))}
              <button onClick={sauvegarderFiltres} className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} disabled={saving}>
                {saving ? 'Sauvegarde...' : 'Appliquer les filtres categories'}
              </button>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: 4, fontSize: 15 }}>Communes actives</h3>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Seules les communes actives sont visibles dans l app</p>
              {['Littoral','Atlantique','Oueme','Borgou','Zou','Atacora','Mono','Alibori','Donga','Collines','Couffo'].map(region => (
                <div key={region}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1D9E75', letterSpacing: 1, padding: '10px 0 4px', borderBottom: '2px solid #E1F5EE', marginBottom: 4 }}>{region.toUpperCase()}</div>
                  {communes.filter(c => c.region === region).map(commune => (
                    <div key={commune.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <span style={{ fontSize: 13, color: commune.active ? '#333' : '#aaa' }}>{commune.nom}</span>
                      <button onClick={() => toggleCommune(commune.id)} className="btn" style={{ background: commune.active ? '#1D9E75' : '#f0f0f0', color: commune.active ? '#fff' : '#888', padding: '3px 12px', fontSize: 11 }}>
                        {commune.active ? 'Actif' : 'Inactif'}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              <button onClick={sauvegarderFiltres} className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} disabled={saving}>
                {saving ? 'Sauvegarde...' : 'Appliquer les filtres communes'}
              </button>
            </div>
          </div>
        </>
      )}

      {onglet === 'monetisation' && (
        <div className="card">
          <h3 style={{ marginBottom: 4, fontSize: 15 }}>Gestion de la monetisation</h3>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Activez ou desactivez les fonctionnalites payantes</p>
          {[
            { key: 'periode_gratuite', label: 'Periode gratuite', desc: 'Desactivez pour lancer la monetisation', color: '#F5A623' },
            { key: 'deblocage_contact_actif', label: 'Deblocage contact (' + monetisation.prix_contact_unique.toLocaleString('fr-FR') + ' FCFA)', desc: 'Client paie pour voir le numero de l artisan', color: '#1D9E75' },
            { key: 'abonnement_artisan_actif', label: 'Abonnement artisan (' + monetisation.prix_abonnement_mensuel.toLocaleString('fr-FR') + ' FCFA/mois)', desc: 'Artisans paient pour la visibilite premium', color: '#1D9E75' },
            { key: 'commission_actif', label: 'Commission ' + monetisation.taux_commission + '%', desc: 'Active le prelevement automatique', color: '#E74C3C' },
          ].map(({ key, label, desc, color }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #eee' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#333' }}>{label}</div>
                <div style={{ color: '#888', fontSize: 13 }}>{desc}</div>
              </div>
              <button onClick={() => toggleMonetisation(key)} className="btn" style={{ background: monetisation[key] ? color : '#f0f0f0', color: monetisation[key] ? '#fff' : '#888', minWidth: 80 }}>
                {monetisation[key] ? 'Actif' : 'Inactif'}
              </button>
            </div>
          ))}
          <button onClick={sauvegarderMonetisation} className="btn btn-primary" style={{ marginTop: 20, width: '100%' }} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Appliquer la monetisation'}
          </button>
        </div>
      )}
    </div>
  );
}