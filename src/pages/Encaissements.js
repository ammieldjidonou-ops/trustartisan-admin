import React, { useState, useEffect, useMemo } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

const VERT = '#1D9E75';
const STATUT = {
  reussi: { label: 'Payé', bg: '#E1F5EE', color: '#0F6E56' },
  en_attente: { label: 'En attente', bg: '#FEF6E7', color: '#8A5A00' },
  echoue: { label: 'Échoué', bg: '#FEF0EE', color: '#C0392B' },
  expire: { label: 'Expiré', bg: '#f0f0f0', color: '#777' },
  annule: { label: 'Annulé', bg: '#f0f0f0', color: '#777' },
  anomalie: { label: 'Anomalie', bg: '#FFE9D6', color: '#B34700' },
  rembourse: { label: 'Remboursé', bg: '#EEF4FF', color: '#2563EB' },
};
const TYPE = { abonnement: 'Abonnement artisan', deblocage_contact: 'Déblocage contact', pass_contact: 'Pass contacts' };
const PRIX = [
  ['prix_contact_unique', 'Contact unique', 'Client · numéro d’un artisan'],
  ['prix_pass_mois', 'Pass contacts 1 mois', 'Client · contacts illimités 30 j'],
  ['prix_pass_trimestre', 'Pass contacts 3 mois', 'Client · contacts illimités 90 j'],
  ['prix_abonnement_mensuel', 'Abonnement mensuel', 'Artisan · 30 j'],
  ['prix_abonnement_trimestriel', 'Abonnement 3 mois', 'Artisan · 90 j'],
  ['prix_abonnement_annuel', 'Abonnement annuel', 'Artisan · 365 j'],
];

const fcfa = (v) => (Math.round(v || 0)).toLocaleString('fr-FR') + ' FCFA';
const dateHeure = (d) => (d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-');
const dateCourte = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

function Pastille({ statut }) {
  const s = STATUT[statut] || { label: statut, bg: '#f0f0f0', color: '#555' };
  return <span style={{ backgroundColor: s.bg, color: s.color, padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

// Encaissements par jour : une seule serie (vert de marque), survol = montant exact
function Histogramme({ serie }) {
  const [survol, setSurvol] = useState(null);
  const max = Math.max(1, ...serie.map(s => s.montant));
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 140, borderBottom: '1px solid #e5e5e5', padding: '0 2px' }}>
        {serie.map((s, i) => (
          <div key={s.jour} onMouseEnter={() => setSurvol(i)} onMouseLeave={() => setSurvol(null)}
            style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', cursor: 'default' }} aria-label={s.jour + ' : ' + fcfa(s.montant)}>
            <div style={{ width: '100%', height: s.montant ? Math.max(3, (s.montant / max) * 100) + '%' : 0, background: survol === i ? '#0F6E56' : VERT, borderRadius: '4px 4px 0 0', transition: 'background .1s' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginTop: 4 }}>
        <span>{dateCourte(serie[0] && serie[0].jour)}</span><span>Aujourd’hui</span>
      </div>
      {survol !== null && serie[survol] ? (
        <div style={{ position: 'absolute', top: -6, left: Math.min(80, Math.max(0, (survol / serie.length) * 100)) + '%', background: '#1c2b26', color: '#fff', padding: '6px 10px', borderRadius: 8, fontSize: 12, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {new Date(serie[survol].jour).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} · <b>{fcfa(serie[survol].montant)}</b>
        </div>
      ) : null}
    </div>
  );
}

function DetailTransaction({ t, onClose, onAction, enCours }) {
  if (!t) return null;
  const lignes = [
    ['Référence', t.reference_id], ['Produit', (TYPE[t.type] || t.type) + ' · ' + (t.produit || '')],
    ['Payeur', (t.payeur ? t.payeur.full_name + ' (' + t.payeur.role + ')' : t.user_id)], ['N° MoMo payeur', '+' + (t.telephone_payeur || '')],
    ['Cible', t.cible ? t.cible.full_name : '-'], ['Montant', fcfa(t.montant) + (t.reduction_pct ? ' (catalogue ' + fcfa(t.montant_initial) + ', -' + t.reduction_pct + ' %)' : '')],
    ['Devise', t.devise], ['Statut MTN', t.statut_operateur || '-'], ['Transaction MTN', t.transaction_operateur || '-'],
    ['Effet appliqué', t.effet_applique ? 'Oui' : 'Non'], ['Vérifications MTN', (t.nb_verifications || 0) + (t.verifie_at ? ' (dernière ' + dateHeure(t.verifie_at) + ')' : '')],
    ['Créée', dateHeure(t.created_at)], ['Confirmée', dateHeure(t.confirme_at)], ['Motif', t.motif_echec || '-'],
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 600, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>x</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{TYPE[t.type] || t.type}</h2>
        <div style={{ marginBottom: 16 }}><Pastille statut={t.statut} /></div>
        <table style={{ width: '100%' }}><tbody>
          {lignes.map(([k, v]) => (
            <tr key={k}><td style={{ color: '#888', fontSize: 13, width: 170, padding: '6px 0' }}>{k}</td><td style={{ fontSize: 13, fontWeight: 500, wordBreak: 'break-all' }}>{v}</td></tr>
          ))}
        </tbody></table>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          {['en_attente', 'anomalie', 'expire'].includes(t.statut) && (
            <button className="btn btn-primary" disabled={enCours} style={{ flex: 1 }} onClick={() => onAction(t, 'verifier')}>Interroger MTN maintenant</button>
          )}
          {['reussi', 'anomalie'].includes(t.statut) && (
            <button className="btn" disabled={enCours} style={{ flex: 1, background: '#EEF4FF', color: '#2563EB' }} onClick={() => onAction(t, 'rembourse')}>Marquer remboursé</button>
          )}
        </div>
        {['reussi', 'anomalie'].includes(t.statut) && (
          <p style={{ fontSize: 11, color: '#999', marginTop: 8 }}>Le remboursement se fait depuis votre espace marchand MTN ; ce bouton l’enregistre ici et retire la période d’abonnement correspondante.</p>
        )}
      </div>
    </div>
  );
}

export default function Encaissements({ admin }) {
  const [donnees, setDonnees] = useState(null);
  const [sante, setSante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [jours, setJours] = useState(90);
  const [onglet, setOnglet] = useState('transactions');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [filtreType, setFiltreType] = useState('tous');
  const [recherche, setRecherche] = useState('');
  const [selection, setSelection] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState('');
  const [periodes, setPeriodes] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [form, setForm] = useState({ artisan_id: '', jours: 30, motif: '' });
  const [prix, setPrix] = useState({});
  const [monetisation, setMonetisation] = useState({});

  const estSuper = admin && admin.role === 'super_admin';

  const flash = (m) => { setMessage(m); setTimeout(() => setMessage(''), 5000); };

  const charger = () => {
    setLoading(true);
    fetch(API_URL + '/api/admin/encaissements?jours=' + jours)
      .then(r => r.json())
      .then(d => { if (d.success) { setDonnees(d); setErreur(''); } else setErreur(d.error || 'Erreur'); })
      .catch(() => setErreur('Connexion impossible'))
      .finally(() => setLoading(false));
  };
  const chargerSante = () => {
    fetch(API_URL + '/api/admin/encaissements/sante').then(r => r.json()).then(d => d.success && setSante(d)).catch(() => {});
  };
  const chargerAbonnements = () => {
    fetch(API_URL + '/api/admin/abonnements').then(r => r.json()).then(d => d.success && setPeriodes(d.periodes || [])).catch(() => {});
    fetch(API_URL + '/api/admin/artisans').then(r => r.json()).then(d => d.success && setArtisans((d.artisans || []).filter(a => a.statut === 'actif'))).catch(() => {});
  };
  const chargerTarifs = () => {
    fetch(API_URL + '/api/config').then(r => r.json()).then(d => {
      if (d.success) { setMonetisation(d.config.monetisation || {}); const p = {}; PRIX.forEach(([k]) => { p[k] = (d.config.monetisation || {})[k] || ''; }); setPrix(p); }
    }).catch(() => {});
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (estSuper) charger(); }, [jours]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (estSuper) { chargerSante(); chargerAbonnements(); chargerTarifs(); } }, []);

  const action = async (t, type) => {
    let body;
    if (type === 'rembourse') {
      const motif = window.prompt('Motif du remboursement (obligatoire) :');
      if (!motif || motif.trim().length < 5) return;
      body = JSON.stringify({ motif });
    }
    setEnCours(true);
    try {
      const r = await fetch(API_URL + '/api/admin/encaissements/' + t.reference_id + '/' + type, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const d = await r.json();
      if (!d.success) alert(d.error || 'Erreur');
      else { flash(type === 'verifier' ? 'Statut MTN : ' + (d.transaction && d.transaction.statut) : 'Remboursement enregistré'); setSelection(null); charger(); chargerAbonnements(); }
    } catch (e) { alert('Erreur serveur'); }
    setEnCours(false);
  };

  const reconcilier = async () => {
    setEnCours(true);
    try {
      const r = await fetch(API_URL + '/api/admin/encaissements/reconcilier', { method: 'POST' });
      const d = await r.json();
      flash(d.success ? d.verifiees + ' paiement(s) en attente re-vérifié(s) auprès de MTN' : (d.error || 'Erreur'));
      charger();
    } catch (e) { flash('Erreur serveur'); }
    setEnCours(false);
  };

  const offrirAbonnement = async () => {
    if (!form.artisan_id || !form.motif.trim()) { alert('Choisissez un artisan et indiquez un motif'); return; }
    setEnCours(true);
    try {
      const r = await fetch(API_URL + '/api/admin/abonnements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, plan: 'offert' }) });
      const d = await r.json();
      if (!d.success) alert(d.error || 'Erreur');
      else { flash('Abonnement actif jusqu’au ' + dateCourte(d.fin)); setForm({ artisan_id: '', jours: 30, motif: '' }); chargerAbonnements(); charger(); }
    } catch (e) { alert('Erreur serveur'); }
    setEnCours(false);
  };

  const annulerPeriode = async (p) => {
    if (!window.confirm('Annuler cette période d’abonnement ? La date de fin de l’artisan sera recalculée.')) return;
    const r = await fetch(API_URL + '/api/admin/abonnements/' + p.id + '/annuler', { method: 'POST' });
    const d = await r.json().catch(() => ({}));
    if (!d.success) alert(d.error || 'Erreur'); else { flash('Période annulée'); chargerAbonnements(); charger(); }
  };

  const enregistrerTarifs = async (extra = {}) => {
    setEnCours(true);
    try {
      const corps = {};
      PRIX.forEach(([k]) => { if (prix[k] !== '' && prix[k] !== undefined) corps[k] = Number(prix[k]); });
      const r = await fetch(API_URL + '/api/config/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ monetisation: { ...corps, ...extra } }) });
      const d = await r.json();
      if (!d.success) alert(d.error || 'Erreur'); else { flash('Tarifs enregistrés : ils s’appliquent immédiatement dans l’application'); chargerTarifs(); }
    } catch (e) { alert('Erreur serveur'); }
    setEnCours(false);
  };

  const s = (donnees && donnees.stats) || {};
  const q = recherche.trim().toLowerCase();
  const transactions = useMemo(() => ((donnees && donnees.transactions) || [])
    .filter(t => filtreStatut === 'tous' || t.statut === filtreStatut)
    .filter(t => filtreType === 'tous' || t.type === filtreType)
    .filter(t => !q || [t.reference_id, t.telephone_payeur, t.payeur && t.payeur.full_name, t.cible && t.cible.full_name].some(v => String(v || '').toLowerCase().includes(q))),
  [donnees, filtreStatut, filtreType, q]);

  if (!estSuper) return <div className="card">Cette page est réservée au super administrateur.</div>;

  const momoConf = donnees && donnees.momo;
  return (
    <div>
      <DetailTransaction t={selection} onClose={() => setSelection(null)} onAction={action} enCours={enCours} />

      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Encaissements</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Abonnements artisans, déblocages de contact et pass clients payés par MTN MoMo</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={jours} onChange={e => setJours(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
            <option value={30}>30 derniers jours</option><option value={90}>90 derniers jours</option><option value={365}>12 derniers mois</option>
          </select>
          <button className="btn btn-secondary" onClick={reconcilier} disabled={enCours} title="Interroge MTN pour chaque paiement encore en attente">Re-vérifier les attentes</button>
          <button className="btn btn-primary" onClick={() => { charger(); chargerSante(); }} disabled={loading}>Actualiser</button>
        </div>
      </div>

      {message && <div className="card" style={{ background: '#E1F5EE', color: '#0F6E56', marginBottom: 16, fontWeight: 600 }}>{message}</div>}
      {erreur && <div className="card" style={{ color: '#E74C3C', marginBottom: 16 }}>{erreur}</div>}

      {/* Connexion MTN */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: sante ? (sante.connexion ? VERT : sante.configure ? '#E74C3C' : '#F5A623') : '#ccc' }} />
          <b style={{ fontSize: 14 }}>MTN MoMo Collection</b>
          <span style={{ color: '#888', fontSize: 13 }}>
            {!sante ? 'vérification…' : !sante.configure ? 'non configuré (variables Railway manquantes)' : sante.connexion ? 'connecté' : 'erreur : ' + (sante.erreur || '')}
          </span>
        </div>
        {sante && sante.environnement && <span style={{ fontSize: 13, color: '#555' }}>Environnement : <b>{sante.environnement}</b>{sante.environnement === 'sandbox' ? ' (tests, en EUR)' : ''}</span>}
        {sante && sante.connexion && <span style={{ fontSize: 13, color: '#555' }}>Solde du compte marchand : <b>{Number(sante.solde || 0).toLocaleString('fr-FR')} {sante.devise}</b></span>}
        {momoConf && <span style={{ fontSize: 13, color: momoConf.callback ? '#555' : '#B34700' }}>Callback MTN : {momoConf.callback ? 'actif' : 'non défini (la vérification automatique toutes les minutes prend le relais)'}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          ['Encaissé ce mois', fcfa(s.encaisse_mois), VERT],
          ['Encaissé sur la période', fcfa(s.total_encaisse), '#0F6E56', (s.nb_reussis || 0) + ' paiement(s)'],
          ['Abonnés Pro actifs', s.abonnes_actifs || 0, '#B8860B'],
          ['Pass clients actifs', s.pass_actifs || 0, '#2563EB'],
          ['Taux de réussite', s.taux_succes === null || s.taux_succes === undefined ? '—' : s.taux_succes + ' %', '#555', 'payés / (payés + échecs)'],
          ['À surveiller', (s.nb_en_attente || 0) + ' / ' + (s.nb_anomalies || 0), (s.nb_anomalies ? '#E74C3C' : '#888'), 'en attente / anomalies'],
        ].map(([l, v, c, aide]) => (
          <div key={l} className="card">
            <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c }}>{loading && !donnees ? '…' : v}</div>
            {aide && <div style={{ color: '#aaa', fontSize: 11, marginTop: 2 }}>{aide}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Encaissements des 30 derniers jours</h3>
          {s.serie_30j ? <Histogramme serie={s.serie_30j} /> : <p style={{ color: '#aaa' }}>…</p>}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Répartition par produit</h3>
          {Object.entries((s.par_type) || {}).map(([k, v]) => {
            const total = Math.max(1, s.total_encaisse || 0);
            return (
              <div key={k} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span>{TYPE[k]}</span><b>{fcfa(v)}</b></div>
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4 }}><div style={{ width: (100 * v / total) + '%', height: 8, background: VERT, borderRadius: 4 }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[['transactions', 'Transactions'], ['abonnements', 'Abonnements'], ['tarifs', 'Tarifs']].map(([k, l]) => (
          <button key={k} onClick={() => setOnglet(k)} className="btn" style={{ background: onglet === k ? VERT : '#f0f0f0', color: onglet === k ? '#fff' : '#555' }}>{l}</button>
        ))}
      </div>

      {onglet === 'transactions' && (
        <div className="card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
              <option value="tous">Tous les statuts</option>
              {Object.entries(STATUT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={filtreType} onChange={e => setFiltreType(e.target.value)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
              <option value="tous">Tous les produits</option>
              {Object.entries(TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Nom, numéro ou référence"
              style={{ marginLeft: 'auto', padding: '7px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: 240 }} />
          </div>
          <table>
            <thead><tr><th>Date</th><th>Payeur</th><th>Produit</th><th>Montant</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {transactions.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>Aucune transaction</td></tr>}
              {transactions.map(t => (
                <tr key={t.reference_id}>
                  <td style={{ fontSize: 13, color: '#666', whiteSpace: 'nowrap' }}>{dateHeure(t.created_at)}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.payeur ? t.payeur.full_name : '—'}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{t.payeur ? (t.payeur.role === 'artisan' ? 'Artisan' : 'Client') : ''} · +{t.telephone_payeur}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {TYPE[t.type] || t.type}
                    <div style={{ fontSize: 12, color: '#888' }}>{t.libelle}{t.cible ? ' · ' + t.cible.full_name : ''}</div>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>{fcfa(t.montant)}{t.reduction_pct ? <div style={{ fontSize: 11, color: VERT, fontWeight: 500 }}>-{t.reduction_pct} % parrainage</div> : null}</td>
                  <td><Pastille statut={t.statut} />{t.statut === 'en_attente' && t.age_minutes > 30 ? <div style={{ fontSize: 11, color: '#B34700' }}>depuis {t.age_minutes} min</div> : null}</td>
                  <td><button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setSelection(t)}>Détail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {onglet === 'abonnements' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
          <div className="card">
            <table>
              <thead><tr><th>Artisan</th><th>Formule</th><th>Période</th><th>Source</th><th>Statut</th><th></th></tr></thead>
              <tbody>
                {periodes.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>Aucun abonnement pour l’instant</td></tr>}
                {periodes.map(p => {
                  const enCoursPeriode = p.statut === 'actif' && new Date(p.fin) > new Date();
                  return (
                    <tr key={p.id}>
                      <td><div style={{ fontWeight: 600, fontSize: 13 }}>{p.artisan ? p.artisan.full_name : p.artisan_id}</div><div style={{ fontSize: 12, color: '#888' }}>{p.artisan ? [p.artisan.primary_specialty, p.artisan.commune].filter(Boolean).join(' · ') : ''}</div></td>
                      <td style={{ fontSize: 13 }}>{p.plan}</td>
                      <td style={{ fontSize: 13 }}>{dateCourte(p.debut)} → {dateCourte(p.fin)}</td>
                      <td style={{ fontSize: 12, color: '#666' }}>{p.source === 'admin' ? 'Offert (' + (p.created_by || 'admin') + ')' : 'Paiement MoMo'}{p.motif ? <div style={{ color: '#999' }}>{p.motif}</div> : null}</td>
                      <td>{p.statut === 'annule' ? <Pastille statut="annule" /> : enCoursPeriode ? <span style={{ color: VERT, fontWeight: 600, fontSize: 12 }}>En cours</span> : <span style={{ color: '#999', fontSize: 12 }}>Terminée</span>}</td>
                      <td>{p.statut === 'actif' && <button className="btn" style={{ fontSize: 12, padding: '4px 10px', background: '#FEF0EE', color: '#C0392B' }} onClick={() => annulerPeriode(p)}>Annuler</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Offrir ou prolonger</h3>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Geste commercial, paiement reçu hors application, compensation d’un incident. Les jours s’ajoutent à la fin de l’abonnement en cours.</p>
            <select value={form.artisan_id} onChange={e => setForm({ ...form, artisan_id: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, marginBottom: 8 }}>
              <option value="">— Artisan validé —</option>
              {artisans.map(a => <option key={a.id} value={a.id}>{a.full_name} · {a.primary_specialty || ''}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {[7, 30, 90, 365].map(j => (
                <button key={j} className="btn" onClick={() => setForm({ ...form, jours: j })} style={{ flex: 1, fontSize: 12, background: form.jours === j ? VERT : '#f0f0f0', color: form.jours === j ? '#fff' : '#555' }}>{j} j</button>
              ))}
            </div>
            <input value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} placeholder="Motif (obligatoire)" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }} />
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={offrirAbonnement} disabled={enCours}>Appliquer</button>
          </div>
        </div>
      )}

      {onglet === 'tarifs' && (
        <div className="card" style={{ maxWidth: 720 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Tarifs (FCFA)</h3>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
            Activation actuelle : période gratuite <b>{monetisation.periode_gratuite ? 'ACTIVE' : 'terminée'}</b> · déblocage payant <b>{monetisation.deblocage_contact_actif ? 'actif' : 'inactif'}</b> · abonnement <b>{monetisation.abonnement_artisan_actif ? 'actif' : 'inactif'}</b>.
            Les interrupteurs se trouvent dans Tableau de bord → Monétisation. Les prix ci-dessous s’appliquent immédiatement aux nouveaux paiements.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {PRIX.map(([k, l, aide]) => (
              <label key={k} style={{ display: 'block' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{l}</div>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{aide}</div>
                <input type="number" min={100} step={100} value={prix[k]} onChange={e => setPrix({ ...prix, [k]: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
              </label>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, fontSize: 13 }}>
            <input type="checkbox" checked={!!monetisation.abonnement_obligatoire} onChange={e => enregistrerTarifs({ abonnement_obligatoire: e.target.checked })} />
            <span><b>Abonnement obligatoire</b> : quand l’abonnement est actif, masquer des recherches les artisans non abonnés (sinon ils restent visibles, les abonnés passent simplement en tête).</span>
          </label>
          <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => enregistrerTarifs()} disabled={enCours}>Enregistrer les tarifs</button>
        </div>
      )}
    </div>
  );
}
