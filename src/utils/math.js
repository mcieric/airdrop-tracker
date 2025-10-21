export const toNum = (v) => Number.isFinite(v) ? v : Number(v || 0);

export function calcRow(row, priceNow) {
  const qty = toNum(row.quantity);
  const claim = toNum(row.claimValueUsd);
  const now = qty * toNum(priceNow);
  const pnl = now - claim;
  return { valueNowUsd: now, pnlUsd: pnl };
}

export function calcTotals(rows) {
  return rows.reduce((acc, r) => {
    acc.claim += toNum(r.claimValueUsd);
    acc.now   += toNum(r.valueNowUsd);
    acc.pnl   += toNum(r.pnlUsd);
    return acc;
  }, { claim:0, now:0, pnl:0 });
}
