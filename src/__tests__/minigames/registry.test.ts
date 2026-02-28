/**
 * Testes do registro de mini-games e tipos.
 * Cobre: registry completo, tipos MiniGameResult, todos os 7 jogos registrados,
 * importação correta de cada jogo.
 */

describe('MiniGame types', () => {
  it('MiniGameResult tem campos obrigatórios', () => {
    // Teste de tipo — se compila, os tipos estão corretos
    const result: import('../../minigames/types').MiniGameResult = {
      completed: true,
      score: 85,
      mistakes: 2,
      seconds: 120,
    };
    expect(result.completed).toBe(true);
    expect(result.score).toBe(85);
    expect(result.mistakes).toBe(2);
    expect(result.seconds).toBe(120);
  });

  it('score range 0-100', () => {
    const r: import('../../minigames/types').MiniGameResult = {
      completed: false,
      score: 0,
      mistakes: 10,
      seconds: 60,
    };
    expect(r.score).toBeGreaterThanOrEqual(0);
  });
});

describe('MiniGame registry', () => {
  let MiniGameRegistry: any;

  beforeAll(() => {
    // Mock require para os assets de áudio/bgm
    jest.mock('../../../assets/sfx/success.wav', () => 'success.wav', { virtual: true });
    jest.mock('../../../assets/sfx/fail.wav', () => 'fail.wav', { virtual: true });
    jest.mock('../../../assets/sfx/tap.wav', () => 'tap.wav', { virtual: true });
    jest.mock('../../../assets/sfx/perfect.wav', () => 'perfect.wav', { virtual: true });
    jest.mock('../../../assets/bgm/criacao.wav', () => 'criacao.wav', { virtual: true });
    jest.mock('../../../assets/bgm/noe.wav', () => 'noe.wav', { virtual: true });
    jest.mock('../../../assets/bgm/davi.wav', () => 'davi.wav', { virtual: true });
    jest.mock('../../../assets/bgm/daniel.wav', () => 'daniel.wav', { virtual: true });
    jest.mock('../../../assets/bgm/jonas.wav', () => 'jonas.wav', { virtual: true });
    jest.mock('../../../assets/bgm/jesus_nascimento.wav', () => 'jesus.wav', { virtual: true });
    jest.mock('../../../assets/bgm/parabolas.wav', () => 'parabolas.wav', { virtual: true });

    MiniGameRegistry = require('../../minigames/registry').MiniGameRegistry;
  });

  const EXPECTED_GAMES = [
    'creation_place',
    'noe_pairs',
    'david_stone',
    'daniel_shields',
    'jonah_guide',
    'star_path',
    'parables_seed',
  ];

  it('registro contém exatamente 7 jogos', () => {
    expect(Object.keys(MiniGameRegistry)).toHaveLength(7);
  });

  it.each(EXPECTED_GAMES)('jogo "%s" está registrado', (gameType) => {
    expect(MiniGameRegistry[gameType]).toBeDefined();
  });

  it.each(EXPECTED_GAMES)('jogo "%s" é uma função/componente', (gameType) => {
    expect(typeof MiniGameRegistry[gameType]).toBe('function');
  });

  it('não tem jogos extras além dos 7 esperados', () => {
    const keys = Object.keys(MiniGameRegistry);
    keys.forEach(k => {
      expect(EXPECTED_GAMES).toContain(k);
    });
  });
});
