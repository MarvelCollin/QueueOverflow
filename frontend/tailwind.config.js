/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', 
  theme: {
    extend: {
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-subtle': 'pulse-subtle 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      colors: {
        'theme': {
          'bg': {
            'primary': '#0B1120',    
            'secondary': '#131C32',  
            'card': '#1A2542'        
          },
          'text': {
            'primary': '#F8FAFC',    
            'secondary': '#E2E8F0',  
            'muted': '#94A3B8'       
          },
          'accent': {
            'primary': '#8B5CF6',    
            'secondary': '#F472B6',  
            'blue': '#3B82F6',       
            'green': '#10B981',      
            'yellow': '#FBBF24',     
            'red': '#EF4444'         
          },
          'border': {
            'light': '#1E3A8A'       
          }
        },
        'night': {
          '50': '#f8fafc',
          '900': '#0f172a'
        },
        'aurora': {
          'purple': '#7c3aed'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
}
