import React, { useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { theme } from '../theme';
import Card from '../components/Card';
import StarsRow from '../components/StarsRow';
import PrimaryButton from '../components/PrimaryButton';
import { useApp, isLevelUnlocked } from '../state/AppState';
import { analytics } from '../utils/analytics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function MapScreen({ navigation }: Props) {
  const { state, data, dispatch } = useApp();
  
  // Debug: mostra as estrelas no console
  console.log('MapScreen - Estrelas por fase:', state.progress.starsByLevel);

  const handleResetProgress = useCallback(() => {
    Alert.alert(
      '⚠️ Reiniciar Progresso',
      'Tem certeza que deseja apagar todo o progresso? Esta ação não pode ser desfeita!',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sim, reiniciar',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'RESET' });
            analytics.clear();
            analytics.track('app_opened', { reason: 'progress_reset' });
          },
        },
      ],
      { cancelable: true }
    );
  }, [dispatch]);

  const handleLevelPress = useCallback((levelId: string) => {
    analytics.trackLevelStart(levelId);
    navigation.navigate('Story', { levelId });
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing(2), gap: theme.spacing(2) }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ ...theme.typography.title, color: theme.colors.primary }}>Mapa de Aventuras</Text>
            <Text style={{ ...theme.typography.body, color: theme.colors.muted, marginTop: 6 }}>
              Toque em uma fase para jogar!
            </Text>
          </View>
          <Pressable
            onPress={handleResetProgress}
            accessibilityRole="button"
            accessibilityLabel="Reiniciar jogo do zero"
            style={({ pressed }) => ({
              padding: 12,
              borderRadius: theme.radius.md,
              backgroundColor: pressed ? theme.colors.bad + '40' : theme.colors.stroke,
            })}
          >
            <Text style={{ fontSize: 24 }}>🔄</Text>
          </Pressable>
        </Card>

        {data.levels.map((lvl, idx) => {
          const unlocked = isLevelUnlocked(lvl.id, state.progress.starsByLevel);
          const stars = state.progress.starsByLevel[lvl.id] ?? 0;
          const prevStars = idx > 0 ? (state.progress.starsByLevel[data.levels[idx - 1].id] ?? 0) : 1;

          return (
            <Pressable
              key={lvl.id}
              disabled={!unlocked}
              onPress={() => handleLevelPress(lvl.id)}
              accessibilityRole="button"
              accessibilityLabel={`Fase ${idx + 1}: ${lvl.title}. ${unlocked ? `${stars} de 3 estrelas` : 'Bloqueada'}`}
              accessibilityHint={unlocked ? 'Toque para jogar esta fase' : 'Complete a fase anterior primeiro'}
              style={({ pressed }) => ({
                opacity: unlocked ? 1 : 0.55,
                transform: [{ scale: pressed && unlocked ? 0.98 : 1 }],
              })}
            >
              <Card style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderWidth: stars >= 3 ? 3 : 2,
                borderColor: stars >= 3 ? theme.colors.primary2 : theme.colors.stroke,
              }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 28 }}>
                      {idx === 0 ? '🌞' : idx === 1 ? '🚢' : idx === 2 ? '🪨' : 
                       idx === 3 ? '🦁' : idx === 4 ? '🐋' : idx === 5 ? '⭐' : '🌱'}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={theme.typography.subtitle}>
                        {idx + 1}. {lvl.title} {unlocked ? '' : '🔒'}
                      </Text>
                      <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 2 }}>
                        {unlocked ? lvl.short : `Complete a fase ${idx} primeiro!`}
                      </Text>
                    </View>
                  </View>
                </View>
                <StarsRow stars={stars} />
              </Card>
            </Pressable>
          );
        })}

        <Card style={{ gap: theme.spacing(1.5) }}>
          <Text style={{ ...theme.typography.subtitle, color: theme.colors.text }}>Menu</Text>
          <PrimaryButton 
            title="🎫 Álbum de adesivos" 
            onPress={() => navigation.navigate('Album')}
            variant="success"
          />
          <PrimaryButton 
            title="👨‍👩‍👧 Para pais" 
            onPress={() => navigation.navigate('Parents')}
            variant="accent"
          />
          <PrimaryButton
            title="🔄 Reiniciar jogo do zero"
            onPress={handleResetProgress}
            style={{ backgroundColor: theme.colors.bad }}
          />
        </Card>
      </ScrollView>
    </View>
  );
}
