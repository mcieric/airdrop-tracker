// src/components/Toolbar.jsx
import React from "react";

export default function Toolbar({
  data = [],
  onImport,
  onRecalcAll,
  onRefreshAll,
  filenameBase = "airdrop-tracker",
  // nouveaux états
  isRefreshingAll = false,
  isRecalculating = false,
}) {
  const download = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const name = `${filenameBase}-${new Date().toISOString().slice(0, 10)}.json`;
    download(blob, name);
  };

  const exportCSV = () => {
    const headers = [
      "date","project","token","qty","cgId","claimUsd",
      "priceNow","valueNowUsd","pnlUsd","soldUsd","id",
    ];
    const esc = (v) => {
      if (v == null) return "";
      const s = String(v);
      const needsWrap = /[",\n]/.test(s);
      const safe = s.replace(/"/g, '""');
      return needsWrap ? `"${safe}"` : safe;
    };
    const rows = data.map((r) => headers.map((h) => esc(r?.[h])));
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const name = `${filenameBase}-${new Date().toISOString().slice(0, 10)}.csv`;
    download(blob, name);
  };

  const importJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error("Le JSON doit être un tableau.");
        onImport?.(parsed);
      } catch (err) {
        alert("Fichier JSON invalide : " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // réimport possible du même fichier
  };

  const btnBase = "px-3 py-1 rounded font-semibold cursor-pointer";
  const dark = { background: "#111418", color: "#fff", border: "1px solid #273142" };
  const accent = { background: "#FCFF52", color: "#000", border: "1px solid #d2d555" };
  const disabledStyle = { opacity: 0.6, cursor: "not-allowed" };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        onClick={exportJSON}
        className={btnBase}
        style={dark}
        title="Exporter vos données en JSON"
      >
        Export JSON
      </button>

      <label
        className={btnBase}
        style={dark}
        title="Importer un fichier JSON exporté"
      >
        Import JSON
        <input
          type="file"
          accept="application/json"
          className="hidden"
          style={{ display: "none" }}
          onChange={importJSON}
        />
      </label>

      <button
        onClick={exportCSV}
        className={btnBase}
        style={dark}
        title="Exporter au format CSV"
      >
        Export CSV
      </button>

      <button
        onClick={onRefreshAll}
        className={btnBase}
        style={{ ...dark, ...(isRefreshingAll ? disabledStyle : null) }}
        title="Récupère les prix CoinGecko pour toutes les lignes"
        disabled={isRefreshingAll}
      >
        {isRefreshingAll ? "Refreshing ALL… ⏳" : "Refresh ALL prices"}
      </button>

      <button
        onClick={onRecalcAll}
        className={btnBase}
        style={{ ...accent, ...(isRecalculating || isRefreshingAll ? disabledStyle : null) }}
        title="Recalcule Value Now & PNL pour toutes les lignes"
        disabled={isRecalculating || isRefreshingAll}
      >
        {isRecalculating ? "Recalculating… ⏳" : "Recalc all"}
      </button>
    </div>
  );
}
