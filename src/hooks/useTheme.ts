import { useCallback, useEffect, useState } from 'react';
import type { Theme } from '@/types';

function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('wt_theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage can fail in private/PWA contexts.
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('wt_theme', theme); } catch { /* ignore blocked storage */ }
  }, [theme]);
  const toggle = useCallback(() => setTheme((previous) => previous === 'light' ? 'dark' : 'light'), []);
  const set = useCallback((nextTheme: Theme) => setTheme(nextTheme), []);
  return { theme, toggle, set };
}
