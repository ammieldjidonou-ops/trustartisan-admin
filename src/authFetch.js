// src/authFetch.js
// Ajoute automatiquement le jeton admin a tous les appels vers l'API TrustArtisan.
// Importe en premier dans index.js : aucune page n'a besoin de gerer l'en-tete elle-meme.
// Si le serveur repond 401 (jeton expire ou invalide), la session admin est fermee.

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';
const fetchOriginal = window.fetch.bind(window);

window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : (input && input.url) || '';
  if (!url.startsWith(API_URL)) return fetchOriginal(input, init);

  const headers = new Headers(init.headers || {});
  const token = localStorage.getItem('admin_token');
  if (token && !headers.has('Authorization')) headers.set('Authorization', 'Bearer ' + token);

  const reponse = await fetchOriginal(input, { ...init, headers });

  const estConnexion = url.includes('/api/admin-auth/login');
  if (reponse.status === 401 && token && !estConnexion) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.reload();
  }
  return reponse;
};
