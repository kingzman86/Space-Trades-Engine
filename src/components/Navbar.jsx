import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sun, Moon, RefreshCw, Terminal, ChevronRight, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import clsx from 'clsx';

export default function Navbar({ onLock, onReset, calcStats }) {
  const { theme, toggle } = useTheme();

  const { starting = 0, final: finalVal = 0, returnPct = 0 } = calcStats || {};

  return (
    <nav className="relative z-50 border-b border-space-border nav-bg">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-3 justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src="/Space_Trade_Logo.png" alt="Space Trades" className="h-7 w-auto"
            style={{ filter: 'drop-shadow(0 0 6px rgba(245,200,66,0.4))' }} />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display font-black text-gold-primary text-xs tracking-widest uppercase">Space Trades</span>
            <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'var(--muted-text)' }}>CMF Compounding Engine</span>
          </div>
        </div>

        {/* Live Stats — center */}
        {calcStats && (
          <div className="hidden md:flex items-center gap-1.5 flex-1 justify-center">
            <StatPill label="Start" value={formatCurrency(starting)} color="muted" icon={<DollarSign size={10} />} />
            <ChevronRight size={13} style={{ color: 'var(--space-border)', flexShrink: 0 }} />
            <StatPill label="Final" value={formatCurrency(finalVal)} color="green" icon={<TrendingUp size={10} />} />
            <ChevronRight size={13} style={{ color: 'var(--space-border)', flexShrink: 0 }} />
            <StatPill
              label="ROI"
              value={`${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%`}
              color={returnPct >= 0 ? 'gold' : 'red'}
              icon={<Zap size={10} />}
            />
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold uppercase tracking-wider text-muted hover:text-gold-primary hover:bg-space-navy border border-space-border transition-all"
            >
              <RefreshCw size={12} />
              <span className="hidden sm:block">Reset</span>
            </button>
          )}

          <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold uppercase tracking-wider text-muted hover:text-gold-primary hover:bg-space-navy transition-all"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' && (
                <motion.span key="matrix-btn" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Terminal size={14} />
                </motion.span>
              )}
              {theme === 'matrix' && (
                <motion.span key="sun-btn" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun size={14} />
                </motion.span>
              )}
              {theme === 'light' && (
                <motion.span key="moon-btn" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon size={14} />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="hidden sm:block">
              {theme === 'dark' ? 'Matrix' : theme === 'matrix' ? 'Light' : 'Dark'}
            </span>
          </motion.button>

          <button
            onClick={onLock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold uppercase tracking-wider text-muted hover:text-candle-red hover:bg-space-navy border border-space-border transition-all"
          >
            <Lock size={12} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function StatPill({ label, value, color, icon }) {
  const isGold  = color === 'gold';
  const isGreen = color === 'green';
  const isRed   = color === 'red';
  const textCol = isGold ? '#F5A623' : isGreen ? '#22C55E' : isRed ? '#EF4444' : 'var(--star-white)';
  const bg      = isGold ? 'rgba(245,166,35,0.12)' : isGreen ? 'rgba(34,197,94,0.1)' : 'var(--space-mid)';
  const border  = isGold ? 'rgba(245,166,35,0.35)' : isGreen ? 'rgba(34,197,94,0.25)' : 'var(--space-border)';
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <span style={{ color: textCol }}>{icon}</span>
      <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--muted-text)' }}>{label}</span>
      <span className="num-mono text-sm font-black" style={{ color: textCol, letterSpacing: '0.02em' }}>{value}</span>
    </div>
  );
}
