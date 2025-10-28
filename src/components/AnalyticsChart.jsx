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
    const sorted = [...rows]
      .filter((r) => r.date)
      .sort((a, b) => a.date.localeCompare(b.date));

    let cumClaim = 0,
      cumNow = 0,
      cumPnl = 0;

    return sorted.map((r) => {
      const claim = Number(r.claimUsd) || 0;
      const now = Number(r.valueNowUsd) || 0;
      const pnl = Number.isFinite(Number(r.pnlUsd))
        ? Number(r.pnlUsd)
        : now - claim;

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
    return (
      <div style={{ color: "#999", padding: 10 }}>
        Add entries to see analytics.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 16,
        width: "100%",
        height: 320,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 8 }}>
        PnL over time (cumulative)
      </div>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="date" stroke="#aaa" tick={{ fill: "#aaa" }} />
          <YAxis stroke="#aaa" tick={{ fill: "#aaa" }} />

          {/* Tooltip en dark mode */}
          <Tooltip
            contentStyle={{
              background: "rgba(20,20,20,0.95)",
              border: "1px solid #2b2b2b",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              color: "#e5e7eb",
            }}
            labelStyle={{ color: "#a3a3a3", fontWeight: 600 }}
            itemStyle={{ color: "#e5e7eb" }}
            wrapperStyle={{ outline: "none" }}
          />

          <Legend />

          {/* Claim — jaune */}
          <Line
            type="monotone"
            dataKey="claim"
            name="claim"
            stroke="#FFD700"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />

          {/* Now — cyan */}
          <Line
            type="monotone"
            dataKey="now"
            name="now"
            stroke="#00FFFF"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />

          {/* PNL — rouge */}
          <Line
            type="monotone"
            dataKey="pnl"
            name="pnl"
            stroke="#FF4500"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
