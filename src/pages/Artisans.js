import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "https://web-production-b97ed.up.railway.app";

const STATUT_COLORS = {
  actif: { bg: "#d4edda", color: "#155724", label: "Actif" },
  en_attente_validation: { bg: "#fff3cd", color: "#856404", label: "En attente" },
  suspendu: { bg: "#f8d7da", color: "#721c24", label: "Suspendu" },
};

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
    refuser: {
      titre: "Refuser le dossier",
      couleur: "#dc3545",
      label: "Refuser",
      placeholder: "Ex: Piece d identite illisible. Merci de retransmettre une photo claire...",
      obligatoire: true,
    },
    suspendre: {
      titre: "Suspendre le compte",
      couleur: "#fd7e14",
      label: "Suspendre",
      placeholder: "Ex: Plusieurs signalements recus. Compte suspendu en attendant verification...",
      obligatoire: true,
    },
    valider: {
      titre: "Valider le dossier",
      couleur: "#1D9E75",
      label: "Valider",
      placeholder: "",
      obligatoire: false,
    },
    reactiver: {
      titre: "Reactiver le compte",
      couleur: "#1D9E75",
      label: "Reactiver",
      placeholder: "",
      obligatoire: false,
    },
  };

  const config = configs[action];

  const handleConfirm = async () => {
    if (config.obligatoire && !message.trim()) {
      alert("Veuillez saisir un message pour l artisan");
      return;
    }
    setLoading(true);
    await onConfirm(action, message);
    setLoading(false);
  };

  return (
    <Modal titre={config.titre} onClose={onClose}>
      <div style={{ padding: "8px 0" }}>
        <p style={{ color: "#555", marginBottom: "16px" }}>
          Artisan : <strong>{artisan.full_name || (artisan.prenom + " " + artisan.nom)}</strong>
        </p>
        {config.obligatoire && (
          <div>
            <label style={styles.label}>Message a envoyer par SMS a l artisan *</label>
            <textarea
              style={styles.textarea}
              rows={4}
              placeholder={config.placeholder}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <p style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
              Ce message sera envoye par SMS au numero {artisan.phone}
            </p>
          </div>
        )}
        {!config.obligatoire && (
          <div>
            <label style={styles.label}>Message optionnel (SMS)</label>
            <textarea
              style={styles.textarea}
              rows={3}
              placeholder="Message de felicitations ou informations complementaires..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
        )}
        <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
          <button style={styles.btnAnnuler} onClick={onClose}>Annuler</button>
          <button
            style={{ ...styles.btnAction, backgroundColor: config.couleur }}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "En cours..." : config.label}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DossierModal({ artisan, onClose, onAction }) {
  const [actionEnCours, setActionEnCours] = useState(null);
  const statut = artisan.statut || "en_attente_validation";
  const statutInfo = STATUT_COLORS[statut] || STATUT_COLORS.en_attente_validation;

  if (actionEnCours) {
    return (
      <ActionModal
        artisan={artisan}
        action={actionEnCours}
        onClose={() => setActionEnCours(null)}
        onConfirm={async (action, message) => {
          await onAction(artisan.id, action, message);
          setActionEnCours(null);
          onClose();
        }}
      />
    );
  }

  return (
    <Modal titre="Dossier Artisan" onClose={onClose}>
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div style={styles.avatar}>
          {artisan.avatar_url
            ? <img src={artisan.avatar_url} alt="avatar" style={{ width: "80px", height: "80px", borderRadius: "50%" }} />
            : <span style={{ fontSize: "36px", color: "#1D9E75", fontWeight: "700" }}>
                {(artisan.full_name || artisan.prenom || "?")[0].toUpperCase()}
              </span>
          }
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: "20px" }}>
            {artisan.full_name || (artisan.prenom + " " + artisan.nom)}
          </h3>
          <span style={{ ...styles.statutBadge, backgroundColor: statutInfo.bg, color: statutInfo.color }}>
            {statutInfo.label}
          </span>
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

      {artisan.photo_profil && (
        <div style={styles.section}>
          <label style={styles.label}>Photo de profil</label>
          <img src={artisan.photo_profil} alt="profil" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }} />
        </div>
      )}
      {artisan.piece_identite && (
        <div style={styles.section}>
          <label style={styles.label}>Piece d identite</label>
          <img src={artisan.piece_identite} alt="piece" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "8px", border: "1px solid #eee" }} />
        </div>
      )}
      {artisan.portfolio && (
        <div style={styles.section}>
          <label style={styles.label}>Portfolio</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {artisan.portfolio.split(",").filter(Boolean).map((url, i) => (
              <img key={i} src={url} alt={"portfolio " + i} style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }} />
            ))}
          </div>
        </div>
      )}
      {artisan.photo_profil && (
        <div style={styles.section}>
          <label style={styles.label}>Photo de profil</label>
          <img src={artisan.photo_profil} alt="profil" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }} />
        </div>
      )}
      {artisan.piece_identite && (
        <div style={styles.section}>
          <label style={styles.label}>Piece d identite</label>
          <img src={artisan.piece_identite} alt="piece" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "8px", border: "1px solid #eee" }} />
        </div>
      )}
      {artisan.portfolio && (
        <div style={styles.section}>
          <label style={styles.label}>Portfolio</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {artisan.portfolio.split(",").filter(Boolean).map((url, i) => (
              <img key={i} src={url} alt={"portfolio " + i} style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }} />
            ))}
          </div>
        </div>
      )}
      <div style={styles.actionBar}>
        {statut === "en_attente_validation" && (
          <>
            <button style={{ ...styles.btnAction, backgroundColor: "#1D9E75" }} onClick={() => setActionEnCours("valider")}>
              Valider le dossier
            </button>
            <button style={{ ...styles.btnAction, backgroundColor: "#dc3545" }} onClick={() => setActionEnCours("refuser")}>
              Refuser le dossier
            </button>
          </>
        )}
        {statut === "actif" && (
          <button style={{ ...styles.btnAction, backgroundColor: "#fd7e14" }} onClick={() => setActionEnCours("suspendre")}>
            Suspendre le compte
          </button>
        )}
        {statut === "suspendu" && (
          <button style={{ ...styles.btnAction, backgroundColor: "#1D9E75" }} onClick={() => setActionEnCours("reactiver")}>
            Reactiver le compte
          </button>
        )}
      </div>
    </Modal>
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await r.json();
      if (data.success) {
        const newStatut = action === "valider" ? "actif" : action === "refuser" ? "refuse" : action === "suspendre" ? "suspendu" : "actif";
        setArtisans(prev => prev.map(a => a.id === id ? { ...a, statut: newStatut } : a));
      }
    } catch (e) { alert("Erreur reseau"); }
  };

  const filtres = [
    { key: "tous", label: "Tous" },
    { key: "en_attente_validation", label: "En attente" },
    { key: "actif", label: "Actifs" },
    { key: "suspendu", label: "Suspendus" },
  ];

  const artisansFiltres = artisans.filter(a => {
    const matchFiltre = filtre === "tous" || a.statut === filtre;
    const matchRecherche = !recherche ||
      (a.full_name || "").toLowerCase().includes(recherche.toLowerCase()) ||
      (a.phone || "").includes(recherche) ||
      (a.primary_specialty || "").toLowerCase().includes(recherche.toLowerCase());
    return matchFiltre && matchRecherche;
  });

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Chargement...</div>;

  return (
    <div style={styles.container}>
      {dossierOuvert && (
        <DossierModal
          artisan={dossierOuvert}
          onClose={() => setDossierOuvert(null)}
          onAction={handleAction}
        />
      )}

      <div style={styles.header}>
        <h1 style={styles.titre}>Gestion des Artisans</h1>
        <span style={styles.badge}>{artisans.length} artisans</span>
      </div>

      <div style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="Rechercher par nom, telephone, specialite..."
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
        />
        <div style={styles.filtres}>
          {filtres.map(f => (
            <button
              key={f.key}
              style={{ ...styles.filtreBtn, ...(filtre === f.key ? styles.filtreBtnActif : {}) }}
              onClick={() => setFiltre(f.key)}
            >
              {f.label}
            </button>
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
            {artisansFiltres.length === 0 ? (
              <tr><td colSpan={7} style={styles.empty}>Aucun artisan trouve</td></tr>
            ) : artisansFiltres.map(a => {
              const statutInfo = STATUT_COLORS[a.statut] || STATUT_COLORS.en_attente_validation;
              return (
                <tr key={a.id} style={styles.tr}>
                  <td style={styles.td}><strong>{a.full_name || (a.prenom + " " + a.nom)}</strong></td>
                  <td style={styles.td}>{a.phone}</td>
                  <td style={styles.td}>{a.primary_specialty || "-"}</td>
                  <td style={styles.td}>{a.commune || "-"}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statut, backgroundColor: statutInfo.bg, color: statutInfo.color }}>
                      {statutInfo.label}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</td>
                  <td style={styles.td}>
                    <button style={styles.btnVoir} onClick={() => setDossierOuvert(a)}>
                      Voir le dossier
                    </button>
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
  filtres: { display: "flex", gap: "8px" },
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
  avatar: { width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#e8f5f0", display: "flex", alignItems: "center", justifyContent: "center" },
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
  textarea: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" },
};


