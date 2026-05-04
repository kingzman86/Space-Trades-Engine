import { motion } from 'framer-motion';
import { Zap, TrendingUp, Layers, Save, BarChart2, GitCompare, Database, Star, RefreshCw, ArrowRight } from 'lucide-react';

const SECTIONS = [
  {
    icon: Zap, color: '#F5A623', bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.25)',
    title: 'Start Here (60 Seconds)',
    body: null,
    steps: [
      'Enter your starting capital and set your first trade.',
      'Adjust gain %, leverage, and allocation to see how your capital grows.',
      'Watch how your trades compound across the sequence.',
    ],
    note: "You don't need to be perfect — just start adjusting and watch what happens.",
  },
  {
    icon: TrendingUp, color: '#22C55E', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)',
    title: 'How the Trade Sequence Works',
    body: 'This tool shows you how your money moves across multiple trades. Each trade builds on the previous one, allowing you to see:',
    bullets: [
      'How gains compound',
      'How allocation impacts growth',
      'How small changes affect your results',
    ],
    footer: 'Think of it as a simulation of your trading decisions before you risk real money.',
    note: null,
  },
  {
    icon: Layers, color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.25)',
    title: 'Use Presets or Build Your Own',
    body: 'You can start with a preset or create your own setup from scratch.',
    bullets: [
      ['Conservative', 'Lower risk, steady growth'],
      ['Moderate', 'Balanced approach'],
      ['Aggressive', 'Higher risk, faster growth'],
      ['Staggered', 'Reduces leverage over time'],
      ['Custom', 'Build your own strategy from scratch'],
    ],
    boldBullets: true,
    note: 'Start with a preset, then tweak it to match your style.',
  },
  {
    icon: Save, color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.25)',
    title: 'Save and Reuse Your Setups',
    body: 'Use the Scenario Manager to save your trade ideas and come back to them later.',
    bullets: ['Save scenarios', 'Rename them', 'Test different ideas quickly'],
    footer: 'This helps you compare strategies without starting over each time.',
    note: null,
  },
  {
    icon: BarChart2, color: '#14B8A6', bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.25)',
    title: 'Project Your Long-Term Growth',
    body: 'The Strategy Builder shows what happens over time. Adjust:',
    bullets: ['Win rate', 'Average gains / losses', 'Number of trades'],
    footer: 'And see how your capital could grow over weeks or months.',
    note: 'This is where you start thinking like a long-term trader.',
  },
  {
    icon: GitCompare, color: '#EF4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)',
    title: 'Compare Different Strategies',
    body: 'Use the Compare section to see multiple setups side-by-side. This helps you:',
    bullets: ['Spot better strategies', 'Understand risk vs reward', 'Make smarter decisions'],
    note: null,
  },
  {
    icon: Database, color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)',
    title: 'How Your Data Is Stored',
    body: 'This tool saves your data locally in your browser. That means:',
    bullets: ['Your scenarios stay on this device', 'Clearing browser data may remove saved setups'],
    extraSection: {
      label: 'Best practice:',
      items: ['Export important scenarios', 'Save your best setups', 'Avoid clearing browser data unless needed'],
    },
    note: 'For important work, always keep a backup.',
  },
  {
    icon: Star, color: '#22C55E', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)',
    title: 'Pro Tips',
    body: null,
    bullets: [
      "Start simple — don't overcomplicate your first setup",
      'Focus on consistency, not big wins',
      'Small changes in allocation can make a big difference',
      ['Use this tool ', 'before', ' you trade, not after'],
    ],
    mixedBullet: true,
    note: 'This tool is designed to help you think before you act.',
  },
  {
    icon: RefreshCw, color: '#06B6D4', bg: 'rgba(6,182,212,0.10)', border: 'rgba(6,182,212,0.25)',
    title: 'Reset Anytime',
    body: 'If you ever feel stuck or want to start fresh, use the Reset button in the top right corner. This will:',
    bullets: ['Clear all your current inputs', 'Reset your trades back to default', 'Let you start over instantly'],
    footer: "There's no way to break this tool — just reset and try again.",
    note: 'Experiment freely. You can always reset and start again.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function HowItWorks({ onGoToCalculator }) {
  return (
    <motion.div
      className="flex flex-col gap-4 max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero header */}
      <motion.div
        variants={fadeUp} initial="initial" animate="animate"
        transition={{ duration: 0.35 }}
        className="rounded-2xl p-8 text-center"
        style={{ background: 'linear-gradient(160deg, #1a0f00 0%, #0C0C0F 60%)', border: '1px solid rgba(245,166,35,0.2)' }}
      >
        <div
          className="inline-block px-3 py-1 rounded-full text-[10px] font-display font-black tracking-[0.18em] uppercase mb-4"
          style={{ background: 'rgba(245,166,35,0.15)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }}
        >
          Space Trades Compounding Engine
        </div>
        <h1 className="font-display font-black text-3xl text-primary tracking-tight mb-3">
          How It Works
        </h1>
        <p className="font-body text-base leading-relaxed max-w-md mx-auto" style={{ color: '#D4D4D8' }}>
          Everything you need to know to start using the tool confidently — in under 60 seconds.
        </p>
      </motion.div>

      {/* Content sections */}
      {SECTIONS.map((s, i) => (
        <SectionCard key={s.title} section={s} index={i} />
      ))}

      {/* CTA footer */}
      <motion.div
        variants={fadeUp} initial="initial" animate="animate"
        transition={{ duration: 0.35, delay: 0.5 }}
        className="rounded-2xl p-8 text-center"
        style={{ background: 'linear-gradient(160deg, #0a1a0a 0%, #0C0C0F 60%)', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <ArrowRight size={18} style={{ color: '#22C55E' }} />
        </div>
        <h2 className="font-display font-black text-xl text-primary mb-2">Now Try It</h2>
        <p className="font-body text-base mb-1" style={{ color: '#D4D4D8' }}>
          Go back to the calculator and run your first scenario.
        </p>
        <p className="font-body text-base mb-4" style={{ color: '#D4D4D8' }}>
          Change the numbers. Test different ideas.
        </p>
        <p className="text-sm font-mono italic mb-6" style={{ color: '#22C55E' }}>
          The more you use it, the clearer everything becomes.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onGoToCalculator}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-bold tracking-wider transition-all"
            style={{ background: '#F5A623', color: '#000' }}
          >
            <ArrowRight size={14} /> Go to Calculator
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SectionCard({ section, index }) {
  const { icon: Icon, color, bg, border, title, body, steps, bullets, boldBullets, mixedBullet, footer, note, extraSection } = section;

  return (
    <motion.div
      variants={fadeUp} initial="initial" animate="animate"
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="rounded-2xl p-6"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      {/* Title row */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}22`, border: `1px solid ${color}55` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <h2 className="font-display font-black text-lg text-primary tracking-tight">
          {title}
        </h2>
      </div>

      {/* Body */}
      {body && (
        <p className="font-body font-medium text-base leading-relaxed mb-3" style={{ color: '#E4E4E7' }}>
          {body}
        </p>
      )}

      {/* Numbered steps */}
      {steps && (
        <ol className="flex flex-col gap-3 mb-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-display font-black mt-0.5"
                style={{ background: `${color}30`, color, border: `1px solid ${color}66` }}
              >{i + 1}</span>
              <span className="font-body font-semibold text-base leading-relaxed" style={{ color: '#E4E4E7' }}>{step}</span>
            </li>
          ))}
        </ol>
      )}

      {/* Bullet list */}
      {bullets && (
        <ul className="flex flex-col gap-2 mb-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
              {boldBullets && Array.isArray(b) ? (
                <span className="font-body font-semibold text-base leading-relaxed" style={{ color: '#E4E4E7' }}>
                  <strong className="text-primary font-black">{b[0]}</strong> — {b[1]}
                </span>
              ) : mixedBullet && Array.isArray(b) ? (
                <span className="font-body font-semibold text-base leading-relaxed" style={{ color: '#E4E4E7' }}>
                  {b[0]}<strong className="text-primary font-black">{b[1]}</strong>{b[2]}
                </span>
              ) : (
                <span className="font-body font-semibold text-base leading-relaxed" style={{ color: '#E4E4E7' }}>{b}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Extra sub-section (Best Practice etc.) */}
      {extraSection && (
        <div className="mt-2 mb-3">
          <p className="font-body font-black text-base text-primary mb-2">{extraSection.label}</p>
          <ul className="flex flex-col gap-1.5">
            {extraSection.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="font-body font-semibold text-base leading-relaxed" style={{ color: '#E4E4E7' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer paragraph */}
      {footer && (
        <p className="font-body font-medium text-base leading-relaxed mb-2" style={{ color: '#E4E4E7' }}>{footer}</p>
      )}

      {/* Italic note */}
      {note && (
        <p className="font-body font-semibold text-sm italic mt-3 leading-relaxed" style={{ color }}>
          {note}
        </p>
      )}
    </motion.div>
  );
}
