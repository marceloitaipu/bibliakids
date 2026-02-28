import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import Card from '../components/Card';
import StarsRow from '../components/StarsRow';
import PrimaryButton from '../components/PrimaryButton';
import { useApp, isLevelUnlocked } from '../state/AppState';
import { analytics } from '../utils/analytics';
import { logger } from '../utils/logger';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

const LEVEL_EMOJIS = ['🌍', '🚢', '⚔️', '🦁', '🐋', '⭐', '🌱'];

export default function MapScreen({ navigation }: Props) {
  const { state, data, dispatch } = useApp();
  
  logger.module('Map').debug('Estrelas por fase:', state.progress.starsByLevel);

  const totalStars = useMemo(() => 
    Object.values(state.progress.starsByLevel).reduce((sum, s) => sum + s, 0),
    [state.progress.starsByLevel]
  );
  const maxStars = data.levels.length * 3;
  const completedLevels = useMemo(() =>
    data.levels.filter(l => (state.progress.starsByLevel[l.id] ?? 0) > 0).length,
    [state.progress.starsByLevel, data.levels]
  );
  const playerName = state.avatar?.name?.trim() || 'Explorador(a)';

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
            navigation.reset({ index: 0, routes: [{ name: 'Avatar' }] });
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
        {/* Header com saudação e progresso */}
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: theme.radius.xl,
            padding: theme.spacing(2),
            ...theme.shadows.large,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...theme.typography.body, color: 'rgba(255,255,255,0.8)' }}>
                Olá, {playerName}! 👋
              </Text>
              <Text style={{ ...theme.typography.title, color: '#fff', marginTop: 2 }}>
                Mapa de Aventuras
              </Text>
              <Text style={{ ...theme.typography.small, color: 'rgba(255,255,255,0.9)', marginTop: 6 }}>
                ⭐ {totalStars}/{maxStars} estrelas • 📖 {completedLevels}/{data.levels.length} fases
              </Text>
            </View>
            <Pressable
              onPress={handleResetProgress}
              accessibilityRole="button"
              accessibilityLabel="Reiniciar jogo do zero"
              style={({ pressed }) => ({
                padding: 12,
                borderRadius: theme.radius.md,
                backgroundColor: pressed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
              })}
            >
              <Text style={{ fontSize: 22 }}>🔄</Text>
            </Pressable>
          </View>
          {/* Mini barra de progresso */}
          <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginTop: 12, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: '#fff', width: `${maxStars > 0 ? (totalStars / maxStars) * 100 : 0}%`, borderRadius: 3 }} />
          </View>
        </LinearGradient>

        {data.levels.map((lvl, idx) => {
          const unlocked = isLevelUnlocked(lvl.id, state.progress.starsByLevel);
          const stars = state.progress.starsByLevel[lvl.id] ?? 0;
          const perfect = stars >= 3;

          return (
            <Pressable
              key={lvl.id}
              disabled={!unlocked}
              onPress={() => handleLevelPress(lvl.id)}
              accessibilityRole="button"
              accessibilityLabel={`Fase ${idx + 1}: ${lvl.title}. ${unlocked ? `${stars} de 3 estrelas` : 'Bloqueada'}`}
              accessibilityHint={unlocked ? 'Toque para jogar esta fase' : 'Complete a fase anterior primeiro'}
              style={({ pressed }) => ({
                opacity: unlocked ? 1 : 0.5,
                transform: [{ scale: pressed && unlocked ? 0.97 : 1 }],
              })}
            >
              <Card style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderWidth: perfect ? 2.5 : 1.5,
                borderColor: perfect ? theme.colors.primary2 : unlocked ? theme.colors.stroke : 'rgba(0,0,0,0.08)',
                backgroundColor: perfect ? theme.colors.primary2 + '10' : theme.colors.card,
              }}>
                <View style={{ 
                  width: 50, height: 50, borderRadius: 25, 
                  backgroundColor: unlocked ? theme.colors.primary + '20' : 'rgba(0,0,0,0.06)',
                  alignItems: 'center', justifyContent: 'center', marginRight: 12,
                }}>
                  <Text style={{ fontSize: 26 }}>
                    {unlocked ? LEVEL_EMOJIS[idx] : '🔒'}
                  </Text>
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ ...theme.typography.subtitle, color: unlocked ? theme.colors.text : theme.colors.muted }}>
                    {idx + 1}. {lvl.title}
                  </Text>
                  <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 2 }} numberOfLines={1}>
                    {unlocked ? lvl.short : idx === 0 ? 'Primeira fase!' : `Complete "${data.levels[idx - 1]?.title}" primeiro!`}
                  </Text>
                </View>
                <StarsRow stars={stars} />
              </Card>
            </Pressable>
          );
        })}

        {/* Menu de navegação */}
        <View style={{ gap: theme.spacing(1), marginTop: theme.spacing(1), paddingBottom: theme.spacing(2) }}>
          <Text style={{ ...theme.typography.small, color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Menu
          </Text>
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
        </View>
      </ScrollView>
    </View>
  );
}
