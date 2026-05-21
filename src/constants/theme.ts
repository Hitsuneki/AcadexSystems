/**
 * ACADEX Design System — unified theme constants
 */
import { Platform } from 'react-native';

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
  // Legacy aliases (kept for compatibility)
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
  borderRadius: 8,
  borderWidth: 0.5,
  borderColor: 'rgba(255,255,255,0.07)',
  backgroundColor: '#111111',
  padding: 12,
} as const;

// ─── Input defaults ───────────────────────────────────────────────────────────
export const InputDefaults = {
  backgroundColor: '#1E1E1E',
  borderRadius: 7,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.07)',
  focusedBorderColor: 'rgba(37,99,235,0.40)',
  color: '#E8E8E8',
  placeholderTextColor: '#555555',
  padding: 12,
  fontSize: 13,
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// ─── Legacy compatibility (for any remaining old imports) ─────────────────────
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
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: { sans: 'var(--font-display)', serif: 'var(--font-serif)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
});
