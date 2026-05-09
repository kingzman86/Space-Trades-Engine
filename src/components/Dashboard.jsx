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

                <HeroLaptopPanel />
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

function GoldCoin({ size }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 30%, #FFE57A 0%, #F5C842 35%, #D4950A 70%, #8B6214 100%)',
      boxShadow: `0 0 ${size * 0.28}px rgba(245,180,35,0.75), 0 ${size * 0.08}px ${size * 0.18}px rgba(0,0,0,0.7), inset 0 ${size * 0.07}px ${size * 0.08}px rgba(255,240,160,0.5)`,
      border: `${Math.max(2, Math.round(size * 0.04))}px solid rgba(255,205,50,0.55)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 900, color: '#7A4800',
      userSelect: 'none', flexShrink: 0,
    }}>₿</div>
  );
}

const LAPTOP_TRADES = [
  ['1', 'LONG', '3X',  '$61,250', '$63,100', 'WIN'],
  ['2', 'LONG', '5X',  '$63,350', '$65,400', 'WIN'],
  ['3', 'LONG', '8X',  '$63,500', '$66,250', 'WIN'],
  ['4', 'LONG', '10X', '$66,300', '$72,000', 'OPEN'],
];

function HeroLaptopPanel() {
  const coins = [
    { size: 74, pos: { bottom: '-8px', right: '-4px'  }, delay: 0   },
    { size: 58, pos: { bottom: '-12px', right: '62px'  }, delay: 0.4 },
    { size: 44, pos: { bottom: '-6px', right: '116px' }, delay: 0.8 },
    { size: 50, pos: { top: '8px',    right: '-8px'  }, delay: 0.3 },
    { size: 34, pos: { top: '68px',   left: '4px'   }, delay: 0.6 },
  ];

  return (
    <div className="hidden lg:flex flex-shrink-0 items-center justify-center relative" style={{ width: '380px', height: '300px' }}>

      {/* Floating gold coins */}
      {coins.map((c, i) => (
        <motion.div key={i} style={{ position: 'absolute', ...c.pos }}
          animate={{ y: [0, -9, 0] }}
          transition={{ duration: 3 + i * 0.25, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}
        >
          <GoldCoin size={c.size} />
        </motion.div>
      ))}

      {/* Laptop shell */}
      <div style={{ position: 'relative', width: '340px' }}>

        {/* Screen bezel */}
        <div style={{
          background: '#08080F',
          border: '2px solid rgba(34,197,94,0.4)',
          borderBottom: 'none',
          borderRadius: '10px 10px 0 0',
          overflow: 'hidden',
          boxShadow: '0 0 50px rgba(34,197,94,0.18), 0 0 30px rgba(245,166,35,0.1)',
        }}>
          {/* macOS-style title bar */}
          <div style={{ background: '#111118', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['#FF5F57','#FFBD2E','#28CA41'].map((bg, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: bg }} />
            ))}
            <div style={{ flex: 1, marginLeft: 8, height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 5, fontFamily: 'monospace', color: '#555' }}>space-trades.app</span>
            </div>
          </div>

          {/* App UI content */}
          <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>

            {/* Brand header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <img src="/Space_Trade_Logo.png" style={{ height: 20, width: 'auto', filter: 'drop-shadow(0 0 5px rgba(245,200,66,0.65))' }} alt="" />
              <div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: 7.5, color: '#F5A623', textTransform: 'uppercase', letterSpacing: 1 }}>Space Trades</div>
                <div style={{ fontFamily: 'monospace', fontSize: 5, color: '#3a3a4a', textTransform: 'uppercase', letterSpacing: 0.8 }}>CMF Compounding Engine</div>
              </div>
              <div style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: 3, padding: '1px 5px' }}>
                <span style={{ fontSize: 5, fontFamily: 'monospace', color: '#22C55E', fontWeight: 700 }}>● LIVE</span>
              </div>
            </div>

            {/* 3-col stat boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
              {[
                { label: 'Total Return', value: '+178.91%', color: '#22C55E' },
                { label: 'Risk/Trade',   value: '1.75%',    color: '#F5A623' },
                { label: 'Portfolio',    value: '$34,782',   color: '#22C55E' },
              ].map(s => (
                <div key={s.label} style={{ background: `${s.color}10`, border: `1px solid ${s.color}28`, borderRadius: 4, padding: '4px 5px' }}>
                  <div style={{ fontSize: 4.5, fontFamily: 'monospace', color: '#555', textTransform: 'uppercase', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Extra stat row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {[
                { label: 'Real Profit',   value: '$24,782.35', color: '#22C55E' },
                { label: 'Risk : Reward', value: '1 : 3.27',   color: '#F5A623' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 5, fontFamily: 'monospace', color: '#555', textTransform: 'uppercase' }}>{s.label}</span>
                  <span style={{ fontSize: 7, fontFamily: 'monospace', fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Trade breakdown */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 5 }}>
              <div style={{ fontSize: 5, fontFamily: 'monospace', color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Trade Breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 1fr 0.8fr 1fr 1fr 1fr', gap: 2, marginBottom: 3 }}>
                {['#','DIR','LEV','ENTRY','TARGET','STATUS'].map(h => (
                  <div key={h} style={{ fontSize: 4.5, fontFamily: 'monospace', color: '#3a3a4a', textAlign: 'center' }}>{h}</div>
                ))}
              </div>
              {LAPTOP_TRADES.map(([n, dir, lev, entry, target, status]) => (
                <div key={n} style={{ display: 'grid', gridTemplateColumns: '0.5fr 1fr 0.8fr 1fr 1fr 1fr', gap: 2, marginBottom: 2 }}>
                  <div style={{ fontSize: 4.5, fontFamily: 'monospace', color: '#555', textAlign: 'center' }}>{n}</div>
                  <div style={{ fontSize: 4.5, fontFamily: 'monospace', color: '#22C55E', textAlign: 'center' }}>{dir}</div>
                  <div style={{ fontSize: 4.5, fontFamily: 'monospace', color: '#777', textAlign: 'center' }}>{lev}</div>
                  <div style={{ fontSize: 4.5, fontFamily: 'monospace', color: '#777', textAlign: 'center' }}>{entry}</div>
                  <div style={{ fontSize: 4.5, fontFamily: 'monospace', color: '#777', textAlign: 'center' }}>{target}</div>
                  <div style={{ fontSize: 4.5, fontFamily: 'monospace', fontWeight: 700, color: status === 'WIN' ? '#22C55E' : '#F5A623', textAlign: 'center' }}>{status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Keyboard base */}
        <div style={{
          background: 'linear-gradient(180deg, #1a1a26 0%, #0f0f1a 100%)',
          height: 16, borderRadius: '0 0 8px 8px',
          border: '2px solid rgba(34,197,94,0.25)', borderTop: 'none',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
            width: 80, height: 7, background: 'rgba(255,255,255,0.05)',
            borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)',
          }} />
        </div>

        {/* Stand notch */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 60, height: 6, background: 'linear-gradient(180deg,#1a1a26,#0f0f1a)', borderRadius: '0 0 6px 6px', border: '2px solid rgba(34,197,94,0.15)', borderTop: 'none' }} />
        </div>
      </div>
    </div>
  );
}
