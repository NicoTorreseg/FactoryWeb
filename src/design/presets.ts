import type { DesignPreset } from '../domain/tenant.schema';

export type ColorMode = 'light' | 'dark';

/** Surface palette expressed as RGB channels (see `color.ts`). */
export interface SurfacePalette {
  surface: string;
  surfaceAlt: string;
  card: string;
  text: string;
  muted: string;
  border: string;
}

export interface DesignPresetDefinition {
  fonts: {
    display: string;
    body: string;
    script: string;
  };
  palettes: Record<ColorMode, SurfacePalette>;
  /** Loads self-hosted font files on demand (code-split per preset). */
  loadFonts: () => Promise<unknown>;
}

const SYSTEM_SANS = "'Inter', system-ui, -apple-system, sans-serif";

/**
 * Design presets = style, decoupled from structure (sections).
 * To add a new look (e.g. `bold`) add an entry here and extend `DESIGN_PRESETS` in the schema.
 */
export const DESIGN_PRESET_DEFINITIONS: Record<DesignPreset, DesignPresetDefinition> = {
  modern: {
    fonts: { display: SYSTEM_SANS, body: SYSTEM_SANS, script: SYSTEM_SANS },
    palettes: {
      light: {
        surface: '250 250 250',
        surfaceAlt: '244 244 245',
        card: '255 255 255',
        text: '9 9 11',
        muted: '82 82 91',
        border: '228 228 231',
      },
      dark: {
        surface: '9 9 11',
        surfaceAlt: '24 24 27',
        card: '24 24 27',
        text: '244 244 245',
        muted: '161 161 170',
        border: '39 39 42',
      },
    },
    loadFonts: async () => undefined,
  },

  editorial: {
    fonts: {
      display: "'Fraunces Variable', Georgia, 'Times New Roman', serif",
      body: SYSTEM_SANS,
      script: "'Caveat', 'Segoe Script', cursive",
    },
    palettes: {
      light: {
        surface: '245 239 228',
        surfaceAlt: '235 227 211',
        card: '251 247 239',
        text: '42 31 23',
        muted: '107 90 76',
        border: '216 205 184',
      },
      dark: {
        surface: '23 17 13',
        surfaceAlt: '31 24 19',
        card: '35 27 21',
        text: '241 232 216',
        muted: '179 162 142',
        border: '58 46 36',
      },
    },
    loadFonts: () =>
      Promise.all([
        import('@fontsource-variable/fraunces/wght.css'),
        import('@fontsource-variable/fraunces/wght-italic.css'),
        import('@fontsource/caveat/latin-600.css'),
      ]),
  },
};
