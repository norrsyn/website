/** @type {import('tailwindcss').Config} */

/**
 * NORRSYN — website palette.
 *
 * The tonal system is a ladder, not a pair of colours. Light sections step
 * between warm paper, near-white and a cooler pale grey so the page gains
 * depth without adding UI chrome; dark sections step between graphite (neutral,
 * technical) and forest (green-black, atmospheric).
 *
 * Green is an accent, never a field. The two greens are the product's own
 * (--color-accent / --color-accent-dim in the app design system): #45A57F for
 * dark surfaces, #2E6E55 for light ones. The old #3ECF8E is gone.
 *
 * Ink steps are tuned so every one clears WCAG AA (4.5:1) on `paper`.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Light ladder */
        paper:    '#F4F1E9', // warm cream — the page canvas
        'paper-2':'#FAF8F3', // near-white — lifted surface
        'paper-3':'#FFFFFF', // white — documents
        mist:     '#E7E9E6', // cooler pale grey — technical sections

        /* Dark ladder */
        graphite:   '#15181A', // near-black, neutral
        'graphite-2':'#1D2124',
        forest:     '#0C1310', // deep green-black
        'forest-2': '#121C17',

        /* Ink — all four clear AA on paper */
        ink:     '#15181A', // 15.9:1
        'ink-2': '#2A2F33', // 12.0:1
        'ink-3': '#4E5459', //  6.7:1
        'ink-4': '#676D72', //  4.6:1 — faintest legal step

        /* Green — restrained */
        'green-deep': '#2E6E55', // light surfaces (5.4:1 on paper)
        green:        '#45A57F', // dark surfaces (6.2:1 on forest)
        'green-hi':   '#58B892',

        /* Editorial signal colours, borrowed verbatim from the app */
        amber: '#C9A04A',
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Newsreader', 'Georgia', 'serif'],
        mono:    ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        /* Machined, matching the app: depth reads through hairlines, not bubbles. */
        'xs': '2px', 'sm': '4px', DEFAULT: '6px', 'md': '6px',
        'lg': '8px', 'xl': '10px', '2xl': '12px', '3xl': '14px', '4xl': '18px',
      },
      transitionTimingFunction: {
        'out-quint': 'cubic-bezier(0.16, 1, 0.30, 1)',
        'both':      'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
}
