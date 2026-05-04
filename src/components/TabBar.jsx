import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, BarChart2, GitCompare, BookOpen, Settings, Layers, ChevronDown, HelpCircle } from 'lucide-react';
import clsx from 'clsx';

const MAIN_TABS = [
  { id: 'calculator', label: 'Six Trade Calculator', icon: Calculator },
  { id: 'strategy',   label: 'Strategy Builder',    icon: BarChart2 },
  { id: 'compare',    label: 'Compare',             icon: GitCompare },
];

const TOOLS_ITEMS = [
  { id: 'howitworks', label: 'How It Works',  icon: HelpCircle },
  { id: 'faq',        label: 'FAQ',           icon: BookOpen },
  { id: 'journal',    label: 'Trade Journal', icon: BookOpen },
  { id: 'settings',   label: 'Settings',      icon: Settings },
];

const TOOLS_IDS = new Set(TOOLS_ITEMS.map(t => t.id));

export default function TabBar({ activeTab, onTabChange }) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toolsActive = TOOLS_IDS.has(activeTab);
  const activeToolItem = TOOLS_ITEMS.find(t => t.id === activeTab);

  return (
    <div
      className="relative z-20 border-b border-space-border"
      style={{ background: 'var(--space-mid)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-2">

        {/* Scrollable main tabs — isolated so overflow doesn't clip the Tools dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1 min-w-0">
          {MAIN_TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <motion.button
                key={id}
                onClick={() => { onTabChange(id); setToolsOpen(false); }}
                whileTap={{ scale: 0.97 }}
                className={clsx(
                  'relative flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200',
                  'font-display font-bold text-xs tracking-wider uppercase select-none flex-shrink-0'
                )}
                style={active
                  ? { background: '#22C55E', color: '#000', boxShadow: '0 0 16px rgba(34,197,94,0.35)' }
                  : { background: 'transparent', color: 'var(--muted-text)', border: '1px solid var(--space-border)' }}
              >
                <Icon size={12} />
                {label}
                {active && (
                  <motion.span
                    layoutId="active-tab-bg"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: '#22C55E', zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="w-px h-5 flex-shrink-0" style={{ background: 'var(--space-border)' }} />

        {/* Tools dropdown — outside the overflow container so it renders above page content */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <motion.button
            onClick={() => setToolsOpen(o => !o)}
            whileTap={{ scale: 0.97 }}
            className={clsx(
              'relative flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200',
              'font-display font-bold text-xs tracking-wider uppercase select-none'
            )}
            style={toolsActive
              ? { background: '#22C55E', color: '#000', boxShadow: '0 0 16px rgba(34,197,94,0.35)' }
              : { background: 'transparent', color: 'var(--muted-text)', border: '1px solid var(--space-border)' }}
          >
            <Layers size={12} />
            {toolsActive ? activeToolItem?.label : 'Tools'}
            <ChevronDown
              size={11}
              style={{ transition: 'transform 0.2s', transform: toolsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </motion.button>

          <AnimatePresence>
            {toolsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-1.5 min-w-[190px] rounded-xl overflow-hidden"
                style={{
                  zIndex: 9999,
                  background: 'var(--space-navy)',
                  border: '1px solid var(--space-border)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                {TOOLS_ITEMS.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { onTabChange(id); setToolsOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors"
                      style={active
                        ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E' }
                        : { color: 'var(--muted-text)' }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Icon size={13} />
                      <span className="font-display font-bold text-xs tracking-wider uppercase">{label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
