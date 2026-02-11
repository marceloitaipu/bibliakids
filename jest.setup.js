// Define __DEV__ global for React Native
global.__DEV__ = true;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
      playAsync: jest.fn().mockResolvedValue(undefined),
      replayAsync: jest.fn().mockResolvedValue(undefined),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      setIsLoopingAsync: jest.fn().mockResolvedValue(undefined),
      setVolumeAsync: jest.fn().mockResolvedValue(undefined),
    })),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Silence console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated') ||
      args[0].includes('useNativeDriver') ||
      args[0].includes('act(...)'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Mock React Native components for Node environment
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  TextInput: 'TextInput',
  Alert: {
    alert: jest.fn(),
  },
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(),
    })),
    sequence: jest.fn(() => ({
      start: jest.fn(),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn(),
    })),
    loop: jest.fn(() => ({
      start: jest.fn(),
    })),
  },
  StyleSheet: {
    create: (styles) => styles,
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  ActivityIndicator: 'ActivityIndicator',
  Switch: 'Switch',
}));
