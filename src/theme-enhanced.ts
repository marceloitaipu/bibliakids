export const theme = {
  colors: {
    bg: '#FFF7E6',
    card: '#FFFFFF',
    text: '#2B2B2B',
    muted: '#6B7280',
    primary: '#FF7A00',
    primary2: '#FFB703',
    accent: '#2EC4B6',
    ok: '#2FBF71',
    warn: '#F59E0B',
    bad: '#EF4444',
    stroke: '#F1E2C8',
    shadow: 'rgba(0,0,0,0.08)',
    
    // NOVAS CORES PARA GRADIENTES E EFEITOS
    primaryLight: '#FFA847',
    primaryDark: '#E66A00',
    accentLight: '#5FD4C8',
    accentDark: '#1FA799',
    cardShadow: 'rgba(255, 122, 0, 0.15)',
    overlay: 'rgba(0, 0, 0, 0.4)',
    successLight: '#5FD99A',
    errorLight: '#FF7B7B',
  },
  
  gradients: {
    primary: ['#FF7A00', '#FFB703'],
    accent: ['#2EC4B6', '#1FA799'],
    success: ['#2FBF71', '#5FD99A'],
    sunset: ['#FFB703', '#FF7A00', '#E66A00'],
    sky: ['#5FD4C8', '#2EC4B6', '#1FA799'],
  },
  
  radius: {
    xl: 24,
    lg: 18,
    md: 14,
    sm: 10,
    round: 999, // Para elementos circulares
  },
  
  spacing: (n: number) => n * 8,
  
  typography: {
    title: { fontSize: 24, fontWeight: '800' as const, lineHeight: 32 },
    subtitle: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
    body: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
    small: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
    tiny: { fontSize: 11, fontWeight: '600' as const, lineHeight: 14 },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    colored: {
      shadowColor: '#FF7A00',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  
  animations: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};
