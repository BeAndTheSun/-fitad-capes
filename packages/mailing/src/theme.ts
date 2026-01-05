export const colors = {
  // Background colors
  background: '#ffffff',
  cardBackground: '#f8fafc',

  // Text colors
  foreground: '#0f172a',
  muted: '#64748b',

  // Brand colors
  primary: '#0f172a',
  primaryForeground: '#ffffff',

  // Secondary colors
  secondary: '#f1f5f9',
  secondaryForeground: '#0f172a',

  // Accent colors
  accent: '#f1f5f9',
  accentForeground: '#0f172a',

  // Border colors
  border: '#e2e8f0',
  input: '#e2e8f0',

  // Status colors
  success: '#10b981',
  successForeground: '#ffffff',
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',

  // Legacy colors for backward compatibility
  white: '#ffffff',
  black: '#0f172a',
  blue: '#3b82f6',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  neutral200: '#e5e7eb',
  neutral500: '#6b7280',
  neutral600: '#4b5563',
  neutral800: '#1f2937',
  green300: '#86efac',
  blue600: '#2563eb',
  zinc800: '#27272a',
};

export const fontSize = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  md: '18px',
  lg: '20px',
  xl: '24px',
  xxl: '28px',
};

export const lineHeight = {
  tight: '115%',
  base: '150%',
  relaxed: '185%',
};

export const fontWeight = {
  normal: '400',
  bold: '700',
};

export const borderRadius = {
  sm: 8,
  base: 16,
  full: 9999,
};

export const fontFamily = {
  sans: 'neue-haas-unica, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  serif:
    'swear-display-cilati, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

export const spacing = {
  s0: 0,
  s1: 4,
  s3: 8,
  s4: 12,
  s5: 16,
  s6: 20,
  s7: 24,
  s8: 32,
  s9: 40,
  s10: 48,
  s11: 56,
};

export const screens = {
  xs: '480px',
  sm: '640px',
};

export const themeDefaults = {
  fontFamily: fontFamily.sans,
  fontWeight: fontWeight.normal,
  fontSize: fontSize.base,
  color: colors.foreground,
  padding: '0px',
};
