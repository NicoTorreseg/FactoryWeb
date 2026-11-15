/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--brand-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: token('primary'),
          'on-primary': token('on-primary'),
          accent: token('accent'),
          surface: token('surface'),
          'surface-alt': token('surface-alt'),
          card: token('card'),
          text: token('text'),
          muted: token('muted'),
          border: token('border'),
        },
      },
      borderRadius: {
        brand: 'var(--brand-radius)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: 'var(--font-body)',
        display: 'var(--font-display)',
        script: 'var(--font-script)',
      },
    },
  },
  plugins: [],
};
