import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Settings2, Trash2, Download, RefreshCw, Info } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ACCESS_CODES } from '../config';

export default function Settings({ onReset }) {
  const [trades, , removeTrades] = useLocalStorage('st_trades', []);
  const [showConfirm, setShowConfirm] = useState(false);

  const exportAll = () => {
    const data = {
      exportDate: new Date().toISOString(),
      trades: JSON.parse(localStorage.getItem('st_trades') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'space-trades-backup.json'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported as JSON');
  };

  const resetJournal = () => {
    removeTrades();
    setShowConfirm(false);
    toast.success('Trade journal cleared');
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div className="panel p-6">
        <h2 className="font-display font-bold text-gold-primary text-xs tracking-widest uppercase flex items-center gap-2 mb-6">
          <Settings2 size={13} /> Settings & Data
        </h2>

        {/* Access codes */}
        <section className="mb-6">
          <h3 className="text-primary font-display text-xs font-semibold uppercase tracking-wider mb-3">
            Active Access Codes
          </h3>
          <div className="flex flex-wrap gap-2">
            {ACCESS_CODES.map(code => (
              <span key={code} className="px-3 py-1.5 rounded-lg bg-space-mid border border-space-border font-mono text-xs text-gold-primary tracking-wider">
                {code}
              </span>
            ))}
          </div>
          <p className="text-sm font-body font-medium mt-2" style={{ color: '#D4D4D8' }}>
            Edit <code className="text-gold-primary">src/config.js</code> to add or change access codes.
          </p>
        </section>

        {/* Data management */}
        <section className="mb-6">
          <h3 className="text-primary font-display text-xs font-semibold uppercase tracking-wider mb-3">
            Data Management
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-space-border text-sm font-display font-semibold uppercase tracking-wider text-muted hover:text-primary hover:border-gold-primary transition-all text-xs"
            >
              <Download size={13} /> Export All Data (JSON)
            </button>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-candle-red/30 text-candle-red hover:bg-candle-red/10 transition-all text-xs font-display font-semibold uppercase tracking-wider"
              >
                <Trash2 size={13} /> Clear Journal ({(trades || []).length} trades)
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-xs text-candle-red font-mono">Confirm delete?</span>
                <button
                  onClick={resetJournal}
                  className="px-3 py-1.5 rounded-lg bg-candle-red text-white text-xs font-display font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1.5 rounded-lg border border-space-border text-muted text-xs font-display font-semibold uppercase tracking-wider hover:text-primary transition-all"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* About */}
        <section>
          <h3 className="text-primary font-display text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Info size={13} /> About
          </h3>
          <div className="p-4 rounded-xl bg-space-mid border border-space-border">
            <div className="flex items-center gap-3 mb-3">
              <img src="/Space_Trade_Logo.png" alt="Space Trades" className="h-10 w-auto"
                style={{ filter: 'drop-shadow(0 0 8px rgba(245,200,66,0.3))' }} />
              <div>
                <div className="font-display font-bold text-gold-primary text-sm tracking-wider">Space Trades</div>
                <div className="font-body font-medium text-sm" style={{ color: '#D4D4D8' }}>Compounding Engine v1.0</div>
              </div>
            </div>
            <p className="text-sm font-body font-medium leading-relaxed" style={{ color: '#D4D4D8' }}>
              Educational tool for simulating compound growth on crypto trades.
              Not financial advice. Trading crypto involves significant risk of loss.
              Past simulation results do not guarantee future performance.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
