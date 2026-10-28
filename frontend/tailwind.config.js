/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Emerald chính
          600: '#059669', // Emerald đậm
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        lock: {
          bg: '#FEF3C7',    // Amber background cho Redis Lock
          border: '#F59E0B',// Amber border
          text: '#D97706',  // Amber text
        },
        booked: {
          bg: '#E0F2FE',    // Sky blue tint cho ô đã đặt
          border: '#BAE6FD',
          text: '#0369A1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
