/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core backgrounds — near-black charcoal
        void: {
          950: '#080A0C',
          900: '#0C0F12',
          800: '#111418',
          700: '#171C21',
          600: '#1E252D',
          500: '#262E38',
        },
        // Borders & structure
        line: {
          hard:   '#1E2A35',
          mid:    '#162028',
          soft:   '#0F1820',
        },
        // Text hierarchy
        ink: {
          primary:   '#E8EDF2',
          secondary: '#8A9BB0',
          muted:     '#3D5068',
          ghost:     '#243040',
        },
        // Orange — operational accent (active zones, trucks, logo, primary chart lines)
        orange: {
          500: '#E8600A',
          dim:  'rgba(232,96,10,0.12)',
          edge: 'rgba(232,96,10,0.25)',
        },
        // Amber — secondary accent (warnings, equipment)
        amber: {
          500: '#F59E0B',
          400: '#FBB833',
          300: '#FCD06A',
          dim:  'rgba(245,158,11,0.12)',
          edge: 'rgba(245,158,11,0.25)',
        },
        // Cyan — secondary accent (data, intel, maps)
        cyan: {
          500: '#06B6D4',
          400: '#22D3EE',
          300: '#67E8F9',
          dim:  'rgba(6,182,212,0.10)',
          edge: 'rgba(6,182,212,0.22)',
        },
        // Status
        ok:       '#22C55E',
        warn:     '#F59E0B',
        alert:    '#EF4444',
        info:     '#3B82F6',

        // ── Legacy aliases (do not delete — mapped from old design system) ──
        // graphite-* → maps to void (bg) and ink (text) tokens
        // Text: graphite-100 lightest → graphite-500 most muted
        // Bg/Border: graphite-600..950 → dark surface layers
        graphite: {
          100:  '#E8EDF2',  // ink.primary
          200:  '#C4CFD9',  // between ink.primary and ink.secondary
          300:  '#8A9BB0',  // ink.secondary
          400:  '#5A7080',  // between ink.secondary and ink.muted
          500:  '#3D5068',  // ink.muted
          600:  '#1E252D',  // void.600
          700:  '#171C21',  // void.700
          800:  '#111418',  // void.800
          900:  '#0C0F12',  // void.900
          950:  '#080A0C',  // void.950
        },
        // industrial-* → maps to amber (warnings, equipment accent)
        industrial: {
          300:  '#FCD06A',  // amber.300
          400:  '#FBB833',  // amber.400
          500:  '#F59E0B',  // amber.500
        },
        // steel-* → maps to cyan (data, intel)
        steel: {
          400:  '#22D3EE',  // cyan.400
        },
        // success / danger / warning — semantic status aliases
        success:  '#22C55E',
        danger:   '#EF4444',
        warning:  '#F59E0B',
      },
      fontFamily: {
        ui:   ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
      },
    },
  },
  plugins: [],
};
