/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Quicksand', 'Inter', 'sans-serif'],
			serif: ['Playfair Display', 'serif'],
			display: ['Playfair Display', 'serif'],
  			mono: ['JetBrains Mono', 'monospace']
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			warm: {
  				white: '#FDFBF7',
				cream: '#F9F3E5',
				paper: '#FFF9F0'
  			},
  			peach: {
  				DEFAULT: '#FF9A9E',
				light: '#FECFEF',
				dark: '#F5576C'
  			},
  			mist: '#A1C4FD',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			ring: 'hsl(var(--ring))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			input: 'hsl(var(--input))',
  		},
  		keyframes: {
  			'fade-in': {
  				'0%': { opacity: '0', transform: 'translateY(10px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			'breathe': {
  				'0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
  				'50%': { transform: 'scale(1.05)', opacity: '1' }
  			},
  			float: {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-10px)' }
  			},
			'slow-spin': {
				'0%': { transform: 'rotate(0deg)' },
				'100%': { transform: 'rotate(360deg)' }
			}
  		},
  		animation: {
  			'fade-in': 'fade-in 1s ease-out',
  			'breathe': 'breathe 8s ease-in-out infinite',
  			float: 'float 4s ease-in-out infinite',
			'slow-spin': 'slow-spin 20s linear infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
}