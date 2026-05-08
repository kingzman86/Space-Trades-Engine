import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Pencil, TrendingUp, TrendingDown, ArrowUp, ArrowDown, AlertTriangle, ChevronDown, Shield, Target, Scale, Info, ExternalLink, Layers, Zap } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const ALLOC_PRESETS = [0, 25, 50, 75, 100];
const MAX_LEV = 50;

function getLeverageLabel(lev) {
  if (lev <= 3)   return { text: 'Low Leverage',      color: '#22C55E' };
  if (lev <= 10)  return { text: 'Moderate Leverage', color: '#F5A623' };
  if (lev <= 20)  return { text: 'High Leverage',     color: '#EF4444' };
  return                 { text: 'Extreme Leverage',  color: '#DC2626' };
}

function getRiskInfo(leverage, allocationPct) {
  if (leverage <= 3)  return { label: 'Low Risk',            color: '#22C55E', borderColor: 'rgba(34,197,94,0.25)',  bg: 'rgba(34,197,94,0.06)',  badgeBg: 'rgba(34,197,94,0.15)'  };
  if (leverage <= 10) return { label: 'Moderate Risk',       color: '#F5A623', borderColor: 'rgba(245,166,35,0.25)', bg: 'rgba(245,166,35,0.06)', badgeBg: 'rgba(245,166,35,0.15)' };
  if (leverage <= 20) return { label: 'High Risk',           color: '#EF4444', borderColor: 'rgba(239,68,68,0.25)',  bg: 'rgba(239,68,68,0.06)',  badgeBg: 'rgba(239,68,68,0.15)'  };
  return                     { label: 'Extreme Leverage Risk', color: '#DC2626', borderColor: 'rgba(220,38,38,0.35)', bg: 'rgba(220,38,38,0.08)',  badgeBg: 'rgba(220,38,38,0.2)'   };
}

export default function PhaseCard({
  phaseNum, startCapital, gainPct, allocationPct,
  leverage = 1, feeMode = 'pct', feePct, flatFee = 0, tradeFee,
  riskPct = 2, direction = 'long', pair = 'BTC/USDT', notes = '',
  onUpdate, onCapitalChange, delay = 0
}) {
  const [riskEngineOpen, setRiskEngineOpen] = useState(false);
  const [advOpen,        setAdvOpen]        = useState(false);
  const [entryPrice,     setEntryPrice]     = useState('');

  const effectivePct = feeMode === 'pct' ? (tradeFee ?? feePct) : 0;
  const allocated   = startCapital * (allocationPct / 100);
  const unallocated = startCapital - allocated;
  const position    = allocated * leverage;
  const gross       = position * (gainPct / 100);
  const fees        = feeMode === 'flat' ? (parseFloat(flatFee) || 0) : gross * (effectivePct / 100);
  const net        = gross - fees;
  const endBalance = parseFloat((startCapital + net).toFixed(2));

  const GAIN_MIN = -50, GAIN_MAX = 50;
  const gainColor = gainPct >= 0 ? '#22C55E' : '#EF4444';
  const gainFill  = Math.max(0, Math.min(100, ((gainPct - GAIN_MIN) / (GAIN_MAX - GAIN_MIN)) * 100));
  const levFill  = Math.max(0, Math.min(100, ((leverage - 1) / (MAX_LEV - 1)) * 100));

  const exposure    = Math.min(allocationPct * leverage, 9999);
  const maxLossDollar  = startCapital * (riskPct / 100);
  const slOnPosition   = position > 0 ? (maxLossDollar / position) * 100 : 0;
  const riskFill       = (riskPct / 10) * 100;
  const levLabel    = getLeverageLabel(leverage);
  const riskInfo    = getRiskInfo(leverage, allocationPct);
  const accentColor = direction === 'short' ? '#EF4444' : '#22C55E';

  return (
    <motion.div
      className="phase-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{ borderLeftColor: accentColor }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-space-border flex-wrap"
        style={{ background: direction === 'short' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)' }}
      >
        {/* Trade label */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-display font-black text-xs tracking-widest uppercase" style={{ color: accentColor }}>
            Trade {phaseNum}
          </span>
          {direction === 'long'
            ? <TrendingUp size={13} color={accentColor} />
            : <TrendingDown size={13} color={accentColor} />}
        </div>

        <span className="text-space-border flex-shrink-0">|</span>

        {/* Pair input — gold bordered pill */}
        <label
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 cursor-text flex-1 min-w-[110px] transition-all"
          style={{ border: '1.5px solid #F5A623', background: 'var(--space-mid)' }}
        >
          <Pencil size={11} color="#F5A623" className="flex-shrink-0" />
          <input
            className="bg-transparent outline-none font-display font-bold text-xs tracking-wider uppercase w-full"
            style={{ color: '#F5A623' }}
            value={pair}
            onChange={e => onUpdate('pair', e.target.value.toUpperCase())}
            placeholder="BTC/USDT"
            maxLength={12}
          />
        </label>

        {/* Direction selector — up/down tabs */}
        <div
          className="flex items-center rounded-xl overflow-hidden flex-shrink-0"
          style={{ border: `1.5px solid ${direction === 'short' ? '#EF4444' : '#22C55E'}`, background: 'var(--space-mid)' }}
        >
          <button
            onClick={() => onUpdate('direction', 'long')}
            className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
            style={direction === 'long'
              ? { background: '#22C55E', color: '#000' }
              : { color: '#22C55E' }}
            title="Long"
          >
            <ArrowUp size={13} />
            <span className="font-display font-black text-xs tracking-wider uppercase">Long</span>
          </button>
          <div style={{ width: 1, background: direction === 'short' ? '#EF4444' : '#22C55E', opacity: 0.4, alignSelf: 'stretch' }} />
          <button
            onClick={() => onUpdate('direction', 'short')}
            className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
            style={direction === 'short'
              ? { background: '#EF4444', color: '#000' }
              : { color: '#EF4444' }}
            title="Short"
          >
            <ArrowDown size={13} />
            <span className="font-display font-black text-xs tracking-wider uppercase">Short</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5 flex-1">

        {/* ── Starting Capital (Trade 1 only) ── */}
        {onCapitalChange && (
          <div>
            <div className="section-title mb-1.5">Starting Capital ($)</div>
            <input
              type="number"
              min="0"
              step="any"
              value={startCapital}
              onChange={e => onCapitalChange(parseFloat(e.target.value) || 0)}
              className="input-gold"
              style={{ fontSize: 15, fontWeight: 700, padding: '10px 14px' }}
              placeholder="1000"
            />
          </div>
        )}

        {/* ── Capital Allocation (hidden on Trade 1) ── */}
        {!onCapitalChange && <div>
          <div className="flex items-center justify-between mb-2">
            <div className="section-title">Capital Allocation</div>
            <span className="num text-base text-primary">{allocationPct}%</span>
          </div>
          <input
            type="range"
            className="alloc-slider w-full"
            min="0" max="100" step="1"
            value={allocationPct}
            style={{ '--alloc-fill': `${allocationPct}%` }}
            onChange={e => onUpdate('allocationPct', parseInt(e.target.value))}
          />
          <div className="flex gap-1.5 flex-wrap mt-2">
            {ALLOC_PRESETS.map(pct => (
              <button key={pct} onClick={() => onUpdate('allocationPct', pct)}
                className={clsx('alloc-btn', allocationPct === pct && 'active')}
              >{pct}%</button>
            ))}
          </div>
        </div>}

        {/* ── Margin Allocated display ── */}
        <div
          className="rounded-lg px-4 py-3 flex items-center justify-between"
          style={{ background: 'var(--space-mid)', border: '1px solid var(--space-border)' }}
        >
          <div>
            <div className="text-[9px] font-display font-bold tracking-widest uppercase text-muted mb-0.5">
              Margin Allocated
            </div>
            <div className="text-[10px] font-mono text-muted">
              {onCapitalChange
                ? `${allocationPct}% of starting capital`
                : `${allocationPct}% of T${phaseNum - 1} total`}
            </div>
          </div>
          <div className="text-right">
            <div className="num font-black text-xl" style={{ color: accentColor }}>
              {formatCurrency(allocated)}
            </div>
            {!onCapitalChange && (
              <div className="text-[10px] font-mono text-muted mt-0.5">
                prev: {formatCurrency(startCapital)}
              </div>
            )}
          </div>
        </div>

        {/* ── Leverage Slider ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="section-title">Leverage</div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold" style={{ color: levLabel.color }}>{levLabel.text}</span>
              <span className="num text-2xl text-primary">{leverage}x</span>
            </div>
          </div>
          <input
            type="range"
            className="lev-slider w-full"
            min="1" max={MAX_LEV} step="1"
            value={leverage}
            style={{ '--lev-fill': `${levFill}%` }}
            onChange={e => onUpdate('leverage', parseInt(e.target.value))}
          />
          <div className="flex justify-between text-[9px] text-muted font-mono mt-1.5">
            <span>1x</span><span>10x</span><span>25x</span><span>50x</span>
          </div>
        </div>

        {/* ── Gain % Slider ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="section-title">Gain % (precision)</div>
            <div className="num text-2xl" style={{ color: gainColor }}>{gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%</div>
          </div>
          <input
            type="number"
            step="0.01"
            value={gainPct}
            onChange={e => onUpdate('gainPct', parseFloat(e.target.value) || 0)}
            className="input-gold mb-2"
            style={{ fontSize: 13, padding: '7px 12px' }}
            placeholder="e.g. 6.12"
          />
          <input
            type="range"
            className="gain-slider w-full"
            min={GAIN_MIN} max={GAIN_MAX} step="0.1"
            value={gainPct}
            style={{ '--fill': `${gainFill}%`, '--gain-color': gainColor }}
            onChange={e => onUpdate('gainPct', parseFloat(e.target.value))}
          />
          <div className="flex justify-between text-[9px] text-muted font-mono mt-1.5">
            <span>-50%</span><span>0%</span><span>+50%</span>
          </div>
        </div>

        {/* ── Risk Control ── */}
        <div className="rounded-lg p-3 border" style={{ borderColor: riskInfo.borderColor, background: riskInfo.bg }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 section-title" style={{ color: riskInfo.color }}>
              <AlertTriangle size={11} /> Risk Control
            </div>
            <span
              className="px-2.5 py-0.5 rounded font-display font-black text-[9px] uppercase tracking-wider"
              style={{ background: riskInfo.badgeBg, color: riskInfo.color }}
            >{riskInfo.label}</span>
          </div>
          <div className="text-[10px] font-mono text-muted mb-3">
            Set how much you're willing to lose on this trade
          </div>

          {/* Risk % slider */}
          <input
            type="range"
            min="0" max="10" step="0.1"
            value={riskPct}
            onChange={e => onUpdate('riskPct', parseFloat(e.target.value))}
            className="w-full mb-1"
            style={{
              appearance: 'none', WebkitAppearance: 'none',
              height: 4, borderRadius: 4, outline: 'none', cursor: 'pointer',
              background: `linear-gradient(to right, ${riskInfo.color} 0%, ${riskInfo.color} ${riskFill}%, var(--space-border) ${riskFill}%, var(--space-border) 100%)`,
            }}
          />
          <div className="flex justify-between text-[9px] text-muted font-mono mb-2">
            <span>0%</span><span>5%</span><span>10%</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="num-mono text-sm font-bold" style={{ color: riskInfo.color }}>
              {riskPct.toFixed(1)}% selected
            </span>
            <span className="num-mono text-sm text-primary">
              −{formatCurrency(maxLossDollar)}
            </span>
          </div>

          {/* Risk Engine — clickable row that expands inline */}
          <button
            onClick={() => setRiskEngineOpen(o => !o)}
            className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 transition-opacity hover:opacity-80"
            style={{ background: 'var(--space-black)', border: `1.5px solid ${riskInfo.borderColor}` }}
          >
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: riskInfo.color }} />
              <span className="text-sm font-display font-black uppercase tracking-wider" style={{ color: riskInfo.color }}>
                Risk Engine
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="num font-black text-sm" style={{ color: riskInfo.color }}>
                {slOnPosition.toFixed(2)}% SL
              </span>
              <motion.div animate={{ rotate: riskEngineOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} style={{ color: riskInfo.color }} />
              </motion.div>
            </div>
          </button>

          {/* Expanded Risk Engine panel */}
          <AnimatePresence initial={false}>
            {riskEngineOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="pt-3 flex flex-col gap-3">

                  {/* Trade Risk Summary card */}
                  <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.25)' }}>
                    <p className="font-display font-black text-xs tracking-widest uppercase mb-3" style={{ color: '#EF4444' }}>
                      Trade Risk Summary
                    </p>
                    <div className="grid grid-cols-2 gap-y-3">
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--muted-text)' }}>You are risking</p>
                        <p className="font-mono font-black text-xl" style={{ color: '#EF4444' }}>{formatCurrency(maxLossDollar)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--muted-text)' }}>Stop must be within</p>
                        <p className="font-mono font-black text-xl" style={{ color: '#EF4444' }}>{slOnPosition.toFixed(2)}%</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-bold" style={{ color: 'var(--muted-text)' }}>Risk / Reward</p>
                        {(() => {
                          const rr = slOnPosition > 0 ? gainPct / slOnPosition : 0;
                          const rrColor = rr >= 2 ? '#22C55E' : rr >= 1 ? '#F5A623' : '#EF4444';
                          return <p className="font-mono font-black text-xl" style={{ color: rrColor }}>1:{rr.toFixed(2)}</p>;
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Metric rows */}
                  {[
                    {
                      icon: AlertTriangle, iconColor: '#F5A623',
                      title: 'Max Risk $', value: formatCurrency(maxLossDollar), valueColor: '#EF4444',
                      desc: 'The dollar amount you could lose if the stop loss is hit.',
                    },
                    {
                      icon: Target, iconColor: '#EF4444',
                      title: 'Required Stop Loss Distance', value: `${slOnPosition.toFixed(2)}%`, valueColor: '#EF4444',
                      desc: 'How far your stop must be from entry to stay within your selected max loss.',
                    },
                    {
                      icon: Scale, iconColor: '#22C55E',
                      title: 'Risk / Reward',
                      value: (() => { const rr = slOnPosition > 0 ? gainPct / slOnPosition : 0; return `1:${rr.toFixed(2)}`; })(),
                      valueColor: (() => { const rr = slOnPosition > 0 ? gainPct / slOnPosition : 0; return rr >= 2 ? '#22C55E' : rr >= 1 ? '#F5A623' : '#EF4444'; })(),
                      desc: 'Compares your projected profit target to your selected max loss.',
                      tip: 'High reward setups usually require precision entries. Tighter stops can increase the chance of early stop-outs.',
                    },
                  ].map(({ icon: Icon, iconColor, title, value, valueColor, desc, tip }) => (
                    <RiskMetricRow key={title} icon={Icon} iconColor={iconColor} title={title} value={value} valueColor={valueColor} desc={desc} tip={tip} />
                  ))}

                  {/* Advanced Details toggle */}
                  <button
                    onClick={() => setAdvOpen(o => !o)}
                    className="w-full flex items-center justify-between py-2.5 transition-opacity hover:opacity-70"
                    style={{ borderTop: '1px solid var(--space-border)' }}
                  >
                    <span className="font-display font-bold text-sm tracking-widest uppercase" style={{ color: 'var(--muted-text)' }}>
                      Advanced Details
                    </span>
                    <motion.div animate={{ rotate: advOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={15} style={{ color: 'var(--muted-text)' }} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {advOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="flex flex-col gap-3 pb-1">

                          {/* Suggested Position Size */}
                          <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1.5px solid rgba(59,130,246,0.35)' }}>
                            <Layers size={18} style={{ color: '#3B82F6', flexShrink: 0, marginTop: 2 }} />
                            <div className="flex-1 min-w-0">
                              <p className="font-display font-black text-sm" style={{ color: '#3B82F6' }}>Suggested Position Size</p>
                              <p className="text-xs font-bold mt-0.5 leading-snug" style={{ color: 'var(--muted-text)' }}>Optimal size to match your risk and stop settings</p>
                            </div>
                            <p className="font-mono font-black text-lg flex-shrink-0" style={{ color: '#3B82F6' }}>{formatCurrency(position)}</p>
                          </div>

                          {/* Entry Price input */}
                          <div className="flex items-start gap-3">
                            <Zap size={18} style={{ color: '#F5A623', flexShrink: 0, marginTop: 32 }} />
                            <div className="flex-1 min-w-0">
                              <p className="font-display font-bold text-sm tracking-wider uppercase" style={{ color: 'var(--star-white)' }}>
                                Entry Price <span className="normal-case tracking-normal font-body font-normal text-xs" style={{ color: 'var(--muted-text)' }}>(Optional)</span>
                              </p>
                              <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--muted-text)' }}>Required to calculate liquidation level</p>
                              <div
                                className="flex items-center gap-2 px-3 py-2.5 rounded-lg mt-2"
                                style={{ border: '1.5px solid #F5A623', background: 'var(--space-mid)' }}
                              >
                                <span className="font-mono text-sm font-bold" style={{ color: 'var(--muted-text)' }}>$</span>
                                <input
                                  type="number"
                                  value={entryPrice}
                                  onChange={e => setEntryPrice(e.target.value)}
                                  placeholder="e.g. 45000"
                                  className="flex-1 bg-transparent outline-none font-mono text-sm font-bold"
                                  style={{ color: 'var(--muted-text)', minWidth: 0 }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Exact SL + target prices if entry filled */}
                          {parseFloat(entryPrice) > 0 && slOnPosition > 0 && (() => {
                            const ep = parseFloat(entryPrice);
                            const slPrice  = direction === 'short' ? ep * (1 + slOnPosition / 100) : ep * (1 - slOnPosition / 100);
                            const tgtPrice = direction === 'short' ? ep * (1 - gainPct / 100) : ep * (1 + gainPct / 100);
                            return (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--muted-text)' }}>Stop Loss Price</p>
                                  <p className="font-mono font-black text-base" style={{ color: '#EF4444' }}>${slPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="rounded-lg p-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--muted-text)' }}>Target Price</p>
                                  <p className="font-mono font-black text-base" style={{ color: '#22C55E' }}>${tgtPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Learn banner */}
                  <a
                    href="https://www.spacetrades.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:opacity-80"
                    style={{ background: 'var(--space-mid)', border: '1px solid var(--space-border)' }}
                  >
                    <span className="font-body font-bold text-sm" style={{ color: 'var(--star-white)' }}>
                      This is how professionals manage risk
                    </span>
                    <span className="flex items-center gap-1.5 font-display font-black text-xs tracking-wider flex-shrink-0 ml-3" style={{ color: '#22C55E' }}>
                      Learn the full system <ExternalLink size={12} />
                    </span>
                  </a>

                  <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--muted-text)' }}>
                    <AlertTriangle size={11} />
                    Simulation only — not live trade execution.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Fee Mode ── */}
        <div className="rounded-lg p-3 border border-space-border" style={{ background: 'var(--space-mid)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="section-title">Fee Mode</div>
            <div className="flex rounded-lg overflow-hidden border border-space-border">
              <button
                onClick={() => onUpdate('feeMode', 'pct')}
                className={clsx(
                  'px-3 py-1 text-[10px] font-display font-bold uppercase tracking-wider transition-all',
                  feeMode === 'pct' ? 'text-black' : 'text-muted hover:text-primary'
                )}
                style={feeMode === 'pct' ? { background: '#F5A623' } : {}}
              >% Fee</button>
              <button
                onClick={() => onUpdate('feeMode', 'flat')}
                className={clsx(
                  'px-3 py-1 text-[10px] font-display font-bold uppercase tracking-wider transition-all border-l border-space-border',
                  feeMode === 'flat' ? 'text-black' : 'text-muted hover:text-primary'
                )}
                style={feeMode === 'flat' ? { background: '#F5A623' } : {}}
              >$ Flat</button>
            </div>
          </div>

          {feeMode === 'pct' ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted font-mono flex-shrink-0">Fee %</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={tradeFee ?? feePct}
                onChange={e => onUpdate('tradeFee', parseFloat(e.target.value) || 0)}
                className="input-gold flex-1"
                style={{ fontSize: 12, padding: '6px 10px' }}
                placeholder="0.1"
              />
              <span className="text-[10px] text-muted font-mono flex-shrink-0">= {formatCurrency(fees)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted font-mono flex-shrink-0">Flat Fee $</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={flatFee}
                onChange={e => onUpdate('flatFee', parseFloat(e.target.value) || 0)}
                className="input-gold flex-1"
                style={{ fontSize: 12, padding: '6px 10px' }}
                placeholder="0.00"
              />
            </div>
          )}
        </div>

        {/* ── Calculated Results ── */}
        <div className="rounded-lg p-3 border border-space-border" style={{ background: 'var(--space-mid)' }}>
          <div className="section-title mb-2.5">Calculated Results</div>
          <div className="flex flex-col gap-2">
            <ResultLine label="Starting Capital"        value={formatCurrency(startCapital)} />
            {leverage > 1 && (
              <ResultLine label="Leveraged Position"    value={formatCurrency(position)} />
            )}
            <ResultLine
              label="Profit"
              value={`${gross >= 0 ? '+' : '−'}${formatCurrency(Math.abs(gross))}`}
              green={gross >= 0} red={gross < 0}
            />
            {fees > 0 && (
              <ResultLine label="Fees Deployed to Trade" value={`−${formatCurrency(fees)}`} red />
            )}
            <div className="border-t border-space-border pt-2 mt-1">
              <ResultLine
                label="Net Gain / Trade"
                value={`${net >= 0 ? '+' : '−'}${formatCurrency(Math.abs(net))}`}
                green={net >= 0} red={net < 0} bold
              />
            </div>
          </div>
        </div>

        {/* ── Trade Notes ── */}
        <div>
          <div className="section-title mb-1.5">Trade Notes (Optional)</div>
          <textarea
            className="input-gold"
            rows={4}
            style={{ fontSize: 12, padding: '10px 12px', resize: 'vertical', minHeight: 90 }}
            placeholder="Setup notes, entry reason, market conditions, exit plan..."
            value={notes}
            onChange={e => onUpdate('notes', e.target.value)}
          />
        </div>

      </div>

      {/* ── Portfolio Total Footer ── */}
      <div
        className="px-4 py-3 border-t border-space-border mt-auto"
        style={{ background: net < 0 ? 'rgba(239,68,68,0.06)' : direction === 'short' ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-mono text-muted mb-0.5">Previous Portfolio + Profit − Fees</div>
            <span className="section-title" style={{ color: net < 0 ? '#EF4444' : accentColor }}>Portfolio Total</span>
          </div>
          <span className="num text-2xl" style={{ color: net < 0 ? '#EF4444' : accentColor }}>{formatCurrency(endBalance)}</span>
        </div>
      </div>
    </motion.div>
  );
}

function RiskMetricRow({ icon: Icon, iconColor, title, value, valueColor, desc, tip }) {
  const [tipOpen, setTipOpen] = useState(false);
  return (
    <div className="flex gap-3 py-3" style={{ borderBottom: '1px solid var(--space-border)' }}>
      <Icon size={18} style={{ color: iconColor, flexShrink: 0, marginTop: 2 }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-display font-bold text-sm" style={{ color: 'var(--star-white)' }}>{title}</span>
          {tip && (
            <button onClick={() => setTipOpen(o => !o)} style={{ color: 'var(--muted-text)' }}>
              <Info size={13} />
            </button>
          )}
        </div>
        <p className="text-xs font-bold mt-0.5 leading-snug" style={{ color: 'var(--muted-text)' }}>{desc}</p>
        <AnimatePresence>
          {tip && tipOpen && (
            <motion.p
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="text-xs font-bold mt-1.5 px-2 py-1.5 rounded overflow-hidden leading-snug"
              style={{ background: 'var(--space-mid)', color: 'var(--muted-text)' }}
            >{tip}</motion.p>
          )}
        </AnimatePresence>
      </div>
      <span className="font-mono font-black text-base flex-shrink-0 self-start" style={{ color: valueColor }}>{value}</span>
    </div>
  );
}

function ResultLine({ label, value, green, red, bold }) {
  const col = green ? 'text-candle-green' : red ? 'text-candle-red' : 'text-primary';
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-mono text-muted">{label}</span>
      <span className={clsx('num-mono text-xs', col, bold && 'font-semibold')}>{value}</span>
    </div>
  );
}
