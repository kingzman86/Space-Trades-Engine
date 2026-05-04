import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Zap, Share2, RefreshCw, Wallet, Target } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../utils/formatters';
import clsx from 'clsx';

const HORIZON_MONTHS = { Daily: 1, Weekly: 3, '6M': 6, '12M': 12, '24M': 24 };
const NUM_SIMS = 300;
const FONT  = "'DM Sans', sans-serif";
const GREEN = '#22C55E';
const RED   = '#EF4444';
const GOLD  = '#F5A623';
const MUTED = '#A1A1AA';
const GRID  = '#2A2A32';

export default function StrategyBuilder() {
  const [capital,      setCapital]      = useState(1000);
  const [winRate,      setWinRate]      = useState(55);
  const [avgWin,       setAvgWin]       = useState(9);
  const [avgLoss,      setAvgLoss]      = useState(4);
  const [leverageMode, setLeverageMode] = useState('uniform');
  const [leverage,     setLeverage]     = useState(3);
  const [tradeFreq,    setTradeFreq]    = useState(10);
  const [feePer,       setFeePer]       = useState(5);
  const [horizon,      setHorizon]      = useState('12M');

  const months  = HORIZON_MONTHS[horizon];
  const wr      = winRate / 100;
  const winMult = (avgWin  / 100) * leverage;
  const lossMult= (avgLoss / 100) * leverage;

  /* Expectancy */
  const expectancyRate     = wr * (avgWin / 100) - (1 - wr) * (avgLoss / 100);
  const expectancyPerTrade = capital * leverage * expectancyRate - feePer;
  const monthlyProfit      = expectancyPerTrade * tradeFreq;
  const monthlyProfitPct   = capital > 0 ? (monthlyProfit / capital) * 100 : 0;

  /* Max expected losing streak */
  const annualTrades    = tradeFreq * 12;
  const maxConsecLosses = Math.max(1, Math.ceil(
    annualTrades > 1
      ? Math.log(annualTrades) / Math.log(1 / Math.max(0.001, 1 - wr))
      : 1
  ));

  /* Monte Carlo */
  const sim = useMemo(() => {
    const allMonthly = [];
    let survived = 0;
    const finals = [], drawdowns = [];

    for (let s = 0; s < NUM_SIMS; s++) {
      let bal  = capital;
      const monthly = [capital];
      let peak = capital, maxDD = 0;

      for (let m = 0; m < months; m++) {
        for (let t = 0; t < tradeFreq; t++) {
          if (bal <= 0) break;
          bal = Math.random() < wr
            ? bal * (1 + winMult) - feePer
            : bal * (1 - lossMult) - feePer;
          bal = Math.max(0, bal);
          if (bal > peak) peak = bal;
          const dd = peak > 0 ? (peak - bal) / peak * 100 : 0;
          if (dd > maxDD) maxDD = dd;
        }
        monthly.push(bal);
      }

      allMonthly.push(monthly);
      if (bal > 0) survived++;
      finals.push(bal);
      drawdowns.push(maxDD);
    }

    finals.sort((a, b) => a - b);
    drawdowns.sort((a, b) => a - b);

    const chartData = [];
    for (let m = 0; m <= months; m++) {
      const vals = allMonthly.map(s => s[m] ?? s[s.length - 1]).sort((a, b) => a - b);
      chartData.push({
        label:   m === 0 ? 'Start' : `M${m}`,
        balance: Math.round(vals[Math.floor(NUM_SIMS / 2)]),
        low:     Math.round(vals[Math.floor(NUM_SIMS * 0.25)]),
        high:    Math.round(vals[Math.floor(NUM_SIMS * 0.75)]),
      });
    }

    const finalCapital = finals[Math.floor(NUM_SIMS / 2)];
    return {
      chartData,
      finalCapital,
      maxDrawdown:  drawdowns[Math.floor(NUM_SIMS / 2)],
      survivalRate: (survived / NUM_SIMS) * 100,
      roi: capital > 0 ? ((finalCapital - capital) / capital) * 100 : 0,
    };
  }, [capital, wr, winMult, lossMult, tradeFreq, feePer, months]);

  /* Tags */
  const strategyTag = !expectancyRate || expectancyRate <= 0 ? 'Negative Expectancy'
    : leverage <= 3                    ? 'Conservative Strategy'
    : leverage <= 10                   ? 'Moderate Strategy'
    :                                    'Aggressive Strategy';

  const liquidationTag = leverage <= 3  ? 'Low Liquidation Risk'
    : leverage <= 10 ? 'Moderate Liquidation Risk'
    : leverage <= 20 ? 'High Liquidation Risk'
    :                  'Extreme Liquidation Risk';

  const confidenceLevel = sim.survivalRate >= 90 ? 'High'
    : sim.survivalRate >= 70 ? 'Medium' : 'Low';

  const tagColor = strategyTag.includes('Conservative') ? GREEN
    : strategyTag.includes('Moderate') ? GOLD : RED;
  const liqColor = liquidationTag.includes('Low') ? GREEN
    : liquidationTag.includes('Moderate') ? GOLD : RED;

  const levLabel = leverage <= 3 ? 'Low Leverage'
    : leverage <= 10 ? 'Moderate Leverage'
    : leverage <= 20 ? 'High Leverage' : 'Extreme Leverage';
  const levColor = leverage <= 3 ? GREEN : leverage <= 10 ? GOLD : RED;

  const reset = () => {
    setCapital(1000); setWinRate(55); setAvgWin(9); setAvgLoss(4);
    setLeverageMode('uniform'); setLeverage(3); setTradeFreq(10);
    setFeePer(5); setHorizon('12M');
  };

  const shareResults = () => {
    const text = `Space Trades Strategy | Win Rate: ${winRate}% | Avg Win: +${avgWin}% | Avg Loss: -${avgLoss}% | Leverage: ${leverage}x | Projected ${horizon} ROI: ${sim.roi.toFixed(1)}%`;
    navigator.clipboard?.writeText(text);
  };

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >

      {/* ── Projected Outcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-2xl border flex items-center gap-4 px-6 py-4"
        style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.07) 0%, rgba(245,166,35,0.04) 100%)',
          borderColor: 'rgba(34,197,94,0.25)',
          boxShadow: '0 0 32px rgba(34,197,94,0.08)',
        }}
      >
        {/* Label */}
        <div className="hidden sm:flex flex-shrink-0 items-center gap-2 mr-2">
          <TrendingUp size={14} style={{ color: GREEN }} />
          <span className="font-display font-black text-[10px] tracking-[0.18em] uppercase whitespace-nowrap" style={{ color: GREEN }}>
            Projected Outcome
          </span>
        </div>

        {/* Cards + arrows */}
        <div className="flex items-center gap-3 flex-1 min-w-0">

          {/* Start Capital */}
          <div
            className="flex items-center gap-3 flex-1 rounded-xl px-4 py-3 min-w-0"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.15)' }}>
              <Wallet size={16} style={{ color: GREEN }} />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-[9px] tracking-[0.14em] uppercase mb-0.5" style={{ color: GREEN }}>
                Start Capital
              </div>
              <div className="num font-black text-xl leading-tight" style={{ color: 'var(--star-white)' }}>
                {formatCurrency(capital)}
              </div>
            </div>
          </div>

          <span className="font-black text-lg flex-shrink-0" style={{ color: MUTED }}>→</span>

          {/* Projected Final */}
          <div
            className="flex items-center gap-3 flex-1 rounded-xl px-4 py-3 min-w-0"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.15)' }}>
              <TrendingUp size={16} style={{ color: GREEN }} />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-[9px] tracking-[0.14em] uppercase mb-0.5" style={{ color: GREEN }}>
                Projected Final
              </div>
              <div className="num font-black text-xl leading-tight" style={{ color: GREEN }}>
                {formatCurrency(sim.finalCapital)}
              </div>
            </div>
          </div>

          <span className="font-black text-lg flex-shrink-0" style={{ color: MUTED }}>→</span>

          {/* Total ROI */}
          <div
            className="flex items-center gap-3 flex-1 rounded-xl px-4 py-3 min-w-0"
            style={{
              background: 'rgba(245,166,35,0.08)',
              border: '1px solid rgba(245,166,35,0.3)',
              boxShadow: '0 0 18px rgba(245,166,35,0.08)',
            }}
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,166,35,0.15)' }}>
              <Target size={16} style={{ color: GOLD }} />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-[9px] tracking-[0.14em] uppercase mb-0.5" style={{ color: GOLD }}>
                Total ROI
              </div>
              <div className="num font-black text-xl leading-tight" style={{ color: GOLD }}>
                {sim.roi >= 0 ? '+' : ''}{sim.roi.toFixed(2)}%
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      <div className="flex items-start gap-5 flex-col lg:flex-row">

        {/* ── Left Panel ── */}
        <div className="panel p-6 w-full lg:w-[420px] flex-shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-display font-bold text-primary text-base tracking-wide">Strategy Parameters</div>
              <div className="text-xs text-muted font-mono mt-0.5">Simulate months of trading based on win rate &amp; statistics</div>
            </div>
            <button onClick={reset}
              className="flex items-center gap-1.5 text-[10px] text-muted hover:text-primary font-display font-semibold uppercase tracking-wider transition-all border border-space-border px-2 py-1 rounded-lg">
              <RefreshCw size={11} /> Reset
            </button>
          </div>

          <div className="flex flex-col gap-6">

            {/* Starting Capital */}
            <ParamGroup label="Starting Capital">
              <div className="input-gold flex items-center gap-2 px-3 py-2">
                <span className="text-muted">$</span>
                <input type="number" min="0" value={capital}
                  onChange={e => setCapital(parseFloat(e.target.value) || 0)}
                  className="bg-transparent outline-none flex-1 font-mono font-semibold text-primary text-sm"
                  placeholder="1000" />
              </div>
            </ParamGroup>

            {/* Win Rate */}
            <ParamGroup label="Win Rate" value={<span style={{ color: GREEN }}>{winRate}%</span>}>
              <SBSlider min={10} max={90} step={1} value={winRate} onChange={setWinRate}
                color={GREEN} marks={['10%', '50%', '90%']} />
            </ParamGroup>

            {/* Avg Win % */}
            <ParamGroup label="Avg Win %" value={<span style={{ color: GREEN }}>+{avgWin.toFixed(1)}%</span>}>
              <SBSlider min={1} max={50} step={0.5} value={avgWin} onChange={setAvgWin}
                color={GREEN} marks={['1%', '25%', '50%']} />
            </ParamGroup>

            {/* Avg Loss % */}
            <ParamGroup label="Avg Loss %" value={<span style={{ color: RED }}>-{avgLoss.toFixed(1)}%</span>}>
              <SBSlider min={0.5} max={30} step={0.5} value={avgLoss} onChange={setAvgLoss}
                color={RED} marks={['0.5%', '15%', '30%']} />
            </ParamGroup>

            {/* Leverage Mode */}
            <ParamGroup label="Leverage Mode">
              <div className="flex rounded-lg overflow-hidden border border-space-border mb-3">
                {['uniform', 'staggered'].map(m => (
                  <button key={m} onClick={() => setLeverageMode(m)}
                    className="flex-1 py-2 text-xs font-display font-bold uppercase tracking-wider capitalize transition-all"
                    style={leverageMode === m ? { background: GREEN, color: '#000' } : { color: MUTED }}>
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                  style={{ background: `${levColor}20`, color: levColor }}>{levLabel}</span>
                <span className="num font-black text-primary text-xl">{leverage}x</span>
              </div>
              <SBSlider min={1} max={50} step={1} value={leverage} onChange={setLeverage}
                color={levColor} marks={['1x', '10x', '20x', '35x', '50x']} />
              <p className="text-[10px] text-muted font-mono mt-2 leading-relaxed">
                Higher leverage increases both upside potential and liquidation risk.
              </p>
            </ParamGroup>

            {/* Trade Frequency */}
            <ParamGroup label="Trade Frequency" value={<span className="num text-primary font-black">{tradeFreq}</span>}>
              <SBSlider min={1} max={60} step={1} value={tradeFreq} onChange={setTradeFreq}
                color={GREEN} marks={['1', '30', '60']} />
              <p className="text-[10px] text-muted font-mono mt-1">Adjust based on your trading style and timeframe.</p>
            </ParamGroup>

            {/* Fee Per Trade */}
            <ParamGroup label="Fee Per Trade ($)">
              <div className="input-gold flex items-center gap-2 px-3 py-2">
                <span className="text-muted">$</span>
                <input type="number" min="0" value={feePer}
                  onChange={e => setFeePer(parseFloat(e.target.value) || 0)}
                  className="bg-transparent outline-none flex-1 font-mono font-semibold text-primary text-sm"
                  placeholder="5" />
              </div>
            </ParamGroup>

            {/* Simulation Horizon */}
            <ParamGroup label="Simulation Horizon">
              <div className="flex gap-1.5 flex-wrap">
                {Object.keys(HORIZON_MONTHS).map(h => (
                  <button key={h} onClick={() => setHorizon(h)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all min-w-[36px]"
                    style={horizon === h
                      ? { background: '#18181B', color: '#fff', border: '1px solid #3F3F46' }
                      : { border: '1px solid var(--space-border)', color: MUTED }}>
                    {h}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted font-mono mt-2 leading-relaxed">
                Choose your timeframe based on your trading style (short-term vs long-term growth).
              </p>
            </ParamGroup>

          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex flex-col gap-4 flex-1 w-full min-w-0">

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <ResultCard label="Final Capital"  icon={<TrendingUp size={12} />}   color="green"
              value={formatCurrency(sim.finalCapital)}
              sub={`${sim.roi >= 0 ? '' : ''}${sim.roi.toFixed(1)}% ROI`} />
            <ResultCard label="Max Drawdown"   icon={<AlertTriangle size={12} />} color="red"
              value={`${sim.maxDrawdown.toFixed(1)}%`}
              sub="Peak-to-trough" />
            <ResultCard label="Survival Rate"  icon={<Shield size={12} />}        color="green"
              value={`${sim.survivalRate.toFixed(0)}%`}
              sub={`${NUM_SIMS} simulations`} />
            <ResultCard label="Expectancy"     icon={<Zap size={12} />}           color="gold"
              value={`$${Math.abs(expectancyPerTrade).toFixed(2)}`}
              sub={`Avg lev: ${leverage}x · per trade`} />
          </div>

          {/* Tag row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-display font-bold tracking-wider"
              style={{ border: `1px solid ${tagColor}`, color: tagColor, background: `${tagColor}18` }}>
              {strategyTag}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-display font-bold tracking-wider"
              style={{ border: `1px solid ${liqColor}`, color: liqColor, background: `${liqColor}18` }}>
              {liquidationTag}
            </span>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-muted flex-wrap">
              <span className="w-2 h-2 rounded-full" style={{ background: GREEN }} />
              Simulation Confidence:&nbsp;
              <span className="font-semibold text-primary">{confidenceLevel}</span>
              &nbsp;· Based on {NUM_SIMS} Monte Carlo simulations
            </div>
          </div>

          {/* Monthly profit + Losing streak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="panel p-4">
              <div className="section-title mb-2 flex items-center gap-1.5">
                <TrendingUp size={12} /> Expected Monthly Profit
              </div>
              <div className="num font-black text-3xl" style={{ color: monthlyProfit >= 0 ? GREEN : RED }}>
                {monthlyProfit >= 0 ? '+' : ''}{formatCurrency(monthlyProfit)}
              </div>
              <div className="text-xs font-mono mt-1" style={{ color: monthlyProfit >= 0 ? GREEN : RED }}>
                {monthlyProfitPct >= 0 ? '+' : ''}{monthlyProfitPct.toFixed(2)}% / month
              </div>
              <div className="text-[10px] text-muted font-mono mt-2">
                Based on {tradeFreq} trades × avg expectancy per trade
              </div>
            </div>

            <div className="panel p-4" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
              <div className="section-title mb-2 flex items-center gap-1.5" style={{ color: RED }}>
                <AlertTriangle size={12} /> Estimated Losing Streak
              </div>
              <div className="font-display font-black text-xl leading-tight" style={{ color: RED }}>
                Up to {maxConsecLosses} losses in a row
              </div>
              <div className="text-[10px] text-muted font-mono mt-2">
                At {winRate}% win rate — psychological risk indicator
              </div>
              <div className="text-[10px] text-muted font-mono">
                Plan for this streak before entering any trade sequence
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="panel p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-display font-bold text-primary text-sm">
                  {horizon === 'Daily' ? '1-Month' : horizon === 'Weekly' ? '3-Month' : horizon} Projection
                </div>
                <div className="text-[10px] text-muted font-mono mt-0.5">Capital growth with win-rate simulation</div>
              </div>
              <button onClick={shareResults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider"
                style={{ background: GOLD, color: '#000' }}>
                <Share2 size={12} /> Share Results
              </button>
            </div>

            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sim.chartData} margin={{ top: 10, right: 10, bottom: 16, left: 0 }}>
                  <defs>
                    <linearGradient id="sbGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={GREEN} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={GREEN} stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label"
                    tick={{ fill: MUTED, fontSize: 11, fontFamily: FONT }}
                    tickLine={false} axisLine={{ stroke: GRID }} />
                  <YAxis
                    tickFormatter={v => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`}
                    tick={{ fill: MUTED, fontSize: 11, fontFamily: FONT }}
                    tickLine={false} axisLine={false} width={68} />
                  <Tooltip
                    contentStyle={{ background: '#141417', border: `1px solid ${GOLD}`, borderRadius: 8, fontFamily: FONT, fontSize: 12 }}
                    formatter={v => [`$${Number(v).toLocaleString()}`, 'Median Capital']}
                    labelStyle={{ color: MUTED, marginBottom: 4 }}
                  />
                  <ReferenceLine y={capital} stroke={GRID} strokeDasharray="5 4" strokeWidth={1.5}
                    label={{ value: 'Start', position: 'insideTopRight', fill: MUTED, fontSize: 10, fontFamily: FONT }} />
                  <Area type="monotone" dataKey="balance" stroke={GREEN} strokeWidth={2.5}
                    fill="url(#sbGrad)" dot={false}
                    activeDot={{ r: 5, fill: GREEN, stroke: '#141417', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

/* ── Sub-components ── */

function ParamGroup({ label, value, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="section-title text-xs">{label}</div>
        {value && <div className="num text-base">{value}</div>}
      </div>
      {children}
    </div>
  );
}

function SBSlider({ min, max, step, value, onChange, color, marks }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full sb-slider"
        style={{ '--sb-fill': `${pct}%`, '--sb-color': color }}
      />
      {marks && (
        <div className="flex justify-between text-[10px] text-muted font-mono mt-1.5">
          {marks.map(m => <span key={m}>{m}</span>)}
        </div>
      )}
    </div>
  );
}

function ResultCard({ label, icon, value, sub, color }) {
  const col = color === 'green' ? GREEN : color === 'red' ? RED : GOLD;
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-1.5 section-title mb-2" style={{ color: col }}>
        {icon} {label}
      </div>
      <div className="num font-black text-2xl" style={{ color: col }}>{value}</div>
      {sub && <div className="text-[10px] text-muted font-mono mt-1">{sub}</div>}
    </div>
  );
}
