const { heroui } = require("@heroui/theme");
const svgToDataUri = require("mini-svg-data-uri");
const defaultTheme = require("tailwindcss/defaultTheme");
import type { Config } from "tailwindcss";

const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

const config = {
	darkMode: ["class"],
	content: ["./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{ts,tsx,js,jsx}", "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			fontFamily: {
				sans: ["Inter", ...defaultTheme.fontFamily.sans],
				sans: ["var(--font-geist-sans)"],
				mono: ["var(--font-geist-mono)"],
			},
			screens: {
				pwa: {
					raw: "(display-mode: standalone)",
				},
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "#AE2D28",
					foreground: "hsl(var(--primary-foreground))",
				},
				school: {
					DEFAULT: "#383f9A",
					foreground: "hsl(var(--englishschool-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"scrolling-banner": {
					from: {
						transform: "translateX(0)",
					},
					to: {
						transform: "translateX(calc(-50% - var(--gap)/2))",
					},
				},
				"scrolling-banner-vertical": {
					from: {
						transform: "translateY(0)",
					},
					to: {
						transform: "translateY(calc(-50% - var(--gap)/2))",
					},
				},
				"accordion-down": {
					from: {
						height: "0",
					},
					to: {
						height: "var(--radix-accordion-content-height)",
					},
				},
				spotlight: {
					"0%": {
						opacity: "0",
						transform: "translate(-72%, -62%) scale(0.5)",
					},
					"100%": {
						opacity: "1",
						transform: "translate(-50%,-40%) scale(1)",
					},
				},
				movingShadow: {
					from: {
						backgroundPosition: "0 0",
					},
					to: {
						backgroundPosition: "-200% 0",
					},
				},
				"accordion-up": {
					from: {
						height: "var(--radix-accordion-content-height)",
					},
					to: {
						height: "0",
					},
				},
			},
			animation: {
				"scrolling-banner": "scrolling-banner var(--duration) linear infinite",
				"scrolling-banner-vertical": "scrolling-banner-vertical var(--duration) linear infinite",
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				shimmer: "movingShadow 2s linear infinite",
				spotlight: "spotlight 2s ease .75s 1 forwards",
			},
		},
	},
	plugins: [
		/* 	heroui(),
		require("tailwindcss-animate"),
		function ({ matchUtilities, theme }) {
			matchUtilities(
				{
					"bg-grid": (value) => ({
						backgroundImage: `url("${svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`)}")`,
					}),
					"bg-grid-small": (value) => ({
						backgroundImage: `url("${svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`)}")`,
					}),
					"bg-dot": (value) => ({
						backgroundImage: `url("${svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`)}")`,
					}),
				},
				{ values: flattenColorPalette(theme("backgroundColor")), type: "color" }
			);
		},
		require("tailwindcss-animate"), */
	],
} satisfies Config;

export default config;
