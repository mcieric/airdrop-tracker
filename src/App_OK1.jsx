import { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo.png"; // <- ton logo local

import Toolbar from "./components/Toolbar";
// ...
<Toolbar data={airdrops} onImport={(payload) => setAirdrops(payload)}/>


const CELO_YELLOW = "#FCFF52";
const BG = "#1A1A1A";
const LS_KEY = "airdrop_tracker_rows_v1";

function usd(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export default function App() {
  // --- Data & persistence ---
  const [rows, setRows] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) ?? []; }
    catch { return []; }
  });
  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(rows)); }, [rows]);

  const [loadingId, setLoadingId] = useState(null);

  // --- Totals ---
  const totals = useMemo(() => {
    const claim = rows.reduce((s, r) => s + (Number(r.claimUsd) || 0), 0);
    const current = rows.reduce(
      (s, r) => s + (Number(r.qty) || 0) * (Number(r.priceNow) || 0),
      0
    );
    return { claim, current, pnl: current - claim };
  }, [rows]);

  // --- Row helpers ---
  const addRow = () =>
    setRows((r) => [
      ...r,
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().slice(0, 10),
        project: "",
        token: "",
        qty: 0,
        cgId: "",
        claimUsd: 0,
        priceNow: 0,
        soldUsd: null,
      },
    ]);

  const updateRow = (id, patch) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const removeRow = (id) => setRows((r) => r.filter((x) => x.id !== id));

  async function refreshPrice(id, cgId) {
    if (!cgId) return;
    setLoadingId(id);
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
        cgId
      )}&vs_currencies=usd`;
      const res = await fetch(url);
      const j = await res.json();
      const p = j?.[cgId]?.usd;
      if (typeof p === "number") updateRow(id, { priceNow: p });
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <main
      style={{
        background: BG,
        color: "white",
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "Inter, system-ui, Arial, sans-serif",
      }}
    >
      {/* HEADER avec logo + badge jaune */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: CELO_YELLOW,
            color: "#000",
            padding: "10px 20px",
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: "1px",
            boxShadow: "0 8px 30px rgba(252,255,82,0.25)",
          }}
        >
          <img
            src={logo}
            alt="Airdrop Tracker"
            style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          AIRDROP TRACKER
        </div>
      </div>

      {/* TOTAL CARDS */}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 40,
          marginBottom: 30,
          flexWrap: "wrap",
        }}
      >
        <Card title="Claim Total" value={usd(totals.claim)} />
        <Card title="Current Total" value={usd(totals.current)} accent />
        <Card
          title="Total PNL"
          value={usd(totals.pnl)}
          tone={totals.pnl > 0 ? "good" : totals.pnl < 0 ? "bad" : "neutral"}
        />
      </section>

      {/* TABLE */}
      <section style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: "bold" }}>Airdrops</h2>
          <button
            onClick={addRow}
            style={{
              background: CELO_YELLOW,
              color: "black",
              fontWeight: 600,
              border: "none",
              borderRadius: 6,
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            + Add
          </button>
        </div>

        <div style={{ overflowX: "auto", border: "1px solid #333", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#111", color: "#ccc" }}>
              <tr>
                <Th>Date</Th>
                <Th>Project</Th>
                <Th>Token</Th>
                <Th align="right">Quantity</Th>
                <Th>CoinGecko ID</Th>
                <Th align="right">Claim Value ($)</Th>
                <Th align="right">Value Now ($)</Th>
                <Th align="right">PNL ($)</Th>
                <Th align="right">PNL (%)</Th>
                <Th align="right">HOLD / SELL</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: 20, color: "#999" }}>
                    Click “+ Add” to start.
                  </td>
                </tr>
              )}

              {rows.map((r) => {
                const current = (Number(r.qty) || 0) * (Number(r.priceNow) || 0);
                const pnl = current - (Number(r.claimUsd) || 0);
                const pct = r.claimUsd ? pnl / Number(r.claimUsd) : 0;
                const pctStr = r.claimUsd ? `${(pct * 100).toFixed(2)}%` : "—";
                const pctColor = pct > 0 ? "limegreen" : pct < 0 ? "red" : "#ccc";
                const mood = pct > 0 ? "😄" : pct < 0 ? "😞" : "😐";

                return (
                  <tr key={r.id} style={{ borderTop: "1px solid #333" }}>
                    <Td>
                      <input
                        type="date"
                        value={r.date}
                        onChange={(e) => updateRow(r.id, { date: e.target.value })}
                        style={inputStyle}
                      />
                    </Td>
                    <Td>
                      <input
                        value={r.project}
                        onChange={(e) => updateRow(r.id, { project: e.target.value })}
                        placeholder="Project"
                        style={inputStyle}
                      />
                    </Td>
                    <Td>
                      <input
                        value={r.token}
                        onChange={(e) => updateRow(r.id, { token: e.target.value })}
                        placeholder="CELO"
                        style={inputStyle}
                      />
                    </Td>
                    <Td align="right">
                      <input
                        type="number"
                        step="any"
                        value={r.qty}
                        onChange={(e) => updateRow(r.id, { qty: Number(e.target.value) })}
                        style={{ ...inputStyle, width: 90, textAlign: "right" }}
                      />
                    </Td>
                    <Td>
                      <input
                        value={r.cgId}
                        onChange={(e) => updateRow(r.id, { cgId: e.target.value })}
                        placeholder="celo"
                        style={inputStyle}
                      />
                    </Td>
                    <Td align="right">
                      <input
                        type="number"
                        step="any"
                        value={r.claimUsd}
                        onChange={(e) => updateRow(r.id, { claimUsd: Number(e.target.value) })}
                        style={{ ...inputStyle, width: 110, textAlign: "right" }}
                      />
                    </Td>
                    <Td align="right">
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <span>{usd(current)}</span>
                        <button
                          onClick={() => refreshPrice(r.id, r.cgId)}
                          disabled={!r.cgId || loadingId === r.id}
                          style={{
                            background: CELO_YELLOW,
                            border: "none",
                            padding: "2px 6px",
                            borderRadius: 4,
                            cursor: "pointer",
                            opacity: loadingId === r.id ? 0.6 : 1,
                            fontWeight: "bold",
                          }}
                          title="Refresh price"
                        >
                          {loadingId === r.id ? "…" : "↻"}
                        </button>
                      </div>
                    </Td>
                    <Td align="right" style={{ color: pnl > 0 ? "limegreen" : pnl < 0 ? "red" : "#ccc" }}>
                      {usd(pnl)}
                    </Td>
                    <Td align="right" style={{ color: pctColor }}>
                      {pctStr} {mood}
                    </Td>
                    <Td align="right">
                      {r.soldUsd ? (
                        <span style={{ color: "limegreen", fontWeight: 600 }}>
                          SOLD ✅ ({usd(r.soldUsd)})
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            const val = prompt("How much did you sell (in USD)?");
                            const n = Number(val);
                            if (!Number.isNaN(n) && n > 0) updateRow(r.id, { soldUsd: n });
                          }}
                          style={{
                            background: CELO_YELLOW,
                            border: "none",
                            padding: "4px 10px",
                            borderRadius: 4,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          SELL
                        </button>
                      )}
                    </Td>
                    <Td align="right">
                      <button
                        onClick={() => removeRow(r.id)}
                        style={{ color: "#888", background: "none", border: "none", cursor: "pointer" }}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer style={{ textAlign: "center", marginTop: 30, color: "#777", fontSize: 12 }}>
          Prices from CoinGecko • CELO yellow theme • Data saved locally
        </footer>
      </section>
    </main>
  );
}

const inputStyle = {
  background: "transparent",
  color: "white",
  border: "1px solid #333",
  borderRadius: 6,
  padding: "6px 8px",
  width: "100%",
  outline: "none",
};

function Card({ title, value, accent = false, tone = "neutral" }) {
  const color = tone === "good" ? "limegreen" : tone === "bad" ? "red" : "white";
  return (
    <div
      style={{
        background: "#121212",
        borderRadius: 12,
        padding: 20,
        border: `1px solid ${CELO_YELLOW}`,
        width: 240,
        textAlign: "center",
        boxShadow: "0 0 10px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ fontSize: 12, color: "#aaa" }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: accent ? CELO_YELLOW : color }}>
        {value}
      </div>
    </div>
  );
}

function Th({ children, align = "left" }) {
  return (
    <th
      style={{
        textAlign: align,
        padding: "10px 12px",
        fontWeight: 700,
        fontSize: 14,
        borderBottom: "1px solid #222",
      }}
    >
      {children}
    </th>
  );
}
function Td({ children, align = "left" }) {
  return <td style={{ textAlign: align, padding: "8px 12px" }}>{children}</td>;
}
