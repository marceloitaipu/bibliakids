/**
 * Testes do módulo de logger.
 * Cobre: debug, info, warn, error, module().
 */
import { logger } from '../../utils/logger';

describe('Logger', () => {
  let originalLog: typeof console.log;
  let originalInfo: typeof console.info;
  let originalWarn: typeof console.warn;
  let originalError: typeof console.error;

  beforeEach(() => {
    originalLog = console.log;
    originalInfo = console.info;
    originalWarn = console.warn;
    originalError = console.error;
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;
  });

  describe('debug', () => {
    it('loga no console em modo DEV', () => {
      logger.debug('test message', 123);
      expect(console.log).toHaveBeenCalledWith('[BibliaKids]', 'test message', 123);
    });
  });

  describe('info', () => {
    it('loga no console.info em modo DEV', () => {
      logger.info('info msg');
      expect(console.info).toHaveBeenCalledWith('[BibliaKids]', 'info msg');
    });
  });

  describe('warn', () => {
    it('loga no console.warn em modo DEV', () => {
      logger.warn('warning msg');
      expect(console.warn).toHaveBeenCalledWith('[BibliaKids]', 'warning msg');
    });
  });

  describe('error', () => {
    it('sempre loga no console.error', () => {
      logger.error('error msg');
      expect(console.error).toHaveBeenCalledWith('[BibliaKids]', 'error msg');
    });
  });

  describe('module', () => {
    it('cria sub-logger com prefixo do módulo', () => {
      const log = logger.module('Quiz');
      log.debug('dados do quiz');
      expect(console.log).toHaveBeenCalledWith('[BibliaKids][Quiz]', 'dados do quiz');
    });

    it('module.info usa console.info', () => {
      const log = logger.module('Map');
      log.info('mapa carregado');
      expect(console.info).toHaveBeenCalledWith('[BibliaKids][Map]', 'mapa carregado');
    });

    it('module.warn usa console.warn', () => {
      const log = logger.module('Sound');
      log.warn('falha no áudio');
      expect(console.warn).toHaveBeenCalledWith('[BibliaKids][Sound]', 'falha no áudio');
    });

    it('module.error usa console.error', () => {
      const log = logger.module('Render');
      log.error('crash no componente');
      expect(console.error).toHaveBeenCalledWith('[BibliaKids][Render]', 'crash no componente');
    });

    it('diferentes módulos não se interferem', () => {
      const logA = logger.module('A');
      const logB = logger.module('B');
      logA.debug('msg a');
      logB.debug('msg b');
      expect(console.log).toHaveBeenCalledWith('[BibliaKids][A]', 'msg a');
      expect(console.log).toHaveBeenCalledWith('[BibliaKids][B]', 'msg b');
    });
  });
});
