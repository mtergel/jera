const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./packages/renderer/index.html', './packages/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        b: {
          base: 'var(--color-base)',
          sidebar: 'var(--color-sidebar-base)',
        },
        t: {
          primary: 'var(--color-text-primary)',
          muted: 'var(--color-text-muted)',
        },
        line: 'var(--color-line)',
      },

      fontFamily: {
        sans: ['var(--font-system)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
