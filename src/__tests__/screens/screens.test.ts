/**
 * Testes das telas (screens).
 * Verifica importação correta, exportação de componentes e integridade dos módulos.
 * Em ambiente node, não renderiza — foca na interface.
 */

// Mocks necessários
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

jest.mock('../../state/AppState', () => ({
  useApp: () => ({
    state: {
      settings: { sound: false, narration: true, animations: true, music: false, shuffleQuestions: true },
      avatar: { name: 'Test', skin: 'clara', outfit: 'azul' },
      progress: { starsByLevel: {}, stickers: {} },
    },
    dispatch: jest.fn(),
    data: {
      levels: [
        {
          id: 'criacao', title: 'Criação', short: 'Criação', stickerId: 'sticker_criacao',
          story: { line1: 'L1', line2: 'L2' },
          questions: [{ prompt: 'P?', options: ['A', 'B'], answerIndex: 0, explain: 'E', ref: 'Gn 1' }],
          minigame: { type: 'creation_place' },
        },
      ],
      stickers: [{ id: 'sticker_criacao', name: 'Criação', emoji: '🌍', desc: 'Desc' }],
    },
  }),
  isLevelUnlocked: () => true,
  shuffle: (arr: any[]) => arr,
}));

jest.mock('../../sfx/SoundManager', () => ({
  useSfx: () => ({
    playSuccess: jest.fn(),
    playFail: jest.fn(),
    playTap: jest.fn(),
    playPerfect: jest.fn(),
  }),
}));

jest.mock('../../bgm/useBgm', () => ({
  useBgm: jest.fn(),
}));

const SCREENS = [
  { name: 'AlbumScreen', path: '../../screens/AlbumScreen' },
  { name: 'AvatarScreen', path: '../../screens/AvatarScreen' },
  { name: 'MapScreen', path: '../../screens/MapScreen' },
  { name: 'MiniGameScreen', path: '../../screens/MiniGameScreen' },
  { name: 'ParentScreen', path: '../../screens/ParentScreen' },
  { name: 'QuizScreen', path: '../../screens/QuizScreen' },
  { name: 'RewardScreen', path: '../../screens/RewardScreen' },
  { name: 'StoryScreen', path: '../../screens/StoryScreen' },
  { name: 'DevTestScreen', path: '../../screens/DevTestScreen' },
];

describe('Screens — importação e exportação', () => {
  it.each(SCREENS.map(s => [s.name, s.path]))(
    '%s exporta um componente React (function)',
    (name, path) => {
      const mod = require(path);
      const Component = mod.default || mod;
      expect(typeof Component).toBe('function');
    }
  );
});

describe('MapScreen', () => {
  it('importa corretamente', () => {
    const MapScreen = require('../../screens/MapScreen').default;
    expect(MapScreen).toBeDefined();
  });
});

describe('AlbumScreen', () => {
  it('importa corretamente', () => {
    const AlbumScreen = require('../../screens/AlbumScreen').default;
    expect(AlbumScreen).toBeDefined();
  });
});

describe('AvatarScreen', () => {
  it('importa corretamente', () => {
    const AvatarScreen = require('../../screens/AvatarScreen').default;
    expect(AvatarScreen).toBeDefined();
  });
});

describe('QuizScreen', () => {
  it('importa corretamente', () => {
    const QuizScreen = require('../../screens/QuizScreen').default;
    expect(QuizScreen).toBeDefined();
  });
});

describe('StoryScreen', () => {
  it('importa corretamente', () => {
    const StoryScreen = require('../../screens/StoryScreen').default;
    expect(StoryScreen).toBeDefined();
  });
});

describe('RewardScreen', () => {
  it('importa corretamente', () => {
    const RewardScreen = require('../../screens/RewardScreen').default;
    expect(RewardScreen).toBeDefined();
  });
});

describe('MiniGameScreen', () => {
  it('importa corretamente', () => {
    const MiniGameScreen = require('../../screens/MiniGameScreen').default;
    expect(MiniGameScreen).toBeDefined();
  });
});

describe('ParentScreen', () => {
  it('importa corretamente', () => {
    const ParentScreen = require('../../screens/ParentScreen').default;
    expect(ParentScreen).toBeDefined();
  });
});

describe('DevTestScreen', () => {
  it('importa corretamente', () => {
    const DevTestScreen = require('../../screens/DevTestScreen').default;
    expect(DevTestScreen).toBeDefined();
  });
});
