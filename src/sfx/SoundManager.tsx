import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

/**
 * SoundManager global: carrega os 4 efeitos sonoros UMA vez no nível
 * do AppProvider, em vez de recriar instâncias em cada tela.
 */

interface SfxApi {
  playSuccess: () => void;
  playFail: () => void;
  playTap: () => void;
  playPerfect: () => void;
}

const SfxContext = createContext<SfxApi>({
  playSuccess: () => {},
  playFail: () => {},
  playTap: () => {},
  playPerfect: () => {},
});

export function SfxProvider({ children }: { children: React.ReactNode }) {
  const success = useRef<Audio.Sound | null>(null);
  const fail = useRef<Audio.Sound | null>(null);
  const tap = useRef<Audio.Sound | null>(null);
  const perfect = useRef<Audio.Sound | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const [s1, s2, s3, s4] = await Promise.all([
          Audio.Sound.createAsync(require('../../assets/sfx/success.wav')),
          Audio.Sound.createAsync(require('../../assets/sfx/fail.wav')),
          Audio.Sound.createAsync(require('../../assets/sfx/tap.wav')),
          Audio.Sound.createAsync(require('../../assets/sfx/perfect.wav')),
        ]);
        if (!mounted) {
          await Promise.all([
            s1.sound.unloadAsync(),
            s2.sound.unloadAsync(),
            s3.sound.unloadAsync(),
            s4.sound.unloadAsync(),
          ]);
          return;
        }
        success.current = s1.sound;
        fail.current = s2.sound;
        tap.current = s3.sound;
        perfect.current = s4.sound;
        loaded.current = true;
      } catch {
        // Fail silently — audio may not be available
      }
    };

    load();

    return () => {
      mounted = false;
      loaded.current = false;
      const unload = async () => {
        try {
          await success.current?.unloadAsync();
          await fail.current?.unloadAsync();
          await tap.current?.unloadAsync();
          await perfect.current?.unloadAsync();
        } catch {}
      };
      unload();
    };
  }, []);

  const play = useCallback(async (snd: React.RefObject<Audio.Sound | null>) => {
    try {
      if (snd.current) await snd.current.replayAsync();
    } catch {}
  }, []);

  const api: SfxApi = {
    playSuccess: () => play(success),
    playFail: () => play(fail),
    playTap: () => play(tap),
    playPerfect: () => play(perfect),
  };

  return <SfxContext.Provider value={api}>{children}</SfxContext.Provider>;
}

/**
 * Hook para acessar os efeitos sonoros globais.
 * O parâmetro `enabled` controla se o som será reproduzido ou não.
 */
export function useSfx(enabled: boolean) {
  const ctx = useContext(SfxContext);

  if (!enabled) {
    return {
      playSuccess: () => {},
      playFail: () => {},
      playTap: () => {},
      playPerfect: () => {},
    };
  }

  return ctx;
}
