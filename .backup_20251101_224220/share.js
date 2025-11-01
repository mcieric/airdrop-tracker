// src/lib/share.js
// Gestion des liens publics tokenisés (création, vérif, suppression)

const KEY_PREFIX = "airdrop-share:" // chaque wallet a sa clé unique

// 🔑 Récupère le token associé à un wallet
export function getShareToken(wallet) {
  if (!wallet) return null
  return localStorage.getItem(KEY_PREFIX + wallet.toLowerCase())
}

// 💾 Enregistre un token pour un wallet
export function setShareToken(wallet, token) {
  if (!wallet || !token) return
  localStorage.setItem(KEY_PREFIX + wallet.toLowerCase(), token)
}

// 🧹 Supprime le token (désactive le lien public)
export function clearShareToken(wallet) {
  if (!wallet) return
  localStorage.removeItem(KEY_PREFIX + wallet.toLowerCase())
}

// ⚙️ Génère un token aléatoire (par ex. “ab29dlf84hz0...”)
export function generateToken(len = 24) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
  let out = ""
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

// 🔗 Construit l’URL complète à partager
export function buildShareUrl(wallet, token) {
  const base = window.location.origin
  return `${base}/public/${wallet.toLowerCase()}?token=${encodeURIComponent(token)}`
}
