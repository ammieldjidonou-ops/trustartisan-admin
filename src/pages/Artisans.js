import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "https://web-production-b97ed.up.railway.app";

const STATUT_COLORS = {
  actif: { bg: "#d4edda", color: "#155724", label: "Actif" },
  en_attente_validation: { bg: "#fff3cd", color: "#856404", label: "En attente" },
  suspendu: { bg: "#f8d7da", color: "#721c24", label: "Suspendu" },
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

function ActionModal({ artisan, action, onClose, onConfirm }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const configs = {
    refuser: { titre: "Refuser le dossier", couleur: "#dc3545", label: "Refuser", placeholder: "Ex: Piece d identite illisible. Merci de retransmettre une photo claire...", obligatoire: true },
    suspendre: { titre: "Suspendre le compte", couleur: "#fd7e14", label: "Suspendre", placeholder: "Ex: Plusieurs signalements recus...", obligatoire: true },
    supprimer: { titre: "Supprimer definitivement", couleur: "#E74C3C", label: "Supprimer", placeholder: "Raison de la suppression...", obligatoire: true },
    supprimer: { titre: "Supprimer definitivement", couleur: "#E74C3C", label: "Supprimer", placeholder: "Raison de la suppression...", obligatoire: true },
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
        <label style={styles.label}>{config.obligatoire ? "Message SMS obligatoire *" : "Message SMS optionnel"}</label>
        <textarea style={styles.textarea} rows={4} placeholder={config.placeholder} value={message} onChange={e => setMessage(e.target.value)} />
        {config.obligatoire && <p style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>Ce message sera envoye par SMS au {artisan.phone}</p>}
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

function DossierModal({ artisan, onClose, onAction }) {
  const [actionEnCours, setActionEnCours] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const statut = artisan.statut || "en_attente_validation";
  const statutInfo = STATUT_COLORS[statut] || STATUT_COLORS.en_attente_validation;

  const portfolioUrls = artisan.portfolio
    ? artisan.portfolio.split(",").filter(u => u.trim().startsWith("http"))
    : [];

  if (actionEnCours) {
    return (
      <ActionModal artisan={artisan} action={actionEnCours} onClose={() => setActionEnCours(null)}
        onConfirm={async (action, message) => { await onAction(artisan.id, action, message); setActionEnCours(null); onClose(); }} />
    );
  }

  return (
    <>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
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
          </div>
        </div>

        <div style={styles.infoGrid}>
          <InfoItem label="Telephone" value={artisan.phone} />
          <InfoItem label="Commune" value={artisan.commune || "-"} />
          <InfoItem label="Specialite" value={artisan.primary_specialty || "-"} />
          <InfoItem label="Date inscription" value={new Date(artisan.created_at).toLocaleDateString("fr-FR")} />
          <InfoItem label="Verifie" value={artisan.is_verified ? "Oui" : "Non"} />
          <InfoItem label="Email" value={artisan.email || "-"} />
        </div>

        {artisan.description && (
          <div style={styles.section}>
            <label style={styles.label}>Description</label>
            <p style={styles.descText}>{artisan.description}</p>
          </div>
        )}

        {artisan.piece_identite && (
          <div style={styles.section}>
            <label style={styles.label}>Piece d identite</label>
            {artisan.piece_identite.endsWith(".pdf")
              ? <a href={artisan.piece_identite} target="_blank" rel="noreferrer" style={{ color: "#1D9E75", fontSize: "14px" }}>Voir le PDF</a>
              : <img src={artisan.piece_identite} alt="piece" onClick={() => setLightbox(artisan.piece_identite)}
                  style={{ width: "100%", maxHeight: "180px", objectFit: "contain", borderRadius: "8px", border: "1px solid #eee", cursor: "zoom-in" }} />}
          </div>
        )}

        {portfolioUrls.length > 0 && (
          <div style={styles.section}>
            <label style={styles.label}>Portfolio ({portfolioUrls.length} photo{portfolioUrls.length > 1 ? "s" : ""})</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {portfolioUrls.map((url, i) => (
                <img key={i} src={url} alt={"portfolio " + i} onClick={() => setLightbox(url)}
                  style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee", cursor: "zoom-in" }} />
              ))}
            </div>
          </div>
        )}

        <div style={styles.actionBar}>
          {statut === "en_attente_validation" && (
            <>
              <button style={{ ...styles.btnAction, backgroundColor: "#1D9E75" }} onClick={() => setActionEnCours("valider")}>Valider le dossier</button>
              <button style={{ ...styles.btnAction, backgroundColor: "#dc3545" }} onClick={() => setActionEnCours("refuser")}>Refuser le dossier</button>
              <button style={{ ...styles.btnAction, backgroundColor: '#E74C3C', marginTop: '8px' }} onClick={() => {
                if (window.confirm('ATTENTION : Supprimer definitivement cet artisan ? Action irreversible.')) {
                  if (window.confirm('Etes-vous vraiment sur ?')) {
                    fetch(API_URL + '/api/admin/artisans/' + artisan.id, { method: 'DELETE' })
                      .then(r => r.json())
                      .then(d => { if (d.success) { alert('Artisan supprime'); onClose(); window.location.reload(); } else alert('Erreur: ' + d.error); });
                  }
                }
              }}>Supprimer definitivement</button>
            </>
          )}
          {statut === "actif" && <button style={{ ...styles.btnAction, backgroundColor: "#fd7e14" }} onClick={() => setActionEnCours("suspendre")}>Suspendre le compte</button>}
          {statut === "suspendu" && <button style={{ ...styles.btnAction, backgroundColor: "#1D9E75" }} onClick={() => setActionEnCours("reactiver")}>Reactiver le compte</button>}
            if (window.confirm('ATTENTION : Supprimer definitivement cet artisan ? Action irreversible.')) {
              if (window.confirm('Etes-vous vraiment sur ?')) {
                fetch(API_URL + '/api/admin/artisans/' + artisan.id, { method: 'DELETE' })
                  .then(r => r.json())
                  .then(d => { if (d.success) { alert('Artisan supprime'); onClose(); window.location.reload(); } else alert('Erreur: ' + d.error); });
              }
            }
          }}>Supprimer definitivement</button>
        </div>