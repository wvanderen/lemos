import { useTheme } from '../theme';
import { Select } from '../atoms';
import type { PlanetaryMode, EventBus, PlanetaryModeChangedPayload } from '@lemos/core';

interface ThemeSwitcherProps {
  bus: EventBus;
  className?: string;
}

export function ThemeSwitcher({ bus, className = '' }: ThemeSwitcherProps) {
  const currentTheme = useTheme();

  const handleThemeChange = (newTheme: PlanetaryMode) => {
    // Emit event to update global context
    bus.emit({
      id: crypto.randomUUID(),
      type: 'PlanetaryModeChanged',
      timestamp: new Date().toISOString(),
      payload: { mode: newTheme } as PlanetaryModeChangedPayload
    });
  };

  const themeOptions = [
    { value: 'sun', label: '☀️ Sun' },
    { value: 'moon', label: '🌙 Moon' },
    { value: 'void', label: '⚫ Void' },
  ];

  return (
    <Select
      options={themeOptions}
      value={currentTheme}
      onChange={(e) => handleThemeChange(e.target.value as PlanetaryMode)}
      className={className}
    />
  );
}