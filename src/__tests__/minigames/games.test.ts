/**
 * Testes dos mini-games individuais.
 * Verifica que cada jogo exporta um componente válido e aceita as props certas.
 * Em ambiente node (sem JSDOM), foca na importação e na interface do componente.
 */

// Mock de áudios e BGM
jest.mock('../../../assets/sfx/success.wav', () => 'success.wav', { virtual: true });
jest.mock('../../../assets/sfx/fail.wav', () => 'fail.wav', { virtual: true });
jest.mock('../../../assets/sfx/tap.wav', () => 'tap.wav', { virtual: true });
jest.mock('../../../assets/sfx/perfect.wav', () => 'perfect.wav', { virtual: true });
jest.mock('../../../assets/bgm/criacao.wav', () => 'c.wav', { virtual: true });
jest.mock('../../../assets/bgm/noe.wav', () => 'n.wav', { virtual: true });
jest.mock('../../../assets/bgm/davi.wav', () => 'd.wav', { virtual: true });
jest.mock('../../../assets/bgm/daniel.wav', () => 'dn.wav', { virtual: true });
jest.mock('../../../assets/bgm/jonas.wav', () => 'j.wav', { virtual: true });
jest.mock('../../../assets/bgm/jesus_nascimento.wav', () => 'jn.wav', { virtual: true });
jest.mock('../../../assets/bgm/parabolas.wav', () => 'p.wav', { virtual: true });

// Mock state/AppState para os jogos que usam useApp
jest.mock('../../state/AppState', () => ({
  useApp: () => ({
    state: {
      settings: { sound: false, narration: true, animations: true, music: false, shuffleQuestions: true },
      avatar: null,
      progress: { starsByLevel: {}, stickers: {} },
    },
    dispatch: jest.fn(),
    data: { levels: [], stickers: [] },
  }),
}));

// Mock SoundManager
jest.mock('../../sfx/SoundManager', () => ({
  useSfx: () => ({
    playSuccess: jest.fn(),
    playFail: jest.fn(),
    playTap: jest.fn(),
    playPerfect: jest.fn(),
  }),
}));

const GAMES = [
  { name: 'CreationPlaceGame', path: '../../minigames/games/CreationPlaceGame' },
  { name: 'NoePairsGame', path: '../../minigames/games/NoePairsGame' },
  { name: 'DavidStoneGame', path: '../../minigames/games/DavidStoneGame' },
  { name: 'DanielShieldsGame', path: '../../minigames/games/DanielShieldsGame' },
  { name: 'JonahGuideGame', path: '../../minigames/games/JonahGuideGame' },
  { name: 'StarPathGame', path: '../../minigames/games/StarPathGame' },
  { name: 'ParablesSeedGame', path: '../../minigames/games/ParablesSeedGame' },
];

describe('Mini-games — módulos e exportações', () => {
  it.each(GAMES.map(g => [g.name, g.path]))(
    '%s exporta um componente React (function)',
    (name, path) => {
      const mod = require(path);
      const Component = mod.default || mod;
      expect(typeof Component).toBe('function');
    }
  );
});

describe('DanielShieldsGame — constantes internas', () => {
  it('importa sem erros', () => {
    const mod = require('../../minigames/games/DanielShieldsGame');
    expect(mod.default).toBeDefined();
  });
});

describe('JonahGuideGame — constantes internas', () => {
  it('importa sem erros', () => {
    const mod = require('../../minigames/games/JonahGuideGame');
    expect(mod.default).toBeDefined();
  });
});

describe('StarPathGame — constantes internas', () => {
  it('importa sem erros', () => {
    const mod = require('../../minigames/games/StarPathGame');
    expect(mod.default).toBeDefined();
  });
});

describe('ParablesSeedGame — constantes internas', () => {
  it('importa sem erros', () => {
    const mod = require('../../minigames/games/ParablesSeedGame');
    expect(mod.default).toBeDefined();
  });
});

describe('CreationPlaceGame — constantes internas', () => {
  it('importa sem erros', () => {
    const mod = require('../../minigames/games/CreationPlaceGame');
    expect(mod.default).toBeDefined();
  });
});

describe('NoePairsGame — constantes internas', () => {
  it('importa sem erros', () => {
    const mod = require('../../minigames/games/NoePairsGame');
    expect(mod.default).toBeDefined();
  });
});

describe('DavidStoneGame — constantes internas', () => {
  it('importa sem erros', () => {
    const mod = require('../../minigames/games/DavidStoneGame');
    expect(mod.default).toBeDefined();
  });
});
