import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4332',
          light:   '#2D6A4F',
          dark:    '#0F2B1F',
        },
        accent: {
          DEFAULT: '#40916C',
          light:   '#52B788',
        },
        surface: '#FFFFFF',
        border:  '#E2E8E2',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      fontSize: {
        '2xs': '0.65rem',
      },
    },
  },
  plugins: [],
}

export default config