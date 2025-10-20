import React, { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [airdrops, setAirdrops] = useState(() => {
    const saved = localStorage.getItem("airdrops");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("airdrops", JSON.stringify(airdrops));
  }, [airdrops]);

  const addRow = () => {
    setAirdrops([
      ...airdrops,
      {
        date: new Date().toLocaleDateString("fr-FR"),
        project: "",
        token: "",
        coingecko: "",
        quantity: 0,
        claimValue: 0,
        valueNow: 0,
        pnl: 0,
      },
    ]);
  };

  const updateRow = (index, key, value) => {
    const updated = [...airdrops];
    updated[index][key] = value;
    setAirdrops(updated);
  };

  const refreshValue = async (index) => {
    const token = airdrops[index].coingecko.trim();
    if (!token) return;
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`
      );
      const data = await res.json();
      const price = data[token]?.usd || 0;
      const updated = [...airdrops];
      const { quantity, claimValue } = updated[index];
      const valueNow = quantity * price;
      const pnl = valueNow - claimValue;
      updated[index].valueNow = valueNow.toFixed(2);
      updated[index].pnl = pnl.toFixed(2);
      setAirdrops(updated);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement :", error);
    }
  };

  const totalClaim = airdrops.reduce((sum, a) => sum + Number(a.claimValue || 0), 0);
  const totalNow = airdrops.reduce((sum, a) => sum + Number(a.valueNow || 0), 0);
  const totalPNL = totalNow - totalClaim;

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col items-center py-10">
      {/* --- HEADER --- */}
      <div className="flex items-center bg-[#FFF84F] text-black px-6 py-3 rounded-2xl shadow-lg mb-8">
        <img
          src="/logo.png"
          alt="Airdrop Tracker"
          style={{
            width: 48,
            height: 48,
            objectFit: "contain",
            marginRight: 12,
            borderRadius: 8,
          }}
        />
        <h1 className="text-3xl font-extrabold tracking-wide">
          AIRDROP TRACKER
        </h1>
      </div>

      {/* --- STATS --- */}
      <div className="grid grid-cols-3 gap-6 mb-10 text-center">
        <div className="border border-yellow-400 p-4 rounded-xl w-56">
          <p className="text-gray-400">Claim Total</p>
          <p className="text-2xl font-bold text-yellow-300">
            {totalClaim.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} $US
          </p>
        </div>
        <div className="border border-yellow-400 p-4 rounded-xl w-56">
          <p className="text-gray-400">Current Total</p>
          <p className="text-2xl font-bold text-yellow-300">
            {totalNow.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} $US
          </p>
        </div>
        <div className="border border-yellow-400 p-4 rounded-xl w-56">
          <p className="text-gray-400">Total PNL</p>
          <p className="text-2xl font-bold text-yellow-300">
            {totalPNL.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} $US
          </p>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="w-full max-w-6xl">
        <h2 className="text-xl font-semibold mb-3 text-yellow-400">Airdrops</h2>
        <table className="w-full border-collapse bg-[#1a1a1a] rounded-xl overflow-hidden">
          <thead className="bg-[#222] text-yellow-400">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Project</th>
              <th className="p-3 text-left">Token</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">CoinGecko ID</th>
              <th className="p-3 text-left">Claim Value ($)</th>
              <th className="p-3 text-left">Value Now ($)</th>
              <th className="p-3 text-left">PNL ($)</th>
            </tr>
          </thead>
          <tbody>
            {airdrops.map((a, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="p-2">
                  <input
                    type="text"
                    value={a.date}
                    onChange={(e) => updateRow(index, "date", e.target.value)}
                    className="bg-transparent border-b border-gray-600 w-full text-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={a.project}
                    onChange={(e) => updateRow(index, "project", e.target.value)}
                    className="bg-transparent border-b border-gray-600 w-full text-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={a.token}
                    onChange={(e) => updateRow(index, "token", e.target.value)}
                    className="bg-transparent border-b border-gray-600 w-full text-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={a.quantity}
                    onChange={(e) => updateRow(index, "quantity", e.target.value)}
                    className="bg-transparent border-b border-gray-600 w-full text-white text-right"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={a.coingecko}
                    onChange={(e) => updateRow(index, "coingecko", e.target.value)}
                    className="bg-transparent border-b border-gray-600 w-full text-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={a.claimValue}
                    onChange={(e) => updateRow(index, "claimValue", e.target.value)}
                    className="bg-transparent border-b border-gray-600 w-full text-white text-right"
                  />
                </td>
                <td className="p-2 text-right text-yellow-300">
                  {a.valueNow}
                  <button
                    onClick={() => refreshValue(index)}
                    className="ml-2 bg-yellow-400 text-black rounded px-2 py-1 text-xs font-bold hover:bg-yellow-300"
                  >
                    ↻
                  </button>
                </td>
                <td className="p-2 text-right text-yellow-300">{a.pnl}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- ADD BUTTON --- */}
        <div className="flex justify-end mt-4">
          <button
            onClick={addRow}
            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded hover:bg-yellow-300"
          >
            + Add
          </button>
        </div>
      </div>

      <p className="mt-8 text-gray-500 text-sm">
        Prices from CoinGecko • CELO yellow theme • Data saved locally
      </p>
    </div>
  );
}

export default App;
