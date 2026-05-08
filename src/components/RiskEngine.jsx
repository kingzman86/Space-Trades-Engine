import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, Scale, AlertTriangle, ChevronUp, ExternalLink, Info, Zap, Layers } from 'lucide-react';

function NumInput({ label, value, onChange, prefix, suffix, placeholder, borderColor }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-display font-bold text-[10px] tracking-widest uppercase" style={{ color: 'var(--muted-text)' }}>
        {label}
      </label>
      <div
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${borderColor || 'var(--space-border)'}`,
        }}
      >
        {prefix && <span className="font-mono text-sm font-bold" style={{ color: 'var(--muted-text)' }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none font-mono text-sm font-bold"
          style={{ color: 'var(--star-white)', minWidth: 0 }}
        />
        {suffix && <span className="font-mono text-sm font-bold" style={{ color: 'var(--muted-text)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function MetricRow({ icon: Icon, iconColor, title, value, valueColor, description, note, infoTip }) {
  const [tipOpen, setTipOpen] = useState(false);
  return (
    <div className="flex gap-3 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={17} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-display font-bold text-sm" style={{ color: 'var(--star-white)' }}>{title}</span>
          {infoTip && (
            <button
              onClick={() => setTipOpen(o => !o)}
              className="transition-opacity hover:opacity-70 flex-shrink-0"
              style={{ color: 'var(--muted-text)' }}
            >
              <Info size={13} />
            </button>
          )}
        </div>
        <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--muted-text)' }}>{description}</p>
        <AnimatePresence>
          {infoTip && tipOpen && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs mt-1.5 px-2 py-1.5 rounded leading-snug overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted-text)' }}
            >
              {infoTip}
            </motion.p>
          )}
        </AnimatePresence>
        {note && <p className="text-xs mt-1" style={{ color: '#F5A623' }}>{note}</p>}
      </div>
      <div className="flex-shrink-0 font-mono font-black text-base self-start" style={{ color: valueColor }}>
        {value}
      </div>
    </div>
  );
}

export default function RiskEngine({ onGoToHowItWorks }) {
  const [open,       setOpen]       = useState(false);
  const [maxRisk,    setMaxRisk]    = useState('');
  const [slPctInput, setSlPctInput] = useState('');
  const [targetPct,  setTargetPct]  = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [advOpen,    setAdvOpen]    = useState(false);

  const risk   = parseFloat(maxRisk)    || 0;
  const slPct  = parseFloat(slPctInput) || 0;
  const target = parseFloat(targetPct)  || 0;
  const entry  = parseFloat(entryPrice) || 0;

  // Suggested position size = Max Risk $ / SL%
  const suggestedPos = slPct > 0 ? risk / (slPct / 100) : 0;
  const rrRatio      = slPct > 0 ? target / slPct : 0;
  const slPrice      = entry > 0 && slPct > 0 ? entry * (1 - slPct / 100) : 0;
  const tgtPrice     = entry > 0 && target > 0 ? entry * (1 + target / 100) : 0;

  const fmtPct = v => `${v.toFixed(2)}%`;
  const fmtUsd = v => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtRR  = v => `1:${v.toFixed(2)}`;

  const rrColor = rrRatio >= 2 ? '#22C55E' : rrRatio >= 1 ? '#F5A623' : '#EF4444';
  const ready   = risk > 0 && slPct > 0 && target > 0;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.55)', zIndex: 40 }}
          />
        )}
      </AnimatePresence>

      {/* Bottom sheet */}
      <motion.div
        initial={false}
        animate={{ y: open ? 0 : 'calc(100% - 56px)' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="fixed bottom-0 left-0 right-0"
        style={{ zIndex: 50, maxHeight: '88vh' }}
      >
        <div
          className="mx-auto flex flex-col"
          style={{
            maxWidth: '900px',
            borderRadius: '20px 20px 0 0',
            border: '1.5px solid #22C55E',
            borderBottom: 'none',
            background: 'var(--space-navy, #0A0F1E)',
            boxShadow: '0 -8px 48px rgba(34,197,94,0.12)',
            maxHeight: '88vh',
            overflow: 'hidden',
          }}
        >
          {/* Header — always visible, tap to toggle */}
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center justify-between px-4 flex-shrink-0"
            style={{ height: '56px' }}
          >
            <div className="flex items-center gap-2.5">
              <Shield size={15} style={{ color: '#22C55E' }} />
              <span className="font-display font-black text-sm tracking-widest uppercase" style={{ color: '#22C55E' }}>
                Risk Engine
              </span>
              {ready && (
                <span
                  className="font-mono font-bold text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.18)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.35)' }}
                >
                  {fmtPct(slPct)} SL
                </span>
              )}
            </div>
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronUp size={18} style={{ color: '#22C55E' }} />
            </motion.div>
          </button>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-4 pb-8 pt-1" style={{ overscrollBehavior: 'contain' }}>

            {/* Main inputs */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <NumInput
                label="Max Risk $"
                value={maxRisk}
                onChange={setMaxRisk}
                prefix="$"
                placeholder="20"
              />
              <NumInput
                label="Stop Loss %"
                value={slPctInput}
                onChange={setSlPctInput}
                suffix="%"
                placeholder="0.67"
              />
              <NumInput
                label="Profit Target %"
                value={targetPct}
                onChange={setTargetPct}
                suffix="%"
                placeholder="7"
              />
            </div>

            {/* Summary card */}
            {ready ? (
              <div
                className="rounded-xl p-4 mb-4"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.25)' }}
              >
                <p className="font-display font-black text-xs tracking-widest uppercase mb-3" style={{ color: '#EF4444' }}>
                  Trade Risk Summary
                </p>
                <div className="grid grid-cols-2 gap-y-3">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted-text)' }}>You are risking</p>
                    <p className="font-mono font-black text-2xl" style={{ color: '#EF4444' }}>{fmtUsd(risk)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted-text)' }}>Stop must be within</p>
                    <p className="font-mono font-black text-2xl" style={{ color: '#EF4444' }}>{fmtPct(slPct)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs" style={{ color: 'var(--muted-text)' }}>Risk / Reward</p>
                    <p className="font-mono font-black text-2xl" style={{ color: rrColor }}>{fmtRR(rrRatio)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="rounded-xl p-4 mb-4 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--space-border)' }}
              >
                <p className="text-sm font-body" style={{ color: 'var(--muted-text)' }}>
                  Enter your max risk $, stop loss %, and profit target % to calculate.
                </p>
              </div>
            )}

            {/* Metric rows */}
            {ready && (
              <div className="mb-2">
                <MetricRow
                  icon={AlertTriangle}
                  iconColor="#F5A623"
                  title="Max Risk $"
                  value={fmtUsd(risk)}
                  valueColor="#EF4444"
                  description="The dollar amount you could lose if the stop loss is hit."
                />
                <MetricRow
                  icon={Target}
                  iconColor="#EF4444"
                  title="Required Stop Loss Distance"
                  value={fmtPct(slPct)}
                  valueColor="#EF4444"
                  description="How far your stop must be from entry to stay within your selected max loss."
                />
                <MetricRow
                  icon={Scale}
                  iconColor="#22C55E"
                  title="Risk / Reward"
                  value={fmtRR(rrRatio)}
                  valueColor={rrColor}
                  description="Compares your projected profit target to your selected max loss."
                  infoTip="High reward setups usually require precision entries. Tighter stops can increase the chance of early stop-outs."
                  note={rrRatio > 0 && rrRatio < 1.5 ? '⚠ Low R:R. Consider widening your target or tightening your stop.' : undefined}
                />
              </div>
            )}

            {/* Advanced Details toggle */}
            <button
              onClick={() => setAdvOpen(o => !o)}
              className="w-full flex items-center justify-between py-3 transition-opacity hover:opacity-70"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="font-display font-bold text-xs tracking-widest uppercase" style={{ color: 'var(--muted-text)' }}>
                Advanced Details
              </span>
              <motion.div animate={{ rotate: advOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronUp size={14} style={{ color: 'var(--muted-text)' }} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {advOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="pb-2 flex flex-col gap-3">

                    {/* Suggested Position Size */}
                    <div
                      className="rounded-xl p-4 flex items-start gap-3"
                      style={{ background: 'rgba(59,130,246,0.08)', border: '1.5px solid rgba(59,130,246,0.35)' }}
                    >
                      <Layers size={18} style={{ color: '#3B82F6', flexShrink: 0, marginTop: 2 }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-black text-sm" style={{ color: '#3B82F6' }}>
                          Suggested Position Size
                        </p>
                        <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--muted-text)' }}>
                          Optimal size to match your risk and stop settings
                        </p>
                      </div>
                      <p className="font-mono font-black text-xl flex-shrink-0" style={{ color: '#3B82F6' }}>
                        {ready ? fmtUsd(suggestedPos) : '—'}
                      </p>
                    </div>

                    {/* Entry Price input */}
                    <div>
                      <div className="flex items-start gap-3">
                        <Zap size={18} style={{ color: '#F5A623', flexShrink: 0, marginTop: 28 }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-1">
                            <label className="font-display font-bold text-xs tracking-widest uppercase" style={{ color: 'var(--star-white)' }}>
                              Entry Price <span className="normal-case tracking-normal font-body font-normal text-xs" style={{ color: 'var(--muted-text)' }}>(Optional)</span>
                            </label>
                            <p className="text-xs" style={{ color: 'var(--muted-text)' }}>Required to calculate liquidation level</p>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl mt-2"
                            style={{ border: '1.5px solid #F5A623', background: 'rgba(245,166,35,0.06)' }}
                          >
                            <span className="font-mono text-sm font-bold" style={{ color: 'var(--muted-text)' }}>$</span>
                            <input
                              type="number"
                              value={entryPrice}
                              onChange={e => setEntryPrice(e.target.value)}
                              placeholder="e.g. 45000"
                              className="flex-1 bg-transparent outline-none font-mono text-sm"
                              style={{ color: 'var(--muted-text)', minWidth: 0 }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Calculated prices when entry is filled */}
                      {entry > 0 && slPct > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-2 gap-3 mt-3 ml-7"
                        >
                          <div className="rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                            <p className="text-xs mb-1" style={{ color: 'var(--muted-text)' }}>Stop Loss Price</p>
                            <p className="font-mono font-bold text-sm" style={{ color: '#EF4444' }}>{fmtUsd(slPrice)}</p>
                          </div>
                          {target > 0 && (
                            <div className="rounded-lg p-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                              <p className="text-xs mb-1" style={{ color: 'var(--muted-text)' }}>Target Price</p>
                              <p className="font-mono font-bold text-sm" style={{ color: '#22C55E' }}>{fmtUsd(tgtPrice)}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Learn banner */}
            <button
              onClick={() => { onGoToHowItWorks(); setOpen(false); }}
              className="w-full flex items-center justify-between mt-3 px-4 py-3 rounded-xl transition-all hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--space-border)' }}
            >
              <span className="font-body font-bold text-sm text-left" style={{ color: 'var(--star-white)' }}>
                This is how professionals manage risk
              </span>
              <span className="flex items-center gap-1.5 font-display font-black text-xs tracking-wider flex-shrink-0 ml-3" style={{ color: '#22C55E' }}>
                Learn the full system <ExternalLink size={12} />
              </span>
            </button>

            <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: 'var(--muted-text)' }}>
              <AlertTriangle size={11} />
              Simulation only — not live trade execution.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
