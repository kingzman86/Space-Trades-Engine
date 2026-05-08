import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Trash2, Download, ChevronUp, ChevronDown, BookOpen } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calcTradeStats } from '../utils/math';
import { formatCurrency, formatPercent } from '../utils/formatters';
import StatCard from './StatCard';
import { DEFAULT_COINS } from '../config';
import clsx from 'clsx';

const EMPTY_FORM = {
  pair: 'BTC/USDT', entryPrice: '', exitPrice: '',
  amount: '', date: new Date().toISOString().split('T')[0], notes: ''
};

export default function TradeJournal() {
  const [trades, setTrades] = useLocalStorage('st_trades', []);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const handleField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = () => {
    const entry = parseFloat(form.entryPrice);
    const exit  = parseFloat(form.exitPrice);
    const amt   = parseFloat(form.amount);

    if (!entry || !exit || !amt || !form.pair) {
      toast.error('Fill in pair, entry, exit, and amount');
      return;
    }

    const pnlPct = ((exit - entry) / entry) * 100;
    const pnl    = (exit - entry) / entry * amt;

    const newTrade = {
      id: Date.now(),
      pair: form.pair,
      entryPrice: entry,
      exitPrice: exit,
      amount: amt,
      date: form.date,
      notes: form.notes,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPct: parseFloat(pnlPct.toFixed(2)),
    };

    setTrades(prev => [newTrade, ...prev]);
    setForm(EMPTY_FORM);
    setShowForm(false);
    toast.success(`Trade added: ${form.pair} ${pnlPct >= 0 ? '🟢' : '🔴'}`);
  };

  const handleDelete = (id) => {
    setTrades(prev => prev.filter(t => t.id !== id));
    toast('Trade removed', { icon: '🗑️' });
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = useMemo(() => {
    return [...trades].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [trades, sortKey, sortDir]);

  const stats = useMemo(() => calcTradeStats(trades), [trades]);

  const exportCSV = () => {
    if (!trades.length) { toast.error('No trades to export'); return; }
    const header = 'Pair,Entry,Exit,Amount,P&L $,P&L %,Date,Notes';
    const rows = trades.map(t =>
      `${t.pair},${t.entryPrice},${t.exitPrice},${t.amount},${t.pnl},${t.pnlPct},${t.date},"${t.notes}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'space-trades-journal.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Journal exported');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      {trades.length > 0 && (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatCard label="Total Trades"    value={trades.length}                    color="neutral" icon="📋" />
          <StatCard label="Win Rate"        value={formatPercent(stats.winRate, 1)}  color={stats.winRate >= 50 ? 'green' : 'red'} icon="🎯" />
          <StatCard label="Avg Win"         value={formatPercent(stats.avgWinPct, 2)} color="green"  icon="📈" />
          <StatCard label="Avg Loss"        value={formatPercent(stats.avgLossPct, 2)} color="red"   icon="📉" />
          <StatCard
            label="Total P&L"
            value={formatCurrency(stats.totalPnl)}
            color={stats.totalPnl >= 0 ? 'green' : 'red'}
            icon={stats.totalPnl >= 0 ? '🚀' : '⚠️'}
          />
        </motion.div>
      )}

      {/* Header + actions */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-gold-primary text-xs tracking-widest uppercase flex items-center gap-2">
            <BookOpen size={13} /> Trade Journal
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-space-border text-muted hover:text-primary hover:border-gold-primary text-xs font-display font-semibold uppercase tracking-wider transition-all"
            >
              <Download size={11} /> Export
            </button>
            <button
              onClick={() => setShowForm(v => !v)}
              className="btn-gold flex items-center gap-1.5 py-1.5 px-3 text-xs"
            >
              <Plus size={12} /> Add Trade
            </button>
          </div>
        </div>

        {/* Add trade form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-xl bg-space-mid border border-space-border mb-4">
                <div>
                  <label className="section-title mb-1.5 block">Pair</label>
                  <select
                    className="input-gold"
                    value={form.pair}
                    onChange={e => handleField('pair', e.target.value)}
                  >
                    {DEFAULT_COINS.map(c => <option key={c}>{c}</option>)}
                    <option value="CUSTOM">Custom...</option>
                  </select>
                </div>
                {form.pair === 'CUSTOM' && (
                  <div>
                    <label className="section-title mb-1.5 block">Custom Pair</label>
                    <input className="input-gold" placeholder="SOL/BTC" onChange={e => handleField('pair', e.target.value)} />
                  </div>
                )}
                <div>
                  <label className="section-title mb-1.5 block">Entry Price</label>
                  <input className="input-gold" type="number" min="0" step="any" value={form.entryPrice} onChange={e => handleField('entryPrice', e.target.value)} placeholder="42100" />
                </div>
                <div>
                  <label className="section-title mb-1.5 block">Exit Price</label>
                  <input className="input-gold" type="number" min="0" step="any" value={form.exitPrice} onChange={e => handleField('exitPrice', e.target.value)} placeholder="45200" />
                </div>
                <div>
                  <label className="section-title mb-1.5 block">Amount ($)</label>
                  <input className="input-gold" type="number" min="0" step="any" value={form.amount} onChange={e => handleField('amount', e.target.value)} placeholder="1000" />
                </div>
                <div>
                  <label className="section-title mb-1.5 block">Date</label>
                  <input className="input-gold" type="date" value={form.date} onChange={e => handleField('date', e.target.value)} />
                </div>
                <div className="col-span-2 sm:col-span-3 lg:col-span-6">
                  <label className="section-title mb-1.5 block">Notes (optional)</label>
                  <input className="input-gold" value={form.notes} onChange={e => handleField('notes', e.target.value)} placeholder="Setup notes..." />
                </div>
                <div className="col-span-2 sm:col-span-3 lg:col-span-6 flex gap-2">
                  <button className="btn-gold flex items-center gap-1.5 py-2 text-xs" onClick={handleAdd}>
                    <Plus size={12} /> Add Trade
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                    className="px-4 py-2 rounded-lg border border-space-border text-muted hover:text-primary text-xs font-display font-semibold uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        {trades.length === 0 ? (
          <div className="text-center py-12 font-body text-base font-medium" style={{ color: 'var(--star-white)' }}>
            No trades logged yet. Add your first trade above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-space-border">
                  {[
                    { key: 'pair',    label: 'Pair' },
                    { key: 'entryPrice', label: 'Entry' },
                    { key: 'exitPrice',  label: 'Exit' },
                    { key: 'amount',  label: 'Size' },
                    { key: 'pnl',     label: 'P&L $' },
                    { key: 'pnlPct',  label: 'P&L %' },
                    { key: 'date',    label: 'Date' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="text-left py-2.5 px-2 section-title cursor-pointer hover:text-primary select-none whitespace-nowrap"
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key && (
                          sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="py-2.5 px-2 section-title text-right">Notes</th>
                  <th className="py-2.5 px-2 w-8" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {sorted.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.02 }}
                      className={clsx(
                        'border-b border-space-border transition-colors',
                        t.pnl >= 0
                          ? 'hover:bg-[rgba(34,197,94,0.04)]'
                          : 'hover:bg-[rgba(239,68,68,0.04)]'
                      )}
                    >
                      <td className="py-3 px-2 text-primary num-mono font-bold">{t.pair}</td>
                      <td className="py-3 px-2 num-mono font-medium" style={{ color: 'var(--star-white)' }}>{formatCurrency(t.entryPrice)}</td>
                      <td className="py-3 px-2 num-mono font-medium" style={{ color: 'var(--star-white)' }}>{formatCurrency(t.exitPrice)}</td>
                      <td className="py-3 px-2 num-mono font-medium" style={{ color: 'var(--star-white)' }}>{formatCurrency(t.amount)}</td>
                      <td className={clsx('py-3 px-2 num-mono font-medium', t.pnl >= 0 ? 'text-candle-green' : 'text-candle-red')}>
                        {t.pnl >= 0 ? '+' : ''}{formatCurrency(t.pnl)}
                      </td>
                      <td className={clsx('py-3 px-2 num font-medium text-sm', t.pnlPct >= 0 ? 'text-candle-green' : 'text-candle-red')}>
                        {t.pnlPct >= 0 ? '🟢' : '🔴'} {formatPercent(t.pnlPct)}
                      </td>
                      <td className="py-3 px-2 num-mono font-medium" style={{ color: 'var(--star-white)' }}>{t.date}</td>
                      <td className="py-3 px-2 font-body font-medium truncate max-w-[120px]" style={{ color: 'var(--star-white)' }}>{t.notes || '—'}</td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1 text-muted hover:text-candle-red transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
