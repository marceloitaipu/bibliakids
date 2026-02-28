/**
 * Testes do hook useBgm.
 * Foca na exportação e interface do módulo.
 */

jest.mock('../../../assets/bgm/criacao.wav', () => 'c.wav', { virtual: true });
jest.mock('../../../assets/bgm/noe.wav', () => 'n.wav', { virtual: true });
jest.mock('../../../assets/bgm/davi.wav', () => 'd.wav', { virtual: true });
jest.mock('../../../assets/bgm/daniel.wav', () => 'dn.wav', { virtual: true });
jest.mock('../../../assets/bgm/jonas.wav', () => 'j.wav', { virtual: true });
jest.mock('../../../assets/bgm/jesus_nascimento.wav', () => 'jn.wav', { virtual: true });
jest.mock('../../../assets/bgm/parabolas.wav', () => 'p.wav', { virtual: true });

describe('useBgm', () => {
  it('exporta uma função', () => {
    const { useBgm } = require('../../bgm/useBgm');
    expect(typeof useBgm).toBe('function');
  });
});
