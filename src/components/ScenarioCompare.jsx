import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatCurrency, formatPercent, formatCompact } from '../utils/formatters';
import clsx from 'clsx';

const GOLD  = '#F5A623';
const GREEN = '#22C55E';
const RED   = '#EF4444';
const MUTED = '#A1A1AA';
const GRID  = '#2A2A32';
const FONT  = "'DM Sans', sans-serif";

function calcScenario(s) {
  const capital = parseFloat(s.startingCapital) || 0;
  const fee     = parseFloat(s.feePct) || 0;
  let balance   = capital;

  const phaseResults = s.phases.map(phase => {
    const startCapital  = balance;
    const allocated     = startCapital * (phase.allocationPct / 100);
    const position      = allocated * (phase.leverage ?? 1);
    const gross         = position * (phase.gainPct / 100);
    const effectivePct  = phase.feeMode === 'pct' ? (phase.tradeFee ?? fee) : 0;
    const fees          = phase.feeMode === 'flat' ? (phase.flatFee || 0) : gross * (effectivePct / 100);
    const net           = gross - fees;
    balance             = parseFloat((startCapital + net).toFixed(2));
    return { ...phase, startCapital, allocated, position, gross, fees, net, endBalance: balance };
  });

  const finalValue  = phaseResults[phaseResults.length - 1]?.endBalance ?? capital;
  const totalProfit = finalValue - capital;
  const totalROI    = capital > 0 ? (totalProfit / capital) * 100 : 0;
  const totalFees   = phaseResults.reduce((acc, p) => acc + p.fees, 0);
  const avgGain     = s.phases.length ? s.phases.reduce((acc, p) => acc + p.gainPct, 0) / s.phases.length : 0;

  const chartData = [
    { trade: 0, balance: capital },
    ...phaseResults.map(p => ({ trade: p.id, balance: p.endBalance })),
  ];

  return { capital, finalValue, totalProfit, totalROI, totalFees, avgGain, chartData, phaseResults };
}

const METRICS = [
  { key: 'capital',     label: 'Starting Capital', fmt: v => formatCurrency(v),                 better: null },
  { key: 'finalValue',  label: 'Final Value',       fmt: v => formatCurrency(v),                 better: 'higher' },
  { key: 'totalROI',    label: 'Total ROI',         fmt: v => formatPercent(v, 2, true),          better: 'higher' },
  { key: 'totalProfit', label: 'Total Profit',      fmt: v => formatCurrency(v),                 better: 'higher' },
  { key: 'totalFees',   label: 'Fees Paid',         fmt: v => formatCurrency(v),                 better: 'lower' },
  { key: 'avgGain',     label: 'Avg Gain / Trade',  fmt: v => `${v.toFixed(2)}%`,                better: 'higher' },
  { key: 'trades',      label: 'Trades',            fmt: (_, s) => s.phases.length,              better: null },
  { key: 'preset',      label: 'Preset',            fmt: (_, s) => s.preset,                     better: null },
];

const ScenarioDropdown = ({ label, color, scenarios, value, onChange, exclude }) => {
  const [open, setOpen] = useState(false);
  const selected = scenarios.find(s => s.id === value);
  const options  = scenarios.filter(s => s.id !== exclude);

  return (
    <div className="relative flex-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm font-display font-bold transition-all"
        style={{
          borderColor: selected ? color : 'var(--space-border)',
          background:  selected ? `${color}12` : 'var(--space-mid)',
          color:       selected ? color : MUTED,
        }}
      >
        <span className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: color }}
          />
          {selected ? selected.name : label}
        </span>
        <ChevronDown size={14} className={clsx('transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-30 top-full mt-1.5 w-full rounded-xl border border-space-border overflow-hidden"
            style={{ background: 'var(--space-navy)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            {options.length === 0 && (
              <div className="px-4 py-3 text-xs text-muted font-mono">No other scenarios</div>
            )}
            {options.map(s => (
              <button
                key={s.id}
                onClick={() => { onChange(s.id); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-mono hover:bg-space-mid transition-colors flex items-center gap-2"
                style={{ color: s.id === value ? color : 'var(--star-white)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.id === value ? color : 'transparent', border: `1px solid ${s.id === value ? color : MUTED}` }} />
                {s.name}
                <span className="ml-auto text-muted text-[10px]">{s.preset}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CompareTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--space-navy)', border: `1px solid ${GRID}`, borderRadius: 8, padding: '10px 14px', fontFamily: FONT, fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
      <div style={{ color: MUTED, fontSize: 10, marginBottom: 6 }}>Trade {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
          {p.name}: {formatCurrency(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function ScenarioCompare() {
  const [savedScenarios] = useLocalStorage('st_scenarios', []);
  const scenarios = savedScenarios || [];

  const [pinA, setPinA] = useState(null);
  const [pinB, setPinB] = useState(null);

  const sA = scenarios.find(s => s.id === pinA);
  const sB = scenarios.find(s => s.id === pinB);

  const resA = useMemo(() => sA ? calcScenario(sA) : null, [sA]);
  const resB = useMemo(() => sB ? calcScenario(sB) : null, [sB]);

  const chartData = useMemo(() => {
    if (!resA || !resB) return [];
    const len = Math.max(resA.chartData.length, resB.chartData.length);
    return Array.from({ length: len }, (_, i) => ({
      trade: i,
      a: resA.chartData[i]?.balance ?? null,
      b: resB.chartData[i]?.balance ?? null,
    }));
  }, [resA, resB]);

  const ready = resA && resB;

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="panel p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: GREEN }} />
          <div>
            <h2 className="font-display font-black text-base tracking-wider uppercase" style={{ color: 'var(--star-white)' }}>
              Scenario Comparison
            </h2>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>
              Pin two saved scenarios and compare them side-by-side
            </p>
          </div>
        </div>

        {/* Pickers */}
        {scenarios.length < 2 ? null : (
          <div className="flex items-center gap-3">
            <ScenarioDropdown
              label="Pick Scenario A"
              color={GOLD}
              scenarios={scenarios}
              value={pinA}
              onChange={setPinA}
              exclude={pinB}
            />
            <div className="flex-shrink-0 text-xs font-display font-black tracking-widest" style={{ color: MUTED }}>VS</div>
            <ScenarioDropdown
              label="Pick Scenario B"
              color={GREEN}
              scenarios={scenarios}
              value={pinB}
              onChange={setPinB}
              exclude={pinA}
            />
          </div>
        )}
      </div>

      {/* Empty state — not enough scenarios */}
      {scenarios.length < 2 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel flex flex-col items-center justify-center gap-4 py-16 px-6 text-center"
        >
          <GitCompare size={40} style={{ color: MUTED, opacity: 0.5 }} />
          <div>
            <div className="font-display font-bold text-sm mb-1" style={{ color: 'var(--star-white)' }}>
              You need at least 2 saved scenarios to compare
            </div>
            <div className="text-xs" style={{ color: MUTED }}>
              Go to the Six Trades Calculator tab, configure your trades, and click{' '}
              <span style={{ color: GREEN }}>Save</span> in the Scenario Manager.
            </div>
          </div>
        </motion.div>
      )}

      {/* Prompt to pick scenarios */}
      {scenarios.length >= 2 && !ready && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel flex flex-col items-center justify-center gap-4 py-16 px-6 text-center"
        >
          <GitCompare size={40} style={{ color: MUTED, opacity: 0.5 }} />
          <div className="text-xs" style={{ color: MUTED }}>
            Select two scenarios above to see a side-by-side breakdown
          </div>
        </motion.div>
      )}

      {/* Comparison table */}
      {ready && (
        <AnimatePresence>
          <motion.div
            key="compare-table"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel overflow-hidden"
          >
            {/* Column headers */}
            <div className="grid grid-cols-3 border-b border-space-border">
              <div className="px-5 py-3.5 text-[10px] font-display font-bold tracking-widest uppercase" style={{ color: MUTED }}>
                Metric
              </div>
              <div className="px-5 py-3.5 border-l border-space-border flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                <span className="font-display font-black text-xs tracking-wider uppercase truncate" style={{ color: GOLD }}>
                  {sA.name}
                </span>
              </div>
              <div className="px-5 py-3.5 border-l border-space-border flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: GREEN }} />
                <span className="font-display font-black text-xs tracking-wider uppercase truncate" style={{ color: GREEN }}>
                  {sB.name}
                </span>
              </div>
            </div>

            {/* Metric rows */}
            {METRICS.map(({ key, label, fmt, better }, i) => {
              const valA = key === 'trades' || key === 'preset' ? null : resA[key];
              const valB = key === 'trades' || key === 'preset' ? null : resB[key];

              let winA = false, winB = false;
              if (better === 'higher' && valA !== null && valB !== null) {
                winA = valA > valB; winB = valB > valA;
              } else if (better === 'lower' && valA !== null && valB !== null) {
                winA = valA < valB; winB = valB < valA;
              }

              const dispA = fmt(valA, sA);
              const dispB = fmt(valB, sB);

              return (
                <div
                  key={key}
                  className="grid grid-cols-3 border-b border-space-border last:border-b-0"
                  style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}
                >
                  <div className="px-5 py-3 text-[10px] font-display font-bold tracking-widest uppercase flex items-center" style={{ color: MUTED }}>
                    {label}
                  </div>
                  <MetricCell value={dispA} win={winA} color={GOLD} />
                  <MetricCell value={dispB} win={winB} color={GREEN} />
                </div>
              );
            })}
          </motion.div>

          {/* Winner banner */}
          {(() => {
            const aWins = [resA.finalValue > resB.finalValue, resA.totalROI > resB.totalROI, resA.totalProfit > resB.totalProfit].filter(Boolean).length;
            const bWins = 3 - aWins;
            if (aWins === bWins) return null;
            const winner = aWins > bWins ? sA : sB;
            const color  = aWins > bWins ? GOLD : GREEN;
            return (
              <motion.div
                key="winner"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="panel p-4 flex items-center gap-3"
                style={{ borderColor: `${color}55`, background: `${color}0D` }}
              >
                <span className="text-xl">🏆</span>
                <div>
                  <div className="font-display font-black text-xs tracking-wider uppercase mb-0.5" style={{ color }}>
                    {winner.name} leads overall
                  </div>
                  <div className="text-xs" style={{ color: MUTED }}>
                    Better on final value, ROI, and total profit metrics
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Equity overlay chart */}
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel p-5"
          >
            <div className="section-title mb-4 flex items-center gap-2">
              <TrendingUp size={12} /> Equity Curve Comparison
            </div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
                  <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="trade"
                    tick={{ fill: MUTED, fontSize: 11, fontFamily: FONT }}
                    tickLine={false}
                    axisLine={{ stroke: GRID }}
                    label={{ value: 'Trades', position: 'insideBottom', offset: -4, fill: MUTED, fontSize: 11, fontFamily: FONT }}
                  />
                  <YAxis
                    tickFormatter={formatCompact}
                    tick={{ fill: MUTED, fontSize: 11, fontFamily: FONT }}
                    tickLine={false}
                    axisLine={false}
                    width={68}
                  />
                  <Tooltip content={<CompareTooltip />} />
                  <Legend
                    wrapperStyle={{ fontFamily: FONT, fontSize: 11, color: MUTED, paddingTop: 8 }}
                    formatter={(value) => value === 'a' ? sA.name : sB.name}
                  />
                  <Line type="monotone" dataKey="a" name="a" stroke={GOLD}  strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: GOLD,  stroke: 'var(--space-black)', strokeWidth: 2 }} connectNulls />
                  <Line type="monotone" dataKey="b" name="b" stroke={GREEN} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: GREEN, stroke: 'var(--space-black)', strokeWidth: 2 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function MetricCell({ value, win, color }) {
  return (
    <div className="px-5 py-3 border-l border-space-border flex items-center gap-2">
      <span
        className="num text-sm"
        style={{ color: win ? color : 'var(--star-white)' }}
      >
        {value}
      </span>
      {win && (
        <span className="text-[10px] font-display font-bold px-1.5 py-0.5 rounded" style={{ background: `${color}20`, color }}>
          WIN
        </span>
      )}
    </div>
  );
}
