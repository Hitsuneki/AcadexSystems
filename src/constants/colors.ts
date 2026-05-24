import type { Priority, FileType } from '@/types';

export const BG = {
  base: '#0A0A0A',
  bg1: '#0F0F0F',
  bg2: '#141414',
  bg3: '#1A1A1A',
  bg4: '#222222',
  // legacy aliases to avoid immediate crashes
  bg0: '#0A0A0A',
} as const;

export const BORDER = {
  dim: 'rgba(255,255,255,0.05)',
  mid: 'rgba(255,255,255,0.09)',
  hi: 'rgba(255,255,255,0.16)',
  // legacy aliases
  default: 'rgba(255,255,255,0.05)',
  hairline: 'rgba(255,255,255,0.05)',
  active: 'rgba(255,255,255,0.16)',
  strong: 'rgba(255,255,255,0.16)',
} as const;

export const TEXT = {
  t0: '#FFFFFF',
  t1: '#E0E0E0',
  t2: '#888888',
  t3: '#444444',
  t4: '#2A2A2A',
  // legacy aliases
  primary: '#FFFFFF',
  secondary: '#888888',
  muted: '#444444',
  faint: '#2A2A2A',
  inverse: '#000000',
} as const;

export const ACCENT = {
  primary: '#00FF85',
  dim: 'rgba(0,255,133,0.08)',
  b: 'rgba(0,255,133,0.25)',
  // legacy
  signal: '#00FF85',
  signalDim: 'rgba(0,255,133,0.08)',
  signalBorder: 'rgba(0,255,133,0.25)',
} as const;

export const SEMANTIC = {
  red: '#FF3B5C',
  redDim: 'rgba(255,59,92,0.08)',
  amber: '#F5A623',
  amberDim: 'rgba(245,166,35,0.08)',
  blue: '#3B82F6',
  blueDim: 'rgba(59,130,246,0.08)',
} as const;

export const PRIORITY_COLORS: Record<Priority, { text: string; bg: string }> = {
  low: { text: TEXT.t3, bg: 'transparent' },
  medium: { text: SEMANTIC.amber, bg: 'transparent' },
  high: { text: SEMANTIC.red, bg: 'transparent' },
  urgent: { text: ACCENT.primary, bg: 'transparent' },
};

export const COLUMN_COLORS = {
  backlog: '#333333',
  inProgress: SEMANTIC.blue,
  review: SEMANTIC.amber,
  done: ACCENT.primary,
} as const;

export const FILE_TYPE_COLORS: Record<FileType, { text: string; bg: string }> = {
  pdf: { text: SEMANTIC.red, bg: 'transparent' },
  docx: { text: SEMANTIC.blue, bg: 'transparent' },
  pptx: { text: SEMANTIC.amber, bg: 'transparent' },
  jpg: { text: ACCENT.primary, bg: 'transparent' },
  png: { text: ACCENT.primary, bg: 'transparent' },
  txt: { text: TEXT.t2, bg: 'transparent' },
};

export const COVER_COLORS = [
  ACCENT.primary,
  SEMANTIC.blue,
  SEMANTIC.amber,
  SEMANTIC.red,
  TEXT.t2,
  TEXT.t3,
  '#C7B99A',
  '#8A9388',
];
