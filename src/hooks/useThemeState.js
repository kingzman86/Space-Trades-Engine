import { useState, useEffect } from 'react';

export function useThemeState() {
  const [theme, setTheme] = useState(() => localStorage.getItem('st_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('st_theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return { theme, toggle };
}
