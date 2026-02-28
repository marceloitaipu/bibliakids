/**
 * Testes do SoundManager (SfxProvider, useSfx).
 * Foca nas exportações e interface – hooks não podem ser chamados
 * diretamente sem contexto React (useContext), então verificamos
 * que as funções existem e têm a assinatura correta.
 */

jest.mock('../../../assets/sfx/success.wav', () => 'success.wav', { virtual: true });
jest.mock('../../../assets/sfx/fail.wav', () => 'fail.wav', { virtual: true });
jest.mock('../../../assets/sfx/tap.wav', () => 'tap.wav', { virtual: true });
jest.mock('../../../assets/sfx/perfect.wav', () => 'perfect.wav', { virtual: true });

describe('SoundManager', () => {
  it('exporta SfxProvider e useSfx', () => {
    const mod = require('../../sfx/SoundManager');
    expect(mod.SfxProvider).toBeDefined();
    expect(mod.useSfx).toBeDefined();
    expect(typeof mod.SfxProvider).toBe('function');
    expect(typeof mod.useSfx).toBe('function');
  });

  it('SfxProvider é um componente React (aceita children)', () => {
    const mod = require('../../sfx/SoundManager');
    // Componentes funcionais possuem length (número de params)
    expect(mod.SfxProvider.length).toBeGreaterThanOrEqual(1);
  });

  it('useSfx recebe um parâmetro (enabled)', () => {
    const mod = require('../../sfx/SoundManager');
    // Hook recebe 1 parâmetro: enabled
    expect(mod.useSfx.length).toBe(1);
  });
});
