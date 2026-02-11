import React, { createContext, useContext, useMemo, useReducer, useCallback } from 'react';
import { analytics } from '../utils/analytics';

export type Progress = {
  starsByLevel: Record<string, number>;
  stickers: Record<string, boolean>;
};

type ProgressAction =
  | { type: 'SET_STARS'; levelId: string; stars: number; stickerId?: string }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; progress: Progress };

const initialProgress: Progress = {
  starsByLevel: {},
  stickers: {},
};

function progressReducer(state: Progress, action: ProgressAction): Progress {
  switch (action.type) {
    case 'SET_STARS': {
      const prev = state.starsByLevel[action.levelId] ?? 0;
      const best = Math.max(prev, action.stars);
      const stickers = { ...state.stickers };
      
      if (action.stickerId && action.stars > 0) {
        stickers[action.stickerId] = true;
        // Track sticker earned
        if (!state.stickers[action.stickerId]) {
          analytics.trackStickerEarned(action.stickerId, action.levelId);
        }
      }

      // Track level completion
      if (action.stars > prev) {
        analytics.trackLevelComplete(action.levelId, action.stars);
      }

      return {
        ...state,
        starsByLevel: { ...state.starsByLevel, [action.levelId]: best },
        stickers,
      };
    }
    case 'RESET':
      return initialProgress;
    case 'HYDRATE':
      return action.progress;
    default:
      return state;
  }
}

interface ProgressContextValue {
  progress: Progress;
  setStars: (levelId: string, stars: number, stickerId?: string) => void;
  resetProgress: () => void;
  hydrateProgress: (progress: Progress) => void;
  getTotalStars: () => number;
  getTotalStickers: () => number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, dispatch] = useReducer(progressReducer, initialProgress);

  const setStars = useCallback((levelId: string, stars: number, stickerId?: string) => {
    dispatch({ type: 'SET_STARS', levelId, stars, stickerId });
  }, []);

  const resetProgress = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const hydrateProgress = useCallback((p: Progress) => {
    dispatch({ type: 'HYDRATE', progress: p });
  }, []);

  const getTotalStars = useCallback(() => {
    return Object.values(progress.starsByLevel).reduce((sum, s) => sum + s, 0);
  }, [progress.starsByLevel]);

  const getTotalStickers = useCallback(() => {
    return Object.values(progress.stickers).filter(Boolean).length;
  }, [progress.stickers]);

  const value = useMemo(
    () => ({ progress, setStars, resetProgress, hydrateProgress, getTotalStars, getTotalStickers }),
    [progress, setStars, resetProgress, hydrateProgress, getTotalStars, getTotalStickers]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return ctx;
}

export { initialProgress };
