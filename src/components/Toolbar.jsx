import React from "react";
import { Link } from "react-router-dom";
// Si CopySnapshotButton n’existe pas chez toi, commente la ligne suivante.
import CopySnapshotButton from "./CopySnapshotButton.jsx";

/**
 * Toolbar — barre d’actions du dashboard
 *
 * Props attendues (toutes optionnelles mais recommandées) :
 * - currentWallet: string | undefined
 * - onExportJSON: () => void
 * - onImportJSON: () => void
 * - onExportCSV: () => void
 * - onRefreshAll: () => void
 * - onRecalcAll: () => void
 * - onExportPDF: () => void
 * - isRefreshingAll: boolean
 */
export default function Toolbar({
  currentWallet,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  onRefreshAll,
  onRecalcAll,
  onExportPDF,
  isRefreshingAll,
}) {
  const walletLower =
    typeof currentWallet === "string" && currentWallet.length > 0
      ? currentWallet.toLowerCase()
      : "";

  // Lien public : /public/<wallet> si dispo, sinon /public
  const publicHref = walletLower ? `/public/${walletLower}` : "/public";

  return (
    <div className="toolbar">
      <div className="toolbar-inner" style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        {/* Titre + logo déjà gérés ailleurs ; ici juste les boutons */}
        <div className="actions-left" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn" onClick={onExportJSON} title="Export JSON">
            Export JSON
          </button>
          <button className="btn" onClick={onImportJSON} title="Import JSON">
            Import JSON
          </button>
          <button className="btn" onClick={onExportCSV} title="Export CSV">
            Export CSV
          </button>
          <button
            className="btn"
            onClick={onRefreshAll}
            disabled={!!isRefreshingAll}
            title="Refresh CoinGecko prices for all rows"
          >
            Refresh ALL prices
          </button>
          <button className="btn" onClick={onRecalcAll} title="Recalculate all">
            Recalc all
          </button>
          <button className="btn" onClick={onExportPDF} title="Export PDF">
            Export PDF
          </button>
        </div>

        <div className="actions-right" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {/* Bouton vers la page publique */}
          <Link className="btn btn-yellow" to={publicHref} title="Open the read-only public view">
            View public page
          </Link>

          {/* Bouton snapshot (optionnel) — commente l’import plus haut si tu ne l’as pas */}
          {typeof CopySnapshotButton === "function" && (
            <CopySnapshotButton wallet={currentWallet} />
          )}
        </div>
      </div>
    </div>
  );
}
