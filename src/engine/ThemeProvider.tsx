import React, { useEffect, useMemo } from 'react';
import { ThemeConfig } from '../domain/tenant.schema';
import { hexToRgbChannels, readableTextOn } from '../design/color';
import { DESIGN_PRESET_DEFINITIONS } from '../design/presets';

interface ThemeProviderProps {
  /** Theme with the *effective* mode already resolved (see `Storefront`). */
  theme: ThemeConfig;
  children: React.ReactNode;
}

const RADIUS_MAP: Record<ThemeConfig['borderRadius'], string> = {
  sharp: '0.25rem',
  rounded: '0.875rem',
  pill: '1.5rem',
};

/**
 * Design-token engine.
 * Publishes the active preset + color mode as CSS custom properties, so every component
 * styles itself with `bg-brand-*` / `text-brand-*` and the light/dark switch is free.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  const preset = DESIGN_PRESET_DEFINITIONS[theme.preset];

  useEffect(() => {
    void preset.loadFonts();
  }, [preset]);

  const styleVars = useMemo(() => {
    const palette = preset.palettes[theme.mode];
    return {
      '--brand-primary': hexToRgbChannels(theme.primaryColor),
      '--brand-on-primary': readableTextOn(theme.primaryColor),
      '--brand-accent': hexToRgbChannels(theme.accentColor),
      '--brand-surface': palette.surface,
      '--brand-surface-alt': palette.surfaceAlt,
      '--brand-card': palette.card,
      '--brand-text': palette.text,
      '--brand-muted': palette.muted,
      '--brand-border': palette.border,
      '--brand-radius': RADIUS_MAP[theme.borderRadius],
      '--font-display': preset.fonts.display,
      '--font-body': preset.fonts.body,
      '--font-script': preset.fonts.script,
      colorScheme: theme.mode,
    } as React.CSSProperties;
  }, [theme, preset]);

  return (
    <div
      style={styleVars}
      data-theme={theme.mode}
      data-preset={theme.preset}
      className="min-h-screen bg-brand-surface font-body text-brand-text transition-colors duration-300"
    >
      {children}
    </div>
  );
};
