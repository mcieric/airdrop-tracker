import { useEffect, useMemo, useRef, useState } from "react";
import "./theme.css";
import { useTheme } from "./theme";
import logo from "./assets/logo.png";
import Toolbar from "./components/Toolbar";
import AnalyticsChart from "./components/AnalyticsChart";

const CELO_YELLOW = "#FCFF52";
const LS_KEY = "airdrop_tracker_rows_v1";

function usd(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}
const toNum = (v) => (Number.isFinite(v) ? v : Number(v || 0));

function calcRow(row, priceNow) {
  const qty = toNum(row.qty);
  const claim = toNum(row.claimUsd);
  const now = qty * toNum(priceNow);
  const pnl = now - claim;
  return {
    valueNowUsd: Number(now.toFixed(2)),
    pnlUsd: Number(pnl.toFixed(2)),
  };
}
function calcTotals(rows) {
  return rows.reduce(
    (acc, r) => {
      const claim = toNum(r.claimUsd);
      const now =
        r.valueNowUsd != null
          ? toNum(r.valueNowUsd)
          : toNum(r.qty) * toNum(r.priceNow);
      const pnl = r.pnlUsd != null ? toNum(r.pnlUsd) : now - claim;
      acc.claim += claim;
      acc.now += now;
      acc.pnl += pnl;
      return acc;
    },
    { claim: 0, now: 0, pnl: 0 }
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();

  // persistence
  const [rows, setRows] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) ?? [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
  }, [rows]);

  // ui states
  const [loadingId, setLoadingId] = useState(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [recalcBusy, setRecalcBusy] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // filters/sort
  const [q, setQ] = useState("");
  const [fProject, setFProject] = useState("");
  const [fToken, setFToken] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const totals = useMemo(() => {
    const t = calcTotals(rows);
    return {
      claim: Number(t.claim.toFixed(2)),
      current: Number(t.now.toFixed(2)),
      pnl: Number(t.pnl.toFixed(2)),
    };
  }, [rows]);

  // derived rows with filters/sort
  const displayedRows = useMemo(() => {
    const term = q.trim().toLowerCase();
    let r = rows.filter((x) => {
      const okQ =
        !term ||
        (x.project || "").toLowerCase().includes(term) ||
        (x.token || "").toLowerCase().includes(term) ||
        (x.cgId || "").toLowerCase().includes(term);
      const okP = !fProject || (x.project || "").toLowerCase().includes(fProject.toLowerCase());
      const okT = !fToken || (x.token || "").toLowerCase().includes(fToken.toLowerCase());
      return okQ && okP && okT;
    });
    r.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const A = sortKey === "pnl" ? (a.pnlUsd ?? (toNum(a.qty)*toNum(a.priceNow)-toNum(a.claimUsd)))
              : sortKey === "now" ? (a.valueNowUsd ?? (toNum(a.qty)*toNum(a.priceNow)))
              : sortKey === "claim" ? toNum(a.claimUsd)
              : sortKey === "token" ? (a.token||"")
              : sortKey === "project" ? (a.project||"")
              : (a.date || "");
      const B = sortKey === "pnl" ? (b.pnlUsd ?? (toNum(b.qty)*toNum(b.priceNow)-toNum(b.claimUsd)))
              : sortKey === "now" ? (b.valueNowUsd ?? (toNum(b.qty)*toNum(b.priceNow)))
              : sortKey === "claim" ? toNum(b.claimUsd)
              : sortKey === "token" ? (b.token||"")
              : sortKey === "project" ? (b.project||"")
              : (b.date || "");
      if (A < B) return -1 * dir;
      if (A > B) return 1 * dir;
      return 0;
    });
    return r;
  }, [rows, q, fProject, fToken, sortKey, sortDir]);

  // row helpers
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
        valueNowUsd: 0,
        pnlUsd: 0,
        soldUsd: null,
      },
    ]);

  const updateRow = (id, patch) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeRow = (id) => setRows((r) => r.filter((x) => x.id !== id));

  const recalcAll = () => {
    setRecalcBusy(true);
    setRows((rws) =>
      rws.map((row) => {
        const { valueNowUsd, pnlUsd } = calcRow(row, toNum(row.priceNow));
        return { ...row, valueNowUsd, pnlUsd };
      })
    );
    setTimeout(() => setRecalcBusy(false), 150);
  };

  async function refreshPrice(id, cgIdRaw) {
    const cgId = cgIdRaw?.toLowerCase()?.trim();
    if (!cgId) return;
    setLoadingId(id);
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
        cgId
      )}&vs_currencies=usd`;
      const res = await fetch(url);
      const j = await res.json();
      const price = j?.[cgId]?.usd;
      if (typeof price === "number") {
        const row = rows.find((r) => r.id === id);
        const { valueNowUsd, pnlUsd } = calcRow(row || {}, price);
        updateRow(id, { priceNow: price, valueNowUsd, pnlUsd });
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors du refresh de ce prix.");
    } finally {
      setLoadingId(null);
    }
  }

  async function refreshAllPrices() {
    const ids = Array.from(
      new Set(rows.map((r) => r.cgId?.toLowerCase()?.trim()).filter(Boolean))
    );
    if (ids.length === 0) return;
    setLoadingAll(true);
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
        ids.join(",")
      )}&vs_currencies=usd`;
      const res = await fetch(url);
      const data = await res.json();

      setRows((prev) =>
        prev.map((row) => {
          const key = row.cgId?.toLowerCase()?.trim();
          const price = key ? data?.[key]?.usd : undefined;
          if (typeof price === "number") {
            const { valueNowUsd, pnlUsd } = calcRow(row, price);
            return { ...row, priceNow: price, valueNowUsd, pnlUsd };
          }
          return row;
        })
      );
    } catch (e) {
      console.error(e);
      alert("Erreur lors du refresh global des prix CoinGecko.");
    } finally {
      setLoadingAll(false);
    }
  }

  // Export PDF
  const pdfRef = useRef(null);
  async function handleExportPdf() {
    try {
      setExportingPdf(true);
      const [{ jsPDF }, html2canvas] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const node = pdfRef.current;
      const canvas = await html2canvas.default(node, {
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      const x = (pageWidth - w) / 2;
      const y = (pageHeight - h) / 2;
      pdf.addImage(imgData, "PNG", x, y, w, h);
      pdf.save(`airdrop-tracker-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF export failed.");
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <main
      style={{
        background: "var(--bg)",
        color: "var(--fg)",
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "Inter, system-ui, Arial, sans-serif",
      }}
    >
      {/* HEADER */}
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
          <button
            onClick={toggleTheme}
            style={{
              marginLeft: 12,
              background: "transparent",
              color: "#000",
              border: "1px solid #000",
              borderRadius: 8,
              padding: "4px 10px",
              fontWeight: 700,
              cursor: "pointer",
              lineHeight: 1,
            }}
            title="Toggle light/dark"
          >
            {theme === "light" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ maxWidth: 1360, margin: "0 auto", marginBottom: 12 }}>
        <Toolbar
          data={rows}
          filenameBase="airdrop-tracker"
          onImport={(payload) => {
            if (Array.isArray(payload)) setRows(payload);
            else alert("Fichier JSON invalide (attendu: tableau de lignes).");
          }}
          onRecalcAll={recalcAll}
          onRefreshAll={refreshAllPrices}
          onExportPdf={handleExportPdf}
          isRefreshingAll={loadingAll}
          isRecalculating={recalcBusy}
          isExportingPdf={exportingPdf}
        />
      </div>

      <div ref={pdfRef}>
        {/* TOTAL CARDS */}
        <section
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <Card title="Claim Total" value={usd(totals.claim)} />
          <Card title="Current Total" value={usd(totals.current)} accent theme={theme} />
          <Card
            title="Total PNL"
            value={usd(totals.pnl)}
            tone={totals.pnl > 0 ? "good" : totals.pnl < 0 ? "bad" : "neutral"}
          />
        </section>

        {/* ANALYTICS */}
        <section style={{ maxWidth: 1360, margin: "0 auto", marginBottom: 18 }}>
          <AnalyticsChart rows={displayedRows} />
        </section>

        {/* FILTERS */}
        <section style={{ maxWidth: 1360, margin: "0 auto", marginBottom: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              placeholder="Search (project/token/cgId)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Filter: Project"
              value={fProject}
              onChange={(e) => setFProject(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Filter: Token"
              value={fToken}
              onChange={(e) => setFToken(e.target.value)}
              style={inputStyle}
            />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              style={inputStyle}
            >
              <option value="date">Sort by Date</option>
              <option value="project">Sort by Project</option>
              <option value="token">Sort by Token</option>
              <option value="claim">Sort by Claim $</option>
              <option value="now">Sort by Value Now $</option>
              <option value="pnl">Sort by PNL $</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              style={inputStyle}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </section>

        {/* TABLE */}
        <section style={{ maxWidth: 1360, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: "bold" }}>Airdrops</h2>
            <button
              onClick={addRow}
              style={{
                background: CELO_YELLOW,
                color: "#000",
                fontWeight: 700,
                border: "none",
                borderRadius: 10,
                padding: "10px 18px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(252,255,82,0.3)",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
            >
              + Add
            </button>
          </div>

          <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
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
                {displayedRows.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ textAlign: "center", padding: 20, color: "#999" }}>
                      No rows match filters.
                    </td>
                  </tr>
                )}

                {displayedRows.map((r) => {
                  const current =
                    r.valueNowUsd != null
                      ? toNum(r.valueNowUsd)
                      : toNum(r.qty) * toNum(r.priceNow);
                  const pnl =
                    r.pnlUsd != null ? toNum(r.pnlUsd) : current - toNum(r.claimUsd);
                  const pct = toNum(r.claimUsd) ? pnl / toNum(r.claimUsd) : 0;
                  const pctStr = toNum(r.claimUsd) ? `${(pct * 100).toFixed(2)}%` : "—";
                  const pctColor = pct > 0 ? "limegreen" : pct < 0 ? "red" : "#ccc";
                  const mood = pct > 0 ? "😄" : pct < 0 ? "😞" : "😐";

                  return (
                    <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
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
                          onBlur={() => {
                            const { valueNowUsd, pnlUsd } = calcRow(r, r.priceNow);
                            updateRow(r.id, { valueNowUsd, pnlUsd });
                          }}
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
                          onBlur={() => {
                            const { valueNowUsd, pnlUsd } = calcRow(r, r.priceNow);
                            updateRow(r.id, { valueNowUsd, pnlUsd });
                          }}
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
                      <Td align="right" style={{ minWidth: 70 }}>
                        <button
                          onClick={() => {
                            if (confirm("Supprimer cette ligne ?")) removeRow(r.id);
                          }}
                          title="Delete"
                          aria-label="Delete row"
                          style={{
                            background: "#ff3b30",
                            color: "#fff",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: 10,
                            fontWeight: 800,
                            lineHeight: 1,
                            cursor: "pointer",
                            boxShadow: "0 6px 18px rgba(255,59,48,0.45)",
                            transform: "translateY(0)",
                            transition: "all .18s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
                          onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                        >
                          ✖
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
      </div>
    </main>
  );
}

const inputStyle = {
  background: "transparent",
  color: "var(--fg)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "6px 8px",
  width: "100%",
  outline: "none",
};

function Card({ title, value, accent = false, tone = "neutral", theme = "dark" }) {
  const baseColor = tone === "good" ? "limegreen" : tone === "bad" ? "red" : "var(--fg)";
  const accentColor = theme === "dark" ? CELO_YELLOW : "#000000";
  return (
    <div
      style={{
        background: "var(--card-bg)",
        borderRadius: 12,
        padding: 20,
        border: `1px solid var(--border)`,
        width: 300,
        textAlign: "center",
        boxShadow: "0 0 10px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontSize: 12, color: "#aaa" }}>{title}</div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          marginTop: 6,
          color: accent ? accentColor : baseColor,
        }}
      >
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
        padding: "14px 12px",
        fontWeight: 700,
        fontSize: 14,
        borderBottom: "1px solid var(--border)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}
function Td({ children, align = "left" }) {
  return <td style={{ textAlign: align, padding: "10px 12px" }}>{children}</td>;
}
