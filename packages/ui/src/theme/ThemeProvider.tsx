import React, { createContext, useContext } from 'react';
import type { PlanetaryMode } from '@lemos/core';

const ThemeContext = createContext<PlanetaryMode>('sun');

export const ThemeProvider: React.FC<{
  theme: PlanetaryMode;
  children: React.ReactNode;
}> = ({ theme, children }) => (
  <ThemeContext.Provider value={theme}>
    {children}
  </ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
