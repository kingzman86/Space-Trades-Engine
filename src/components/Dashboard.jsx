import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import TabBar from './TabBar';
import StatCard from './StatCard';
import CompoundCalculator from './CompoundCalculator';
import StrategyBuilder from './StrategyBuilder';
import ScenarioCompare from './ScenarioCompare';
import HowItWorks from './HowItWorks';
import FAQ from './FAQ';
import TradeJournal from './TradeJournal';
import Settings from './Settings';
import StarField from './StarField';
import MatrixField from './MatrixField';
import { useTheme } from '../context/ThemeContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calcTradeStats } from '../utils/math';
import { formatCurrency, formatPercent } from '../utils/formatters';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};
const cardVariant = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function Dashboard({ onLock }) {
  const [activeTab, setActiveTab] = useState('calculator');
  const [calcStats, setCalcStats] = useState(null);
  const [trades] = useLocalStorage('st_trades', []);
  const { theme } = useTheme();

  const stats = useMemo(() => calcTradeStats(trades || []), [trades]);

  const handleLock = () => {
    localStorage.removeItem('st_access');
    onLock();
  };

  /* Journal stats — shown only on Journal tab */
  const journalStats = [
    { label: 'Total Trades',  value: `${(trades || []).length}`,               color: 'neutral', icon: '📋' },
    { label: 'Win Rate',      value: formatPercent(stats.winRate, 1),           color: stats.winRate >= 50 ? 'green' : 'red', icon: '🎯' },
    { label: 'Total P&L',    value: formatCurrency(stats.totalPnl),            color: stats.totalPnl >= 0 ? 'green' : 'red', icon: stats.totalPnl >= 0 ? '🚀' : '📉' },
    { label: 'Avg Win %',    value: formatPercent(stats.avgWinPct, 2),         color: 'green', icon: '📈' },
    { label: 'Avg Loss %',   value: formatPercent(stats.avgLossPct, 2),        color: 'red',   icon: '⚠️' },
    { label: 'Profit Factor', value: isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : '∞', color: stats.profitFactor >= 1 ? 'gold' : 'red', icon: '⚡' },
  ];

  return (
    <div
      className="relative min-h-screen flex flex-col page-bg"
      style={{ backgroundColor: 'var(--space-black)' }}
    >
      {theme === 'matrix' ? <MatrixField /> : <StarField />}

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar onLock={handleLock} calcStats={activeTab === 'calculator' ? calcStats : null} />

        {/* Hero banner — calculator tab only */}
        <AnimatePresence>
          {activeTab === 'calculator' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative z-10 border-b border-space-border overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(12,12,15,0.95) 50%, rgba(245,166,35,0.08) 100%)',
                boxShadow: '0 4px 32px rgba(34,197,94,0.08)',
              }}
            >
              <div className="max-w-7xl mx-auto px-8 py-8 flex items-center gap-8">
                <img
                  src="/Space_Trade_Logo.png"
                  alt="Space Trades"
                  className="h-20 w-auto hidden sm:block flex-shrink-0"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(245,200,66,0.55))' }}
                />
                <div className="flex-1 min-w-0">
                  <h1 className="font-display font-black text-2xl sm:text-4xl tracking-wider uppercase leading-tight">
                    <span className="text-candle-green" style={{ textShadow: '0 0 32px rgba(34,197,94,0.5)' }}>Trade Smarter.</span>{' '}
                    <span className="text-gold-primary" style={{ textShadow: '0 0 32px rgba(245,166,35,0.45)' }}>Compound Faster.</span>
                  </h1>
                  <p className="font-mono text-sm sm:text-base mt-2 tracking-widest" style={{ color: 'var(--muted-text)' }}>
                    Real Strategies · Real Results · Real Wealth
                  </p>
                </div>
                <div className="hidden lg:flex items-center gap-8">
                  <HeroBadge label="Precise Entry"    icon="🎯" />
                  <HeroBadge label="Compound Capital" icon="💰" />
                  <HeroBadge label="Track Growth"     icon="📈" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-5">

          {/* Journal stats strip — only on journal tab */}
          <AnimatePresence>
            {activeTab === 'journal' && (trades || []).length > 0 && (
              <motion.div
                key="journal-stats"
                variants={stagger}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
              >
                {journalStats.map(s => (
                  <motion.div key={s.label} variants={cardVariant}>
                    <StatCard {...s} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === 'calculator' && (
              <motion.div key="calculator" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <CompoundCalculator onStatsChange={setCalcStats} />
              </motion.div>
            )}
            {activeTab === 'strategy' && (
              <motion.div key="strategy" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <StrategyBuilder />
              </motion.div>
            )}
            {activeTab === 'compare' && (
              <motion.div key="compare" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <ScenarioCompare />
              </motion.div>
            )}
            {activeTab === 'journal' && (
              <motion.div key="journal" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <TradeJournal />
              </motion.div>
            )}
            {activeTab === 'howitworks' && (
              <motion.div key="howitworks" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <HowItWorks onGoToCalculator={() => setActiveTab('calculator')} />
              </motion.div>
            )}
            {activeTab === 'faq' && (
              <motion.div key="faq" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <FAQ
                  onGoToCalculator={() => setActiveTab('calculator')}
                  onGoToHowItWorks={() => setActiveTab('howitworks')}
                />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div key="settings" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Settings />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="relative z-10 border-t border-space-border text-center py-3 px-4">
          <p className="text-xs text-muted font-mono">
            Space Trades © 2025 · Educational purposes only · Not financial advice
          </p>
        </footer>
      </div>
    </div>
  );
}

function HeroBadge({ icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' }}>{icon}</span>
      <span className="font-display font-bold text-[11px] tracking-widest uppercase" style={{ color: 'var(--muted-text)' }}>{label}</span>
    </div>
  );
}
