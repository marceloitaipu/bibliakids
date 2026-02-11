/**
 * Sistema de Analytics e Logging para BibliaKids
 * 
 * Registra eventos de progresso, erros e uso do app.
 * Pode ser facilmente integrado com Firebase, Sentry, etc.
 */

type EventType = 
  | 'level_started'
  | 'level_completed'
  | 'minigame_started'
  | 'minigame_completed'
  | 'quiz_started'
  | 'quiz_completed'
  | 'sticker_earned'
  | 'settings_changed'
  | 'error'
  | 'app_opened'
  | 'avatar_created';

interface AnalyticsEvent {
  type: EventType;
  timestamp: number;
  data?: Record<string, unknown>;
}

interface ErrorLog {
  message: string;
  stack?: string;
  context?: string;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private errors: ErrorLog[] = [];
  private enabled: boolean = true;
  private maxEvents: number = 100; // Limitar memória

  /**
   * Ativa ou desativa o tracking (para LGPD/privacidade)
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (__DEV__) {
      console.log(`[Analytics] Tracking ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Registra um evento genérico
   */
  track(type: EventType, data?: Record<string, unknown>) {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    this.events.push(event);

    // Limitar tamanho do array
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    if (__DEV__) {
      console.log(`[Analytics] ${type}`, data || '');
    }

    // Aqui você pode enviar para serviço externo
    // Ex: firebase.analytics().logEvent(type, data);
  }

  /**
   * Registra início de uma fase
   */
  trackLevelStart(levelId: string) {
    this.track('level_started', { levelId });
  }

  /**
   * Registra conclusão de uma fase
   */
  trackLevelComplete(levelId: string, stars: number, timeSpent?: number) {
    this.track('level_completed', { levelId, stars, timeSpent });
  }

  /**
   * Registra início de minigame
   */
  trackMiniGameStart(levelId: string, gameType: string) {
    this.track('minigame_started', { levelId, gameType });
  }

  /**
   * Registra conclusão de minigame
   */
  trackMiniGameComplete(levelId: string, gameType: string, score: number, mistakes: number) {
    this.track('minigame_completed', { levelId, gameType, score, mistakes });
  }

  /**
   * Registra conclusão do quiz
   */
  trackQuizComplete(levelId: string, correct: number, total: number, stars: number) {
    this.track('quiz_completed', { levelId, correct, total, stars });
  }

  /**
   * Registra conquista de adesivo
   */
  trackStickerEarned(stickerId: string, levelId: string) {
    this.track('sticker_earned', { stickerId, levelId });
  }

  /**
   * Registra mudança de configuração
   */
  trackSettingChanged(setting: string, value: boolean) {
    this.track('settings_changed', { setting, value });
  }

  /**
   * Registra um erro
   */
  logError(error: Error, context?: string) {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
    };

    this.errors.push(errorLog);

    // Limitar tamanho
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }

    if (__DEV__) {
      console.error(`[Analytics Error] ${context || 'Unknown'}:`, error.message);
    }

    this.track('error', { message: error.message, context });

    // Aqui você pode enviar para Sentry, Crashlytics, etc.
    // Ex: Sentry.captureException(error, { extra: { context } });
  }

  /**
   * Retorna eventos recentes (para debugging)
   */
  getRecentEvents(count: number = 10): AnalyticsEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Retorna erros recentes (para debugging)
   */
  getRecentErrors(count: number = 10): ErrorLog[] {
    return this.errors.slice(-count);
  }

  /**
   * Limpa todos os eventos (ex: ao resetar progresso)
   */
  clear() {
    this.events = [];
    this.errors = [];
  }

  /**
   * Retorna estatísticas resumidas
   */
  getStats() {
    const levelCompletes = this.events.filter(e => e.type === 'level_completed');
    const totalStars = levelCompletes.reduce(
      (sum, e) => sum + ((e.data?.stars as number) || 0),
      0
    );

    return {
      totalEvents: this.events.length,
      totalErrors: this.errors.length,
      levelsCompleted: levelCompletes.length,
      totalStars,
    };
  }
}

// Singleton instance
export const analytics = new Analytics();
