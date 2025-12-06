/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import type { EventBus, PlanetaryMode, PlanetaryModeChangedPayload, BaseEvent } from '@lemos/core';
import { ThemeProvider } from './ThemeProvider';

interface ThemeEngineProps {
  bus: EventBus;
  contextProvider: () => { planetaryMode: PlanetaryMode };
  children: React.ReactNode;
}

export const ThemeEngine: React.FC<ThemeEngineProps> = ({
  bus,
  contextProvider,
  children
}) => {
  const [theme, setTheme] = useState<PlanetaryMode>('sun');

  useEffect(() => {
    // Initialize from context
    const context = contextProvider();
    setTheme(context.planetaryMode);

    // Subscribe to changes
    const handleModeChange = (event: BaseEvent<PlanetaryModeChangedPayload>) => {
      setTheme(event.payload.mode);
    };

    bus.on<PlanetaryModeChangedPayload>('PlanetaryModeChanged', handleModeChange);

    return () => {
      bus.off<PlanetaryModeChangedPayload>('PlanetaryModeChanged', handleModeChange);
    };
  }, [bus, contextProvider]);

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
