
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        'custom-dark': '5px 5px 3px hsla(277, 48.70%, 22.20%, 0.80)',
        'gold-glow-bottom': '0 4px 15px 2px rgba(255, 215, 0, 0.4)',
      },
      spacing: {
        '1.5': '0.375rem',
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        code: ['monospace'],
        'plex-sans': ['"IBM Plex Sans"', 'sans-serif'],
        'plex-sans-condensed': ['"IBM Plex Sans Condensed"', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        'custom-gold': '#FFD139',
        'custom-purple-light': '#E1BEE7',
        'custom-purple-dark': '#5D2B79',
        'custom-gray-dark': 'rgb(12, 12, 12)',
        'footer-gray': '#353535',
        sparkle: 'hsl(var(--sparkle))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: '#22c55e', // green-500
          foreground: '#fafaf9', // stone-50
          border: '#16a34a', // green-600
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-from-right-and-fade': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down-fade': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'sparkle-pulse': {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '50%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.2)', opacity: '0' },
        },
        'sparkle-fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'heart-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        'pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-up-fade-in': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-up-and-fade-in-out': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '20%': { transform: 'translateY(0)', opacity: '1' },
          '80%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
        'slide-up-and-out': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-150%)', opacity: '0' },
        },
        'cut-through': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'shake': {
          '0%, 25%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '6.25%': { transform: 'rotate(5deg) scale(1.1)' },
          '12.5%': { transform: 'rotate(-5deg) scale(1.1)' },
          '18.75%': { transform: 'rotate(5deg) scale(1.1)' },
        },
        'loader-bar': {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '75%': {
            transform: 'translateX(-40%)',
          },
          '100%': {
            transform: 'translateX(0%)',
          },
        },
        'sparkle-glow': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'slide-up-in': {
          from: { transform: 'translateY(100%)', opacity: '0.8' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down-out': {
          from: { transform: 'translateY(0)', opacity: '1' },
          to: { transform: 'translateY(100%)', opacity: '0' },
        },
        'fade-out-slide-up': {
          'from': { opacity: '1', transform: 'translateY(0)', maxHeight: '1000px' },
          'to': { opacity: '0', transform: 'translateY(-20px)', maxHeight: '0px', paddingTop: '0', paddingBottom: '0', marginTop: '0', marginBottom: '0' },
        },
        'pulse': {
          '50%': {
            opacity: '.5',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-in-from-left': 'slide-in-from-left 0.5s ease-out forwards',
        'slide-in-from-right': 'slide-in-from-right 0.5s ease-out forwards',
        'slide-in-from-right-and-fade': 'slide-in-from-right-and-fade 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out forwards',
        'slide-down-fade': 'slide-down-fade 0.3s ease-in-out',
        'sparkle-pulse': 'sparkle-pulse 0.6s ease-out forwards',
        'sparkle-fade-out': 'sparkle-fade-out 0.6s ease-out forwards',
        'heart-pop': 'heart-pop 0.3s ease-in-out',
        'pop': 'pop 0.3s ease-in-out',
        'slide-up-fade-in': 'slide-up-fade-in 0.5s ease-out forwards',
        'slide-up-and-fade-in-out': 'slide-up-and-fade-in-out 1s ease-in-out forwards',
        'slide-up-and-out': 'slide-up-and-out 1s ease-in-out forwards',
        'cut-through': 'cut-through 0.8s ease-in-out forwards',
        'shake': 'shake 4s ease-in-out infinite',
        'loader-bar': 'loader-bar 1.5s ease-in-out forwards',
        'sparkle-glow': 'sparkle-glow 3s ease-in-out infinite',
        'slide-up-in': 'slide-up-in 0.5s ease-out',
        'slide-down-out': 'slide-down-out 0.5s ease-out',
        'fade-out-slide-up': 'fade-out-slide-up 0.5s ease-out forwards',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
