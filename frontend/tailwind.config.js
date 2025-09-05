/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,js}",
    "./public/**/*.html"
  ],
  safelist: [
    'bg-cover', 'bg-center', 'text-white', 'first_line', 'mid_line', 'last_line',
    'flicker', 'fast-flicker', 'title', 'btn', 'btn-animated', 'btn-hover-animated'
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