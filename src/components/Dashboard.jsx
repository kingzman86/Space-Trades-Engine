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
              style={{ background: '#05050A', minHeight: '460px' }}
            >
              {/* === FLOATING GOLD COINS (full section) === */}
              {[
                { size: 78, style: { bottom: '12%', right: '1%'   }, delay: 0   },
                { size: 60, style: { bottom: '4%',  right: '6%'   }, delay: 0.5 },
                { size: 46, style: { bottom: '18%', right: '10%'  }, delay: 0.9 },
                { size: 54, style: { top:    '8%',  right: '2%'   }, delay: 0.3 },
                { size: 36, style: { top:    '22%', right: '15%'  }, delay: 0.7 },
                { size: 42, style: { bottom: '8%',  left:  '2%'   }, delay: 0.4 },
                { size: 30, style: { top:    '12%', left:  '6%'   }, delay: 1.1 },
                { size: 34, style: { bottom: '25%', left:  '10%'  }, delay: 0.6 },
              ].map((c, i) => (
                <motion.div key={i} style={{ position: 'absolute', zIndex: 3, pointerEvents: 'none', ...c.style }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}
                >
                  <GoldCoin size={c.size} />
                </motion.div>
              ))}

              {/* === BACKGROUND LAYERS === */}
              {/* Deep green ground glow */}
              <div style={{ position: 'absolute', bottom: -80, left: '20%', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(34,197,94,0.18) 0%, transparent 60%)', pointerEvents: 'none' }} />
              {/* Gold right glow */}
              <div style={{ position: 'absolute', top: -60, right: '0%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 55%)', pointerEvents: 'none' }} />
              {/* Faint top-left green */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '450px', height: '350px', background: 'radial-gradient(circle at 10% 10%, rgba(34,197,94,0.09) 0%, transparent 60%)', pointerEvents: 'none' }} />
              {/* Center energy glow behind logo */}
              <div style={{ position: 'absolute', top: '50%', left: '52%', transform: 'translate(-50%,-50%)', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, rgba(245,166,35,0.06) 40%, transparent 70%)', pointerEvents: 'none' }} />


              {/* === MAIN CONTENT === */}
              <div style={{ position: 'relative', zIndex: 2, maxWidth: '1280px', margin: '0 auto', padding: '44px 40px', display: 'flex', alignItems: 'center', gap: '16px', minHeight: '460px' }}>

                {/* LEFT: Text */}
                <div style={{ flex: 1, minWidth: 0 }}>

                  {/* Main headline */}
                  <h1 style={{ margin: 0, lineHeight: 0.92, textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif", fontWeight: 900 }}>
                    <span style={{ display: 'block', fontSize: 'clamp(2.4rem, 4.8vw, 4.2rem)', color: '#FFFFFF', textShadow: '0 0 60px rgba(255,255,255,0.15)' }}>TRADE SMARTER.</span>
                    <span style={{ display: 'block', fontSize: 'clamp(2.4rem, 4.8vw, 4.2rem)', color: '#F5A623', textShadow: '0 0 60px rgba(245,166,35,0.55), 0 0 120px rgba(245,166,35,0.25)' }}>COMPOUND FASTER.</span>
                  </h1>

                  {/* Gold banner */}
                  <div style={{ display: 'inline-block', marginTop: 14, padding: '7px 18px', background: 'linear-gradient(90deg, #F5A623 0%, #D4860A 100%)', boxShadow: '0 0 28px rgba(245,166,35,0.45)' }}>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: 'clamp(0.65rem, 1.3vw, 0.9rem)', textTransform: 'uppercase', letterSpacing: '2.5px', color: '#000' }}>
                      REAL STRATEGIES. REAL RESULTS. REAL WEALTH.
                    </span>
                  </div>

                  {/* Brand + tagline row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: 'clamp(1rem, 2vw, 1.35rem)', color: '#22C55E', textTransform: 'uppercase', lineHeight: 1, textShadow: '0 0 28px rgba(34,197,94,0.55)' }}>SPACE TRADES</div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: 'clamp(0.6rem, 1.1vw, 0.78rem)', color: '#22C55E', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: 2, textShadow: '0 0 18px rgba(34,197,94,0.4)' }}>CMF COMPOUNDING ENGINE</div>
                    </div>
                    <div style={{ width: 2, height: 36, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 'clamp(0.6rem, 1vw, 0.78rem)', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1.4 }}>
                      THE ADVANTAGE<br /><span style={{ color: '#22C55E' }}>SERIOUS TRADERS</span> USE.
                    </div>
                  </div>

                  {/* Hexagon feature icons */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
                    {HERO_FEATURES.map(f => <HexFeature key={f.label} {...f} />)}
                  </div>
                </div>

                {/* RIGHT: Laptop + Coins */}
                <HeroLaptopPanel />
              </div>

              {/* Projected outcome strip */}
              {calcStats && (
                <div style={{ borderTop: '1px solid var(--space-border)', background: 'rgba(0,0,0,0.5)' }}>
                  <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '10px 40px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '3px' }}>◈ Projected Outcome</span>
                    <div style={{ width: 1, height: 16, background: 'var(--space-border)' }} />
                    <OutcomeStat label="Start Capital"   value={formatCurrency(calcStats.starting)} />
                    <span style={{ color: 'var(--space-border)', fontSize: 12 }}>→</span>
                    <OutcomeStat label="Projected Final" value={formatCurrency(calcStats.final)} color="green" />
                    <span style={{ color: 'var(--space-border)', fontSize: 12 }}>→</span>
                    <OutcomeStat label="Total ROI"       value={`${calcStats.returnPct >= 0 ? '+' : ''}${calcStats.returnPct.toFixed(2)}%`} color="gold" />
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

function HexFeature({ icon, label, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 74 }}>
      <div style={{
        width: 56, height: 56, flexShrink: 0,
        background: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.3)',
        clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem',
        boxShadow: '0 0 18px rgba(34,197,94,0.15)',
      }}>{icon}</div>
      <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: 7.5, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
      <span style={{ fontFamily: 'monospace', fontSize: 7, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'center' }}>{sub}</span>
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
  ['1','LONG','3X', '$61,250','$63,100','$60,800','1.55%','2.82%','WIN' ],
  ['2','LONG','5X', '$63,350','$65,400','$62,700','1.75%','3.58%','WIN' ],
  ['3','LONG','5X', '$63,500','$66,250','$64,900','1.50%','4.20%','WIN' ],
  ['4','LONG','10X','$66,300','$72,000','$67,400','1.75%','4.87%','OPEN'],
];

const KB_ROWS = [
  [1.4,1,1,1,1,1,1,1,1,1,1,1,1,1.6],
  [1.7,1,1,1,1,1,1,1,1,1,1,1,1,1.3],
  [1.9,1,1,1,1,1,1,1,1,1,1,1,2.1],
  [2.4,1,1,1,1,1,1,1,1,1,2.6],
];

function HeroLaptopPanel() {
  return (
    <div className="hidden lg:flex flex-shrink-0 items-end justify-center relative" style={{ width: '400px', minHeight: '340px' }}>

      {/* ── LAPTOP SHELL ── */}
      <div style={{ position: 'relative', width: '355px' }}>

        {/* ── SCREEN LID ── */}
        <div style={{
          background: 'linear-gradient(160deg, #28283a 0%, #18182a 100%)',
          borderRadius: '12px 12px 0 0',
          padding: '7px 7px 0',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
          boxShadow: '0 0 50px rgba(34,197,94,0.22), 0 0 25px rgba(245,166,35,0.08)',
        }}>
          {/* Webcam dot */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#111', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 0 4px rgba(34,197,94,0.4)' }} />
          </div>

          {/* Inner screen — black panel */}
          <div style={{
            background: '#04040A',
            borderRadius: '5px 5px 0 0',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.9)',
            border: '1px solid rgba(0,0,0,0.7)',
            borderBottom: 'none',
          }}>
            {/* Title bar */}
            <div style={{ background: '#0C0C18', padding: '4px 7px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {['#FF5F57','#FFBD2E','#28CA41'].map((bg, i) => (
                <div key={i} style={{ width: 5.5, height: 5.5, borderRadius: '50%', background: bg, flexShrink: 0 }} />
              ))}
              <div style={{ flex: 1, marginLeft: 6, height: 9, background: 'rgba(255,255,255,0.04)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 4.5, fontFamily: 'monospace', color: '#3a3a4a' }}>space-trades.app</span>
              </div>
            </div>

            {/* ── APP CONTENT ── */}
            <div style={{ padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>

              {/* App header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <img src="/Space_Trade_Logo.png" style={{ height: 18, width: 'auto', filter: 'drop-shadow(0 0 5px rgba(245,200,66,0.65))' }} alt="" />
                <div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: 7, color: '#F5A623', textTransform: 'uppercase', letterSpacing: 0.8 }}>Space Trades</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 4, color: '#2e2e3e', textTransform: 'uppercase' }}>CMF Compounding Engine</div>
                </div>
                <div style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 2, padding: '1px 4px' }}>
                  <span style={{ fontSize: 4.5, fontFamily: 'monospace', color: '#22C55E', fontWeight: 700 }}>● LIVE</span>
                </div>
              </div>

              {/* 3 dashboard columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 4 }}>

                {/* Trade Sequence */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 3, padding: '4px 5px' }}>
                  <div style={{ fontSize: 4, fontFamily: 'monospace', color: '#3a3a4a', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>Trade Sequence</div>
                  <svg width="100%" height="26" viewBox="0 0 80 26" preserveAspectRatio="none">
                    <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity="0.25"/><stop offset="100%" stopColor="#22C55E" stopOpacity="0"/></linearGradient></defs>
                    <polygon points="0,24 13,20 26,15 39,9 52,5 65,3 80,1 80,26 0,26" fill="url(#sg)" />
                    <polyline points="0,24 13,20 26,15 39,9 52,5 65,3 80,1" fill="none" stroke="#22C55E" strokeWidth="1.5"/>
                  </svg>
                  <div style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 700, color: '#22C55E', marginTop: 2 }}>+178.91%</div>
                  <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#3a3a4a', marginBottom: 2 }}>Total Projected Return</div>
                  <div style={{ fontSize: 7, fontFamily: 'monospace', fontWeight: 700, color: '#22C55E' }}>$24,782.35</div>
                  <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#3a3a4a', marginBottom: 2 }}>Real Profit</div>
                  <div style={{ fontSize: 6.5, fontFamily: 'monospace', fontWeight: 700, color: '#22C55E' }}>$34,782.35</div>
                  <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#3a3a4a' }}>Final Portfolio Value</div>
                </div>

                {/* Risk Control */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 3, padding: '4px 5px' }}>
                  <div style={{ fontSize: 4, fontFamily: 'monospace', color: '#3a3a4a', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>Risk Control</div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(34,197,94,0.12)" strokeWidth="6"/>
                      <circle cx="20" cy="20" r="15" fill="none" stroke="#22C55E" strokeWidth="6" strokeDasharray="20 74" strokeDashoffset="27" strokeLinecap="round"/>
                      <text x="20" y="23" textAnchor="middle" fontSize="7.5" fontFamily="monospace" fontWeight="700" fill="#22C55E">1.75%</text>
                    </svg>
                  </div>
                  <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#3a3a4a', textAlign: 'center', marginBottom: 3 }}>Risk Per Trade</div>
                  <div style={{ fontSize: 6.5, fontFamily: 'monospace', fontWeight: 700, color: '#F5A623' }}>4.21%</div>
                  <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#3a3a4a', marginBottom: 2 }}>Max Drawdown</div>
                  <div style={{ fontSize: 6.5, fontFamily: 'monospace', fontWeight: 700, color: '#22C55E' }}>1:3.27</div>
                  <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#3a3a4a' }}>Risk Reward Ratio</div>
                </div>

                {/* Capital Allocation */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 3, padding: '4px 5px' }}>
                  <div style={{ fontSize: 4, fontFamily: 'monospace', color: '#3a3a4a', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>Capital Alloc.</div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="15" fill="none" stroke="#1a3020" strokeWidth="6"/>
                      <circle cx="20" cy="20" r="15" fill="none" stroke="#F5A623" strokeWidth="6" strokeDasharray="57 37" strokeDashoffset="27" strokeLinecap="round"/>
                      <circle cx="20" cy="20" r="15" fill="none" stroke="#22C55E" strokeWidth="6" strokeDasharray="37 57" strokeDashoffset="-26" strokeLinecap="round"/>
                      <text x="20" y="19" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="#F5A623">$10K</text>
                      <text x="20" y="25" textAnchor="middle" fontSize="3.5" fontFamily="monospace" fill="#555">total</text>
                    </svg>
                  </div>
                  <div style={{ fontSize: 5.5, fontFamily: 'monospace', fontWeight: 700, color: '#22C55E' }}>$7,250 <span style={{ fontSize: 3.5, color: '#3a3a4a', fontWeight: 400 }}>72.5%</span></div>
                  <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#3a3a4a', marginBottom: 2 }}>Deployed</div>
                  <div style={{ fontSize: 5.5, fontFamily: 'monospace', fontWeight: 700, color: '#F5A623' }}>$2,750 <span style={{ fontSize: 3.5, color: '#3a3a4a', fontWeight: 400 }}>27.5%</span></div>
                  <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#3a3a4a' }}>Sideline</div>
                </div>
              </div>

              {/* Trade Breakdown table */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 4 }}>
                <div style={{ fontSize: 4, fontFamily: 'monospace', color: '#333', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Trade Breakdown</div>
                <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 0.8fr 0.7fr 1fr 1fr 0.7fr 0.7fr 0.7fr 0.8fr', gap: 1.5, marginBottom: 2 }}>
                  {['#','DIR','LEV','ENTRY','TARGET','SL','RISK','RWRD','STATUS'].map(h => (
                    <div key={h} style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#2e2e3e', textAlign: 'center' }}>{h}</div>
                  ))}
                </div>
                {LAPTOP_TRADES.map(([n,dir,lev,entry,target,sl,risk,rwrd,status]) => (
                  <div key={n} style={{ display: 'grid', gridTemplateColumns: '0.4fr 0.8fr 0.7fr 1fr 1fr 0.7fr 0.7fr 0.7fr 0.8fr', gap: 1.5, marginBottom: 2 }}>
                    <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#555', textAlign: 'center' }}>{n}</div>
                    <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#22C55E', textAlign: 'center' }}>{dir}</div>
                    <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#777', textAlign: 'center' }}>{lev}</div>
                    <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#777', textAlign: 'center' }}>{entry}</div>
                    <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#777', textAlign: 'center' }}>{target}</div>
                    <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#EF4444', textAlign: 'center' }}>{sl}</div>
                    <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#F5A623', textAlign: 'center' }}>{risk}</div>
                    <div style={{ fontSize: 3.5, fontFamily: 'monospace', color: '#22C55E', textAlign: 'center' }}>{rwrd}</div>
                    <div style={{ fontSize: 3.5, fontFamily: 'monospace', fontWeight: 700, color: status === 'WIN' ? '#22C55E' : '#F5A623', textAlign: 'center' }}>{status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── HINGE ── */}
        <div style={{ height: 5, background: 'linear-gradient(180deg,#222235 0%,#14141e 100%)', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none', borderBottom: 'none' }} />

        {/* ── KEYBOARD BASE ── */}
        <div style={{
          background: 'linear-gradient(180deg,#1e1e2e 0%,#12121c 100%)',
          borderRadius: '0 0 10px 10px',
          padding: '5px 8px 7px',
          border: '1px solid rgba(255,255,255,0.07)',
          borderTop: 'none',
          boxShadow: '0 10px 28px rgba(0,0,0,0.75)',
        }}>
          {KB_ROWS.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 1.5, marginBottom: 1.5 }}>
              {row.map((w, ki) => (
                <div key={ki} style={{ height: 5.5, flex: w, background: 'rgba(255,255,255,0.06)', borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.09)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ))}
          {/* Space bar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 1 }}>
            <div style={{ width: '55%', height: 5.5, background: 'rgba(255,255,255,0.06)', borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.09)' }} />
          </div>
          {/* Touchpad */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <div style={{ width: '38%', height: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
