import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sun, Moon, RefreshCw } from 'lucide-react';
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
          <img src="/Space_Trade_Logo.png" alt="Space Trades" className="h-6 w-auto"
            style={{ filter: 'drop-shadow(0 0 6px rgba(245,200,66,0.4))' }} />
          <span className="font-display font-bold text-gold-primary text-xs tracking-widest hidden sm:block uppercase">
            Space Trades
          </span>
        </div>

        {/* Live Stats — center */}
        {calcStats && (
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <StatPill label="Start" value={`$${formatCurrency(starting)}`} color="muted" />
            <span className="text-space-border text-xs">|</span>
            <StatPill label="Final" value={`$${formatCurrency(finalVal)}`} color="green" />
            <span className="text-space-border text-xs">|</span>
            <StatPill
              label="Return"
              value={`${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%`}
              color={returnPct >= 0 ? 'green' : 'red'}
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
              {theme === 'dark' ? (
                <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun size={14} />
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon size={14} />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="hidden sm:block">{theme === 'dark' ? 'Light' : 'Dark'}</span>
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

function StatPill({ label, value, color }) {
  const col = color === 'green' ? '#22C55E' : color === 'red' ? '#EF4444' : 'var(--muted-text)';
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: 'var(--space-mid)' }}>
      <span className="text-[10px] font-mono text-muted uppercase tracking-wider">{label}:</span>
      <span className="num-mono text-xs font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}
