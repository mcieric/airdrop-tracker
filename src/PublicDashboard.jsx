// src/PublicDashboard.jsx
import React, { useState, useEffect } from "react"
import { useParams, Link, useLocation } from "react-router-dom"
import { getAirdropData, getDemoData } from "./lib/storage"
import {
  getShareToken,
  setShareToken,
  clearShareToken,
  generateToken,
  buildShareUrl,
} from "./lib/share"
import { setMetaTags } from "./lib/meta"

// Lire ?token=... dans l'URL
function useQuery() {
  const { search } = useLocation()
  return new URLSearchParams(search)
}

// Masque l'adresse (0x88ac…3429)
const maskWallet = (addr) =>
  addr ? addr.replace(/^(0x[0-9a-fA-F]{6}).+([0-9a-fA-F]{4})$/, "$1…$2") : ""

export default function PublicDashboard() {
  const { wallet: rawWallet } = useParams()
  const wallet = (rawWallet || "0x88ac3d64230c8a453492ff908a02daa27e9b3429").toLowerCase()
  const query = useQuery()
  const tokenFromUrl = query.get("token") || null

  const [data, setData] = useState(null)
  const [copied, setCopied] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  // 1) Charger données depuis localStorage (ou démo)
  useEffect(() => {
    const stored = getAirdropData()
    setData(stored || getDemoData())
  }, [])

  // 2) Contrôle d’accès via token (si un token existe pour ce wallet)
  useEffect(() => {
    const t = getShareToken(wallet)
    if (!t) return // pas de token => accès libre
    if (t && tokenFromUrl !== t) {
      setForbidden(true) // token requis mais manquant/incorrect
    } else {
      setForbidden(false)
    }
  }, [wallet, tokenFromUrl])

  // 3) Mettre à jour les meta tags (OG/Twitter) quand les données sont prêtes
  useEffect(() => {
    if (data) {
      setMetaTags({
        wallet,
        tvlUSD: Number(data.tvlUSD) || 0,
        realizedUSD: Number(data.realizedUSD) || 0,
      })
    }
  }, [data, wallet])

  // 4) Générer un token et afficher l’URL prête à partager
  const onEnableShare = () => {
    const t = generateToken()
    setShareToken(wallet, t)
    const url = buildShareUrl(wallet, t)
    setShareUrl(url)
  }

  // 5) Copier l’URL (tokenisée si un token existe)
  const onCopy = async () => {
    const t = getShareToken(wallet)
    const url = t
      ? buildShareUrl(wallet, t)
      : window.location.origin + `/public/${wallet}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // 6) Désactiver le lien public (supprime le token)
  const onDisableShare = () => {
    clearShareToken(wallet)
    setShareUrl("")
  }

  if (forbidden) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Access denied</h1>
        <p className="mb-4">
          Ce dashboard public est protégé par un <strong>token</strong>. Le lien doit contenir{" "}
          <code>?token=...</code>.
        </p>
        <p className="text-sm opacity-70">
          Astuce (proprio)&nbsp;: ouvre cette page sans <code>?token=</code>, clique
          “Activer lien public (token)” puis “Copier”.
        </p>
        <Link to="/" className="underline mt-4 inline-block">
          Back to app
        </Link>
      </div>
    )
  }

  if (!data) return <p className="p-6">Loading...</p>

  return (
    <div className="mx-auto max-w-6xl p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 py-4">
        <div>
          <h1 className="text-2xl font-semibold">Airdrop Tracker — Public</h1>
          <p className="text-sm opacity-70">Lecture seule — données depuis localStorage</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onEnableShare} className="px-3 py-2 rounded-2xl border hover:shadow">
            Activer lien public (token)
          </button>
          <button onClick={onCopy} className="px-3 py-2 rounded-2xl border hover:shadow">
            {copied ? "Lien copié ✓" : "Copier le lien"}
          </button>
          <button onClick={onDisableShare} className="px-3 py-2 rounded-2xl border hover:shadow">
            Désactiver le lien
          </button>
          <Link to="/" className="underline text-sm opacity-80 hover:opacity-100">
            Back to app
          </Link>
        </div>
      </div>

      {shareUrl && (
        <p className="text-xs opacity-70 mt-1 break-all">Lien généré : {shareUrl}</p>
      )}

      {/* Wallet Card */}
      <div className="rounded-2xl border p-4 bg-white/50 mt-3">
        <p className="text-xs uppercase opacity-60 mb-1">Wallet</p>
        <div className="flex items-center justify-between">
          <div className="font-medium">{maskWallet(wallet)}</div>
          <a
            className="text-xs underline opacity-80 hover:opacity-100"
            href={`https://debank.com/profile/${wallet}`}
            target="_blank"
            rel="noreferrer"
          >
            View on DeBank
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <div className="rounded-2xl border p-4">
          <div className="text-xs uppercase opacity-60 mb-1">TVL (USD)</div>
          <div className="text-2xl font-semibold">
            ${Number(data.tvlUSD).toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-xs uppercase opacity-60 mb-1">Realized PnL (USD)</div>
          <div className="text-2xl font-semibold">
            ${Number(data.realizedUSD).toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-xs uppercase opacity-60 mb-1"># Airdrops</div>
          <div className="text-2xl font-semibold">
            {Number(data.airdropCount).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="mt-6 rounded-2xl border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 text-sm font-semibold">
          Recent claims
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-2">Token</th>
                <th className="px-4 py-2">Chain</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Value (USD)</th>
              </tr>
            </thead>
            <tbody>
              {(data.claims || data.recentClaims || []).map((c, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 font-medium">{c.token}</td>
                  <td className="px-4 py-2">{c.chain}</td>
                  <td className="px-4 py-2">{c.date}</td>
                  <td className="px-4 py-2">${Number(c.usd).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Privacy Note */}
      <p className="mt-4 text-xs opacity-60">
        Cette vue publique masque les secrets : API keys, notes privées, tags internes, etc.
      </p>
    </div>
  )
}
