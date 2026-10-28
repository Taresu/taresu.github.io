// Tailwind theme shared by every page; loaded right after the vendored Tailwind runtime.
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink:      '#0A0E14',
        panel:    '#0E1420',
        card:     '#111827',
        line:     '#1E2A3A',
        purple:   { DEFAULT: '#7C3AED', light: '#C4B5FD', dim: '#4C1D95' },
        terminal: '#00FF87',
        amber:    '#FBBF24',
        danger:   '#FF4D6D',
        fog:      '#8B98AC',
        paper:    '#EDF1F7',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      }
    }
  }
};
