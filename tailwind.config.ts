/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			inter: [
  				'Inter',
  				'sans-serif'
  			],
  			mono: [
  				'Roboto Mono',
  				'monospace'
  			]
  		},
  		fontSize: {
  			xs: [
  				'0.75rem',
  				{
  					lineHeight: '1.5'
  				}
  			],
  			sm: [
  				'0.875rem',
  				{
  					lineHeight: '1.5715'
  				}
  			],
  			base: [
  				'1rem',
  				{
  					lineHeight: '1.5',
  					letterSpacing: '-0.017em'
  				}
  			],
  			lg: [
  				'1.125rem',
  				{
  					lineHeight: '1.5',
  					letterSpacing: '-0.017em'
  				}
  			],
  			xl: [
  				'1.25rem',
  				{
  					lineHeight: '1.5',
  					letterSpacing: '-0.017em'
  				}
  			],
  			'2xl': [
  				'1.5rem',
  				{
  					lineHeight: '1.415',
  					letterSpacing: '-0.037em'
  				}
  			],
  			'3xl': [
  				'1.875rem',
  				{
  					lineHeight: '1.3333',
  					letterSpacing: '-0.037em'
  				}
  			],
  			'4xl': [
  				'2.25rem',
  				{
  					lineHeight: '1.2777',
  					letterSpacing: '-0.037em'
  				}
  			],
  			'5xl': [
  				'3rem',
  				{
  					lineHeight: '1',
  					letterSpacing: '-0.037em'
  				}
  			],
  			'6xl': [
  				'4rem',
  				{
  					lineHeight: '1',
  					letterSpacing: '-0.037em'
  				}
  			],
  			'7xl': [
  				'4.5rem',
  				{
  					lineHeight: '1',
  					letterSpacing: '-0.037em'
  				}
  			]
  		},
  		keyframes: {
  			'code-1': {
  				'0%': {
  					opacity: 0
  				},
  				'2.5%': {
  					opacity: 1
  				},
  				'97.5%': {
  					opacity: 1
  				},
  				'100%': {
  					opacity: 0
  				}
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			aurora: {
  				from: {
  					backgroundPosition: '50% 50%, 50% 50%'
  				},
  				to: {
  					backgroundPosition: '350% 50%, 350% 50%'
  				}
  			},
  			'border-beam': {
  				'100%': {
  					'offset-distance': '100%'
  				}
  			},
  			'progress-top': {
  				'0%': { transform: 'translateX(0%)', width: '3px' },
  				'12.5%': { transform: 'translateX(100%)', width: '100%' },
  				'12.51%, 100%': { transform: 'translateX(100%)', width: '3px' },
  			},
  			'progress-right': {
  				'0%, 12.5%': { transform: 'translateY(0%)', height: '3px' },
  				'25%': { transform: 'translateY(100%)', height: '100%' },
  				'25.01%, 100%': { transform: 'translateY(100%)', height: '3px' },
  			},
  			'progress-bottom': {
  				'0%, 25%': { transform: 'translateX(0%)', width: '3px' },
  				'37.5%': { transform: 'translateX(-100%)', width: '100%' },
  				'37.51%, 100%': { transform: 'translateX(-100%)', width: '3px' },
  			},
  			'progress-left': {
  				'0%, 37.5%': { transform: 'translateY(0%)', height: '3px' },
  				'50%': { transform: 'translateY(-100%)', height: '100%' },
  				'50.01%, 100%': { transform: 'translateY(-100%)', height: '3px' },
  			},
  			'progress-line': {
  				'0%': { 
  					transform: 'translateX(0%) translateY(0%)',
  					width: '100%',
  					height: '3px',
  					top: '0',
  					left: '0'
  				},
  				'25%': {
  					transform: 'translateX(100%) translateY(0%)',
  					width: '3px',
  					height: '100%',
  					top: '0',
  					right: '0'
  				},
  				'50%': {
  					transform: 'translateX(100%) translateY(100%)',
  					width: '100%',
  					height: '3px',
  					bottom: '0',
  					right: '0'
  				},
  				'75%': {
  					transform: 'translateX(0%) translateY(100%)',
  					width: '3px',
  					height: '100%',
  					bottom: '0',
  					left: '0'
  				},
  				'100%': {
  					transform: 'translateX(0%) translateY(0%)',
  					width: '100%',
  					height: '3px',
  					top: '0',
  					left: '0'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			}
  		},
  		animation: {
  			aurora: 'aurora 60s linear infinite',
  			'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
  			'progress-line': 'progress-line 50s linear infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
