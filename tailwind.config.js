/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/views/**/*.edge',
    './resources/js/**/*.js',
    './app/**/*.ts',
    './start/**/*.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        tindax: {
          50: '#f3fbf7',
          100: '#dff4e8',
          200: '#bfe8d2',
          300: '#91d5b2',
          400: '#5eb98d',
          500: '#35986d',
          600: '#247c57',
          700: '#1c6246',
          800: '#164d38',
          900: '#123f2f',
          950: '#09241b',
        },
        gold: {
          100: '#fbf1c8',
          200: '#f5df8b',
          300: '#edc95f',
          400: '#ddb03c',
        },
        ink: '#101916',
        mist: '#f7f7f3',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(9, 36, 27, 0.12)',
        panel: '0 18px 48px rgba(16, 25, 22, 0.08)',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top left, rgba(191, 232, 210, 0.65), transparent 40%), radial-gradient(circle at top right, rgba(221, 176, 60, 0.14), transparent 30%), linear-gradient(135deg, rgba(9, 36, 27, 0.98), rgba(28, 98, 70, 0.92))',
      },
    },
  },
  plugins: [],
}
