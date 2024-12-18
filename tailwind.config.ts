import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    {
      pattern: /bg-(blue|green|purple|orange|pink|indigo|yellow|red|teal|cyan|lime|emerald|sky|violet|rose|amber|fuchsia)-(100|200|800)/,
    },
    {
      pattern: /text-(blue|green|purple|orange|pink|indigo|yellow|red|teal|cyan|lime|emerald|sky|violet|rose|amber|fuchsia)-800/,
    },
    {
      pattern: /hover:bg-(blue|green|purple|orange|pink|indigo|yellow|red|teal|cyan|lime|emerald|sky|violet|rose|amber|fuchsia)-200/,
    }
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
			  shimmer: {
				'0%': { backgroundPosition: '200% 0' },
  				'100%': { backgroundPosition: '-200% 0' },
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
			'shimmer': 'shimmer 2s linear infinite',
			'shimmer-fast': 'shimmer 1.5s linear infinite',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/typography'), require('tailwind-scrollbar-hide')],
};
export default config;
