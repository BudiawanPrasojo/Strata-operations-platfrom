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
