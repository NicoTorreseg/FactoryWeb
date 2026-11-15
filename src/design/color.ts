/**
 * Converts `#rrggbb` to a space separated RGB triplet (`"21 128 61"`).
 * Tokens are stored as channels so Tailwind can apply alpha: `bg-brand-primary/20`.
 */
export function hexToRgbChannels(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Relative luminance (WCAG) used to pick a readable text color over a brand color. */
export function readableTextOn(hex: string): '255 255 255' | '24 24 27' {
  const [r, g, b] = hexToRgbChannels(hex)
    .split(' ')
    .map((c) => {
      const s = Number(c) / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? '24 24 27' : '255 255 255';
}
