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

function useQuery() {
  const { search } = useLocation()
  return new URLSearchParams(search)
}

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

  useEffect(() => {
    const stored = getAirdropData()
    setData(stored || getDemoData())
  }, [])

  useEffect(() => {
    const t = getShareToken(wallet)
    if (!t) return
    if (t && tokenFromUrl !== t) setForbidden(true)
    else setForbidden(false)
  }, [wallet, tokenFromUrl])

  useEffect(() => {
    if (data) {
      setMetaTags({
        wallet,
        tvlUSD: Number(data.tvlUSD) || 0,
        realizedUSD: Number(data.realizedUSD) || 0,
      })
    }
  }, [data, wallet])

  const onEnableShare = () => {
    const t = generateToken()
    setShareToken(wallet, t)
    const url = buildShareUrl(wallet, t)
    setShareUrl(url)
  }

  const onCopy = async () => {
    const t = getShareToken(wallet)
    const url = t
      ? buildShareUrl(wallet, t)
      : window.location.origin + `/public/${wallet}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const onDisableShare = () => {
    clearShareToken(wallet)
    setShareUrl("")
  }

  if (forbidden) {
    return (
      <div className="container-app">
        <div className="card">
          <h1 className="text-2xl font-semibold mb-2">Access denied</h1>
          <p className="mb-2">
            Ce dashboard public est protégé par un <strong>token</strong>. Le lien doit contenir <code>?token=...</code>.
          </p>
          <p className="text-sm text-textDim">
            Astuce (proprio) : ouvre cette page sans <code>?token=</code>, clique “Activer lien public (token)” puis “Copier”.
          </p>
          <Link to="/" className="btn-ghost mt-4">Back to app</Link>
        </div>
      </div>
    )
  }

  if (!data) return <div className="container-app"><div className="card">Loading…</div></div>

  return (
    <div className="container-app">
      {/* Title row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Airdrop Tracker — Public</h1>
          <p className="text-sm text-textDim">Lecture seule — données depuis localStorage</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onEnableShare} className="btn-yellow">Activer lien public (token)</button>
          <button onClick={onCopy} className="btn">{copied ? "Lien copié ✓" : "Copier le lien"}</button>
          <button onClick={onDisableShare} className="btn">Désactiver le lien</button>
          <Link to="/" className="btn-ghost">Back to app</Link>
        </div>
      </div>

      {shareUrl && (
        <p className="text-xs text-textDim mt-1 break-all mb-3">Lien généré : {shareUrl}</p>
      )}

      {/* Wallet card */}
      <div className="card mb-4">
        <p className="text-xs uppercase tracking-wider text-textDim mb-1">Wallet</p>
        <div className="flex items-center justify-between">
          <div className="font-medium">{maskWallet(wallet)}</div>
          <a
            className="text-xs underline text-textDim hover:text-white"
            href={`https://debank.com/profile/${wallet}`}
            target="_blank" rel="noreferrer"
          >
            View on DeBank
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="kpi">
          <div className="label">TVL (USD)</div>
          <div className="value">${Number(data.tvlUSD).toLocaleString()}</div>
        </div>
        <div className="kpi">
          <div className="label">Realized PnL (USD)</div>
          <div className="value">${Number(data.realizedUSD).toLocaleString()}</div>
        </div>
        <div className="kpi">
          <div className="label"># Airdrops</div>
          <div className="value">{Number(data.airdropCount).toLocaleString()}</div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap mt-6">
        <div className="table-head px-4 py-3">Recent claims</div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-left">
                <th>Token</th>
                <th>Chain</th>
                <th>Date</th>
                <th>Value (USD)</th>
              </tr>
            </thead>
            <tbody>
              {(data.claims || data.recentClaims || []).map((c, i) => (
                <tr key={i}>
                  <td className="font-medium">{c.token}</td>
                  <td>{c.chain}</td>
                  <td>{c.date}</td>
                  <td>${Number(c.usd).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-textDim">
        Cette vue publique masque les secrets : API keys, notes privées, tags internes, etc.
      </p>
    </div>
  )
}
