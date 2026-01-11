import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { themeLight, themeDark } from './theme';
import type { ThemeMode } from './theme';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (m: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode debe usarse dentro de ThemeModeProvider');
  return ctx;
};

interface Props { children: React.ReactNode; }

export const ThemeModeProvider: React.FC<Props> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  // Cargar preferencia almacenada
  useEffect(()=>{
    const stored = localStorage.getItem('ui.theme');
    if (stored === 'light' || stored === 'dark') setMode(stored);
    else if (stored === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setMode(mq.matches ? 'dark':'light');
    }
  },[]);

  const toggleMode = () => setMode(prev => prev === 'light' ? 'dark' : 'light');
  const setAndPersist = (m: ThemeMode) => { setMode(m); localStorage.setItem('ui.theme', m); };

  const theme = useMemo(()=> mode === 'dark' ? themeDark : themeLight, [mode]);

  const value: ThemeContextValue = { mode, toggleMode, setMode: setAndPersist };

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
