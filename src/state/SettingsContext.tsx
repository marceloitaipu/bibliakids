import React, { createContext, useContext, useMemo, useReducer, useCallback } from 'react';

export type Settings = {
  shuffleQuestions: boolean;
  narration: boolean;
  sound: boolean;
  animations: boolean;
  music: boolean;
};

type SettingsAction =
  | { type: 'SET_SETTING'; key: keyof Settings; value: boolean }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; settings: Settings };

const initialSettings: Settings = {
  shuffleQuestions: true,
  narration: true,
  sound: true,
  animations: true,
  music: true,
};

function settingsReducer(state: Settings, action: SettingsAction): Settings {
  switch (action.type) {
    case 'SET_SETTING':
      return { ...state, [action.key]: action.value };
    case 'RESET':
      return initialSettings;
    case 'HYDRATE':
      return action.settings;
    default:
      return state;
  }
}

interface SettingsContextValue {
  settings: Settings;
  setSetting: (key: keyof Settings, value: boolean) => void;
  resetSettings: () => void;
  hydrateSettings: (settings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

  const setSetting = useCallback((key: keyof Settings, value: boolean) => {
    dispatch({ type: 'SET_SETTING', key, value });
  }, []);

  const resetSettings = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const hydrateSettings = useCallback((s: Settings) => {
    dispatch({ type: 'HYDRATE', settings: s });
  }, []);

  const value = useMemo(
    () => ({ settings, setSetting, resetSettings, hydrateSettings }),
    [settings, setSetting, resetSettings, hydrateSettings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}

export { initialSettings };
