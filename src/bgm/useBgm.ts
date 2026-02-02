import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

type LevelId = 'criacao' | 'noe' | 'davi' | 'daniel' | 'jonas' | 'jesus_nascimento' | 'parabolas';

function getTrack(levelId: string) {
  switch (levelId as LevelId) {
    case 'criacao':
      return require('../../assets/bgm/criacao.wav');
    case 'noe':
      return require('../../assets/bgm/noe.wav');
    case 'davi':
      return require('../../assets/bgm/davi.wav');
    case 'daniel':
      return require('../../assets/bgm/daniel.wav');
    case 'jonas':
      return require('../../assets/bgm/jonas.wav');
    case 'jesus_nascimento':
      return require('../../assets/bgm/jesus_nascimento.wav');
    case 'parabolas':
      return require('../../assets/bgm/parabolas.wav');
    default:
      return require('../../assets/bgm/criacao.wav');
  }
}

export function useBgm(levelId: string | undefined, enabled: boolean) {
  const sound = useRef<Audio.Sound | null>(null);
  const current = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;

    const stop = async () => {
      try {
        if (sound.current) {
          await sound.current.stopAsync();
          await sound.current.unloadAsync();
          sound.current = null;
        }
      } catch (e) {}
      current.current = null;
    };

    const start = async () => {
      try {
        if (!enabled || !levelId) {
          await stop();
          return;
        }

        if (current.current === levelId && sound.current) return;

        await stop();

        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const s = new Audio.Sound();
        await s.loadAsync(getTrack(levelId));
        await s.setIsLoopingAsync(true);
        await s.setVolumeAsync(0.10);
        await s.playAsync();

        if (!alive) {
          await s.stopAsync();
          await s.unloadAsync();
          return;
        }

        sound.current = s;
        current.current = levelId;
      } catch (e) {}
    };

    start();

    return () => {
      alive = false;
      stop();
    };
  }, [levelId, enabled]);
}
