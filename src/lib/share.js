/**
 * Utilitaires de lien public (token) pour la page publique.
 * Exporte: getShareToken, setShareToken, clearShareToken, generateToken, buildShareUrl
 */

const STORAGE_KEY = (wallet) => `share:token:${(wallet||"").toLowerCase()}`;

/** Récupère le token stocké pour ce wallet (ou null) */
export function getShareToken(wallet) {
  try { return localStorage.getItem(STORAGE_KEY(wallet)); }
  catch { return null; }
}

/** Enregistre un token pour ce wallet */
export function setShareToken(wallet, token) {
  try { localStorage.setItem(STORAGE_KEY(wallet), token || ""); }
  catch {}
}

/** Supprime le token pour ce wallet */
export function clearShareToken(wallet) {
  try { localStorage.removeItem(STORAGE_KEY(wallet)); }
  catch {}
}

/** Génère un token court (lisible) */
export function generateToken() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      // court, mais suffisamment unique pour un partage
      return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    }
  } catch {}
  // fallback
  return Math.random().toString(36).slice(2, 14);
}

/**
 * Construit l'URL publique:
 * - HashRouter -> {origin}{pathname}#/public/{wallet}[?token=...]
 * - BrowserRouter -> {origin}/public/{wallet}[?token=...]
 */
export function buildShareUrl(wallet, token) {
  const w = (wallet || "").toLowerCase();
  const base = `${window.location.origin}${window.location.pathname}`;
  const hasHash = true; // ton app utilise HashRouter
  let url = hasHash ? `${base}#/public/${w}` : `${window.location.origin}/public/${w}`;
  if (token) url += `?token=${encodeURIComponent(token)}`;
  return url;
}

export default {
  getShareToken,
  setShareToken,
  clearShareToken,
  generateToken,
  buildShareUrl,
};
