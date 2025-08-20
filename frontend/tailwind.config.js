/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,js}",
    "./public/**/*.html"
  ],
  safelist: [
    'flex', 'flex-col', 'min-h-screen', 'bg-cover', 'bg-center', 'text-white', 'm-0', 'ml-5', 'relative', 'first_line', 'mid_line', 'last_line',
  'flicker', 'fast-flicker', 'title', body, h1, 'btn', 'btn-animated', 'btn-hover-animated'
  ],
  theme: {
    extend: {
      fontFamily: {
        mclaren: ['McLaren', 'cursive'],
        pressstart2p: ['PressStart2P', 'cursive'],
        jura: ['Jura', 'cursive'],
        vt323: ['VT323', 'cursive']
      },
    },
  },
  plugins: [],
}