import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// Base tokens shared
const baseComponents: Theme['components'] = {
  MuiButton: {
    styleOverrides: {
      root: { borderRadius: 8, textTransform: 'none', fontWeight: 500, padding: '8px 16px' },
      contained: { boxShadow: '0 2px 4px rgba(0,0,0,0.15)', '&:hover': { boxShadow: '0 4px 10px rgba(0,0,0,0.25)' } }
    }
  },
  MuiCard: { styleOverrides: { root: { borderRadius: 12, transition: 'box-shadow .25s', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.2)' } } } },
  MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } } } },
  MuiAppBar: { styleOverrides: { root: { boxShadow: '0 2px 8px rgba(0,0,0,0.2)' } } },
};

export const themeLight = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  components: baseComponents,
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
});

export const themeDark = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9', light: '#e3f2fd', dark: '#42a5f5', contrastText: '#0d1117' },
    secondary: { main: '#f48fb1', light: '#f8bbd0', dark: '#ad4875', contrastText: '#0d1117' },
    background: { default: '#0d1117', paper: '#161b22' },
    success: { main: '#4caf50' },
    error: { main: '#ef5350' },
    warning: { main: '#ffb74d' },
    info: { main: '#64b5f6' },
    divider: '#30363d'
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  },
  components: baseComponents,
  spacing: 8,
  shape: { borderRadius: 8 }
});

export type ThemeMode = 'light' | 'dark';
