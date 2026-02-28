import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text } from 'react-native';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import StarsRow from '../components/StarsRow';
import StarRise from '../components/StarRise';
import { useSfx } from '../sfx/SoundManager';
import { useApp } from '../state/AppState';
import { logger } from '../utils/logger';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useBgm } from '../bgm/useBgm';

type Props = NativeStackScreenProps<RootStackParamList, 'Reward'>;

export default function RewardScreen({ route, navigation }: Props) {
  const { dispatch, state } = useApp();
  const { levelId, stars, newStickerId } = route.params;
  useBgm(levelId, state.settings.music);
  const { playPerfect, playSuccess } = useSfx(state.settings.sound);
  const [showStars, setShowStars] = useState(false);

  const log = logger.module('Reward');
  // Refs to avoid stale closures in the mount-only effect
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;
  const sfxRef = useRef({ playPerfect, playSuccess });
  sfxRef.current = { playPerfect, playSuccess };

  useEffect(() => {
    log.debug('Salvando estrelas -', { levelId, stars, newStickerId });
    dispatchRef.current({ type: 'SET_STARS', levelId, stars, stickerId: stars > 0 ? newStickerId : undefined });

    if (stars >= 3) sfxRef.current.playPerfect();
    else if (stars > 0) sfxRef.current.playSuccess();

    if (state.settings.animations) {
      setShowStars(true);
      setTimeout(() => setShowStars(false), 1100);
    }
  }, [levelId, stars, newStickerId, state.settings.animations]);

  const msg =
    stars === 3
      ? 'Uau! Você mandou muito bem! 🎉'
      : stars === 2
      ? 'Muito bom! Continue assim! 💪'
      : stars === 1
      ? 'Boa! Vamos tentar melhorar na próxima! 😊'
      : 'Tudo bem! Você pode tentar de novo quando quiser. ❤️';

  const emoji = stars === 3 ? '🏆' : stars === 2 ? '🌟' : stars === 1 ? '🚀' : '💖';

  return (
    <View style={{ flex: 1, padding: theme.spacing(2), gap: theme.spacing(2) }}>
      <Card style={{ 
        alignItems: 'center', 
        gap: 16, 
        position: 'relative', 
        overflow: 'hidden',
        borderWidth: stars >= 3 ? 3 : 2,
        borderColor: stars >= 3 ? theme.colors.primary2 : theme.colors.stroke,
      }}>
        <StarRise show={showStars && state.settings.animations} />
        
        <Text style={{ fontSize: 56 }}>{emoji}</Text>
        
        <Text style={{ ...theme.typography.title, textAlign: 'center', color: theme.colors.primary }}>
          Parabéns!
        </Text>
        
        <StarsRow stars={stars} />
        
        <Text style={{ ...theme.typography.body, color: theme.colors.text, textAlign: 'center', paddingHorizontal: 20 }}>
          {msg}
        </Text>
        
        {stars > 0 ? (
          <View style={{ 
            backgroundColor: theme.colors.ok, 
            paddingVertical: 12, 
            paddingHorizontal: 24,
            borderRadius: theme.radius.lg,
            marginTop: 8,
          }}>
            <Text style={{ ...theme.typography.body, color: '#FFFFFF', textAlign: 'center', fontWeight: '800' }}>
              🎫 Você ganhou um adesivo!
            </Text>
          </View>
        ) : (
          <View style={{ 
            backgroundColor: theme.colors.accent, 
            paddingVertical: 12, 
            paddingHorizontal: 24,
            borderRadius: theme.radius.lg,
            marginTop: 8,
          }}>
            <Text style={{ ...theme.typography.body, color: '#FFFFFF', textAlign: 'center', fontWeight: '800' }}>
              🔄 Tente de novo para ganhar!
            </Text>
          </View>
        )}
      </Card>

      <PrimaryButton title="🗺️ Voltar ao mapa" onPress={() => navigation.replace('Map')} />
      <PrimaryButton title="📚 Ver álbum" onPress={() => navigation.navigate('Album')} variant="success" />
      <PrimaryButton title="🔄 Tentar de novo" onPress={() => navigation.replace('Story', { levelId })} variant="accent" />
    </View>
  );
}