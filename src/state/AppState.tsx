import React, { createContext, useContext, useMemo, useReducer, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import levels from '../data/levels.json';
import AnimatedSplash from '../components/AnimatedSplash';
import { analytics } from '../utils/analytics';

export type Avatar = {
  name: string;
  skin: 'clara' | 'media' | 'escura';
  outfit: 'laranja' | 'azul' | 'verde' | 'rosa';
};

export type Progress = {
  starsByLevel: Record<string, number>;
  stickers: Record<string, boolean>;
};

export type Settings = {
  shuffleQuestions: boolean;
  narration: boolean;
  sound: boolean;
  animations: boolean;
  music: boolean;
};

type State = {
  avatar: Avatar | null;
  progress: Progress;
  settings: Settings;
};

type Action =
  | { type: 'SET_AVATAR'; avatar: Avatar }
  | { type: 'SET_STARS'; levelId: string; stars: number; stickerId?: string }
  | { type: 'SET_SETTING'; key: keyof Settings; value: boolean }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: State };

const initialState: State = {
  avatar: null,
  progress: {
    starsByLevel: {},
    stickers: {},
  },
  settings: {
    shuffleQuestions: true,
    narration: true,
    sound: true,
    animations: true,
    music: true,
  },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_AVATAR':
      return { ...state, avatar: action.avatar };

    case 'SET_STARS': {
      console.log('Reducer SET_STARS:', action);
      const prev = state.progress.starsByLevel[action.levelId] ?? 0;
      const best = Math.max(prev, action.stars);
      const stickers = { ...state.progress.stickers };
      if (action.stickerId) stickers[action.stickerId] = true;

      const newState = {
        ...state,
        progress: {
          starsByLevel: { ...state.progress.starsByLevel, [action.levelId]: best },
          stickers,
        },
      };
      console.log('Novo starsByLevel:', newState.progress.starsByLevel);
      return newState;
    }

    case 'SET_SETTING':
      return { ...state, settings: { ...state.settings, [action.key]: action.value } };

    case 'RESET':
      return initialState;

    case 'HYDRATE':
      return action.state;

    default:
      return state;
  }
}

const Ctx = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  data: typeof levels;
} | null>(null);

const STORAGE_KEY = '@bibliakids_state';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loaded, setLoaded] = useState(false);

  // Carregar estado do AsyncStorage na inicialização
  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        console.log('Carregando estado do AsyncStorage:', stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Estado carregado - starsByLevel:', parsed.progress?.starsByLevel);
          dispatch({ type: 'HYDRATE', state: parsed });
        }
      } catch (e) {
        console.warn('Failed to load state:', e);
      } finally {
        setLoaded(true);
      }
    };
    loadState();
  }, []);

  // Salvar estado no AsyncStorage sempre que mudar
  useEffect(() => {
    if (loaded) {
      const saveState = async () => {
        try {
          console.log('Salvando estado no AsyncStorage:', state.progress.starsByLevel);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          console.log('Estado salvo com sucesso!');
        } catch (e) {
          console.warn('Failed to save state:', e);
        }
      };
      saveState();
    }
  }, [state, loaded]);

  const value = useMemo(() => ({ state, dispatch, data: levels }), [state]);

  if (!loaded) {
    return <AnimatedSplash />;
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
}

// Re-export utilities for backwards compatibility
export { isLevelUnlocked, shuffle } from './utils';
