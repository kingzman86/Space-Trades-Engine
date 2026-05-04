import { useMemo } from 'react';
import { calculateCompound, tradesToDouble, tradesToMultiple, calculatePositionSize } from '../utils/math';

export function useCompound({ capital, gainPct, trades, style, retainPct, withdrawAmt, riskPct, stopLossPct }) {
  return useMemo(() => {
    const c = parseFloat(capital) || 0;
    const g = parseFloat(gainPct) || 0;
    const t = parseInt(trades) || 0;
    const r = parseFloat(retainPct) || 80;
    const w = parseFloat(withdrawAmt) || 0;
    const rp = parseFloat(riskPct) || 1;
    const sl = parseFloat(stopLossPct) || 5;

    if (c <= 0 || g <= 0 || t <= 0) {
      return {
        finalValue: c,
        totalWithdrawn: 0,
        totalReturn: 0,
        totalReturnPct: 0,
        tradeHistory: [],
        tradesToDouble: 0,
        tradesToTenX: 0,
        positionSize: 0,
      };
    }

    const result = calculateCompound(c, g / 100, t, style, r / 100, w);

    return {
      ...result,
      tradesToDouble: tradesToDouble(g),
      tradesToTenX: tradesToMultiple(g, 10),
      positionSize: calculatePositionSize(c, rp, sl),
    };
  }, [capital, gainPct, trades, style, retainPct, withdrawAmt, riskPct, stopLossPct]);
}
