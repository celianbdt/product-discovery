/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'color-1': 'hsl(0, 100%, 50%)',
        'color-2': 'hsl(60, 100%, 50%)',
        'color-3': 'hsl(120, 100%, 50%)',
        'color-4': 'hsl(180, 100%, 50%)',
        'color-5': 'hsl(240, 100%, 50%)',
      },
      animation: {
        'rainbow': 'rainbow 3s linear infinite',
      },
      keyframes: {
        rainbow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
    },
  },
  plugins: [],
};
