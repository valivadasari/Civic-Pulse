/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070D1E',
          900: '#0B132B',
          850: '#111D3E',
          800: '#1C2541',
          700: '#263459',
          600: '#3A4D7D',
        },
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          card: '#FFFFFF',
        },
        brand: {
          blue: '#2563EB',
          'blue-electric': '#0284C7',
          'blue-light': '#E0F2FE',
          teal: '#0D9488',
          'teal-light': '#CCFBF1',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px -2px rgba(15, 23, 42, 0.05), 0 10px 25px -5px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'modal': '0 25px 50px -12px rgba(11, 19, 43, 0.25)',
      }
    },
  },
  plugins: [],
}
