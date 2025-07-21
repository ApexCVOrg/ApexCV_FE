'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { THEME } from '@/lib/constants/constants';

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: THEME.LIGHT,
  toggleTheme: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState(THEME.LIGHT);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || THEME.LIGHT;
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT;
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const muiTheme = createTheme({
    palette: {
      mode: theme === THEME.LIGHT ? 'light' : 'dark',
      primary: {
        main: '#0070f3',
      },
      secondary: {
        main: '#00c6ff',
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
