import { Platform } from 'react-native';

export const palette = {
  background: '#FFF9F0',
  surface: '#FFFFFF',
  text: '#24202B',
  mutedText: '#6E6875',
  border: '#E9DFE7',
  pink: '#FF4FA3',
  blue: '#3E7BFA',
  yellow: '#FFD84D',
  orange: '#FF8748',
  lime: '#B9E64A',
  darkBackground: '#19151F',
  darkSurface: '#282230',
  darkText: '#FFF8F1',
} as const;

export const themes = {
  light: {
    background: palette.background,
    surface: palette.surface,
    surfaceMuted: '#F7EDF3',
    text: palette.text,
    mutedText: palette.mutedText,
    border: palette.border,
    primary: palette.pink,
    primaryText: '#241620',
    secondary: palette.yellow,
    danger: '#C82E53',
    what: palette.pink,
    where: palette.blue,
    when: '#8DB62F',
    caveat: palette.orange,
    shadow: '#3D2334',
  },
  dark: {
    background: palette.darkBackground,
    surface: palette.darkSurface,
    surfaceMuted: '#352D3F',
    text: palette.darkText,
    mutedText: '#CBC0CE',
    border: '#494052',
    primary: '#FF70B4',
    primaryText: '#27151F',
    secondary: '#F5CE48',
    danger: '#FF7693',
    what: '#FF70B4',
    where: '#70A0FF',
    when: '#B9E64A',
    caveat: '#FF9C68',
    shadow: '#000000',
  },
} as const;

export type AppTheme = typeof themes.light | typeof themes.dark;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 48 } as const;
export const radii = { sm: 10, md: 16, lg: 24, pill: 999 } as const;
export const layout = { maxWidth: 760, tabBarHeight: Platform.OS === 'ios' ? 84 : 70 } as const;
export const typography = {
  title: { fontSize: 34, lineHeight: 40, fontWeight: '900' as const },
  heading: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const },
  subheading: { fontSize: 18, lineHeight: 24, fontWeight: '800' as const },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' as const },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '700' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
} as const;
