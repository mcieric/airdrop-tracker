// src/lib/storage.js
export function getAirdropData() {
  try {
    const raw = localStorage.getItem("airdrop-tracker")
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getDemoData() {
  return {
    wallet: "0x88ac3d64230c8a453492ff908a02daa27e9b3429",
    tvlUSD: 12456.72,
    realizedUSD: 3821.14,
    airdropCount: 27,
    claims: [
      { token: "ARB", chain: "Arbitrum", date: "2025-10-11", usd: 210.44 },
      { token: "STRK", chain: "Starknet", date: "2025-10-05", usd: 98.12 },
      { token: "TAIKO", chain: "Taiko", date: "2025-09-28", usd: 340.0 },
    ],
  }
}
