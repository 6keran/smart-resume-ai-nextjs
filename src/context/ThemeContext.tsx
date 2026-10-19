'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: string;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: string) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'smart_resume_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  // Apply theme classes and attributes directly to document.documentElement and document.body
  const applyThemeToDom = useCallback((targetTheme: 'light' | 'dark') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (targetTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      if (body) {
        body.classList.remove('dark');
        body.classList.add('light');
        body.setAttribute('data-theme', 'light');
        body.style.colorScheme = 'light';
      }
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      if (body) {
        body.classList.remove('light');
        body.classList.add('dark');
        body.setAttribute('data-theme', 'dark');
        body.style.colorScheme = 'dark';
      }
    }
  }, []);

  // Compute resolved theme based on preference
  const resolveTheme = useCallback((pref: string): 'light' | 'dark' => {
    if (pref === 'light') return 'light';
    if (pref === 'dark') return 'dark';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  }, []);

  // Initialize theme on client mount
  useEffect(() => {
    setMounted(true);
    let savedTheme: string | null = null;
    try {
      savedTheme = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('theme');
    } catch {}

    const initialTheme = savedTheme || 'dark';
    const resolved = resolveTheme(initialTheme);
    setThemeState(initialTheme);
    setResolvedTheme(resolved);
    applyThemeToDom(resolved);
  }, [applyThemeToDom, resolveTheme]);

  // Listen to system preference changes if theme is 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (theme === 'system') {
        const resolved = media.matches ? 'dark' : 'light';
        setResolvedTheme(resolved);
        applyThemeToDom(resolved);
      }
    };
    try {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } catch {
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [theme, applyThemeToDom]);

  // Sync across tabs via storage event
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === 'theme') {
        const next = e.newValue || 'dark';
        const resolved = resolveTheme(next);
        setThemeState(next);
        setResolvedTheme(resolved);
        applyThemeToDom(resolved);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [applyThemeToDom, resolveTheme]);

  // User sets theme
  const setTheme = useCallback(
    (newTheme: string) => {
      const resolved = resolveTheme(newTheme);
      setThemeState(newTheme);
      setResolvedTheme(resolved);

      // Instant DOM update
      applyThemeToDom(resolved);

      // Persist to storage
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
        localStorage.setItem('theme', newTheme);
      } catch {}
    },
    [applyThemeToDom, resolveTheme]
  );

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  const isDark = resolvedTheme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        isDark,
        toggleTheme,
        setTheme,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
