import React, { useState, useEffect } from "react";

export default function App() {
  const [airdrops, setAirdrops] = useState(() => {
    const saved = localStorage.getItem("airdrops");
    return saved ? JSON.parse(saved) : [];
  });

  const [totals, setTotals] = useState({ claim: 0, current: 0, pnl: 0 });

  useEffect(() => {
    localStorage.setItem("airdrops", JSON.stringify(airdrops));
    const claim = airdrops.reduce((sum, a) => sum + (a.claimValue || 0), 0);
    const current = airdrops.reduce((sum, a) => sum + (a.valueNow || 0), 0);
    const pnl = current - claim;
    setTotals({ claim, current, pnl });
  }, [airdrops]);

  const addAirdrop = () => {
    const newItem = {
      date: new Date().toLocaleDateString(),
      project: "",
      token: "",
      quantity: 0,
      claimValue: 0,
      valueNow: 0,
    };
    setAirdrops([...airdrops, newItem]);
  };

  return (
    <div
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        padding: "40px 20px",
      }}
    >
      {/* HEADER avec logo */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#FCFF52",
            color: "#000",
            padding: "10px 18px",
            borderRadius: 14,
            boxShadow: "0 4px 20px rgba(252,255,82,0.15)",
          }}
        >
          <img
            src="/logo.png"
            alt="Airdrop Tracker"
            style={{
              width: 36,
              height: 36,
              objectFit: "contain",
            }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div
            style={{
              fontWeight: 900,
              fontSize: 24,
              letterSpacing: "1px",
            }}
          >
            AIRDROP TRACKER
          </div>
        </div>
      </div>

      {/* TOTALS */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 30,
          flexWrap: "wrap",
          marginBottom: 40,
        }}
      >
        {[
          { label: "Claim Total", value: totals.claim },
          { label: "Current Total", value: totals.current },
          { label: "Total PNL", value: totals.pnl },
        ].map((t, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #FCFF52",
              borderRadius: 12,
              padding: "18px 36px",
              minWidth: 220,
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(252,255,82,0.1)",
            }}
          >
            <div style={{ color: "#bbb", fontSize: 14 }}>{t.label}</div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 22,
                color: "#FCFF52",
                marginTop: 4,
              }}
            >
              {t.value.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 22 }}>Airdrops</h2>
          <button
            onClick={addAirdrop}
            style={{
              background: "#FCFF52",
              color: "#000",
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#e0e341")}
            onMouseOut={(e) => (e.target.style.background = "#FCFF52")}
          >
            + Add
          </button>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#181818",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ background: "#222" }}>
              {[
                "Date",
                "Project",
                "Token",
                "Quantity",
                "Claim Value ($)",
                "Value Now ($)",
                "PNL ($)",
                "PNL (%)",
                "HOLD / SELL",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 8px",
                    textAlign: "left",
                    fontSize: 13,
                    color: "#ddd",
                    borderBottom: "1px solid #333",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {airdrops.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    color: "#888",
                    padding: "24px 0",
                  }}
                >
                  Click “+ Add” to start.
                </td>
              </tr>
            ) : (
              airdrops.map((a, i) => (
                <tr key={i}>
                  <td style={td}>{a.date}</td>
                  <td style={td}>{a.project}</td>
                  <td style={td}>{a.token}</td>
                  <td style={td}>{a.quantity}</td>
                  <td style={td}>${a.claimValue}</td>
                  <td style={td}>${a.valueNow}</td>
                  <td style={td}>${(a.valueNow - a.claimValue).toFixed(2)}</td>
                  <td style={td}>
                    {a.claimValue
                      ? (((a.valueNow - a.claimValue) / a.claimValue) * 100).toFixed(1) + "%"
                      : "-"}
                  </td>
                  <td style={td}>HOLD</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#777",
            marginTop: 16,
          }}
        >
          Prices from CoinGecko • CELO yellow theme • Data saved locally
        </div>
      </div>
    </div>
  );
}

const td = {
  padding: "10px 8px",
  borderBottom: "1px solid #222",
  fontSize: 13,
};
