import type { Priority, FileType } from '@/types';

// ─── Background ───────────────────────────────────────────────────────────────
export const BG = {
  bg0: '#0A0A0A',
  bg1: '#111111',
  bg2: '#161616',
  bg3: '#1E1E1E',
  bg4: '#242424',
} as const;

// ─── Borders ──────────────────────────────────────────────────────────────────
export const BORDER = {
  default: 'rgba(255,255,255,0.07)',
  active: 'rgba(255,255,255,0.18)',
} as const;

// ─── Text ─────────────────────────────────────────────────────────────────────
export const TEXT = {
  primary: '#E8E8E8',
  secondary: '#A0A0A0',
  muted: '#555555',
} as const;

// ─── Accent ───────────────────────────────────────────────────────────────────
export const ACCENT = {
  blue: '#2563EB',
  blueDim: 'rgba(37,99,235,0.15)',
  blueBorder: 'rgba(37,99,235,0.30)',
  blueFocused: 'rgba(37,99,235,0.40)',
} as const;

// ─── Semantic ─────────────────────────────────────────────────────────────────
export const SEMANTIC = {
  green: '#10B981',
  greenDim: 'rgba(16,185,129,0.13)',
  red: '#EF4444',
  redDim: 'rgba(239,68,68,0.13)',
  redBorder: 'rgba(239,68,68,0.3)',
  amber: '#F59E0B',
  amberDim: 'rgba(245,158,11,0.13)',
  purple: '#8B5CF6',
  purpleDim: 'rgba(139,92,246,0.13)',
} as const;

// ─── Priority ─────────────────────────────────────────────────────────────────
export const PRIORITY_COLORS: Record<Priority, { text: string; bg: string }> = {
  low: { text: SEMANTIC.green, bg: SEMANTIC.greenDim },
  medium: { text: SEMANTIC.amber, bg: SEMANTIC.amberDim },
  high: { text: SEMANTIC.red, bg: SEMANTIC.redDim },
  urgent: { text: SEMANTIC.purple, bg: SEMANTIC.purpleDim },
};

// ─── Column ───────────────────────────────────────────────────────────────────
export const COLUMN_COLORS = {
  backlog: TEXT.muted,
  inProgress: ACCENT.blue,
  review: SEMANTIC.amber,
  done: SEMANTIC.green,
} as const;

// ─── File Type ────────────────────────────────────────────────────────────────
export const FILE_TYPE_COLORS: Record<FileType, { text: string; bg: string }> = {
  pdf: { text: SEMANTIC.red, bg: 'rgba(239,68,68,0.12)' },
  docx: { text: ACCENT.blue, bg: 'rgba(37,99,235,0.12)' },
  pptx: { text: SEMANTIC.amber, bg: 'rgba(245,158,11,0.12)' },
  jpg: { text: SEMANTIC.green, bg: 'rgba(16,185,129,0.12)' },
  png: { text: SEMANTIC.green, bg: 'rgba(16,185,129,0.12)' },
  txt: { text: TEXT.secondary, bg: 'rgba(160,160,160,0.12)' },
};

// ─── Cover presets ────────────────────────────────────────────────────────────
export const COVER_COLORS = [
  '#2563EB', '#7C3AED', '#DB2777', '#DC2626',
  '#EA580C', '#D97706', '#16A34A', '#0891B2',
];
