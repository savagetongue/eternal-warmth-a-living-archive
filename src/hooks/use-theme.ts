import { useState, useEffect } from 'react';
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    // We handle this in a side effect for SSR/Hydration safety if needed,
    // but here we check localStorage/system immediately for initial state.
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);
  // We return a stable function reference that doesn't rely on useCallback
  // to prevent "Rendered more hooks than during the previous render" 
  // which can happen if hook counts fluctuate in downstream components.
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };
  return { isDark, toggleTheme };
}