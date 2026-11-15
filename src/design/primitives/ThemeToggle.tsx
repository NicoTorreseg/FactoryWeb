import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeMode } from '../ThemeModeContext';

interface ThemeToggleProps {
  /** `onDark` for use over photography / always-dark bars. */
  tone?: 'auto' | 'onDark';
  className?: string;
}

/** Light/dark switch for the end user. Renders nothing when the tenant disabled it. */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ tone = 'auto', className = '' }) => {
  const { mode, canToggle, toggle } = useThemeMode();
  if (!canToggle) return null;

  const isDark = mode === 'dark';
  const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent ${
        tone === 'onDark'
          ? 'border-white/40 text-white hover:bg-white/10'
          : 'border-brand-border text-brand-text hover:bg-brand-text/5'
      } ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};
