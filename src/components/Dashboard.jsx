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
              style={{ background: '#08080F' }}
            >
              {/* Ambient glow blobs */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-80px', left: '0%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(34,197,94,0.13) 0%, transparent 65%)' }} />
                <div style={{ position: 'absolute', top: '-60px', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245,166,35,0.09) 0%, transparent 65%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: '35%', width: '600px', height: '150px', background: 'radial-gradient(ellipse, rgba(34,197,94,0.05) 0%, transparent 70%)' }} />
              </div>

              <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-10 flex items-center gap-10">
                {/* Text block */}
                <div className="flex-1 min-w-0">
                  <h1 className="font-display font-black leading-none tracking-tight uppercase" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.75rem)' }}>
                    <span className="block" style={{ color: 'var(--star-white)', textShadow: '0 0 40px rgba(255,255,255,0.12)' }}>TRADE SMARTER.</span>
                    <span className="block" style={{ color: '#F5A623', textShadow: '0 0 40px rgba(245,166,35,0.45)' }}>COMPOUND FASTER.</span>
                  </h1>

                  {/* Gold tagline banner */}
                  <div
                    className="inline-flex items-center px-4 py-2 mt-4 rounded"
                    style={{ background: 'linear-gradient(90deg, #F5A623 0%, #E8961A 100%)', boxShadow: '0 0 24px rgba(245,166,35,0.35)' }}
                  >
                    <span className="font-display font-black text-xs sm:text-sm tracking-widest uppercase" style={{ color: '#000' }}>
                      REAL STRATEGIES. REAL RESULTS. REAL WEALTH.
                    </span>
                  </div>

                  {/* Feature icons grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-6">
                    {HERO_FEATURES.map(f => <HeroFeature key={f.label} {...f} />)}
                  </div>
                </div>

                {/* Logo */}
                <div className="hidden xl:flex flex-shrink-0 items-center justify-center" style={{ width: '210px' }}>
                  <img
                    src="/Space_Trade_Logo.png"
                    alt="Space Trades"
                    style={{ width: '200px', height: 'auto', filter: 'drop-shadow(0 0 40px rgba(245,200,66,0.65)) drop-shadow(0 0 80px rgba(34,197,94,0.25))' }}
                  />
                </div>
              </div>

              {/* Projected outcome strip */}
              {calcStats && (
                <div className="relative border-t border-space-border" style={{ background: 'rgba(0,0,0,0.45)' }}>
                  <div className="max-w-7xl mx-auto px-6 sm:px-10 py-2.5 flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--muted-text)' }}>◈ Projected Outcome</span>
                    <div className="w-px h-4" style={{ background: 'var(--space-border)' }} />
                    <OutcomeStat label="Start Capital"    value={formatCurrency(calcStats.starting)} />
                    <span className="text-xs" style={{ color: 'var(--space-border)' }}>→</span>
                    <OutcomeStat label="Projected Final"  value={formatCurrency(calcStats.final)} color="green" />
                    <span className="text-xs" style={{ color: 'var(--space-border)' }}>→</span>
                    <OutcomeStat label="Total ROI"        value={`${calcStats.returnPct >= 0 ? '+' : ''}${calcStats.returnPct.toFixed(2)}%`} color="gold" />
                  </div>
                </div>
              )}
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

const HERO_FEATURES = [
  { icon: '🎯', label: 'PRECISE ENTRY',      sub: 'STRATEGIES'       },
  { icon: '🛡️', label: 'CONTROL RISK',       sub: 'BEFORE ENTRY'     },
  { icon: '💰', label: 'COMPOUND CAPITAL',   sub: 'MAXIMIZE GROWTH'  },
  { icon: '📊', label: 'ALLOCATE SMARTER',   sub: 'GROW FASTER'      },
  { icon: '📈', label: 'TRACK GROWTH',       sub: 'STAY SHARP'       },
  { icon: '🚀', label: 'CONSISTENCY TODAY',  sub: 'FREEDOM TOMORROW' },
];

function HeroFeature({ icon, label, sub }) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 8px rgba(245,200,66,0.4))' }}>{icon}</span>
      <span className="font-display font-black text-[9px] tracking-wider uppercase text-center leading-tight" style={{ color: 'var(--star-white)' }}>{label}</span>
      <span className="font-mono text-[8px] tracking-wider uppercase text-center" style={{ color: '#22C55E' }}>{sub}</span>
    </div>
  );
}

function OutcomeStat({ label, value, color }) {
  const col = color === 'green' ? '#22C55E' : color === 'gold' ? '#F5A623' : 'var(--star-white)';
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--muted-text)' }}>{label}</span>
      <span className="num-mono text-sm font-black" style={{ color: col }}>{value}</span>
    </div>
  );
}
