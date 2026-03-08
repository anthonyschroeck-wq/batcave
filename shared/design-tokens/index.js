/**
 * @batcave/design-tokens
 * 
 * Canonical design system for all Batcave projects.
 * Instrument Serif + Source Sans 3 + IBM Plex Mono
 * Navy / White / Black / Cream
 */

export const fonts = {
  display: "'Instrument Serif', Georgia, serif",
  body: "'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif",
  mono: "'IBM Plex Mono', 'SF Mono', Consolas, monospace",
};

export const palette = {
  navy: '#0a1628',
  white: '#ffffff',
  black: '#000000',
  cream: '#f5f0e8',
  navyLight: '#1a2a44',
  navyMuted: '#2a3a54',
};

export const stroke = {
  primary: '1.4px',
  textureOffset: '0.5px',
  textureOpacity: 0.275, // 25-30% midpoint
  lineCap: 'round',
  lineJoin: 'round',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const cssVariables = `
  :root {
    --font-display: ${fonts.display};
    --font-body: ${fonts.body};
    --font-mono: ${fonts.mono};
    --color-navy: ${palette.navy};
    --color-white: ${palette.white};
    --color-black: ${palette.black};
    --color-cream: ${palette.cream};
    --color-navy-light: ${palette.navyLight};
    --color-navy-muted: ${palette.navyMuted};
    --stroke-primary: ${stroke.primary};
    --stroke-texture: ${stroke.textureOffset};
  }
`;

export default { fonts, palette, stroke, spacing, cssVariables };
