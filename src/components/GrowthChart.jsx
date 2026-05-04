import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';
import { formatCompact, formatCurrency } from '../utils/formatters';

const FONT  = "'DM Sans', sans-serif";
const MUTED = '#A1A1AA';
const GOLD  = '#F5A623';
const GREEN = '#22C55E';
const GRID  = '#2A2A32';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'var(--space-navy)',
      border: `1px solid ${GOLD}`,
      borderRadius: 8,
      padding: '10px 14px',
      fontFamily: FONT,
      fontSize: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ color: MUTED, fontSize: 11, marginBottom: 4 }}>Trade {label}</div>
      <div style={{ color: GOLD, fontWeight: 700, fontSize: 14 }}>{formatCurrency(d.balance)}</div>
      {d.profit > 0 && (
        <div style={{ color: GREEN, fontSize: 11, marginTop: 2 }}>+{formatCurrency(d.profit)} gain</div>
      )}
      {d.withdrawn > 0 && (
        <div style={{ color: MUTED, fontSize: 11 }}>−{formatCurrency(d.withdrawn)} withdrawn</div>
      )}
    </div>
  );
};

export default function GrowthChart({ tradeHistory, startingCapital }) {
  if (!tradeHistory?.length) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm" style={{ fontFamily: FONT }}>
        Enter values to see projection
      </div>
    );
  }

  const balances = tradeHistory.map(t => t.balance);
  const maxVal   = Math.max(...balances);
  const minVal   = Math.min(...balances, startingCapital * 0.95);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={tradeHistory} margin={{ top: 10, right: 10, bottom: 16, left: 0 }}>
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={GOLD} stopOpacity={0.3} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0}   />
          </linearGradient>
        </defs>

        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />

        <XAxis
          dataKey="trade"
          tick={{ fill: MUTED, fontSize: 11, fontFamily: FONT, fontWeight: 500 }}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          interval="preserveStartEnd"
          label={{ value: 'Phases', position: 'insideBottom', offset: -4, fill: MUTED, fontSize: 11, fontFamily: FONT }}
        />

        <YAxis
          tickFormatter={formatCompact}
          tick={{ fill: MUTED, fontSize: 11, fontFamily: FONT, fontWeight: 500 }}
          tickLine={false}
          axisLine={false}
          width={62}
          domain={[minVal * 0.97, maxVal * 1.03]}
        />

        <Tooltip content={<CustomTooltip />} />

        <ReferenceLine
          y={startingCapital}
          stroke={GRID}
          strokeDasharray="5 4"
          strokeWidth={1.5}
          label={{ value: 'Start', position: 'insideTopRight', fill: MUTED, fontSize: 10, fontFamily: FONT }}
        />

        <Area
          type="monotone"
          dataKey="balance"
          stroke={GOLD}
          strokeWidth={2.5}
          fill="url(#goldGradient)"
          dot={false}
          activeDot={{ r: 5, fill: GOLD, stroke: 'var(--space-black)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
