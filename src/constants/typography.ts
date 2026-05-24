export const FontFamily = {
  // Sora Bold for Hero/Display
  soraRegular: 'Sora_400Regular',
  soraSemiBold: 'Sora_600SemiBold',
  soraBold: 'Sora_700Bold',
  display: 'Sora_700Bold',

  // Inter for UI/Body
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',

  // JetBrains Mono for Data
  monoRegular: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',

  // Aliases
  value: 'JetBrainsMono_400Regular',
  label: 'Inter_500Medium',
  mono: 'JetBrainsMono_400Regular',
} as const;

export const FontSize = {
  label: 10,
  caption: 11,
  monoSm: 11,
  body: 13,
  subhead: 14,
  monoMd: 14,
  heading: 18,
  monoLg: 24,
  display: 28,
  hero: 48,

  // Legacy mappings to prevent instant crashes
  xs: 10,
  sm: 11,
  base: 13,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 28,
  '3xl': 36,
  value: 28,
  metric: 48,
} as const;

export const LineHeight = {
  xs: 16,
  sm: 16,
  base: 20,
  md: 22,
  lg: 24,
  xl: 26,
  '2xl': 34,
  '3xl': 40,
} as const;
