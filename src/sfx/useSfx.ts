import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

/**
 * SFX offline: usa WAVs locais (assets/sfx).
 * Falha silenciosamente caso o aparelho esteja sem áudio/permissão.
 */
export function useSfx(enabled: boolean) {
  const success = useRef<Audio.Sound | null>(null);
  const fail = useRef<Audio.Sound | null>(null);
  const tap = useRef<Audio.Sound | null>(null);
  const perfect = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const s1 = new Audio.Sound();
        const s2 = new Audio.Sound();
        const s3 = new Audio.Sound();
        const s4 = new Audio.Sound();
        await s1.loadAsync(require('../../assets/sfx/success.wav'));
        await s2.loadAsync(require('../../assets/sfx/fail.wav'));
        await s3.loadAsync(require('../../assets/sfx/tap.wav'));
        await s4.loadAsync(require('../../assets/sfx/perfect.wav'));
        if (!mounted) return;
        success.current = s1;
        fail.current = s2;
        tap.current = s3;
        perfect.current = s4;
      } catch (e) {
        // ignore
      }
    };

    load();

    return () => {
      mounted = false;
      const unload = async () => {
        try {
          await success.current?.unloadAsync();
          await fail.current?.unloadAsync();
          await tap.current?.unloadAsync();
          await perfect.current?.unloadAsync();
        } catch (e) {}
      };
      unload();
    };
  }, []);

  const play = async (snd: Audio.Sound | null) => {
    if (!enabled) return;
    try {
      if (!snd) return;
      await snd.replayAsync();
    } catch (e) {}
  };

  return {
    playSuccess: () => play(success.current),
    playFail: () => play(fail.current),
    playTap: () => play(tap.current),
    playPerfect: () => play(perfect.current),
  };
}
