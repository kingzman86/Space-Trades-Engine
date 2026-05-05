import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import SalesPage from './components/SalesPage';
import Dashboard from './components/Dashboard';
import { ThemeContext } from './context/ThemeContext';
import { useThemeState } from './hooks/useThemeState';

export default function App() {
  const { theme, toggle } = useThemeState();

  const [unlocked, setUnlocked] = useState(() => {
    return localStorage.getItem('st_access') === 'true';
  });

  const toastBg     = theme === 'light' ? '#FFFFFF' : '#0A0F1E';
  const toastColor  = theme === 'light' ? '#0F172A' : '#F0F4FF';
  const toastBorder = theme === 'light' ? '#CBD5E1' : '#1E2A42';

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: toastBg,
            color: toastColor,
            border: `1px solid ${toastBorder}`,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#22C55E', secondary: toastBg } },
          error:   { iconTheme: { primary: '#EF4444', secondary: toastBg } },
        }}
      />
      <AnimatePresence mode="wait">
        {unlocked ? (
          <Dashboard key="dashboard" onLock={() => setUnlocked(false)} />
        ) : (
          <SalesPage key="sales" onUnlock={() => setUnlocked(true)} />
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}
