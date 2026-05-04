import { motion } from 'framer-motion';
import clsx from 'clsx';

const colorMap = {
  green:   { value: 'text-candle-green', glow: 'hover:shadow-green' },
  gold:    { value: 'text-gold-primary', glow: 'hover:shadow-gold' },
  red:     { value: 'text-candle-red',   glow: '' },
  neutral: { value: 'text-primary',      glow: '' },
};

export default function StatCard({ label, value, delta, color = 'neutral', icon, className }) {
  const colors = colorMap[color] || colorMap.neutral;

  return (
    <motion.div
      className={clsx('stat-card', colors.glow, className)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="section-title">{label}</span>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <div className={clsx('num text-xl leading-tight', colors.value)}>
        {value}
      </div>
      {delta && (
        <div className="num-mono text-xs text-muted mt-1">{delta}</div>
      )}
    </motion.div>
  );
}
