import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RefreshCw, TrendingUp, Zap, BarChart2, DollarSign, Save, Share2, Download, FileText, FileSpreadsheet, Trash2, Info } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import clsx from 'clsx';
import CountUp from 'react-countup';
import PhaseCard from './PhaseCard';
import GrowthChart from './GrowthChart';
import { formatCurrency, formatPercent, formatCompact } from '../utils/formatters';
import { useLocalStorage } from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';

const PRESETS = [
  { id: 'conservative', label: 'Conservative', gainPct: 5,    leverage: 1,  desc: '5% · 1x leverage' },
  { id: 'moderate',     label: 'Moderate',     gainPct: 10,   leverage: 3,  desc: '10% · 3x leverage' },
  { id: 'aggressive',   label: 'Aggressive',   gainPct: 15,   leverage: 5,  desc: '15% · 5x leverage' },
  { id: 'ultra',        label: 'Staggered',    gainPct: null, leverage: 10, desc: 'Staggered · 10x leverage' },
  { id: 'custom',       label: 'Custom',       gainPct: null, leverage: null, desc: 'Set per trade manually' },
];

const DEFAULT_GAIN    = 10;
const DEFAULT_PHASES  = 6;

function makePhases(count, gainPct, leverage = 1) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    gainPct: gainPct ?? DEFAULT_GAIN,
    allocationPct: 100,
    leverage,
    direction: 'long',
    pair: 'BTC/USDT',
    feeMode: 'pct',
    flatFee: 0,
    tradeFee: null,
    riskPct: 2,
    notes: '',
  }));
}

export default function CompoundCalculator({ onStatsChange }) {
  const [startingCapital, setStartingCapital] = useState('1000');
  const [feePct,          setFeePct]          = useState('0');
  const [preset,          setPreset]          = useState('moderate');
  const [phases,          setPhases]          = useState(() => makePhases(DEFAULT_PHASES, DEFAULT_GAIN));
  const [scenarioName,    setScenarioName]    = useState('');
  const [savedScenarios,  setSavedScenarios]  = useLocalStorage('st_scenarios', []);
  const [scenarioSaved,   setScenarioSaved]   = useState(false);

  const capital = parseFloat(startingCapital) || 0;
  const fee     = parseFloat(feePct) || 0;

  /* Cascade calculation across phases */
  const phaseResults = useMemo(() => {
    let balance = capital;
    return phases.map(phase => {
      const startCapital = balance;
      const allocated    = startCapital * (phase.allocationPct / 100);
      const position     = allocated * (phase.leverage ?? 1);
      const gross        = position * (phase.gainPct / 100);
      const effectivePct = phase.feeMode === 'pct' ? (phase.tradeFee ?? fee) : 0;
      const fees         = phase.feeMode === 'flat' ? (phase.flatFee || 0) : gross * (effectivePct / 100);
      const net          = gross - fees;
      balance            = parseFloat((startCapital + net).toFixed(2));
      return { ...phase, startCapital, allocated, position, gross, fees, net, endBalance: balance };
    });
  }, [phases, capital, fee]);

  /* Summary */
  const last       = phaseResults[phaseResults.length - 1];
  const finalValue = last?.endBalance ?? capital;
  const totalProfit = finalValue - capital;
  const totalROI    = capital > 0 ? (totalProfit / capital) * 100 : 0;
  const totalFees   = phaseResults.reduce((s, p) => s + p.fees, 0);
  const avgGain     = phases.length ? phases.reduce((s, p) => s + p.gainPct, 0) / phases.length : 0;

  useEffect(() => {
    onStatsChange?.({ starting: capital, final: finalValue, returnPct: totalROI });
  }, [capital, finalValue, totalROI]);

  /* Chart-compatible data */
  const chartData = [
    { trade: 0, balance: capital, profit: 0, withdrawn: 0 },
    ...phaseResults.map(p => ({ trade: p.id, balance: p.endBalance, profit: p.net, withdrawn: 0 })),
  ];

  const updatePhase  = (index, key, value) =>
    setPhases(prev => prev.map((p, i) => i === index ? { ...p, [key]: value } : p));

  const applyPreset = (p) => {
    setPreset(p.id);
    if (p.id === 'ultra') {
      const STAGGERED_LEV = [10, 5, 3, 2, 2, 1];
      setPhases(prev => prev.map((ph, i) => ({
        ...ph,
        leverage: STAGGERED_LEV[i] ?? 1,
        gainPct: (i + 1) * 5,
      })));
    } else if (p.gainPct !== null) {
      setPhases(prev => prev.map(ph => ({
        ...ph,
        gainPct: p.gainPct,
        ...(p.leverage !== null ? { leverage: p.leverage } : {}),
      })));
    } else if (p.leverage !== null) {
      setPhases(prev => prev.map(ph => ({ ...ph, leverage: p.leverage })));
    }
  };

  const addPhase = () => {
    if (phases.length >= 6) return;
    const last = phases[phases.length - 1];
    setPhases(prev => [...prev, { id: prev.length + 1, gainPct: last?.gainPct ?? DEFAULT_GAIN, allocationPct: 100, leverage: last?.leverage ?? 1, direction: 'long', pair: last?.pair ?? 'BTC/USDT', feeMode: last?.feeMode ?? 'pct', flatFee: 0, tradeFee: null, notes: '' }]);
  };

  const removePhase = () => {
    if (phases.length <= 1) return;
    setPhases(prev => prev.slice(0, -1));
  };

  const resetPhases = () => {
    const p = PRESETS.find(p => p.id === preset);
    setPhases(makePhases(phases.length, p?.gainPct ?? DEFAULT_GAIN));
  };

  const saveScenario = () => {
    if (!scenarioName.trim()) { toast.error('Enter a scenario name first'); return; }
    const scenario = {
      id: Date.now(),
      name: scenarioName.trim(),
      preset,
      startingCapital,
      feePct,
      phases,
      savedAt: new Date().toISOString(),
    };
    setSavedScenarios(prev => [scenario, ...(prev || []).filter(s => s.name !== scenario.name)]);
    setScenarioSaved(true);
    toast.success(`Scenario "${scenario.name}" saved`);
    setTimeout(() => setScenarioSaved(false), 2000);
  };

  const loadScenario = (s) => {
    setScenarioName(s.name);
    setPreset(s.preset);
    setStartingCapital(s.startingCapital);
    setFeePct(s.feePct);
    setPhases(s.phases);
    toast.success(`Loaded "${s.name}"`);
  };

  const [returnMode,   setReturnMode]   = useState('portfolio');
  const [includeNotes, setIncludeNotes] = useState(false);

  const totalDeployed  = phaseResults.reduce((s, p) => s + p.allocated, 0);
  const tradeROI       = totalDeployed > 0 ? (totalProfit / totalDeployed) * 100 : 0;
  const sidelineTotal  = phaseResults.reduce((s, p) => s + (p.startCapital - p.allocated), 0);
  const displayROI     = returnMode === 'portfolio' ? totalROI : tradeROI;

  const exportCSV = () => {
    const header = ['Trade', 'Pair', 'Direction', 'Start Capital', 'Allocation %', 'Leverage', 'Gain %', 'Gross Profit', 'Fees', 'Net Gain', 'End Balance', ...(includeNotes ? ['Notes'] : [])];
    const rows = phaseResults.map(p => [
      p.id, p.pair ?? 'BTC/USDT', p.direction, p.startCapital.toFixed(2),
      p.allocationPct, p.leverage, p.gainPct, p.gross.toFixed(2),
      p.fees.toFixed(2), p.net.toFixed(2), p.endBalance.toFixed(2),
      ...(includeNotes ? [`"${(p.notes || '').replace(/"/g, '""')}"`] : []),
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `space-trades-${scenarioName || 'scenario'}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as CSV');
  };

  const exportPDF = () => {
    window.print();
    toast.success('Opening print dialog for PDF');
  };

  const clearNotes = () => {
    setPhases(prev => prev.map(p => ({ ...p, notes: '' })));
    toast.success('All trade notes cleared');
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Live Stats Bar */}
      <motion.div
        className="panel p-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <LiveStat label="Starting Capital" value={capital}      type="currency" color="gold" />
          <LiveStat label="Final Value"      value={finalValue}   type="currency" color="green" />
          <LiveStat label="Total Return"     value={totalROI}     type="percent"  color={totalROI >= 0 ? 'green' : 'red'} sign />
          <LiveStat label="Total Profit"     value={totalProfit}  type="currency" color={totalProfit >= 0 ? 'green' : 'red'} sign />
        </div>
      </motion.div>

      {/* STEP 1 — Choose Your Setup */}
      <StepPanel num={1} title="Choose Your Setup" icon={<Zap size={13} />}>
        <div className="text-[10px] text-muted font-mono mb-3 tracking-wide">Scenario Presets</div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={clsx('preset-pill', preset === p.id && 'active')}
            >
              <span className="pill-label">{p.label}</span>
            </button>
          ))}
        </div>
      </StepPanel>

      {/* STEP 2 — Name & Save Your Scenario */}
      <StepPanel num={2} title="Name & Save Your Scenario" icon={<Save size={13} />}>
        <div className="mb-3">
          <label className="section-title mb-1.5 block">Scenario Name</label>
          <input
            className="input-gold"
            value={scenarioName}
            onChange={e => setScenarioName(e.target.value)}
            placeholder="e.g. Aggressive 15% Plan"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={saveScenario}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all"
            style={{ background: scenarioSaved ? '#16A34A' : '#22C55E', color: '#000' }}
          >
            <Save size={12} /> {scenarioSaved ? 'Saved!' : 'Save'}
          </button>
          <button
            onClick={() => {
              if (!scenarioName.trim()) { toast.error('Name your scenario first'); return; }
              navigator.clipboard?.writeText(`Space Trades Scenario: ${scenarioName} | Capital: $${startingCapital} | Trades: ${phases.length} | Preset: ${preset}`);
              toast.success('Scenario details copied to clipboard');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-space-border text-muted hover:text-primary hover:border-gold-primary text-xs font-display font-bold uppercase tracking-wider transition-all"
          >
            <Share2 size={12} /> Share Scenario
          </button>
        </div>

        {/* Saved scenarios */}
        {(savedScenarios || []).length > 0 && (
          <div className="mt-4 pt-4 border-t border-space-border">
            <div className="section-title mb-2">Saved Scenarios</div>
            <div className="flex flex-wrap gap-2">
              {(savedScenarios || []).slice(0, 6).map(s => (
                <button
                  key={s.id}
                  onClick={() => loadScenario(s)}
                  className="px-3 py-1.5 rounded-lg border border-space-border text-xs font-mono text-muted hover:text-primary hover:border-gold-primary transition-all"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </StepPanel>

      {/* STEP 3 — Set Your Starting Capital */}
      <StepPanel num={3} title="Set Your Starting Capital" icon={<DollarSign size={13} />}>
        <p className="text-[10px] text-muted font-mono mb-4">
          Seeds Trade 1. Each subsequent trade uses the previous trade's Total as its Margin.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="section-title mb-1.5 block">Starting Capital ($)</label>
            <input
              className="input-gold"
              type="number"
              min="0"
              value={startingCapital}
              onChange={e => setStartingCapital(e.target.value)}
              placeholder="1000"
            />
          </div>
          <div>
            <label className="section-title mb-1.5 block">Reset All Trades</label>
            <button
              onClick={resetPhases}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-space-border text-muted hover:text-candle-green hover:border-candle-green text-xs font-display font-bold uppercase tracking-wider transition-all"
              style={{ height: '42px' }}
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>
        </div>
      </StepPanel>

      {/* STEP 4 — Trade Sequence */}
      <StepPanel num={4} title="Build Your Trade Sequence" icon={<TrendingUp size={13} />}>

        {/* Export toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-space-border">
          {/* Include notes checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeNotes}
              onChange={e => setIncludeNotes(e.target.checked)}
              className="w-4 h-4 rounded border border-space-border accent-candle-green cursor-pointer"
            />
            <span className="text-xs font-mono text-muted">Include trade notes in export</span>
          </label>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs font-display font-bold uppercase tracking-wider text-muted">
              <Download size={12} /> Export
            </span>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display font-bold uppercase tracking-wider transition-all"
              style={{ borderColor: '#22C55E', color: '#22C55E' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <FileSpreadsheet size={13} /> Export CSV
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display font-bold uppercase tracking-wider transition-all"
              style={{ borderColor: '#F5A623', color: '#F5A623' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,166,35,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <FileText size={13} /> Export PDF
            </button>
          </div>

          <div className="h-5 w-px bg-space-border hidden sm:block" />

          <button
            onClick={clearNotes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display font-bold uppercase tracking-wider transition-all"
            style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#EF4444' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Trash2 size={13} /> Clear Notes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {phaseResults.map((phase, idx) => (
              <PhaseCard
                key={phase.id}
                phaseNum={phase.id}
                startCapital={phase.startCapital}
                gainPct={phase.gainPct}
                allocationPct={phase.allocationPct}
                leverage={phase.leverage}
                direction={phase.direction}
                pair={phase.pair}
                feeMode={phase.feeMode}
                flatFee={phase.flatFee}
                tradeFee={phase.tradeFee}
                riskPct={phase.riskPct ?? 2}
                notes={phase.notes}
                feePct={fee}
                delay={idx * 0.04}
                onUpdate={(key, val) => updatePhase(idx, key, val)}
                onCapitalChange={idx === 0 ? (val) => setStartingCapital(String(val)) : undefined}
              />
            ))}
          </AnimatePresence>
        </div>

      </StepPanel>

      {/* STEP 5 — Performance Dashboard */}
      <motion.div
        className="panel overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-space-border flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: '#F5A623' }} />
            <div>
              <div className="font-display font-black text-xl text-primary tracking-wide">Performance Dashboard</div>
              <div className="text-xs text-muted font-mono mt-0.5">Summary across all {phases.length} trades</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setReturnMode('portfolio')}
              className="px-4 py-2 rounded-lg text-xs font-display font-bold tracking-wider transition-all"
              style={returnMode === 'portfolio'
                ? { background: '#22C55E', color: '#000' }
                : { border: '1px solid var(--space-border)', color: 'var(--muted-text)' }}
            >Portfolio Return (Actual Growth)</button>
            <button
              onClick={() => setReturnMode('trade')}
              className="px-4 py-2 rounded-lg text-xs font-display font-bold tracking-wider transition-all"
              style={returnMode === 'trade'
                ? { background: '#22C55E', color: '#000' }
                : { border: '1px solid var(--space-border)', color: 'var(--muted-text)' }}
            >Trade Return (Deployed Capital Only)</button>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Mode info banner */}
          <div className="rounded-xl p-4 border" style={{ borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)' }}>
            {returnMode === 'portfolio' ? (
              <>
                <p className="text-xs font-mono leading-relaxed" style={{ color: '#22C55E' }}>
                  <span className="font-bold">Portfolio Return (Actual Growth)</span> — Includes both traded and unallocated capital. This reflects your actual account growth.
                </p>
                <p className="text-xs font-mono mt-1 leading-relaxed" style={{ color: '#22C55E' }}>
                  This reflects true account growth. Only trade profits increase portfolio value. Capital reallocation does not inflate results.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-mono leading-relaxed" style={{ color: '#22C55E' }}>
                  <span className="font-bold">Trade Return (Deployed Capital Only)</span> — Measures ROI on capital actually put to work across all trades.
                </p>
                <p className="text-xs font-mono mt-1 leading-relaxed" style={{ color: '#22C55E' }}>
                  Total deployed: {formatCurrency(totalDeployed)}. This shows your strategy efficiency, not your full account result.
                </p>
              </>
            )}
          </div>

          {/* Big metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <BigPerfCard
              label="Starting Capital"
              icon={<DollarSign size={13} />}
              value={formatCurrency(capital)}
            />
            <BigPerfCard
              label="Final Capital"
              icon={<TrendingUp size={13} />}
              value={formatCurrency(finalValue)}
              color="green"
            />
            <BigPerfCard
              label={`Total Profit ${returnMode === 'portfolio' ? '(Account)' : '(Account)'}`}
              icon={<BarChart2 size={13} />}
              value={formatCurrency(Math.abs(totalProfit))}
              color={totalProfit >= 0 ? 'green' : 'red'}
              badge={totalProfit >= 0 ? '▲ Gain' : '▼ Loss'}
            />
            <BigPerfCard
              label={`Total ROI ${returnMode === 'portfolio' ? '(Account)' : '(Deployed)'}`}
              icon={<Zap size={13} />}
              value={`${displayROI >= 0 ? '+' : ''}${displayROI.toFixed(2)}%`}
              color="gold"
            />
            <BigPerfCard
              label="Total Fees Paid"
              icon={<Download size={13} />}
              value={formatCurrency(totalFees)}
            />
            <BigPerfCard
              label="Avg Gain / Trade"
              icon={<TrendingUp size={13} />}
              value={`${avgGain.toFixed(2)}%`}
              color={avgGain >= 0 ? 'green' : 'red'}
            />
          </div>

          {/* Sideline deployed */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl p-4 border border-space-border" style={{ background: 'var(--space-mid)' }}>
              <div className="section-title mb-2 flex items-center gap-1.5">
                <BarChart2 size={11} /> Sideline Deployed
              </div>
              {sidelineTotal === 0 ? (
                <>
                  <div className="font-display font-black text-2xl text-primary mb-1">—</div>
                  <div className="text-xs text-muted font-mono">No sideline capital used</div>
                </>
              ) : (
                <>
                  <div className="num font-black text-2xl text-gold-primary">{formatCurrency(sidelineTotal)}</div>
                  <div className="text-xs text-muted font-mono mt-1">Kept on sideline across trades</div>
                </>
              )}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-xs text-muted font-mono flex items-start gap-1.5">
            <Info size={12} className="flex-shrink-0 mt-0.5" />
            For most users, <strong className="text-primary mx-1">Portfolio Return</strong> is your real account result. Trade Return shows strategy efficiency only.
          </p>

          {/* Redesigned Equity Curve */}
          <PerfEquityCurve chartData={chartData} capital={capital} phases={phases} />

        </div>
      </motion.div>

      {/* CMF Framework Banner */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, #0C0C0F 0%, #111118 100%)',
          border: '1px solid rgba(245,166,35,0.3)',
          boxShadow: '0 0 32px rgba(245,166,35,0.08)',
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="font-display font-black text-lg tracking-wide" style={{ color: '#F5A623' }}>
            Want to identify better trades?
          </div>
          <div className="text-sm font-mono mt-1" style={{ color: 'var(--muted-text)' }}>
            Learn the CMF Framework — the system behind this compounding engine.
          </div>
        </div>
        <a
          href="https://www.spacetrades.net"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all hover:opacity-90 active:scale-95"
          style={{ background: '#F5A623', color: '#000' }}
        >
          Learn the CMF Framework →
        </a>
      </div>

      {/* Blofin Banner */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, #041A0A 0%, #061410 100%)',
          border: '1px solid rgba(34,197,94,0.3)',
          boxShadow: '0 0 32px rgba(34,197,94,0.08)',
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="font-display font-black text-lg tracking-wide" style={{ color: '#22C55E' }}>
            Ready to execute this trade?
          </div>
          <div className="text-sm font-mono mt-1" style={{ color: 'var(--muted-text)' }}>
            Your plan is built — now put it into action.
          </div>
        </div>
        <a
          href="https://blofin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all hover:opacity-90 active:scale-95"
          style={{ background: '#22C55E', color: '#000' }}
        >
          Trade on Blofin →
        </a>
      </div>

    </div>
  );
}

/* ─── Sub-components ─────────────────────────────── */

function StepPanel({ num, title, icon, children }) {
  return (
    <motion.div
      className="panel p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: num * 0.05 }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="step-num">{num}</div>
        <div>
          <div className="text-[9px] text-muted font-mono uppercase tracking-widest">Step {num}</div>
          <h2 className="font-display font-bold text-primary text-xs tracking-wider uppercase flex items-center gap-1.5">
            {icon}{title}
          </h2>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function LiveStat({ label, value, type, color, sign }) {
  const col = { green: 'text-candle-green', gold: 'text-gold-primary', red: 'text-candle-red' }[color] || 'text-primary';
  return (
    <div>
      <div className="section-title mb-1">{label}</div>
      <div className={clsx('num text-xl leading-tight', col)}>
        {sign && value > 0 ? '+' : ''}
        <CountUp
          end={value}
          duration={0.6}
          decimals={2}
          prefix={type === 'currency' ? '$' : ''}
          suffix={type === 'percent' ? '%' : ''}
          separator=","
          preserveValue
        />
      </div>
    </div>
  );
}

const PERF_COLORS = {
  green: { text: '#22C55E', border: 'rgba(34,197,94,0.25)',  bg: 'rgba(34,197,94,0.08)'  },
  gold:  { text: '#F5A623', border: 'rgba(245,166,35,0.25)', bg: 'rgba(245,166,35,0.08)' },
  red:   { text: '#EF4444', border: 'rgba(239,68,68,0.25)',  bg: 'rgba(239,68,68,0.08)'  },
};

function BigPerfCard({ label, icon, value, color, badge }) {
  const c = PERF_COLORS[color];
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{
        background: c ? c.bg : 'var(--space-mid)',
        border: `1px solid ${c ? c.border : 'var(--space-border)'}`,
      }}
    >
      <div className="section-title flex items-center gap-1" style={{ color: c ? c.text : 'var(--muted-text)' }}>
        {icon} {label}
      </div>
      <div className="num font-black text-2xl leading-tight" style={{ color: c ? c.text : 'var(--star-white)' }}>
        {value}
      </div>
      {badge && (
        <span
          className="self-start px-2 py-0.5 rounded text-[9px] font-display font-black uppercase tracking-wider"
          style={{ background: `${c?.text}22`, color: c?.text }}
        >{badge}</span>
      )}
    </div>
  );
}

const PERF_FONT = "'DM Sans', sans-serif";

function PerfTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const tradeLabel = label === 0 ? 'Start' : `T${label}`;
  return (
    <div style={{
      background: '#0C0C0F', border: '1px solid #2A2A32', borderRadius: 10,
      padding: '10px 16px', fontFamily: PERF_FONT, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      <div style={{ color: 'var(--muted-text)', fontSize: 11, marginBottom: 4 }}>{tradeLabel}</div>
      <div style={{ color: '#22C55E', fontWeight: 900, fontSize: 20 }}>{formatCurrency(payload[0].value)}</div>
    </div>
  );
}

function PerfEquityCurve({ chartData, capital, phases }) {
  const peak = chartData.reduce((mx, d) => d.balance > mx.balance ? d : mx, chartData[0]);
  const peakLabel = peak.trade === 0 ? 'Start' : `T${peak.trade}`;
  const balances  = chartData.map(d => d.balance);
  const maxVal    = Math.max(...balances);
  const minVal    = Math.min(...balances, capital * 0.97);

  return (
    <div className="panel p-5">
      {/* Chart header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="font-display font-bold text-primary text-sm">Equity Curve</div>
          <div className="text-xs text-muted font-mono mt-0.5">
            Portfolio value progression across {phases.length} trades
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 rounded" style={{ background: '#22C55E' }} />
            Portfolio Value
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t border-dashed" style={{ borderColor: '#A1A1AA' }} />
            Starting Capital
          </span>
        </div>
      </div>

      {/* Peak badge */}
      <div className="mb-3">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold"
          style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          ↑ Peak at {peakLabel}: {formatCurrency(peak.balance)}
        </span>
      </div>

      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <defs>
              <linearGradient id="perfAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#22C55E" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2A2A32" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="trade"
              tickFormatter={v => v === 0 ? 'Start' : `T${v}`}
              tick={{ fill: '#A1A1AA', fontSize: 11, fontFamily: PERF_FONT }}
              tickLine={false}
              axisLine={{ stroke: '#2A2A32' }}
            />
            <YAxis
              tickFormatter={formatCompact}
              tick={{ fill: '#A1A1AA', fontSize: 11, fontFamily: PERF_FONT }}
              tickLine={false}
              axisLine={false}
              width={68}
              domain={[minVal * 0.95, maxVal * 1.05]}
            />
            <Tooltip content={<PerfTooltip />} />
            <ReferenceLine
              y={capital}
              stroke="#A1A1AA"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{ value: 'Start', position: 'insideTopRight', fill: '#A1A1AA', fontSize: 10, fontFamily: PERF_FONT }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#22C55E"
              strokeWidth={2.5}
              fill="url(#perfAreaGrad)"
              dot={{ r: 5, fill: '#F5A623', stroke: '#0C0C0F', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#22C55E', stroke: '#0C0C0F', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-end mt-3 pt-3 border-t border-space-border">
        <span className="text-[10px] text-muted font-mono">
          Powered by <strong className="text-primary">Space Trades</strong> CMF Compounding Engine
        </span>
      </div>
    </div>
  );
}
