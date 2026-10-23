import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "https://web-production-b97ed.up.railway.app";

const STATUT_COLORS = {
  actif: { bg: "#d4edda", color: "#155724", label: "Actif" },
  en_attente_validation: { bg: "#fff3cd", color: "#856404", label: "En attente" },
  suspendu: { bg: "#f8d7da", color: "#721c24", label: "Suspendu" },
  refuse: { bg: "#FDECEA", color: "#B42318", label: "A completer" },
};

// Actions sensibles (numero, suppression) : reservees au super administrateur (controle aussi fait par le serveur)
const estSuperAdmin = () => { try { return JSON.parse(localStorage.getItem('admin_user') || '{}').role === 'super_admin'; } catch (e) { return false; } };
// Moderation du contenu (photos, description) : moderateur ou super administrateur (controle aussi fait par le serveur)
const peutModerer = () => { try { return ['moderateur', 'super_admin'].includes(JSON.parse(localStorage.getItem('admin_user') || '{}').role); } catch (e) { return false; } };

// Appel d'une action de moderation ; renvoie la reponse du serveur ou null (erreur deja affichee)
async function moderer(methode, chemin, corps) {
  try {
    const r = await fetch(API_URL + '/api/admin/artisans/' + chemin, { method: methode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps || {}) });
    const d = await r.json();
    if (!d.success) { alert('Action impossible : ' + (d.error || 'erreur')); return null; }
    return d;
  } catch (e) { alert('Erreur reseau'); return null; }
}
const listePortfolio = (v) => {
  try { const j = JSON.parse(v); if (Array.isArray(j)) return j.map(String).filter(u => u.startsWith('http')); } catch (e) { /* format "url1,url2" */ }
  return String(v || '').split(',').map(u => u.trim()).filter(u => u.startsWith('http'));
};
function Lightbox({ src, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, cursor: "zoom-out" }}>
      <img src={src} alt="zoom" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: "8px" }} />
    </div>
  );
}

function Modal({ titre, onClose, children }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitre}>{titre}</h2>
          <button style={styles.closeBtn} onClick={onClose}>x</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function ModalChangePhone({ artisan, onClose, onSuccess }) {
  const [phone, setPhone] = useState('');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const submit = async () => {
    setErreur('');
    if (!phone.trim() || !motif.trim()) { setErreur('Numero et motif requis'); return; }
    setLoading(true);
    try {
      const resp = await fetch(API_URL + '/api/admin/users/' + artisan.id + '/phone', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), motif: motif.trim() })
      });
      const data = await resp.json();
      if (data.success) { onSuccess(data); onClose(); }
      else { setErreur(data.error || 'Erreur inconnue'); }
    } catch (e) { setErreur('Erreur reseau'); }
    setLoading(false);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000 }}>
    <Modal titre={'Modifier le numero de ' + (artisan.full_name || 'l artisan')} onClose={onClose}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Numero actuel</label>
        <div style={{ fontSize: 14, color: '#333', backgroundColor: '#f8f9fa', padding: '8px 12px', borderRadius: 6 }}>{artisan.phone || '-'}</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Nouveau numero (format : 0197XXXXXX ou +2290197XXXXXX)</label>
        <input style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }}
          value={phone} onChange={e => setPhone(e.target.value)} placeholder="0197XXXXXX" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Motif (audit interne, obligatoire)</label>
        <textarea style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, minHeight: 60, fontFamily: 'inherit', boxSizing: 'border-box' }}
          value={motif} onChange={e => setMotif(e.target.value)} placeholder="Ex : Faute de frappe a l inscription, ancien numero inactif, changement de SIM..." />
      </div>
      {erreur && <div style={{ color: '#dc3545', fontSize: 13, marginBottom: 8 }}>{erreur}</div>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <button onClick={onClose} disabled={loading} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer' }}>Annuler</button>
        <button onClick={submit} disabled={loading} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: '#1D9E75', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          {loading ? 'Enregistrement...' : 'Confirmer le changement'}
        </button>
      </div>
    </Modal>
    </div>
  );
}

function ActionModal({ artisan, action, onClose, onConfirm }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const configs = {
    refuser: { titre: "Demander des corrections", couleur: "#dc3545", label: "Envoyer a l artisan", placeholder: "Ex: Votre photo de profil doit montrer clairement votre visage. Ajoutez aussi 2 photos de chantiers termines.", obligatoire: true },
    suspendre: { titre: "Suspendre le compte", couleur: "#fd7e14", label: "Suspendre", placeholder: "Ex: Plusieurs signalements recus...", obligatoire: true },
    valider: { titre: "Valider le dossier", couleur: "#1D9E75", label: "Valider", placeholder: "", obligatoire: false },
    reactiver: { titre: "Reactiver le compte", couleur: "#1D9E75", label: "Reactiver", placeholder: "", obligatoire: false },
  };
  const config = configs[action];
  const handleConfirm = async () => {
    if (config.obligatoire && !message.trim()) { alert("Veuillez saisir un message pour l artisan"); return; }
    setLoading(true);
    await onConfirm(action, message);
    setLoading(false);
  };
  return (
    <Modal titre={config.titre} onClose={onClose}>
      <div style={{ padding: "8px 0" }}>
        <p style={{ color: "#555", marginBottom: "16px" }}>Artisan : <strong>{artisan.full_name}</strong></p>
        {(action === "refuser" || action === "suspendre") && (<>
          <label style={styles.label}>Message pour l artisan *</label>
          <textarea style={styles.textarea} rows={4} placeholder={config.placeholder} value={message} onChange={e => setMessage(e.target.value)} />
        </>)}
        {action === "refuser" && <p style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>Le message s affiche dans l application de l artisan, avec la liste des elements a corriger et un bouton « Renvoyer mon dossier ». Il est aussi prevenu par notification et par SMS ({artisan.phone}).</p>}
        {action === "valider" && <p style={{ fontSize: "13px", color: "#555" }}>L artisan sera prevenu par notification et par SMS ({artisan.phone}), et son profil deviendra visible par les clients.</p>}
        <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
          <button style={styles.btnAnnuler} onClick={onClose}>Annuler</button>
          <button style={{ ...styles.btnAction, backgroundColor: config.couleur }} onClick={handleConfirm} disabled={loading}>
            {loading ? "En cours..." : config.label}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Piece d'identite : stockee dans un espace PRIVE. On demande un lien temporaire (5 min)
// au backend, uniquement quand l'admin clique (chaque consultation est journalisee).
function PieceIdentite({ artisanId, onZoom }) {
  const [lien, setLien] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const afficher = async () => {
    setChargement(true); setErreur('');
    try {
      const r = await fetch(API_URL + '/api/admin/artisans/' + artisanId + '/piece-identite');
      const d = await r.json();
      if (d.success) setLien(d); else setErreur(d.error || 'Lien indisponible');
    } catch (e) { setErreur('Serveur inaccessible'); }
    setChargement(false);
  };
  if (!lien) {
    return (
      <div>
        <button onClick={afficher} disabled={chargement}
          style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "14px" }}>
          {chargement ? "Chargement..." : "Afficher la piece d identite"}
        </button>
        {erreur && <p style={{ color: "#E74C3C", fontSize: 13 }}>{erreur}</p>}
      </div>
    );
  }
  return lien.est_pdf
    ? <a href={lien.url} target="_blank" rel="noreferrer" style={{ color: "#1D9E75", fontSize: "14px" }}>Voir le PDF (lien valable 5 min)</a>
    : <img src={lien.url} alt="piece" onClick={() => onZoom(lien.url)}
        style={{ width: "100%", maxHeight: "180px", objectFit: "contain", borderRadius: "8px", border: "1px solid #eee", cursor: "zoom-in" }} />;
}

function DossierModal({ artisan: artisanInitial, onClose, onAction, onMaj }) {
  // Copie locale : les retraits de photos / corrections de description s'affichent tout de suite
  const [artisan, setArtisan] = useState(artisanInitial);
  const maj = (champs) => { setArtisan(a => ({ ...a, ...champs })); if (onMaj) onMaj(artisan.id, champs); };
  const [editionDesc, setEditionDesc] = useState(null); // texte en cours de modification, ou null
  const moderateur = peutModerer();

  const retirerPhoto = async (url) => {
    const motif = window.prompt('Retirer cette photo des realisations ?\n\nMotif transmis a l artisan (facultatif) : photo floue, sans rapport avec le metier, contenu inapproprie...', '');
    if (motif === null) return;
    const d = await moderer('POST', artisan.id + '/portfolio/retirer', { url, motif });
    if (d) maj({ portfolio: (d.portfolio || []).join(',') || null });
  };
  const retirerPhotoProfil = async () => {
    const motif = window.prompt('Retirer la photo de profil ?\n\nMotif transmis a l artisan (facultatif) :', 'La photo doit montrer clairement votre visage');
    if (motif === null) return;
    const d = await moderer('POST', artisan.id + '/photo-profil/retirer', { motif });
    if (d) maj({ photo_profil: null });
  };
  const enregistrerDescription = async (texte) => {
    const d = await moderer('PUT', artisan.id + '/description', { description: texte });
    if (d) { maj({ description: d.description, alerte_coordonnees: false }); setEditionDesc(null); }
  };
  const [actionEnCours, setActionEnCours] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [changePhoneFor, setChangePhoneFor] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!artisan?.id) return;
    setLoadingStats(true);
    fetch(API_URL + '/api/admin/artisans/' + artisan.id + '/stats')
      .then(r => r.json())
      .then(data => { if (data.success) setStats(data.stats); })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, [artisan?.id]);
  const statut = artisan.statut || "en_attente_validation";
  const statutInfo = STATUT_COLORS[statut] || STATUT_COLORS.en_attente_validation;

  const portfolioUrls = listePortfolio(artisan.portfolio);

  if (actionEnCours) {
    return (
      <ActionModal artisan={artisan} action={actionEnCours} onClose={() => setActionEnCours(null)}
        onConfirm={async (action, message) => { await onAction(artisan.id, action, message); setActionEnCours(null); onClose(); }} />
    );
  }

  return (
    <>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      {changePhoneFor && (
        <ModalChangePhone artisan={changePhoneFor}
          onClose={() => setChangePhoneFor(null)}
          onSuccess={(res) => { alert('Numero mis a jour : ' + res.ancien + ' -> ' + res.nouveau); window.location.reload(); }} />
      )}
      <Modal titre="Dossier Artisan" onClose={onClose}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "#e8f5f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: artisan.photo_profil ? "zoom-in" : "default" }}
            onClick={() => artisan.photo_profil && setLightbox(artisan.photo_profil)}>
            {artisan.photo_profil
              ? <img src={artisan.photo_profil} alt="profil" style={{ width: "70px", height: "70px", objectFit: "cover" }} />
              : <span style={{ fontSize: "28px", color: "#1D9E75", fontWeight: "700" }}>{(artisan.full_name || "?")[0]}</span>}
          </div>
          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: "20px" }}>{artisan.full_name}</h3>
            <span style={{ ...styles.statutBadge, backgroundColor: statutInfo.bg, color: statutInfo.color }}>{statutInfo.label}</span>
            {moderateur && artisan.photo_profil && (
              <button onClick={retirerPhotoProfil} style={{ ...styles.btnLien, display: "block", marginTop: 8 }}>Retirer la photo de profil</button>
            )}
          </div>
        </div>

        {statut === "refuse" && (
          <div style={{ backgroundColor: "#FDECEA", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, color: "#7A271A" }}>
            <strong>Corrections demandees :</strong> {artisan.motif_refus || "(aucun message enregistre)"}
            <div style={{ marginTop: 4, color: "#B42318" }}>En attente des corrections de l artisan.</div>
          </div>
        )}
        {statut === "en_attente_validation" && artisan.dossier_renvoye_at && (
          <div style={{ backgroundColor: "#FFF3CD", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, color: "#664D03" }}>
            Dossier corrige et renvoye par l artisan le {new Date(artisan.dossier_renvoye_at).toLocaleString("fr-FR")}.
          </div>
        )}
        <div style={styles.infoGrid}>
          <InfoItem label="Telephone" value={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {artisan.phone || '-'}
              {estSuperAdmin() && <button onClick={() => setChangePhoneFor(artisan)}
                style={{ padding: '2px 8px', fontSize: 11, borderRadius: 4, border: '1px solid #1D9E75', backgroundColor: '#fff', color: '#1D9E75', cursor: 'pointer' }}>
                Modifier
              </button>}
            </span>
          } />
          <InfoItem label="Commune" value={artisan.commune || "-"} />
          <InfoItem label="Specialite" value={artisan.primary_specialty || "-"} />
          <InfoItem label="Date inscription" value={new Date(artisan.created_at).toLocaleDateString("fr-FR")} />
          <InfoItem label="Genre" value={artisan.genre || "-"} />
          <InfoItem label="Verifie" value={artisan.is_verified ? "Oui" : "Non"} />
          <InfoItem label="Email" value={artisan.email || "-"} />
        </div>

        {(artisan.description || editionDesc !== null) && (
          <div style={styles.section}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <label style={{ ...styles.label, marginBottom: 0 }}>Description</label>
              {artisan.alerte_coordonnees && <span style={styles.alerte}>Numero ou e-mail detecte</span>}
              {moderateur && editionDesc === null && (
                <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  {artisan.alerte_coordonnees && (
                    <button style={{ ...styles.btnPetit, backgroundColor: "#E74C3C", color: "#fff", borderColor: "#E74C3C" }}
                      onClick={() => enregistrerDescription(artisan.description || '')}>Retirer les coordonnees</button>
                  )}
                  <button style={styles.btnPetit} onClick={() => setEditionDesc(artisan.description || '')}>Modifier</button>
                </span>
              )}
            </div>
            {editionDesc === null ? (
              <p style={{ ...styles.descText, whiteSpace: "pre-wrap" }}>{artisan.description}</p>
            ) : (
              <>
                <textarea style={styles.textarea} rows={6} maxLength={2000} value={editionDesc} onChange={e => setEditionDesc(e.target.value)} />
                <p style={{ fontSize: 12, color: "#888", margin: "6px 0" }}>Les numeros, e-mails et liens WhatsApp sont retires automatiquement a l enregistrement.</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ ...styles.btnPetit, backgroundColor: "#1D9E75", color: "#fff", borderColor: "#1D9E75" }} onClick={() => enregistrerDescription(editionDesc)}>Enregistrer</button>
                  <button style={styles.btnPetit} onClick={() => setEditionDesc(null)}>Annuler</button>
                </div>
              </>
            )}
          </div>
        )}

        <div style={styles.section}>
          <label style={styles.label}>Statistiques</label>
          {loadingStats ? (
            <p style={{ color: '#888', fontSize: 13 }}>Chargement des stats...</p>
          ) : stats ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div style={{ backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#0066CC' }}>{stats.total_missions}</div>
                  <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>Total</div>
                </div>
                <div style={{ backgroundColor: '#E1F5EE', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#1D9E75' }}>{stats.missions_terminees}</div>
                  <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>Terminees</div>
                </div>
                <div style={{ backgroundColor: '#EEF4FF', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#0066CC' }}>{stats.missions_en_cours || 0}</div>
                  <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>En cours</div>
                </div>
                <div style={{ backgroundColor: '#FEF6E7', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#8A6D1E' }}>{stats.missions_annulees || 0}</div>
                  <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>Annulees</div>
                </div>
                <div style={{ backgroundColor: '#FEF0EE', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#E74C3C' }}>{stats.missions_litige || 0}</div>
                  <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>Litiges</div>
                </div>
                <div style={{ backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#F5A623' }}>{(stats.montant_percu || 0).toLocaleString('fr-FR')}</div>
                  <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>FCFA percu</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div style={{ backgroundColor: '#FFF8E7', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#F5A623' }}>
                    {stats.note_moyenne ? stats.note_moyenne.toFixed(1) : '-'}
                    {stats.note_moyenne ? <span style={{ fontSize: 14, color: '#888' }}> /5</span> : null}
                  </div>
                  <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>Note moyenne</div>
                </div>
                <div style={{ backgroundColor: '#E8F5F0', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#0F6E56' }}>
                    {stats.score_qualite || 0}
                    <span style={{ fontSize: 12, color: '#888' }}> /5</span>
                  </div>
                  <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>Score qualite (note x taux validation {stats.taux_validation}%)</div>
                </div>
              </div>

              {Array.isArray(stats.top_specialites) && stats.top_specialites.length > 0 && (
                <div style={{ backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12 }}>
                  <div style={{ color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Top specialites realisees</div>
                  {stats.top_specialites.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                      <span>{i + 1}. {s.nom}</span>
                      <span style={{ color: '#1D9E75', fontWeight: 600 }}>{s.count} mission{s.count > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#aaa', fontSize: 13 }}>Aucune mission pour cet artisan.</p>
          )}
        </div>

        {artisan.piece_identite && (
          <div style={styles.section}>
            <label style={styles.label}>Piece d identite</label>
            <PieceIdentite artisanId={artisan.id} onZoom={setLightbox} />
          </div>
        )}

        {portfolioUrls.length > 0 && (
          <div style={styles.section}>
            <label style={styles.label}>Portfolio ({portfolioUrls.length} photo{portfolioUrls.length > 1 ? "s" : ""}){moderateur ? <span style={{ fontWeight: 400, color: "#999" }}> · touchez &times; pour retirer une photo indesirable</span> : null}</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {portfolioUrls.map((url, i) => (
                <div key={url} style={{ position: "relative" }}>
                  <img src={url} alt={"portfolio " + i} onClick={() => setLightbox(url)}
                    style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee", cursor: "zoom-in", display: "block" }} />
                  {moderateur && (
                    <button onClick={() => retirerPhoto(url)} title="Retirer cette photo" aria-label="Retirer cette photo" style={styles.btnRetirerPhoto}>&times;</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.actionBar}>
          {(statut === "en_attente_validation" || statut === "refuse") && (
            <>
              <button style={{ ...styles.btnAction, backgroundColor: "#1D9E75" }} onClick={() => setActionEnCours("valider")}>Valider le dossier</button>
              <button style={{ ...styles.btnAction, backgroundColor: "#dc3545" }} onClick={() => setActionEnCours("refuser")}>{statut === "refuse" ? "Modifier la demande de corrections" : "Demander des corrections"}</button>
            </>
          )}
          {statut === "actif" && <button style={{ ...styles.btnAction, backgroundColor: "#fd7e14" }} onClick={() => setActionEnCours("suspendre")}>Suspendre le compte</button>}
          {statut === "suspendu" && <button style={{ ...styles.btnAction, backgroundColor: "#1D9E75" }} onClick={() => setActionEnCours("reactiver")}>Reactiver le compte</button>}
          {estSuperAdmin() && <button style={{ ...styles.btnAction, backgroundColor: '#E74C3C', marginTop: '8px' }} onClick={() => {
            // Suppression conforme APDP : anonymisation + effacement photo, piece d identite, portfolio
            if (window.confirm('Supprimer le compte et ses donnees personnelles ?\n\nProfil anonymise, photos et pieces d identite effacees, missions ouvertes annulees. Action irreversible.\n\nA utiliser notamment pour les demandes recues par e-mail ou WhatsApp (verifier d abord l identite du demandeur).') && window.confirm('Confirmer la suppression definitive ?')) {
              fetch(API_URL + '/api/admin/users/' + artisan.id + '/supprimer-donnees', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                .then(r => r.json())
                .then(d => { if (d.success) { alert('Compte et donnees supprimes'); onClose(); window.location.reload(); } else alert('Erreur : ' + d.error); });
            }
          }}>Supprimer le compte et les donnees</button>}
        </div>
      </Modal>
    </>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

export default function Artisans() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [dossierOuvert, setDossierOuvert] = useState(null);

  useEffect(() => {
    fetch(API_URL + "/api/admin/artisans")
      .then(r => r.json())
      .then(data => { if (data.success) setArtisans(data.artisans); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAction = async (id, action, message) => {
    try {
      const r = await fetch(API_URL + "/api/admin/artisans/" + id + "/" + action, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }),
      });
      const data = await r.json();
      if (data.success) {
        const newStatut = action === "valider" ? "actif" : action === "refuser" ? "refuse" : action === "suspendre" ? "suspendu" : "actif";
        setArtisans(prev => prev.map(a => a.id === id ? { ...a, statut: newStatut, ...(action === "refuser" ? { motif_refus: message } : {}), ...(action === "valider" ? { motif_refus: null } : {}) } : a));
      }
    } catch (e) { alert("Erreur reseau"); }
  };

  const filtres = [
    { key: "tous", label: "Tous" },
    { key: "en_attente_validation", label: "En attente" },
    { key: "actif", label: "Actifs" },
    { key: "refuse", label: "A completer" },
    { key: "suspendu", label: "Suspendus" },
    { key: "coordonnees", label: "Numero en description (" + artisans.filter(a => a.alerte_coordonnees).length + ")" },
  ];

  const artisansFiltres = artisans.filter(a => {
    const matchFiltre = filtre === "tous" || a.statut === filtre || (filtre === "coordonnees" && a.alerte_coordonnees);
    const matchRecherche = !recherche ||
      (a.full_name || "").toLowerCase().includes(recherche.toLowerCase()) ||
      (a.phone || "").includes(recherche) ||
      (a.primary_specialty || "").toLowerCase().includes(recherche.toLowerCase());
    return matchFiltre && matchRecherche;
  });

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Chargement...</div>;

  return (
    <div style={styles.container}>
      {dossierOuvert && <DossierModal artisan={dossierOuvert} onClose={() => setDossierOuvert(null)} onAction={handleAction}
        onMaj={(id, champs) => setArtisans(prev => prev.map(a => a.id === id ? { ...a, ...champs } : a))} />}
      <div style={styles.header}>
        <h1 style={styles.titre}>Gestion des Artisans</h1>
        <span style={styles.badge}>{artisans.length} artisans</span>
      </div>
      <div style={styles.toolbar}>
        <input style={styles.search} placeholder="Rechercher par nom, telephone, specialite..." value={recherche} onChange={e => setRecherche(e.target.value)} />
        <div style={styles.filtres}>
          {filtres.map(f => (
            <button key={f.key} style={{ ...styles.filtreBtn, ...(filtre === f.key ? styles.filtreBtnActif : {}) }} onClick={() => setFiltre(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Telephone</th>
              <th style={styles.th}>Specialite</th>
              <th style={styles.th}>Commune</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Date inscription</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {artisansFiltres.length === 0
              ? <tr><td colSpan={7} style={styles.empty}>Aucun artisan trouve</td></tr>
              : artisansFiltres.map(a => {
                  const statutInfo = STATUT_COLORS[a.statut] || STATUT_COLORS.en_attente_validation;
                  return (
                    <tr key={a.id} style={styles.tr}>
                      <td style={styles.td}><strong>{a.full_name}</strong>{a.alerte_coordonnees && <span style={{ ...styles.alerte, marginLeft: 6 }} title="Numero ou e-mail dans la description">Numero</span>}</td>
                      <td style={styles.td}>{a.phone}</td>
                      <td style={styles.td}>{a.primary_specialty || "-"}</td>
                      <td style={styles.td}>{a.commune || "-"}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statut, backgroundColor: statutInfo.bg, color: statutInfo.color }}>{statutInfo.label}</span>
                      </td>
                      <td style={styles.td}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</td>
                      <td style={styles.td}>
                        <button style={styles.btnVoir} onClick={() => setDossierOuvert(a)}>Voir le dossier</button>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "24px" },
  header: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" },
  titre: { fontSize: "24px", fontWeight: "700", color: "#1a1a1a", margin: 0 },
  badge: { backgroundColor: "#1D9E75", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "14px" },
  toolbar: { display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" },
  search: { flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
  filtres: { display: "flex", gap: "8px", flexWrap: "wrap" },
  filtreBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #ddd", cursor: "pointer", backgroundColor: "#fff", fontSize: "13px" },
  filtreBtnActif: { backgroundColor: "#1D9E75", color: "#fff", borderColor: "#1D9E75" },
  tableContainer: { backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { backgroundColor: "#f8f9fa" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666", borderBottom: "1px solid #eee" },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "12px 16px", fontSize: "14px", color: "#333" },
  statut: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  btnVoir: { backgroundColor: "#1D9E75", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  empty: { textAlign: "center", padding: "40px", color: "#999" },
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "#fff", borderRadius: "16px", width: "90%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #eee" },
  modalTitre: { margin: 0, fontSize: "18px", fontWeight: "700" },
  closeBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#999", padding: "4px 8px" },
  modalBody: { padding: "24px" },
  statutBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "20px 0" },
  infoItem: { display: "flex", flexDirection: "column", gap: "2px" },
  infoLabel: { fontSize: "11px", fontWeight: "600", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px" },
  infoValue: { fontSize: "14px", color: "#333" },
  section: { marginBottom: "16px" },
  descText: { fontSize: "14px", color: "#555", lineHeight: "1.6", backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "8px" },
  actionBar: { display: "flex", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #eee", flexWrap: "wrap" },
  btnAction: { color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  btnAnnuler: { backgroundColor: "#f8f9fa", color: "#555", border: "1px solid #ddd", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#555", marginBottom: "8px" },
  alerte: { backgroundColor: "#FDECEA", color: "#B42318", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" },
  btnPetit: { padding: "4px 10px", fontSize: "12px", borderRadius: "6px", border: "1px solid #1D9E75", backgroundColor: "#fff", color: "#1D9E75", cursor: "pointer", fontWeight: "600" },
  btnLien: { background: "none", border: "none", padding: 0, color: "#E74C3C", fontSize: "12px", cursor: "pointer", textDecoration: "underline" },
  btnRetirerPhoto: { position: "absolute", top: "-8px", right: "-8px", width: "24px", height: "24px", borderRadius: "50%", border: "2px solid #fff", backgroundColor: "#E74C3C", color: "#fff", fontSize: "15px", lineHeight: "18px", cursor: "pointer", padding: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.3)" },
  textarea: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" },
};