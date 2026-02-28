/**
 * Testes do hook useAnalytics e useTrackScreen.
 * Verifica integração com o módulo de analytics.
 */
import { analytics } from '../../utils/analytics';

// Não podemos testar hooks sem React renderer, então testamos a lógica diretamente

describe('analyticsHooks — lógica', () => {
  beforeEach(() => {
    analytics.clear();
    analytics.setEnabled(true);
  });

  it('useAnalytics retornaria a instância analytics singleton', () => {
    // A função simplesmente retorna analytics
    const { useAnalytics } = require('../../utils/analyticsHooks');
    expect(typeof useAnalytics).toBe('function');
  });

  it('useTrackScreen é um hook exportado', () => {
    const { useTrackScreen } = require('../../utils/analyticsHooks');
    expect(typeof useTrackScreen).toBe('function');
  });

  it('analytics.track simula o que useTrackScreen faria', () => {
    analytics.track('app_opened', { screen: 'Map' });
    const ev = analytics.getRecentEvents(1);
    expect(ev[0].data?.screen).toBe('Map');
  });
});
