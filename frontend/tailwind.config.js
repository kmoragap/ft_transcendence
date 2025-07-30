/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,js}",
    "./public/**/*.html"
  ],
  safelist: [
    'flex', 'flex-col', 'min-h-screen', 'bg-cover', 'bg-center', 'text-white', 'm-0', 'ml-5', 'relative', 'first_line', 'mid_line', 'last_line',
  'flicker', 'fast-flicker', 'title'
  ],
  theme: {
    extend: {
      fontFamily: {
        mclaren: ['McLaren', 'cursive'],
      },
    },
  },
  plugins: [],
}