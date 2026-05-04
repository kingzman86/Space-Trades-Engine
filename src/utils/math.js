export function calculateCompound(capital, gainPct, trades, style = 'full', retainPct = 0.8, withdrawAmt = 0) {
  let balance = capital;
  let totalWithdrawn = 0;
  const tradeHistory = [];

  for (let i = 1; i <= trades; i++) {
    const profit = balance * gainPct;
    let withdrawn = 0;

    if (style === 'partial') {
      withdrawn = profit * (1 - retainPct);
      balance = balance + profit * retainPct;
    } else if (style === 'fixed') {
      withdrawn = Math.min(withdrawAmt, profit);
      balance = balance + profit - withdrawn;
    } else {
      balance = balance + profit;
    }

    totalWithdrawn += withdrawn;
    tradeHistory.push({
      trade: i,
      balance: parseFloat(balance.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      withdrawn: parseFloat(withdrawn.toFixed(2)),
    });
  }

  return {
    finalValue: parseFloat(balance.toFixed(2)),
    totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
    totalReturn: parseFloat((balance + totalWithdrawn - capital).toFixed(2)),
    totalReturnPct: parseFloat(((balance + totalWithdrawn - capital) / capital) * 100),
    tradeHistory,
  };
}

export function calculatePositionSize(accountBalance, riskPct, stopLossPct) {
  if (!stopLossPct) return 0;
  const riskAmount = accountBalance * (riskPct / 100);
  return riskAmount / (stopLossPct / 100);
}

export function tradesToDouble(gainPct) {
  if (!gainPct || gainPct <= 0) return Infinity;
  return Math.ceil(72 / gainPct);
}

export function tradesToMultiple(gainPct, multiple) {
  if (!gainPct || gainPct <= 0) return Infinity;
  return Math.ceil(Math.log(multiple) / Math.log(1 + gainPct / 100));
}

export function calcTradeStats(trades) {
  if (!trades.length) {
    return { winRate: 0, avgWinPct: 0, avgLossPct: 0, profitFactor: 0, totalPnl: 0 };
  }
  const wins = trades.filter(t => t.pnlPct > 0);
  const losses = trades.filter(t => t.pnlPct < 0);
  const totalWin = wins.reduce((s, t) => s + t.pnl, 0);
  const totalLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  return {
    winRate: (wins.length / trades.length) * 100,
    avgWinPct: wins.length ? wins.reduce((s, t) => s + t.pnlPct, 0) / wins.length : 0,
    avgLossPct: losses.length ? losses.reduce((s, t) => s + t.pnlPct, 0) / losses.length : 0,
    profitFactor: totalLoss > 0 ? totalWin / totalLoss : totalWin > 0 ? Infinity : 0,
    totalPnl: trades.reduce((s, t) => s + t.pnl, 0),
  };
}
