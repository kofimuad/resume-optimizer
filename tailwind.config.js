/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Brand placeholders — adjust during design polish
        brand: {
          DEFAULT: '#0f172a',
          accent: '#2563eb',
        },
      },
    },
  },
  plugins: [],
}
