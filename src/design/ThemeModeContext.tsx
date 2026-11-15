import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ColorMode } from './presets';

interface ThemeModeContextValue {
  mode: ColorMode;
  /** False when the tenant disabled the switch (mode is then fixed). */
  canToggle: boolean;
  toggle: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

const storageKey = (slug: string) => `aventotech:mode:${slug}`;

function isColorMode(value: unknown): value is ColorMode {
  return value === 'light' || value === 'dark';
}

/**
 * Resolution order: `?mode=` query (deterministic screenshots) > saved user choice > tenant default.
 */
function resolveInitialMode(slug: string, defaultMode: ColorMode, canToggle: boolean): ColorMode {
  if (!canToggle) return defaultMode;

  const fromQuery = new URLSearchParams(window.location.search).get('mode');
  if (isColorMode(fromQuery)) return fromQuery;

  try {
    const saved = window.localStorage.getItem(storageKey(slug));
    if (isColorMode(saved)) return saved;
  } catch {
    /* storage can be blocked (private mode / iframes): fall back silently */
  }
  return defaultMode;
}

interface ThemeModeProviderProps {
  slug: string;
  defaultMode: ColorMode;
  allowToggle: boolean;
  children: React.ReactNode;
}

/** Mount with `key={slug}` so the state resets when the operator switches tenant. */
export const ThemeModeProvider: React.FC<ThemeModeProviderProps> = ({
  slug,
  defaultMode,
  allowToggle,
  children,
}) => {
  const [mode, setMode] = useState<ColorMode>(() =>
    resolveInitialMode(slug, defaultMode, allowToggle)
  );

  const toggle = useCallback(() => {
    setMode((current) => {
      const next: ColorMode = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(storageKey(slug), next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [slug]);

  const value = useMemo<ThemeModeContextValue>(
    () => ({ mode, canToggle: allowToggle, toggle }),
    [mode, allowToggle, toggle]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
};

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used inside <ThemeModeProvider>');
  return ctx;
}
