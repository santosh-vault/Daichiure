/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-gradient-to-br',
    'from-[#0f051d]',
    'via-[#1a093b]',
    'to-[#0f051d]',
    'from-[#18122B]',
    'to-[#18122B]',
    'from-[#0fffc1]',
    'to-[#7e30e1]',
    'from-[#1a093b]',
    'via-[#0fffc1]/10',
    'to-[#7e30e1]/10',
    'text-cyan-400',
    'text-cyan-200',
    'text-cyan-300',
    'text-cyan-100',
    'text-fuchsia-400',
    'text-fuchsia-200',
    'text-yellow-300',
    'text-purple-400',
    'border-cyan-400/40',
    'border-cyan-400',
    'border-fuchsia-400/30',
    'border-fuchsia-400',
    'shadow-[0_0_8px_2px_#0fffc1]',
    'shadow-[0_0_32px_4px_#0fffc1]',
    'shadow-[0_0_24px_2px_rgba(0,255,255,0.15)]',
    'shadow-[0_0_24px_2px_#7e30e1]',
    'drop-shadow-[0_0_8px_cyan]',
    'drop-shadow-[0_0_8px_fuchsia]',
    'drop-shadow-[0_0_8px_yellow]',
    'drop-shadow-[0_0_8px_purple]',
    'drop-shadow-[0_0_6px_#0fffc1]',
    'drop-shadow-[0_0_8px_fuchsia]',
    'drop-shadow-[0_0_8px_cyan]',
    'drop-shadow-[0_0_8px_yellow]',
    'drop-shadow-[0_0_8px_purple]',
    // New utility classes for enhanced UI
    'glass',
    'glass-strong',
    'gradient-text',
    'btn-primary',
    'btn-secondary',
    'card',
    'input-modern',
    'animate-fade-in-up',
    'animate-fade-in-scale',
    'animate-pulse-glow',
    'hover-lift',
    'hover-glow',
    'line-clamp-2',
    'backdrop-blur-sm',
    'backdrop-blur-md',
    'backdrop-blur-lg',
    'backdrop-blur-xl',
    'backdrop-blur-2xl',
    'backdrop-blur-3xl',
  ],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'bruno-ace': ['Bruno Ace SC', 'sans-serif'],
        'helvetica': ['Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        'primary': {
          'gold': '#FFD700',
          'gold-dark': '#FFB300',
          'gold-light': '#FFE55C',
        },
        'accent': {
          'blue': '#3B82F6',
          'purple': '#8B5CF6',
        },
        'bg': {
          'dark': '#0A0A0A',
          'darker': '#050505',
          'card': 'rgba(31, 41, 55, 0.8)',
          'glass': 'rgba(255, 255, 255, 0.05)',
        },
        'text': {
          'primary': '#F9FAFB',
          'secondary': '#D1D5DB',
          'muted': '#9CA3AF',
        },
        'border': {
          'light': 'rgba(255, 255, 255, 0.1)',
          'medium': 'rgba(255, 255, 255, 0.2)',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-scale': 'fadeInScale 0.4s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'fadeInUp': {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fadeInScale': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
          },
        },
        'gradient-shift': {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-strong': '0 0 30px rgba(255, 215, 0, 0.5)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.4)',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    // Add line-clamp plugin for text truncation
    function({ addUtilities }) {
      const newUtilities = {
        '.line-clamp-2': {
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
        '.line-clamp-3': {
          display: '-webkit-box',
          '-webkit-line-clamp': '3',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};
