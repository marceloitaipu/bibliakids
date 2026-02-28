/**
 * Testes do theme.ts — constantes de design.
 * Cobre: existência de todas as cores, tipografia, gradientes, spacing, radius.
 */
import { theme } from '../../theme';

describe('theme', () => {
  describe('colors', () => {
    const expectedColors = [
      'bg', 'card', 'text', 'muted', 'primary', 'primary2', 'accent',
      'ok', 'warn', 'bad', 'stroke', 'shadow', 'primaryLight', 'primaryDark',
      'accentLight', 'accentDark', 'cardShadow', 'successLight', 'errorLight',
    ];

    it.each(expectedColors)('tem cor "%s" definida', (color) => {
      expect((theme.colors as any)[color]).toBeDefined();
      expect(typeof (theme.colors as any)[color]).toBe('string');
    });

    it('cores primárias são hexadecimais válidos', () => {
      expect(theme.colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.colors.ok).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.colors.bad).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('gradients', () => {
    it('tem gradiente primary com 2 cores', () => {
      expect(theme.gradients.primary).toHaveLength(2);
    });

    it('tem gradiente accent com 2 cores', () => {
      expect(theme.gradients.accent).toHaveLength(2);
    });

    it('tem gradiente success com 2 cores', () => {
      expect(theme.gradients.success).toHaveLength(2);
    });

    it('tem gradiente card com 2 cores', () => {
      expect(theme.gradients.card).toHaveLength(2);
    });
  });

  describe('radius', () => {
    it('xl > lg > md > sm', () => {
      expect(theme.radius.xl).toBeGreaterThan(theme.radius.lg);
      expect(theme.radius.lg).toBeGreaterThan(theme.radius.md);
      expect(theme.radius.md).toBeGreaterThan(theme.radius.sm);
    });

    it('round é alto (círculo)', () => {
      expect(theme.radius.round).toBeGreaterThanOrEqual(100);
    });
  });

  describe('spacing', () => {
    it('spacing(0) = 0', () => {
      expect(theme.spacing(0)).toBe(0);
    });

    it('spacing(1) = 8', () => {
      expect(theme.spacing(1)).toBe(8);
    });

    it('spacing(2) = 16', () => {
      expect(theme.spacing(2)).toBe(16);
    });

    it('spacing(3) = 24', () => {
      expect(theme.spacing(3)).toBe(24);
    });

    it('spacing é linear (multiplier × 8)', () => {
      for (let i = 0; i <= 5; i++) {
        expect(theme.spacing(i)).toBe(i * 8);
      }
    });
  });

  describe('typography', () => {
    it('title tem fontSize, fontWeight, lineHeight', () => {
      expect(theme.typography.title.fontSize).toBeGreaterThan(0);
      expect(theme.typography.title.fontWeight).toBeDefined();
      expect(theme.typography.title.lineHeight).toBeGreaterThan(0);
    });

    it('subtitle < title em fontSize', () => {
      expect(theme.typography.subtitle.fontSize).toBeLessThan(theme.typography.title.fontSize);
    });

    it('body < subtitle em fontSize', () => {
      expect(theme.typography.body.fontSize).toBeLessThanOrEqual(theme.typography.subtitle.fontSize);
    });

    it('small < body em fontSize', () => {
      expect(theme.typography.small.fontSize).toBeLessThan(theme.typography.body.fontSize);
    });
  });

  describe('shadows', () => {
    it('tem small, medium, large', () => {
      expect(theme.shadows.small).toBeDefined();
      expect(theme.shadows.medium).toBeDefined();
      expect(theme.shadows.large).toBeDefined();
    });

    it('elevation cresce: small < medium < large', () => {
      expect(theme.shadows.small.elevation).toBeLessThan(theme.shadows.medium.elevation);
      expect(theme.shadows.medium.elevation).toBeLessThan(theme.shadows.large.elevation);
    });
  });
});
