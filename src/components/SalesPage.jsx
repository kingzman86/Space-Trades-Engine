import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Loader2, Star, ChevronDown, ChevronUp, X,
  BookOpen, GitCompare, Shield, Layers, TrendingUp, CheckCircle2, Zap
} from 'lucide-react';
import { ACCESS_CODES } from '../config';
import StarField from './StarField';

const LIFETIME_URL = import.meta.env.VITE_LS_LIFETIME_URL || '#';
const SUPABASE_READY = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

/* ─── FADE UP VARIANT ─────────────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

/* ─── FEATURES ────────────────────────────────── */
const FEATURES = [
  {
    icon: Zap, color: '#F5A623', bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.25)',
    title: 'Six Trade Calculator',
    desc: 'Simulate up to 6 compounding trades in sequence. Watch exactly how your capital grows — or shrinks — trade by trade before you risk a single dollar.',
  },
  {
    icon: TrendingUp, color: '#22C55E', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)',
    title: 'Strategy Builder',
    desc: 'Project your long-term growth over weeks or months. Plug in your win rate, average gain, and number of trades to see where your strategy leads.',
  },
  {
    icon: GitCompare, color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.25)',
    title: 'Scenario Compare',
    desc: 'Run two strategies side by side and see which one wins. Compare risk, reward, and growth so you always know which setup has the edge.',
  },
  {
    icon: BookOpen, color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.25)',
    title: 'Trade Journal',
    desc: 'Log every trade you take with entry, exit, size, and notes. Track your real P&L, win rate, and profit factor over time.',
  },
  {
    icon: Shield, color: '#EF4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)',
    title: 'Risk Controls',
    desc: 'Set your max loss per trade as a percentage. The calculator shows your stop-loss levels and max drawdown so you never blow past your limits.',
  },
  {
    icon: Layers, color: '#14B8A6', bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.25)',
    title: 'Strategy Presets',
    desc: 'Start from Conservative, Moderate, Aggressive, or Staggered presets — then tweak them to match your exact trading style.',
  },
];

/* ─── PAIN POINTS ─────────────────────────────── */
const PAINS = [
  'You enter trades not knowing your actual risk',
  'Gains disappear because you had no plan going in',
  "You can't tell if your strategy actually works over time",
  'You have no way to test ideas before putting real money on the line',
  'You track nothing — so every loss feels like a surprise',
];

/* ─── WHO IT'S FOR ────────────────────────────── */
const FOR_WHOM = [
  { label: 'Beginners', desc: "Just starting out? The calculator shows you exactly how compounding works so you build the right habits from day one." },
  { label: 'Intermediate Traders', desc: "Already trading but winging it? Use the Strategy Builder and Journal to turn your gut decisions into a real system." },
  { label: 'Advanced Traders', desc: "Want to stress-test a setup before risking capital? Compare scenarios and simulate months of trading in seconds." },
];

/* ─── FAQ ─────────────────────────────────────── */
const FAQS = [
  { q: 'Is this financial advice?', a: 'No. Space Trades is an educational simulation tool. It helps you think through trade ideas and understand compounding math — it does not tell you what to trade or predict market outcomes.' },
  { q: 'Do I need trading experience to use this?', a: 'Not at all. The tool is designed for all levels. Beginners use it to understand how compounding and leverage work. Experienced traders use it to plan and backtest ideas.' },
  { q: 'What happens to my data?', a: 'Everything is stored locally in your browser. Your scenarios, journal entries, and settings never leave your device unless you export them.' },
  { q: 'Is this a one-time payment?', a: 'Yes. $197 one time — no subscriptions, no recurring charges, no surprises. Pay once and the tool is yours forever.' },
  { q: 'How do I get my access code?', a: 'Immediately after purchase, Lemon Squeezy emails you an access code. Enter it on this page to unlock the tool.' },
];

/* ─── STEPS ───────────────────────────────────── */
const STEPS = [
  { num: '01', title: 'Get Access', desc: 'One-time payment of $197. Checkout takes under 2 minutes.' },
  { num: '02', title: 'Get Your Code', desc: 'Your unique access code lands in your inbox instantly after payment.' },
  { num: '03', title: 'Start Trading Smarter', desc: 'Enter your code, open the calculator, and start planning your first compound sequence.' },
];

/* ─── MAIN COMPONENT ──────────────────────────── */
export default function SalesPage({ onUnlock }) {
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col" style={{ backgroundColor: 'var(--space-black)', color: 'var(--star-white)' }}>
      <StarField />

      <div className="relative z-10 flex flex-col">
        <StickyNav onEnterCode={() => setCodeModalOpen(true)} />

        <HeroSection onEnterCode={() => setCodeModalOpen(true)} />
        <PainSection />
        <SolutionSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ForWhomSection />
        <PricingSection />
        <FAQSection />
        <FinalCTA onEnterCode={() => setCodeModalOpen(true)} />

        <footer className="border-t border-space-border text-center py-6 px-4">
          <p className="text-xs font-body" style={{ color: '#71717A' }}>
            Space Trades © 2025 · For educational purposes only · Not financial advice · Trading crypto involves significant risk of loss
          </p>
        </footer>
      </div>

      <AnimatePresence>
        {codeModalOpen && (
          <CodeModal onUnlock={onUnlock} onClose={() => setCodeModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── STICKY NAV ──────────────────────────────── */
function StickyNav({ onEnterCode }) {
  return (
    <div
      className="sticky top-0 z-50 border-b border-space-border"
      style={{ background: 'rgba(12,12,15,0.92)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/Space_Trade_Logo.png" alt="Space Trades" className="h-8 w-auto"
            style={{ filter: 'drop-shadow(0 0 8px rgba(245,200,66,0.4))' }} />
          <span className="font-display font-black text-gold-primary tracking-widest text-sm uppercase hidden sm:block">
            Space Trades
          </span>
        </div>
        <button
          onClick={onEnterCode}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-display font-bold text-xs tracking-wider uppercase transition-all"
          style={{ border: '1px solid var(--space-border)', color: '#D4D4D8' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#F5A623'; e.currentTarget.style.color = '#F5A623'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--space-border)'; e.currentTarget.style.color = '#D4D4D8'; }}
        >
          🔓 I Have a Code
        </button>
      </div>
    </div>
  );
}

/* ─── HERO ────────────────────────────────────── */
function HeroSection({ onEnterCode }) {
  return (
    <section className="relative overflow-hidden py-20 px-4 text-center">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(245,166,35,0.10), transparent)' }} />

      <motion.div
        className="max-w-4xl mx-auto"
        variants={fadeUp} initial="initial" animate="animate"
        transition={{ duration: 0.5 }}
      >
        <div
          className="inline-block px-3 py-1 rounded-full text-[11px] font-display font-black tracking-[0.18em] uppercase mb-6"
          style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }}
        >
          The Compounding Engine for Serious Traders
        </div>

        <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
          <span style={{ color: '#F4F4F5' }}>Stop Guessing.</span>
          <br />
          <span style={{ color: '#F5A623', textShadow: '0 0 40px rgba(245,166,35,0.4)' }}>Start Compounding.</span>
        </h1>

        <p className="font-body text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl mx-auto" style={{ color: '#D4D4D8' }}>
          Space Trades gives you the exact tools to simulate, plan, and track your crypto trades —
          so every decision is backed by <strong className="text-primary">math, not emotion.</strong>
        </p>

        <div className="flex items-center justify-center mb-10">
          <a
            href={LIFETIME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-display font-black text-base tracking-wider uppercase transition-all hover:scale-105"
            style={{ background: '#F5A623', color: '#000', boxShadow: '0 0 32px rgba(245,166,35,0.4)' }}
          >
            <Star size={16} /> Get Lifetime Access — $197
          </a>
        </div>

        <button
          onClick={onEnterCode}
          className="font-body text-sm underline underline-offset-4 transition-colors"
          style={{ color: '#A1A1AA' }}
          onMouseEnter={e => e.currentTarget.style.color = '#F5A623'}
          onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}
        >
          Already have a code? Click here to unlock
        </button>
      </motion.div>
    </section>
  );
}

/* ─── PAIN ────────────────────────────────────── */
function PainSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-center mb-3">
            Sound Familiar?
          </h2>
          <p className="font-body text-base text-center mb-10" style={{ color: '#A1A1AA' }}>
            Most traders lose not because they lack knowledge — but because they lack a system.
          </p>
          <div className="flex flex-col gap-3">
            {PAINS.map((pain, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
                className="flex items-start gap-4 rounded-xl px-5 py-4"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">❌</span>
                <p className="font-body font-medium text-base" style={{ color: '#E4E4E7' }}>{pain}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── SOLUTION ────────────────────────────────── */
function SolutionSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <div
            className="inline-block px-3 py-1 rounded-full text-[11px] font-display font-black tracking-[0.18em] uppercase mb-5"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            The Solution
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-5 leading-tight">
            Introducing <span style={{ color: '#F5A623' }}>Space Trades</span>
          </h2>
          <p className="font-body text-lg leading-relaxed mb-6" style={{ color: '#D4D4D8' }}>
            A compounding engine built for traders who want to <strong className="text-primary">plan every move</strong> before they make it.
            Simulate trade sequences, project long-term growth, compare strategies, and track your real results — all in one place.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['Plan Before You Trade', 'Track What Works', 'Compound With Precision'].map(label => (
              <div key={label} className="flex items-center gap-2 font-display font-bold text-sm" style={{ color: '#22C55E' }}>
                <CheckCircle2 size={16} /> {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── FEATURES ────────────────────────────────── */
function FeaturesSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="text-center mb-12">
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-3">Everything You Need</h2>
          <p className="font-body text-base" style={{ color: '#A1A1AA' }}>Six powerful tools inside one access code.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="rounded-2xl p-6"
              style={{ background: f.bg, border: `1px solid ${f.border}` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}22`, border: `1px solid ${f.color}55` }}>
                <f.icon size={18} style={{ color: f.color }} />
              </div>
              <h3 className="font-display font-black text-base text-primary mb-2">{f.title}</h3>
              <p className="font-body font-medium text-sm leading-relaxed" style={{ color: '#D4D4D8' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ────────────────────────────── */
function HowItWorksSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="text-center mb-12">
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-3">Get Started in 3 Steps</h2>
          <p className="font-body text-base" style={{ color: '#A1A1AA' }}>From checkout to trading smarter in under 5 minutes.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="rounded-2xl p-6 text-center"
              style={{ background: 'var(--space-navy)', border: '1px solid var(--space-border)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-display font-black text-lg"
                style={{ background: 'rgba(245,166,35,0.15)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }}
              >
                {s.num}
              </div>
              <h3 className="font-display font-black text-base text-primary mb-2">{s.title}</h3>
              <p className="font-body font-medium text-sm leading-relaxed" style={{ color: '#D4D4D8' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FOR WHOM ────────────────────────────────── */
function ForWhomSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="text-center mb-12">
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-3">Built for Every Trader</h2>
          <p className="font-body text-base" style={{ color: '#A1A1AA' }}>Whether you're on day one or year five — this tool works for you.</p>
        </motion.div>
        <div className="flex flex-col gap-4">
          {FOR_WHOM.map((item, i) => (
            <motion.div
              key={item.label}
              variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="flex items-start gap-5 rounded-2xl p-6"
              style={{ background: 'var(--space-navy)', border: '1px solid var(--space-border)' }}
            >
              <CheckCircle2 size={22} className="flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
              <div>
                <h3 className="font-display font-black text-base text-primary mb-1">{item.label}</h3>
                <p className="font-body font-medium text-base leading-relaxed" style={{ color: '#D4D4D8' }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PRICING ─────────────────────────────────── */
function PricingSection() {
  return (
    <section id="pricing" className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="text-center mb-12">
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-3">Simple Pricing</h2>
          <p className="font-body text-base" style={{ color: '#A1A1AA' }}>One price. Full access. Forever.</p>
        </motion.div>

        <motion.div
          variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ duration: 0.3 }}
          className="max-w-md mx-auto rounded-2xl p-8 flex flex-col relative overflow-hidden"
          style={{ background: 'var(--space-navy)', border: '1px solid rgba(245,166,35,0.5)', boxShadow: '0 0 48px rgba(245,166,35,0.10)' }}
        >
          <div
            className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-display font-black tracking-widest uppercase"
            style={{ background: 'rgba(245,166,35,0.2)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.4)' }}
          >
            Lifetime Access
          </div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)' }}>
              <Star size={18} style={{ color: '#F5A623' }} />
            </div>
            <span className="font-display font-black text-sm tracking-widest uppercase" style={{ color: '#F5A623' }}>Space Trades</span>
          </div>
          <div className="mb-2">
            <span className="font-display font-black text-5xl text-primary">$197</span>
            <span className="font-body text-base ml-2" style={{ color: '#A1A1AA' }}>one-time</span>
          </div>
          <p className="font-body font-medium text-sm mb-6" style={{ color: '#22C55E' }}>
            Pay once. Use forever. No subscriptions ever.
          </p>
          <ul className="flex flex-col gap-3 mb-8">
            {[
              'Full access to all 6 tools',
              'Lifetime access — never pay again',
              'Access code delivered to your email instantly',
              'All future updates included free',
            ].map(f => (
              <li key={f} className="flex items-start gap-2.5 font-body font-medium text-base" style={{ color: '#D4D4D8' }}>
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#F5A623' }} /> {f}
              </li>
            ))}
          </ul>
          <a
            href={LIFETIME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-xl text-center font-display font-black text-base tracking-wider uppercase transition-all hover:opacity-90 block"
            style={{ background: '#F5A623', color: '#000', boxShadow: '0 0 24px rgba(245,166,35,0.3)' }}
          >
            Get Lifetime Access — $197
          </a>
        </motion.div>
      </div>
    </section>
  );
}


/* ─── FAQ ─────────────────────────────────────── */
function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="text-center mb-10">
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-3">Frequently Asked Questions</h2>
          <p className="font-body text-base" style={{ color: '#A1A1AA' }}>Everything you need to know before you get started.</p>
        </motion.div>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-xl overflow-hidden"
              style={{ background: 'var(--space-navy)', border: '1px solid var(--space-border)' }}
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span className="font-display font-bold text-base text-primary pr-4">{faq.q}</span>
                {openIdx === i ? <ChevronUp size={16} style={{ color: '#F5A623', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: '#A1A1AA', flexShrink: 0 }} />}
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-6 pb-5 font-body font-medium text-base leading-relaxed"
                      style={{ color: '#D4D4D8', borderLeft: '3px solid #F5A623', marginLeft: 24, paddingLeft: 16 }}
                    >
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FINAL CTA ───────────────────────────────── */
function FinalCTA({ onEnterCode }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <div
            className="inline-block px-3 py-1 rounded-full text-[11px] font-display font-black tracking-[0.18em] uppercase mb-5"
            style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }}
          >
            Ready to Trade Smarter?
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-5 leading-tight">
            Your Next Trade Deserves a Plan.
          </h2>
          <p className="font-body text-lg leading-relaxed mb-8" style={{ color: '#D4D4D8' }}>
            Join traders who stopped guessing and started compounding with precision.
            One payment. Full access. Forever.
          </p>
          <div className="flex items-center justify-center mb-6">
            <a
              href={LIFETIME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-display font-black text-base tracking-wider uppercase transition-all hover:scale-105"
              style={{ background: '#F5A623', color: '#000', boxShadow: '0 0 32px rgba(245,166,35,0.4)' }}
            >
              <Star size={16} /> Get Lifetime Access — $197
            </a>
          </div>
          <button
            onClick={onEnterCode}
            className="font-body text-sm underline underline-offset-4 transition-colors"
            style={{ color: '#A1A1AA' }}
            onMouseEnter={e => e.currentTarget.style.color = '#F5A623'}
            onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}
          >
            Already have a code? Unlock here
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── CODE MODAL ──────────────────────────────── */
function CodeModal({ onUnlock, onClose }) {
  const [code, setCode]             = useState('');
  const [shake, setShake]           = useState(false);
  const [loading, setLoading]       = useState(false);
  const [showRocket, setShowRocket] = useState(false);

  const triggerShake = (msg) => {
    setShake(true);
    toast.error(msg, { icon: '🚫' });
    setTimeout(() => setShake(false), 600);
  };

  const handleUnlock = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    try {
      if (!SUPABASE_READY) {
        if (!ACCESS_CODES.includes(trimmed)) {
          triggerShake('Invalid access code');
          return;
        }
      } else {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('access_codes')
          .select('status, expires_at, plan_type')
          .eq('code', trimmed)
          .single();

        if (error || !data) { triggerShake('Invalid access code'); return; }

        if (data.status !== 'active') {
          triggerShake(
            data.status === 'expired'
              ? 'Your subscription has expired — please renew to continue'
              : 'This access code is no longer valid'
          );
          return;
        }

        if (data.plan_type === 'monthly' && data.expires_at) {
          if (new Date(data.expires_at) < new Date()) {
            await supabase.from('access_codes').update({ status: 'expired' }).eq('code', trimmed);
            triggerShake('Your subscription has expired — please renew to continue');
            return;
          }
        }
      }

      setShowRocket(true);
      localStorage.setItem('st_access', 'true');
      setTimeout(() => onUnlock(), 900);

    } catch {
      toast.error('Connection error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl p-8 text-center relative"
        style={{ background: 'var(--space-navy)', border: '1px solid var(--space-border)', boxShadow: '0 0 60px rgba(245,200,66,0.1)' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
          style={{ color: '#A1A1AA' }}
          onMouseEnter={e => e.currentTarget.style.color = '#F4F4F5'}
          onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}
        >
          <X size={16} />
        </button>

        <motion.div
          className="mb-5 flex justify-center"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img src="/Space_Trade_Logo.png" alt="Space Trades"
            style={{ maxWidth: 100, filter: 'drop-shadow(0 0 12px rgba(245,200,66,0.4))' }} />
        </motion.div>

        <h2 className="font-display font-black text-lg text-primary mb-1">Enter Your Code</h2>
        <p className="font-body text-sm mb-6" style={{ color: '#A1A1AA' }}>
          Check your email for the access code we sent after your purchase.
        </p>

        <motion.div
          animate={shake ? { x: [-8, 8, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-3"
        >
          <input
            type="text"
            className="input-gold text-center tracking-widest uppercase text-sm"
            placeholder="ST-XXXX-XXXX"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            autoFocus
            disabled={loading || showRocket}
          />
        </motion.div>

        <button
          className="btn-gold w-full"
          onClick={handleUnlock}
          disabled={loading || showRocket}
        >
          {showRocket ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span animate={{ y: [-2, -30], opacity: [1, 0] }} transition={{ duration: 0.7 }}>🚀</motion.span>
              LAUNCHING...
            </span>
          ) : loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" /> VERIFYING...
            </span>
          ) : (
            '🔓 UNLOCK ACCESS'
          )}
        </button>

        <p className="text-xs font-body mt-4" style={{ color: '#71717A' }}>
          Don't have a code?{' '}
          <a href="#pricing" onClick={onClose} className="underline underline-offset-2" style={{ color: '#F5A623' }}>
            Get access below
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}
