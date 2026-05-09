import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/formatters';

function MarqueeLights({ count = 26, ms = 85 }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), ms);
    return () => clearInterval(id);
  }, [ms]);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 6px', gap: 2 }}>
      {Array.from({ length: count }, (_, i) => {
        const phase = (i * 3 + tick) % 8;
        const gold  = phase < 2;
        const green = phase === 4;
        return (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: gold ? '#FFE57A' : green ? '#22C55E' : '#1C1400',
            boxShadow: gold  ? '0 0 10px #FFE57A, 0 0 20px rgba(255,229,122,0.55)'
                     : green ? '0 0 8px #22C55E,  0 0 14px rgba(34,197,94,0.45)'
                     : 'none',
            transition: 'background 0.07s, box-shadow 0.07s',
          }} />
        );
      })}
    </div>
  );
}

const TIERS = [
  { min: 500, emoji: '🚀', label: 'MEGA JACKPOT',  accent: '#F5A623' },
  { min: 200, emoji: '💎', label: 'DIAMOND HANDS', accent: '#F5A623' },
  { min: 100, emoji: '🎰', label: 'HIGH ROLLER',   accent: '#F5A623' },
  { min:  50, emoji: '🃏', label: 'BIG WIN',        accent: '#22C55E' },
  { min:   5, emoji: '🪙', label: 'WINNER',         accent: '#22C55E' },
];

export default function CasinoJackpot({ finalValue, roi, onClose }) {
  const tier = TIERS.find(t => roi >= t.min) ?? TIERS[TIERS.length - 1];

  useEffect(() => {
    const id = setTimeout(onClose, 5000);
    return () => clearTimeout(id);
  }, [onClose]);

  return (
    <motion.div
      initial={{ y: -320, opacity: 0, scale: 0.85 }}
      animate={{ y: 0,    opacity: 1, scale: 1    }}
      exit={{    y: -320, opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', damping: 16, stiffness: 260 }}
      onClick={onClose}
      style={{
        position: 'fixed', top: 68, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, minWidth: 400, cursor: 'pointer',
        background: 'linear-gradient(160deg, #0C0900 0%, #1C1405 50%, #0C0900 100%)',
        borderRadius: 18, overflow: 'hidden',
        boxShadow: `0 0 90px ${tier.accent}55, 0 0 180px ${tier.accent}22, 0 24px 80px rgba(0,0,0,0.85)`,
      }}
    >
      {/* Outer gold border ring */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 18, border: `2px solid ${tier.accent}88`, pointerEvents: 'none' }} />

      {/* Top marquee lights */}
      <div style={{ paddingTop: 10, paddingBottom: 5, paddingInline: 10 }}>
        <MarqueeLights />
      </div>

      {/* Inner content */}
      <div style={{ padding: '4px 40px 16px', textAlign: 'center' }}>

        {/* Emoji */}
        <div style={{ fontSize: '3rem', lineHeight: 1.1, filter: `drop-shadow(0 0 18px ${tier.accent})` }}>
          {tier.emoji}
        </div>

        {/* Tier label — neon style */}
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontWeight: 900,
          fontSize: '2rem', letterSpacing: '6px', textTransform: 'uppercase',
          color: tier.accent,
          textShadow: `0 0 24px ${tier.accent}, 0 0 60px ${tier.accent}88, 0 0 100px ${tier.accent}44`,
          marginTop: 4,
        }}>
          {tier.label}
        </div>

        {/* Divider */}
        <div style={{ height: 1, margin: '10px 0', background: `linear-gradient(90deg, transparent, ${tier.accent}66, transparent)` }} />

        {/* Final value */}
        <div style={{
          fontFamily: 'monospace', fontWeight: 900, fontSize: '2.2rem', letterSpacing: 2,
          color: '#22C55E',
          textShadow: '0 0 24px rgba(34,197,94,0.8), 0 0 50px rgba(34,197,94,0.35)',
        }}>
          {formatCurrency(finalValue)}
        </div>

        {/* ROI */}
        <div style={{
          fontFamily: 'monospace', fontWeight: 700, fontSize: '1.15rem', marginTop: 4,
          color: '#F5A623',
          textShadow: '0 0 18px rgba(245,166,35,0.65)',
        }}>
          +{roi.toFixed(2)}% ROI
        </div>

        {/* Divider */}
        <div style={{ height: 1, margin: '10px 0', background: `linear-gradient(90deg, transparent, ${tier.accent}66, transparent)` }} />

        <div style={{ fontFamily: 'monospace', fontSize: '0.58rem', color: '#444', letterSpacing: 3, textTransform: 'uppercase' }}>
          🃏 Space Trades · CMF Engine · Tap to dismiss
        </div>
      </div>

      {/* Bottom marquee lights */}
      <div style={{ paddingBottom: 10, paddingTop: 5, paddingInline: 10 }}>
        <MarqueeLights ms={90} />
      </div>
    </motion.div>
  );
}
