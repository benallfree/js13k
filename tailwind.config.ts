import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}', './index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#4a9eff',
        danger: '#dd4444',
        success: '#00ff00',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      spacing: {
        '0.5': '0.125rem', // 2px
        '15': '15px',
      },
    },
  },
} satisfies Config
