/** @type {import('tailwindcss').Config} */
// DESIGN.md (Contractbook reference) — 100% compliance.
// Public site follows cream + violet + yellow + ink system. NO drop shadows.
// Admin pages retain samsung-* tokens for legacy compatibility.
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Public site — DESIGN.md palette
        cream: '#f0f0ec',
        ink: '#1a1a1a',
        charcoal: '#222222',
        violet: {
          DEFAULT: '#1009f6',
          soft: '#ece9ff',
          deep: '#0a05c4',
        },
        yellow: {
          DEFAULT: '#ffba09',
          soft: '#fff3d4',
        },
        stone: '#d4d4d0',
        silver: '#b3b3b3',
        skymist: '#add3e5',
        blossom: '#e3c7de',
        forest: '#304801',
        whatsapp: '#25D366',
        // Admin — kept for admin pages
        samsung: {
          blue: '#1428a0',
          darkblue: '#0d1b5e',
          lightblue: '#4a7dff',
          light: '#4a7dff',
          mist: '#f4f6fb',
          ink: '#0a1024',
        },
      },
      fontFamily: {
        // DESIGN.md: Abcwhyte substitute. Inter Variable used.
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        display: ['"Inter Tight Variable"', '"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // DESIGN.md type scale — exact values
        caption: ['11px', { lineHeight: '1.4' }],
        body: ['14px', { lineHeight: '1.5' }],
        'body-lg': ['16px', { lineHeight: '1.6' }],
        subheading: ['25px', { lineHeight: '1.25' }],
        'heading-sm': ['28px', { lineHeight: '1.3' }],
        heading: ['32px', { lineHeight: '1.24' }],
        'heading-lg': ['40px', { lineHeight: '1.2' }],
        display: ['48px', { lineHeight: '1.2' }],
      },
      maxWidth: {
        content: '1200px', // DESIGN.md page max-width
      },
      borderRadius: {
        // DESIGN.md named radii
        md: '4px',       // input radius per spec
        lg: '16px',
        '2xl': '20px',
        '3xl': '24px',   // cards + standard buttons
        '4xl': '32px',
        '5xl': '40px',   // images
        pill: '999px',    // pills
        full: '9999px',
      },
      keyframes: {
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};