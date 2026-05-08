import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Star, Zap, Settings, Shield, TrendingUp, BarChart2, Database, AlertTriangle, Download, HelpCircle, Lightbulb } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'start',
    label: 'START HERE',
    sublabel: 'Start Here',
    icon: Star,
    color: '#F5A623',
    highlight: true,
    questions: [
      { q: 'What Is the Space Trades Compounding Engine?', a: 'The Space Trades Compounding Engine is a multi-trade simulation tool that shows you how your capital grows across up to 6 trades. You set your starting capital, gain %, leverage, and allocation — and the tool calculates how each trade compounds into the next in real time.' },
      { q: 'What is the difference between Portfolio Return and Trade Return?', a: 'Portfolio Return measures growth on your total capital including any unallocated (sideline) portion — this is your real account result. Trade Return measures ROI only on the capital you actually deployed in trades, showing how efficiently your strategy performed on deployed funds.' },
      { q: 'What does "Risk %" mean?', a: 'Risk % is the maximum percentage of your portfolio you\'re willing to lose on a single trade. The Risk Engine uses this value to automatically calculate the required stop-loss distance on your leveraged position, so you always know your worst-case exposure.' },
      { q: 'What is sideline (unallocated) capital?', a: 'Sideline capital is the portion of your portfolio you choose not to deploy in a trade. If you allocate 75%, the remaining 25% sits safely on the sideline — it\'s not at risk and doesn\'t participate in that trade\'s gains or losses.' },
    ],
  },
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: Zap,
    color: '#14B8A6',
    questions: [
      { q: 'How do I start using the tool?', a: 'Enter your starting capital in Trade 1, pick a preset (Conservative, Moderate, or Aggressive), then watch the results cascade through all 6 trades. Adjust the gain %, leverage, and allocation sliders to explore different scenarios.' },
      { q: 'What does each trade represent?', a: 'Each trade card represents one position in your sequence. The ending balance of one trade automatically becomes the starting capital of the next — this is how compounding works across the sequence.' },
      { q: 'Do I need trading experience to use this tool?', a: 'No. The tool is designed for all experience levels. Start with a preset like Conservative or Moderate to see how the numbers work, then tweak individual settings to match your real trading style.' },
    ],
  },
  {
    id: 'trade-setup',
    label: 'Trade Setup & Inputs',
    icon: Settings,
    color: 'var(--muted-text)',
    questions: [
      { q: 'How does the asset (trading pair) field work?', a: 'The trading pair field (e.g. BTC/USDT) is a reference label for your own notes. It does not affect any calculations — it simply helps you identify which market each trade in the sequence is for.' },
      { q: 'What is leverage and how does it affect my results?', a: 'Leverage multiplies your position size. At 10x, a $1,000 allocation controls a $10,000 position. Both gains and losses are amplified by the leverage multiplier, and your liquidation price moves much closer to your entry.' },
      { q: 'What does Gain % represent?', a: 'Gain % is the percentage move your trade makes. A 7% gain on a 10x leveraged $1,000 allocation returns $700 in profit, not $70. You can enter negative values to model a losing trade.' },
      { q: 'What is the difference between flat fee and % fee?', a: 'Flat fee charges a fixed dollar amount per trade regardless of size (e.g. $10). Percentage fee charges a portion of your gross profit (e.g. 0.1%). Use % fee for exchange commissions and flat fee for fixed-cost brokers.' },
      { q: 'What is Capital Allocation % on Trades 2–6?', a: 'This controls how much of the previous trade\'s ending balance you put into the next trade. 100% means you deploy everything; 50% means half stays on the sideline. Lower allocation reduces both risk and compounding speed.' },
    ],
  },
  {
    id: 'risk',
    label: 'Risk Engine & Capital Management',
    icon: Shield,
    color: '#EF4444',
    questions: [
      { q: 'What Is "Max Loss Per Trade (%)"?', a: 'This is the maximum percentage of your total capital you\'re willing to lose on a single trade. Set it using the Risk Control slider on each trade card. The Risk Engine instantly calculates your stop-loss distance on the leveraged position.' },
      { q: 'What Is "Required Stop Loss Distance"?', a: 'This is the percentage move against your position that triggers your stop loss. It\'s calculated as: (Max Loss % × Capital) ÷ Position Size. Smaller risk % or higher leverage means a tighter stop.' },
      { q: 'What is Risk/Reward ratio?', a: 'Risk/Reward compares your potential profit target to your stop-loss size. A 3:1 ratio means you aim to make 3× your risk on every trade. Strong risk/reward combined with a solid win rate creates long-term positive expectancy.' },
      { q: 'What Is Suggested Position Size?', a: 'The recommended allocation given your risk settings — ensuring that if your stop loss is hit, you lose no more than your defined Max Loss %. It keeps your position sizing disciplined and consistent.' },
      { q: 'What Is the Liquidation Price?', a: 'The price level at which your entire margin is wiped out. At 10x leverage a 10% adverse move liquidates you; at 50x leverage that\'s just a 2% move. Always know your liquidation distance before entering a trade.' },
    ],
  },
  {
    id: 'sideline',
    label: 'Sideline Capital',
    icon: TrendingUp,
    color: '#22C55E',
    questions: [
      { q: 'What is sideline capital?', a: 'Sideline capital is the portion of your portfolio not deployed in a trade. It sits safely outside the position, is not subject to that trade\'s gain or loss, and remains available for future trades.' },
      { q: 'How do I deploy sideline capital into a trade?', a: 'Increase the Capital Allocation % slider toward 100% on any trade card. This moves more of the previous balance into the active position. The sideline amount shown updates in real time.' },
      { q: 'Do I have to use all of my sideline capital?', a: 'No. Keeping capital on the sideline reduces risk and gives you reserves for future opportunities. Many traders intentionally keep 25–50% on the sideline to manage drawdown risk.' },
      { q: 'How does sideline capital affect compounding?', a: 'Only deployed capital compounds. If you allocate 50%, only that half participates in gains and losses. The sideline portion stays flat. Lower allocation = slower compounding but significantly lower drawdown risk.' },
    ],
  },
  {
    id: 'dashboard',
    label: 'Performance Dashboard',
    icon: BarChart2,
    color: '#3B82F6',
    questions: [
      { q: 'What is the difference between Portfolio Return and Trade Return in the Dashboard?', a: 'Portfolio Return = total profit ÷ starting capital. This is your true account growth. Trade Return = total profit ÷ total capital deployed. This shows how efficiently your deployed capital worked.' },
      { q: 'Why do the Portfolio and Trade numbers look so different?', a: 'If you kept capital on the sideline, Trade Return will be higher because it only accounts for what you put to work. Portfolio Return is always the more conservative and accurate measure of your actual wealth growth.' },
      { q: 'What does the Equity Curve show?', a: 'The equity curve charts your portfolio value after every trade in the sequence. Gold dots mark individual trade outcomes. The dashed line shows your starting capital as a reference point for gains and losses.' },
      { q: 'What is the difference between ROI and Profit?', a: 'Profit is the raw dollar amount gained (e.g. $500). ROI is that gain expressed as a percentage of your starting capital (e.g. 50% on a $1,000 start). Both are shown so you can evaluate results in context.' },
    ],
  },
  {
    id: 'strategy',
    label: 'Strategy Builder',
    icon: TrendingUp,
    color: '#06B6D4',
    questions: [
      { q: 'What does the Strategy Builder do?', a: 'It runs 300 Monte Carlo simulations of your strategy over a selected time horizon, projecting a range of possible equity outcomes based on your win rate, average gain/loss, leverage, fee, and trade frequency.' },
      { q: 'What is Win Rate and how is it used?', a: 'Win Rate is the percentage of trades you expect to win. The simulator randomly assigns wins and losses to each trade based on this probability, then shows the median outcome and confidence band across all simulations.' },
      { q: 'What Is Expectancy?', a: 'Expectancy is the average dollar amount you expect to make per trade, calculated from your win rate, average win %, average loss %, leverage, and fee per trade. A positive expectancy means your strategy is profitable over time.' },
      { q: 'How should I use Daily and Weekly horizons?', a: 'Daily simulates roughly 1 month of activity; Weekly simulates 3 months. Choose based on how frequently you trade. Day traders use Daily; swing traders use Weekly or longer horizons.' },
      { q: 'Is the Strategy Builder a prediction of real results?', a: 'No. It is a probability simulation based on your inputs. Real markets involve slippage, emotional decisions, and changing conditions. Use the Strategy Builder to stress-test your approach, not to guarantee outcomes.' },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced & Pro Trader Questions',
    icon: Zap,
    color: '#8B5CF6',
    questions: [
      { q: 'Why do my real trade results differ from the tool\'s projections?', a: 'The tool models ideal conditions with fixed inputs. Real trading involves slippage, partial fills, emotional decisions, and variable fees. Treat projections as a planning guide, not a guarantee.' },
      { q: 'How does a losing streak affect compounding?', a: 'Losses compound just like gains. A string of losses rapidly reduces your capital base, making recovery harder. This is why defining Max Loss Per Trade is critical — it limits the damage any single trade can do.' },
      { q: 'How does high leverage increase liquidation risk?', a: 'At 50x leverage, a 2% adverse move wipes your entire margin. High leverage moves your liquidation price dangerously close to your entry. Always set a stop loss well inside the liquidation distance.' },
      { q: 'How does Capital Allocation % affect compounding?', a: 'Lower allocation reduces both upside and downside proportionally. 50% allocation means gains and losses are halved relative to your full portfolio. Full 100% allocation maximizes compounding speed but also maximizes drawdown exposure.' },
      { q: 'How does compounding actually work in this tool?', a: 'Each trade\'s ending balance becomes the next trade\'s starting capital automatically. Profits stack on profits — this is why small differences in gain % or allocation produce dramatically different results over 6 trades.' },
      { q: 'Can I model a losing trade using negative Gain %?', a: 'Yes. Enter a negative value in the Gain % field (e.g. -7%) or drag the slider below zero to simulate a losing trade and see exactly how it impacts your portfolio total and subsequent trades.' },
      { q: 'What is a practical Risk/Reward ratio to target?', a: 'Most professional traders target at least 2:1 or 3:1. This means for every $1 risked, you aim to make $2–$3. Combined with a win rate above 40%, this creates long-term positive expectancy.' },
      { q: 'How should I use the Strategy Builder alongside the Six Trade Calculator?', a: 'Use the Six Trade Calculator to plan specific trade sequences with real numbers. Use the Strategy Builder to validate that your overall strategy (win rate, R:R, leverage) has positive expectancy over months of trading.' },
    ],
  },
  {
    id: 'exports',
    label: 'Exports & Data',
    icon: Download,
    color: '#F59E0B',
    questions: [
      { q: 'What does the CSV export include?', a: 'The CSV includes all trade details: pair, direction, starting capital, allocation %, leverage, gain %, gross profit, fees, net gain, and ending balance for each trade. Check "Include trade notes in export" to add your notes column.' },
      { q: 'What does the PDF export include?', a: 'The PDF export opens your browser\'s print dialog, letting you save a formatted snapshot of your full trade sequence as a PDF file — useful for records, screenshots, or sharing with others.' },
      { q: 'Can I include or exclude trade journal notes from exports?', a: 'Yes. Use the "Include trade notes in export" checkbox in the Trade Sequence section before clicking Export CSV. Uncheck it to keep your notes private and out of the exported file.' },
      { q: 'Where is my data stored?', a: 'All data — saved scenarios, journal trades, and settings — is stored locally in your browser using localStorage. Nothing is sent to any server. Clearing your browser data will permanently remove your saved data.' },
    ],
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    icon: AlertTriangle,
    color: '#EF4444',
    questions: [
      { q: "My numbers don't match what I expected — what should I check?", a: 'Check your Capital Allocation %, leverage, and fee settings on each trade. Also verify whether you\'re viewing Portfolio Return or Trade Return in the Performance Dashboard — they can look very different when sideline capital is involved.' },
      { q: 'How do I reset the tool to a clean state?', a: 'Click the Reset button in the Trade Sequence section to restore all trades to their default values. To remove a saved scenario, load it and save a blank one over it, or clear your browser\'s localStorage.' },
      { q: 'I cleared my browser data and lost my saved scenarios — can I recover them?', a: 'Unfortunately, no. Scenarios are stored only in your browser\'s localStorage and are not backed up anywhere. Always export critical setups as CSV before clearing browser data.' },
      { q: 'Common mistakes to avoid', a: 'Setting leverage too high without a stop loss plan. Using 100% allocation on every trade without accounting for losing streaks. Confusing Trade Return with Portfolio Return. Forgetting to account for fees. Treating projections as guaranteed outcomes.' },
    ],
  },
];

export default function FAQ({ onGoToCalculator, onGoToHowItWorks }) {
  const [search, setSearch]   = useState('');
  const [openId, setOpenId]   = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map(cat => ({
      ...cat,
      questions: cat.questions.filter(
        item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      ),
    })).filter(cat => cat.questions.length > 0);
  }, [search]);

  const toggle = id => setOpenId(prev => prev === id ? null : id);

  return (
    <motion.div
      className="flex flex-col gap-4 max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="font-display font-black text-4xl text-primary mb-3">
          Frequently Asked Questions
        </h1>
        <p className="font-body font-medium text-lg" style={{ color: 'var(--star-white)' }}>
          Everything you need to understand and use the Space Trades Compounding Engine with confidence.
        </p>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-xl border"
        style={{ background: '#1C1C24', borderColor: '#3F3F50' }}
      >
        <Search size={18} style={{ color: 'var(--muted-text)', flexShrink: 0 }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search FAQs..."
          className="bg-transparent outline-none flex-1 font-body font-medium text-base"
          style={{ color: 'var(--star-white)' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-sm font-semibold transition-colors" style={{ color: 'var(--muted-text)' }}>
            clear
          </button>
        )}
      </div>

      {/* Categories */}
      {filtered.map((cat, ci) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: ci * 0.03 }}
          className="rounded-2xl overflow-hidden"
          style={{
            border: cat.highlight ? `2px solid ${cat.color}88` : `1px solid #3A3A48`,
            background: cat.highlight
              ? `linear-gradient(135deg, ${cat.color}18 0%, #16161C 60%)`
              : '#16161C',
          }}
        >
          {/* Category header */}
          <div
            className="flex items-center gap-4 px-6 py-5 border-b"
            style={{ borderColor: '#2E2E3A' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${cat.color}25`, border: `1px solid ${cat.color}66` }}
            >
              <cat.icon size={18} style={{ color: cat.color }} />
            </div>
            <div>
              {cat.sublabel ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-black text-xs tracking-[0.15em] uppercase" style={{ color: cat.color }}>
                    {cat.label} —
                  </span>
                  <span className="font-display font-black text-base" style={{ color: '#F4F4F5' }}>{cat.sublabel}</span>
                </div>
              ) : (
                <span className="font-display font-black text-base" style={{ color: '#F4F4F5' }}>{cat.label}</span>
              )}
              <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted-text)' }}>
                {cat.questions.length} question{cat.questions.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Questions */}
          <div>
            {cat.questions.map((item, qi) => {
              const id    = `${cat.id}-${qi}`;
              const isOpen = openId === id;
              return (
                <div key={qi} style={{ borderBottom: qi < cat.questions.length - 1 ? '1px solid #2E2E3A' : 'none' }}>
                  <button
                    onClick={() => toggle(id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-all"
                    style={{ background: isOpen ? `${cat.color}0D` : 'transparent' }}
                    onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="font-body font-bold text-base leading-snug" style={{ color: '#F4F4F5' }}>
                      {item.q}
                    </span>
                    <ChevronDown
                      size={18}
                      style={{
                        color: isOpen ? cat.color : '#A1A1AA',
                        flexShrink: 0,
                        transition: 'transform 0.2s, color 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          className="px-6 pb-6 pt-2 ml-6"
                          style={{ borderLeft: `3px solid ${cat.color}` }}
                        >
                          <p className="font-body font-medium text-base leading-relaxed" style={{ color: 'var(--star-white)' }}>
                            {item.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* No results */}
      {filtered.length === 0 && (
        <div className="panel flex flex-col items-center gap-3 py-16 text-center">
          <HelpCircle size={36} style={{ color: 'var(--muted-text)', opacity: 0.5 }} />
          <div className="font-display font-bold text-sm text-primary">No results for "{search}"</div>
          <div className="text-xs text-muted font-mono">Try a different keyword or browse the categories above</div>
        </div>
      )}

      {/* Footer CTA */}
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: 'var(--space-navy)', border: '1px solid var(--space-border)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)' }}
        >
          <Lightbulb size={18} style={{ color: '#F5A623' }} />
        </div>
        <h2 className="font-display font-black text-lg text-primary mb-2">Still have questions?</h2>
        <p className="font-body text-sm mb-1" style={{ color: 'var(--muted-text)' }}>
          This tool is designed to be self-guided. Most answers are covered above.
        </p>
        <p className="font-body text-sm mb-5" style={{ color: 'var(--muted-text)' }}>
          Explore the <strong className="text-primary">How It Works</strong> tab for a full walkthrough, or use the{' '}
          <strong className="text-primary">Strategy Builder</strong> to see your plan in action.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onGoToHowItWorks}
            className="px-5 py-2.5 rounded-xl text-sm font-display font-bold tracking-wider transition-all"
            style={{ background: '#F5A623', color: '#000' }}
          >
            How It Works
          </button>
          <button
            onClick={onGoToCalculator}
            className="px-5 py-2.5 rounded-xl text-sm font-display font-bold tracking-wider transition-all border"
            style={{ borderColor: 'var(--space-border)', color: 'var(--muted-text)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#22C55E'; e.currentTarget.style.color = '#22C55E'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--space-border)'; e.currentTarget.style.color = 'var(--muted-text)'; }}
          >
            Go to Calculator
          </button>
        </div>
      </div>
    </motion.div>
  );
}
