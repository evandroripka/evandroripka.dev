/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        surface: 'var(--color-surface)',

        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        muted: 'var(--color-text-muted)',

        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',

        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(34, 211, 238, 0.15)',
      },
      borderRadius: {
        card: '28px',
        panel: '32px',
      },
      maxWidth: {
        content: '1440px',
      },
    },
  },
  plugins: [],
}