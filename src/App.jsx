import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [airdrops, setAirdrops] = useState([]);
  const [totals, setTotals] = useState({ claim: 0, current: 0, pnl: 0 });

  // --- LOAD DATA FROM LOCALSTORAGE ---
  useEffect(() => {
    const saved = localStorage.getItem("airdrops");
    if (saved) setAirdrops(JSON.parse(saved));
  }, []);

  // --- SAVE DATA LOCALLY ---
  useEffect(() => {
    localStorage.setItem("airdrops", JSON.stringify(airdrops));
  }, [airdrops]);

  // --- ADD A NEW AIRDROP ---
  const addAirdrop = () => {
    const newDrop = {
      date: new Date().toLocaleDateString(),
      project: "New Airdrop",
      token: "TOKEN",
      quantity: 0,
      claimValue: 0,
      valueNow: 0,
    };
    setAirdrops([...airdrops, newDrop]);
  };

  // --- CALCULATE TOTALS ---
  useEffect(() => {
    const claim = airdrops.reduce((acc, x) => acc + x.claimValue, 0);
    const current = airdrops.reduce((acc, x) => acc + x.valueNow, 0);
    const pnl = current - claim;
    setTotals({ claim, current, pnl });
  }, [airdrops]);

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            background: "#FCFF52",
            color: "#000",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 24px",
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: "1px",
            boxShadow: "0 0 18px rgba(252, 255, 82, 0.6)",
          }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              height: 48,
              marginRight: 12,
              filter:
                "brightness(0) saturate(100%) invert(85%) sepia(90%) saturate(800%) hue-rotate(350deg)",
            }}
          />
          AIRDROP TRACKER
        </div>
      </div>

      {/* TOTALS SECTION */}
      <div className="flex flex-wrap justify-center gap-6 mb-10">
        <div className="border border-yellow-400 rounded-xl p-6 text-center w-60">
          <p className="text-gray-300">Claim Total</p>
          <p className="text-2xl font-bold text-yellow-400">
            {totals.claim.toFixed(2)} $US
          </p>
        </div>
        <div className="border border-yellow-400 rounded-xl p-6 text-center w-60">
          <p className="text-gray-300">Current Total</p>
          <p className="text-2xl font-bold text-yellow-400">
            {totals.current.toFixed(2)} $US
          </p>
        </div>
        <div className="border border-yellow-400 rounded-xl p-6 text-center w-60">
          <p className="text-gray-300">Total PNL</p>
          <p className="text-2xl font-bold text-yellow-400">
            {totals.pnl.toFixed(2)} $US
          </p>
        </div>
      </div>

      {/* TABLE */}
      <h2 className="text-2xl font-bold mb-4">Airdrops</h2>
      <div className="overflow-x-auto border border-gray-700 rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-yellow-300">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Project</th>
              <th className="p-3">Token</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Claim Value ($)</th>
              <th className="p-3">Value Now ($)</th>
              <th className="p-3">PNL ($)</th>
            </tr>
          </thead>
          <tbody>
            {airdrops.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center text-gray-500 py-6 italic"
                >
                  Click “+ Add” to start.
                </td>
              </tr>
            ) : (
              airdrops.map((drop, i) => (
                <tr key={i} className="border-t border-gray-800">
                  <td className="p-3">{drop.date}</td>
                  <td className="p-3">{drop.project}</td>
                  <td className="p-3">{drop.token}</td>
                  <td className="p-3">{drop.quantity}</td>
                  <td className="p-3">{drop.claimValue}</td>
                  <td className="p-3">{drop.valueNow}</td>
                  <td
                    className={`p-3 ${
                      drop.valueNow - drop.claimValue >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {(drop.valueNow - drop.claimValue).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD BUTTON */}
      <div className="flex justify-end mt-6">
        <button
          onClick={addAirdrop}
          className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-300"
        >
          + Add
        </button>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-500 mt-12">
        Prices from CoinGecko • CELO yellow theme • Data saved locally
      </footer>
    </div>
  );
}

export default App;
