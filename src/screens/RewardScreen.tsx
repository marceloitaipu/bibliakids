import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import StarsRow from '../components/StarsRow';
import StarRise from '../components/StarRise';
import { useSfx } from '../sfx/useSfx';
import { useApp } from '../state/AppState';
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

  useEffect(() => {
    dispatch({ type: 'SET_STARS', levelId, stars, stickerId: stars > 0 ? newStickerId : undefined });

    if (stars >= 3) playPerfect();
    else if (stars > 0) playSuccess();

    if (state.settings.animations) {
      setShowStars(true);
      setTimeout(() => setShowStars(false), 1100);
    }
  }, [dispatch, levelId, stars, newStickerId]);

  const msg =
    stars === 3
      ? 'Uau! Você mandou muito bem! 🌟'
      : stars === 2
      ? 'Muito bom! Continue assim! 💪'
      : stars === 1
      ? 'Boa! Vamos tentar melhorar na próxima! 😊'
      : 'Tudo bem! Você pode tentar de novo quando quiser. ❤️';

  return (
    <View style={{ flex: 1, padding: theme.spacing(2), gap: theme.spacing(2) }}>
      <Card style={{ alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden' }}>
        <StarRise show={showStars && state.settings.animations} />
        <Text style={theme.typography.title}>Parabéns!</Text>
        <StarsRow stars={stars} />
        <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>{msg}</Text>
        {stars > 0 ? (
          <Text style={{ ...theme.typography.body, textAlign: 'center' }}>Você ganhou um adesivo! 🎁</Text>
        ) : (
          <Text style={{ ...theme.typography.body, textAlign: 'center' }}>Tente de novo para ganhar o adesivo 🎁</Text>
        )}
      </Card>

      <PrimaryButton title="Voltar ao mapa" onPress={() => navigation.replace('Map')} />
      <PrimaryButton title="Ver álbum" onPress={() => navigation.navigate('Album')} style={{ backgroundColor: theme.colors.accent }} />
      <PrimaryButton title="Tentar de novo" onPress={() => navigation.replace('Story', { levelId })} style={{ backgroundColor: theme.colors.primary2 }} />
    </View>
  );
}