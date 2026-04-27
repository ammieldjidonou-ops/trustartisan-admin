import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const STATS = [
  { label: 'Artisans actifs', value: '124', icon: '🛠️', color: '#1D9E75', bg: '#E1F5EE' },
  { label: 'Clients inscrits', value: '389', icon: '👤', color: '#0066CC', bg: '#EEF4FF' },
  { label: 'Missions en cours', value: '47', icon: '📋', color: '#F5A623', bg: '#FEF6E7' },
  { label: 'Revenus du mois', value: '1 245 000 FCFA', icon: '💰', color: '#E74C3C', bg: '#FEF0EE' },
];

const STATS_FISCAL = [
  { label: 'TVA collectée (mois)', value: '22 410 FCFA', icon: '📜', color: '#6C3483', bg: '#F5EEF8' },
  { label: 'Commission (mois)', value: '124 500 FCFA', icon: '💹', color: '#1D9E75', bg: '#E1F5EE' },
  { label: 'TVA cumulée (année)', value: '134 460 FCFA', icon: '📊', color: '#0066CC', bg: '#EEF4FF' },
  { label: 'Projection (6 mois)', value: '8 967 000 FCFA', icon: '🚀', color: '#F5A623', bg: '#FEF6E7' },
];

const DATA_MISSIONS = [
  { mois: 'Jan', missions: 12 },
  { mois: 'Fev', missions: 19 },
  { mois: 'Mar', missions: 28 },
  { mois: 'Avr', missions: 35 },
  { mois: 'Mai', missions: 42 },
  { mois: 'Juin', missions: 47 },
];

const DATA_REVENUS = [
  { mois: 'Jan', commission: 45000, tva: 8100 },
  { mois: 'Fev', commission: 68000, tva: 12240 },
  { mois: 'Mar', commission: 89000, tva: 16020 },
  { mois: 'Avr', commission: 112000, tva: 20160 },
  { mois: 'Mai', commission: 145000, tva: 26100 },
  { mois: 'Juin', commission: 124500, tva: 22410 },
];

const CATEGORIES_CONFIG = [
  { id: 1, nom: 'Plomberie', active: true },
  { id: 2, nom: 'Electricite', active: true },
  { id: 3, nom: 'Reparation telephone', active: true },
  { id: 4, nom: 'Reparation ordinateur', active: true },
  { id: 5, nom: 'Maçonnerie', active: false },
  { id: 6, nom: 'Peinture', active: false },
  { id: 7, nom: 'Menuiserie', active: false },
  { id: 8, nom: 'Climatisation', active: false },
  { id: 9, nom: 'Ferronnerie', active: false },
  { id: 10, nom: 'Carrelage', active: false },
  { id: 11, nom: 'Toiture', active: false },
  { id: 12, nom: 'Vitrerie', active: false },
  { id: 13, nom: 'Mécanique auto', active: false },
  { id: 14, nom: 'Mécanique moto', active: false },
  { id: 15, nom: 'Electricite auto', active: false },
  { id: 16, nom: 'Vulcanisation', active: false },
  { id: 17, nom: 'Coiffure homme', active: false },
  { id: 18, nom: 'Coiffure femme', active: false },
  { id: 19, nom: 'Barbier', active: false },
  { id: 20, nom: 'Esthétique', active: false },
  { id: 21, nom: 'Jardinage', active: false },
  { id: 22, nom: 'Déménagement', active: false },
  { id: 23, nom: 'Nettoyage', active: false },
  { id: 24, nom: 'Gardiennage', active: false },
  { id: 25, nom: 'Couture', active: false },
  { id: 26, nom: 'Broderie', active: false },
  { id: 27, nom: 'Poterie', active: false },
  { id: 28, nom: 'Vannerie', active: false },
  { id: 29, nom: 'Sculpture bois', active: false },
  { id: 30, nom: 'Cuisine Traiteur', active: false },
];

const COMMUNES_CONFIG = [
  { id: 1, nom: 'Cotonou', active: true, region: 'Littoral' },
  { id: 2, nom: 'Abomey-Calavi', active: true, region: 'Atlantique' },
  { id: 3, nom: 'Porto-Novo', active: false, region: 'Ouémé' },
  { id: 4, nom: 'Akpakpa', active: false, region: 'Littoral' },
  { id: 5, nom: 'Cadjehoun', active: false, region: 'Littoral' },
  { id: 6, nom: 'Fidjrossé', active: false, region: 'Littoral' },
  { id: 7, nom: 'Agla', active: false, region: 'Littoral' },
  { id: 8, nom: 'Parakou', active: false, region: 'Borgou' },
  { id: 9, nom: 'Ouidah', active: false, region: 'Atlantique' },
  { id: 10, nom: 'Bohicon', active: false, region: 'Zou' },
  { id: 11, nom: 'Abomey', active: false, region: 'Zou' },
  { id: 12, nom: 'Natitingou', active: false, region: 'Atacora' },
  { id: 13, nom: 'Lokossa', active: false, region: 'Mono' },
  { id: 14, nom: 'Kandi', active: false, region: 'Alibori' },
  { id: 15, nom: 'Djougou', active: false, region: 'Donga' },
  { id: 16, nom: 'Savé', active: false, region: 'Collines' },
  { id: 17, nom: 'Covè', active: false, region: 'Zou' },
  { id: 18, nom: 'Allada', active: false, region: 'Atlantique' },
  { id: 19, nom: 'Dogbo', active: false, region: 'Couffo' },
  { id: 20, nom: 'Aplahoué', active: false, region: 'Couffo' },
  { id: 21, nom: 'Bassila', active: false, region: 'Donga' },
  { id: 22, nom: 'Nikki', active: false, region: 'Borgou' },
  { id: 23, nom: 'Malanville', active: false, region: 'Alibori' },
  { id: 24, nom: 'Banikoara', active: false, region: 'Alibori' },
  { id: 25, nom: 'Tanguieta', active: false, region: 'Atacora' },
];

const MONETISATION_CONFIG = {
  periode_gratuite: true,
  jours_restants: 14,
  abonnement_artisan_actif: false,
  deblocage_contact_actif: false,
  commission_actif: false,
  prix_contact_unique: 500,
  prix_abonnement_mensuel: 5000,
  taux_commission: 10,
};

const ARTISANS_ATTENTE = [
  { id: 1, nom: 'Gbessi Rodrigue', specialite: 'Plomberie', commune: 'Cotonou', date: '23/04/2026', docs: true },
  { id: 2, nom: 'Ahounou Claire', specialite: 'Coiffure femme', commune: 'Porto-Novo', date: '22/04/2026', docs: false },
  { id: 3, nom: 'Kpossou Marc', specialite: 'Mécanique auto', commune: 'Parakou', date: '21/04/2026', docs: true },
];

export default function Dashboard() {
  const [categories, setCategories] = useState(CATEGORIES_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveMsgTab, setSaveMsgTab] = useState('');
  const [communes, setCommunes] = useState(COMMUNES_CONFIG);
  const [monetisation, setMonetisation] = useState(MONETISATION_CONFIG);
  const [onglet, setOnglet] = useState('stats');

  const toggleCategorie = (id) => {
    setCategories(categories.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const toggleCommune = (id) => {
    setCommunes(communes.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const sauvegarderFiltres = async () => {
    setSaving(true);
    try {
      const response = await fetch('https://web-production-b97ed.up.railway.app/api/config/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories_actives: categories.filter(c => c.active).map(c => c.nom),
          communes_actives: communes.filter(c => c.active).map(c => c.nom),
        })
      });
      const data = await response.json();
      if (data.success) {
        setSaveMsg('Filtres mis à jour ! L app se mettra à jour au prochain démarrage.');
        setSaveMsgTab('filtres');
        setTimeout(() => { setSaveMsg(''); setSaveMsgTab(''); }, 4000);
      }
    } catch (e) {
      setSaveMsg('Erreur : serveur inaccessible');
    }
    setSaving(false);
  };

  const sauvegarderMonetisation = async () => {
    setSaving(true);
    try {
      const response = await fetch('https://web-production-b97ed.up.railway.app/api/config/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monetisation })
      });
      const data = await response.json();
      if (data.success) {
        setSaveMsg('Monetisation mise a jour ! L app se mettra a jour au prochain demarrage.');
        setTimeout(() => setSaveMsg(''), 4000);
      }
    } catch (e) {
      setSaveMsg('Erreur : serveur inaccessible');
    }
    setSaving(false);
  };

  const toggleMonetisation = (key) => {
    setMonetisation({ ...monetisation, [key]: !monetisation[key] });
  };

  

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>Tableau de bord</h1>
          <p style={{ color: '#888', fontSize: 14 }}>TrustArtisan Admin ? Bienvenue</p>
        </div>
        {monetisation.periode_gratuite && (
          <div style={{ background: '#FEF6E7', border: '1px solid #F5A623', borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 600, color: '#854F0B', fontSize: 13 }}>Période gratuite</div>
              <div style={{ color: '#F5A623', fontSize: 12 }}>{monetisation.jours_restants} jours restants</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['stats', 'fiscal', 'filtres', 'monetisation'].map(o => (
          <button key={o} onClick={() => setOnglet(o)} className="btn" style={{ background: onglet === o ? '#1D9E75' : '#f0f0f0', color: onglet === o ? '#fff' : '#555', textTransform: 'capitalize' }}>
            {o === 'stats' ? '📊 Stats' : o === 'fiscal' ? '📜 Fiscal' : o === 'filtres' ? '📍 Filtres' : '💰 Monétisation'}
          </button>
        ))}
      </div>

      {onglet === 'stats' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {STATS.map((s, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
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
            </div>
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 15 }}>Commission vs TVA (FCFA)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={DATA_REVENUS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="commission" fill="#1D9E75" name="Commission" radius={[4,4,0,0]} />
                  <Bar dataKey="tva" fill="#6C3483" name="TVA" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15 }}>Artisans en attente ? Validation manuelle</h3>
              <span className="badge badge-warning">{ARTISANS_ATTENTE.length} en attente</span>
            </div>
            <table>
              <thead><tr><th>Nom</th><th>Spécialité</th><th>Commune</th><th>Date</th><th>Documents</th><th>Actions</th></tr></thead>
              <tbody>
                {ARTISANS_ATTENTE.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.nom}</td>
                    <td>{a.specialite}</td>
                    <td>{a.commune}</td>
                    <td style={{ color: '#888' }}>{a.date}</td>
                    <td><span className={a.docs ? 'badge badge-success' : 'badge badge-warning'}>{a.docs ? 'Complets' : 'Incomplets'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 12px' }}>Valider</button>
                        <button className="btn btn-danger" style={{ fontSize: 12, padding: '4px 12px' }}>Refuser</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {onglet === 'fiscal' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {STATS_FISCAL.map((s, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 15 }}>Détail fiscal mensuel</h3>
            <table>
              <thead><tr><th>Mois</th><th>Missions</th><th>Volume total</th><th>Commission (10%)</th><th>TVA (18%)</th><th>Net TrustArtisan</th></tr></thead>
              <tbody>
                {DATA_REVENUS.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{d.mois}</td>
                    <td>{DATA_MISSIONS[i].missions}</td>
                    <td>{(d.commission * 10).toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ color: '#1D9E75', fontWeight: 600 }}>{d.commission.toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ color: '#6C3483', fontWeight: 600 }}>{d.tva.toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ color: '#333', fontWeight: 700 }}>{(d.commission - d.tva).toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {onglet === 'filtres' && (
        <>
      {saveMsg && saveMsgTab === onglet && <div style={{ background: '#E1F5EE', border: '1px solid #1D9E75', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#0F6E56', fontWeight: 600 }}>{saveMsg}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <h3 style={{ marginBottom: 4, fontSize: 15 }}>Catégories actives</h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Seules les catégories actives sont visibles dans l’app</p>
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
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Seules les communes actives sont visibles dans l’app</p>
            {['Littoral', 'Atlantique', 'Ouémé', 'Borgou', 'Zou', 'Atacora', 'Mono', 'Alibori', 'Donga', 'Collines', 'Couffo'].map(region => (
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
          <h3 style={{ marginBottom: 4, fontSize: 15 }}>Gestion de la monétisation</h3>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Activez ou désactivez les fonctionnalités payantes</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #eee' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#333' }}>Période gratuite</div>
              <div style={{ color: '#888', fontSize: 13 }}>Désactivez pour lancer la monétisation</div>
            </div>
            <button onClick={() => toggleMonetisation('periode_gratuite')} className="btn" style={{ background: monetisation.periode_gratuite ? '#F5A623' : '#f0f0f0', color: monetisation.periode_gratuite ? '#fff' : '#888', minWidth: 80 }}>
              {monetisation.periode_gratuite ? 'Active' : 'Inactive'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #eee' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#333' }}>Déblocage contact ({monetisation.prix_contact_unique.toLocaleString('fr-FR')} FCFA)</div>
              <div style={{ color: '#888', fontSize: 13 }}>Client paie pour voir le numéro de l’artisan</div>
            </div>
            <button onClick={() => toggleMonetisation('deblocage_contact_actif')} className="btn" style={{ background: monetisation.deblocage_contact_actif ? '#1D9E75' : '#f0f0f0', color: monetisation.deblocage_contact_actif ? '#fff' : '#888', minWidth: 80 }}>
              {monetisation.deblocage_contact_actif ? 'Actif' : 'Inactif'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #eee' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#333' }}>Abonnement artisan ({monetisation.prix_abonnement_mensuel.toLocaleString('fr-FR')} FCFA/mois)</div>
              <div style={{ color: '#888', fontSize: 13 }}>Artisans paient pour la visibilité premium</div>
            </div>
            <button onClick={() => toggleMonetisation('abonnement_artisan_actif')} className="btn" style={{ background: monetisation.abonnement_artisan_actif ? '#1D9E75' : '#f0f0f0', color: monetisation.abonnement_artisan_actif ? '#fff' : '#888', minWidth: 80 }}>
              {monetisation.abonnement_artisan_actif ? 'Actif' : 'Inactif'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#333' }}>Commission {monetisation.taux_commission}% + Signalement transactions hors plateforme</div>
              <div style={{ color: '#888', fontSize: 13 }}>Active le prélèvement automatique ET le signalement des paiements hors app</div>
            </div>
            <button onClick={() => toggleMonetisation('commission_actif')} className="btn" style={{ background: monetisation.commission_actif ? '#E74C3C' : '#f0f0f0', color: monetisation.commission_actif ? '#fff' : '#888', minWidth: 80 }}>
              {monetisation.commission_actif ? 'Actif' : 'Inactif'}
            </button>
          </div>
          <button onClick={sauvegarderMonetisation} className="btn btn-primary" style={{ marginTop: 20, width: '100%' }} disabled={saving}>
            {saving ? 'Sauvegarde...' : '💾 Appliquer la monétisation'}
          </button>
        </div>
      )}
    </div>
  );
}
