/**
 * Testes detalhados do módulo de analytics.
 * Cobre: tracking, limites de memória, estatísticas,
 * mini-game tracking, sticker tracking, settings tracking.
 */
import { analytics } from '../../utils/analytics';

beforeEach(() => {
  analytics.clear();
  analytics.setEnabled(true);
});

/* ─────────── Tracking básico ─────────── */
describe('track — eventos genéricos', () => {
  it('registra evento com tipo e dados', () => {
    analytics.track('app_opened', { screen: 'Map' });
    const ev = analytics.getRecentEvents(10);
    expect(ev).toHaveLength(1);
    expect(ev[0].type).toBe('app_opened');
    expect(ev[0].data?.screen).toBe('Map');
    expect(ev[0].timestamp).toBeGreaterThan(0);
  });

  it('registra múltiplos eventos em ordem', () => {
    analytics.track('app_opened');
    analytics.track('level_started');
    analytics.track('level_completed');
    const ev = analytics.getRecentEvents(10);
    expect(ev).toHaveLength(3);
    expect(ev[0].type).toBe('app_opened');
    expect(ev[2].type).toBe('level_completed');
  });

  it('não registra quando desabilitado', () => {
    analytics.setEnabled(false);
    analytics.track('app_opened');
    expect(analytics.getRecentEvents(10)).toHaveLength(0);
  });

  it('volta a registrar quando reabilitado', () => {
    analytics.setEnabled(false);
    analytics.track('app_opened');
    analytics.setEnabled(true);
    analytics.track('level_started');
    expect(analytics.getRecentEvents(10)).toHaveLength(1);
  });

  it('limita memória a 100 eventos', () => {
    for (let i = 0; i < 120; i++) {
      analytics.track('app_opened', { i });
    }
    const events = analytics.getRecentEvents(200);
    expect(events.length).toBeLessThanOrEqual(100);
  });
});

/* ─────────── Level tracking ─────────── */
describe('trackLevelStart / trackLevelComplete', () => {
  it('registra início de fase', () => {
    analytics.trackLevelStart('criacao');
    const ev = analytics.getRecentEvents(1);
    expect(ev[0].type).toBe('level_started');
    expect(ev[0].data?.levelId).toBe('criacao');
  });

  it('registra conclusão com estrelas e tempo', () => {
    analytics.trackLevelComplete('noe', 3, 90);
    const ev = analytics.getRecentEvents(1);
    expect(ev[0].type).toBe('level_completed');
    expect(ev[0].data?.stars).toBe(3);
    expect(ev[0].data?.timeSpent).toBe(90);
  });

  it('registra conclusão sem tempo (undefined)', () => {
    analytics.trackLevelComplete('davi', 2);
    const ev = analytics.getRecentEvents(1);
    expect(ev[0].data?.timeSpent).toBeUndefined();
  });
});

/* ─────────── MiniGame tracking ─────────── */
describe('trackMiniGameStart / trackMiniGameComplete', () => {
  it('registra início de minigame', () => {
    analytics.trackMiniGameStart('daniel', 'daniel_shields');
    const ev = analytics.getRecentEvents(1);
    expect(ev[0].type).toBe('minigame_started');
    expect(ev[0].data?.levelId).toBe('daniel');
    expect(ev[0].data?.gameType).toBe('daniel_shields');
  });

  it('registra conclusão de minigame com score e erros', () => {
    analytics.trackMiniGameComplete('jonas', 'jonah_guide', 85, 2);
    const ev = analytics.getRecentEvents(1);
    expect(ev[0].type).toBe('minigame_completed');
    expect(ev[0].data?.score).toBe(85);
    expect(ev[0].data?.mistakes).toBe(2);
  });
});

/* ─────────── Quiz tracking ─────────── */
describe('trackQuizComplete', () => {
  it('registra conclusão do quiz com acertos/total/estrelas', () => {
    analytics.trackQuizComplete('noe', 8, 10, 2);
    const ev = analytics.getRecentEvents(1);
    expect(ev[0].type).toBe('quiz_completed');
    expect(ev[0].data?.correct).toBe(8);
    expect(ev[0].data?.total).toBe(10);
    expect(ev[0].data?.stars).toBe(2);
  });
});

/* ─────────── Sticker tracking ─────────── */
describe('trackStickerEarned', () => {
  it('registra conquista de adesivo', () => {
    analytics.trackStickerEarned('sticker_criacao', 'criacao');
    const ev = analytics.getRecentEvents(1);
    expect(ev[0].type).toBe('sticker_earned');
    expect(ev[0].data?.stickerId).toBe('sticker_criacao');
    expect(ev[0].data?.levelId).toBe('criacao');
  });
});

/* ─────────── Settings tracking ─────────── */
describe('trackSettingChanged', () => {
  it('registra mudança de configuração', () => {
    analytics.trackSettingChanged('narration', false);
    const ev = analytics.getRecentEvents(1);
    expect(ev[0].type).toBe('settings_changed');
    expect(ev[0].data?.setting).toBe('narration');
    expect(ev[0].data?.value).toBe(false);
  });
});

/* ─────────── Erro logging ─────────── */
describe('logError', () => {
  it('registra erro com mensagem e contexto', () => {
    analytics.logError(new Error('Falha no render'), 'QuizScreen');
    const errs = analytics.getRecentErrors(10);
    expect(errs).toHaveLength(1);
    expect(errs[0].message).toBe('Falha no render');
    expect(errs[0].context).toBe('QuizScreen');
    expect(errs[0].timestamp).toBeGreaterThan(0);
  });

  it('registra stack do erro', () => {
    const e = new Error('Stack test');
    analytics.logError(e);
    const errs = analytics.getRecentErrors(1);
    expect(errs[0].stack).toBeDefined();
    expect(errs[0].stack).toContain('Stack test');
  });

  it('limita a 50 erros', () => {
    for (let i = 0; i < 60; i++) {
      analytics.logError(new Error(`Err ${i}`));
    }
    expect(analytics.getRecentErrors(100).length).toBeLessThanOrEqual(50);
  });

  it('também registra como evento de tipo error', () => {
    analytics.logError(new Error('teste'));
    const ev = analytics.getRecentEvents(10);
    const errorEvent = ev.find(e => e.type === 'error');
    expect(errorEvent).toBeDefined();
    expect(errorEvent?.data?.message).toBe('teste');
  });
});

/* ─────────── getStats ─────────── */
describe('getStats', () => {
  it('calcula estatísticas corretamente', () => {
    analytics.trackLevelComplete('criacao', 3);
    analytics.trackLevelComplete('noe', 2);
    analytics.trackLevelComplete('davi', 1);
    analytics.logError(new Error('err1'));
    analytics.logError(new Error('err2'));

    const stats = analytics.getStats();
    expect(stats.levelsCompleted).toBe(3);
    expect(stats.totalStars).toBe(6); // 3+2+1
    expect(stats.totalErrors).toBe(2);
    expect(stats.totalEvents).toBeGreaterThanOrEqual(3);
  });

  it('retorna zeros quando vazio', () => {
    const stats = analytics.getStats();
    expect(stats.levelsCompleted).toBe(0);
    expect(stats.totalStars).toBe(0);
    expect(stats.totalErrors).toBe(0);
    expect(stats.totalEvents).toBe(0);
  });
});

/* ─────────── clear ─────────── */
describe('clear', () => {
  it('limpa todos os eventos e erros', () => {
    analytics.track('app_opened');
    analytics.track('level_started');
    analytics.logError(new Error('x'));
    analytics.clear();
    expect(analytics.getRecentEvents(10)).toHaveLength(0);
    expect(analytics.getRecentErrors(10)).toHaveLength(0);
  });
});

/* ─────────── getRecentEvents limita retorno ─────────── */
describe('getRecentEvents / getRecentErrors — limitados', () => {
  it('retorna apenas N eventos mais recentes', () => {
    for (let i = 0; i < 20; i++) analytics.track('app_opened', { i });
    expect(analytics.getRecentEvents(5)).toHaveLength(5);
  });

  it('retorna apenas N erros mais recentes', () => {
    for (let i = 0; i < 20; i++) analytics.logError(new Error(`e${i}`));
    expect(analytics.getRecentErrors(3)).toHaveLength(3);
  });
});
