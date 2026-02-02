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
  },
  radius: {
    xl: 24,
    lg: 18,
    md: 14,
    sm: 10,
  },
  spacing: (n: number) => n * 8,
  typography: {
    title: { fontSize: 22, fontWeight: '800' as const },
    subtitle: { fontSize: 18, fontWeight: '700' as const },
    body: { fontSize: 16, fontWeight: '600' as const },
    small: { fontSize: 13, fontWeight: '600' as const },
  },
};
