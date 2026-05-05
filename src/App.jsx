import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import SalesPage from './components/SalesPage';
import Dashboard from './components/Dashboard';
import { ThemeContext } from './context/ThemeContext';
import { useThemeState } from './hooks/useThemeState';

function isTelegramSessionValid() {
  const expires = localStorage.getItem('st_telegram_expires');
  if (!expires) return true; // not a Telegram session, let normal access logic handle it
  return Date.now() < Number(expires);
}

export default function App() {
  const { theme, toggle } = useThemeState();

  const [unlocked, setUnlocked] = useState(() => {
    const hasAccess = localStorage.getItem('st_access') === 'true';
    if (!hasAccess) return false;

    // Telegram members must re-verify daily
    if (localStorage.getItem('st_telegram_expires')) {
      if (!isTelegramSessionValid()) {
        localStorage.removeItem('st_access');
        localStorage.removeItem('st_telegram_expires');
        localStorage.removeItem('st_telegram_id');
        return false;
      }
    }

    return true;
  });

  const handleLock = () => {
    localStorage.removeItem('st_access');
    localStorage.removeItem('st_telegram_expires');
    localStorage.removeItem('st_telegram_id');
    setUnlocked(false);
  };

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
          <Dashboard key="dashboard" onLock={handleLock} />
        ) : (
          <SalesPage key="sales" onUnlock={() => setUnlocked(true)} />
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}
