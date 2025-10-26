/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/ui/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  prefix: 'cf-',
  corePlugins: {
    preflight: false,
  },
  important: '.chore-fire-ui',
}
