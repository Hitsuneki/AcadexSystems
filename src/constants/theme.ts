/**
 * ACADEX Design System — unified theme constants
 */
import { Platform } from 'react-native';
import { ACCENT, BG, BORDER, TEXT } from './colors';

// Re-export all ACADEX token namespaces
export { BG, BORDER, TEXT, ACCENT, SEMANTIC, PRIORITY_COLORS, COLUMN_COLORS, FILE_TYPE_COLORS, COVER_COLORS } from './colors';
export { FontFamily, FontSize, LineHeight } from './typography';

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  // Legacy aliases
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// ─── Card defaults ────────────────────────────────────────────────────────────
export const CardDefaults = {
  borderRadius: 0,
  borderWidth: 1,
  borderColor: BORDER.dim,
  backgroundColor: BG.bg1,
  padding: 14,
} as const;

// ─── Input defaults ───────────────────────────────────────────────────────────
export const InputDefaults = {
  backgroundColor: BG.bg4,
  borderRadius: 0,
  borderWidth: 1,
  borderColor: BORDER.dim,
  focusedBorderColor: ACCENT.b,
  color: TEXT.t1,
  placeholderTextColor: TEXT.t4,
  padding: 12,
  fontSize: 13,
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// ─── Legacy compatibility ─────────────────────
export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#0A0A0A',
    backgroundElement: '#0F0F0F',
    backgroundSelected: '#141414',
    textSecondary: '#888888',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: { sans: 'var(--font-display)', serif: 'var(--font-serif)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
});
