import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

// rows: [{date, claimUsd, valueNowUsd, pnlUsd}, ...]
export default function AnalyticsChart({ rows = [] }) {
  const data = useMemo(() => {
    const sorted = [...rows].filter(r => r.date).sort((a, b) => a.date.localeCompare(b.date));
    let cumClaim = 0, cumNow = 0, cumPnl = 0;
    return sorted.map((r) => {
      const claim = Number(r.claimUsd) || 0;
      const now = (Number(r.valueNowUsd) || 0);
      const pnl = (Number(r.pnlUsd) || (now - claim));

      cumClaim += claim;
      cumNow += now;
      cumPnl += pnl;

      return {
        date: r.date,
        claim: Number(cumClaim.toFixed(2)),
        now: Number(cumNow.toFixed(2)),
        pnl: Number(cumPnl.toFixed(2)),
      };
    });
  }, [rows]);

  if (data.length === 0) {
    return <div style={{ color: "#999", padding: 10 }}>Add entries to see analytics.</div>;
  }

  return (
    <div style={{
      background: "var(--card-bg)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: 16,
      width: "100%",
      height: 320
    }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>PnL over time (cumulative)</div>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="claim" />
          <Line type="monotone" dataKey="now" />
          <Line type="monotone" dataKey="pnl" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
