/**
 * Utilitário centralizado de logging para BibliaKids.
 * Só imprime no console em modo de desenvolvimento (__DEV__).
 * Pode ser estendido para enviar logs para serviços externos.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private prefix = '[BibliaKids]';

  debug(...args: unknown[]) {
    if (__DEV__) console.log(this.prefix, ...args);
  }

  info(...args: unknown[]) {
    if (__DEV__) console.info(this.prefix, ...args);
  }

  warn(...args: unknown[]) {
    if (__DEV__) console.warn(this.prefix, ...args);
  }

  error(...args: unknown[]) {
    // Erros sempre logados (podem ir para Sentry/Crashlytics)
    console.error(this.prefix, ...args);
  }

  /** Log com contexto de módulo, ex: logger.module('Quiz').debug('dados') */
  module(name: string) {
    const tag = `${this.prefix}[${name}]`;
    return {
      debug: (...args: unknown[]) => { if (__DEV__) console.log(tag, ...args); },
      info: (...args: unknown[]) => { if (__DEV__) console.info(tag, ...args); },
      warn: (...args: unknown[]) => { if (__DEV__) console.warn(tag, ...args); },
      error: (...args: unknown[]) => { console.error(tag, ...args); },
    };
  }
}

export const logger = new Logger();
