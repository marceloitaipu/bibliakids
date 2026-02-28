import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import SpeakButton from '../components/SpeakButton';
import { useApp } from '../state/AppState';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useBgm } from '../bgm/useBgm';

type Props = NativeStackScreenProps<RootStackParamList, 'Story'>;

const LEVEL_EMOJIS: Record<string, string> = {
  criacao: '🌍✨',
  noe: '🚢🌈',
  davi: '👦⚔️',
  daniel: '🦁🙏',
  jonas: '🐋🌊',
  jesus_nascimento: '⭐👶',
  parabolas: '🌱📖',
};

const LEVEL_COLORS: Record<string, readonly [string, string]> = {
  criacao: ['#87CEEB', '#98FB98'] as const,
  noe: ['#4169E1', '#48CAE4'] as const,
  davi: ['#CD853F', '#DEB887'] as const,
  daniel: ['#DAA520', '#F4A460'] as const,
  jonas: ['#0077B6', '#00B4D8'] as const,
  jesus_nascimento: ['#1a1a2e', '#2d2d5e'] as const,
  parabolas: ['#8B4513', '#228B22'] as const,
};

export default function StoryScreen({ route, navigation }: Props) {
  const { data, state } = useApp();
  const level = data.levels.find((l) => l.id === route.params.levelId);
  useBgm(level?.id, state.settings.music);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const emojiAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!state.settings.animations) {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      emojiAnim.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.spring(emojiAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [state.settings.animations, fadeAnim, slideAnim, emojiAnim]);

  if (!level) return null;

  const storyText = `${level.title}. ${level.story.line1} ${level.story.line2}${level.story.line3 ? ' ' + level.story.line3 : ''}`;
  const emoji = LEVEL_EMOJIS[level.id] ?? '📖';
  const colors = LEVEL_COLORS[level.id] ?? (['#FFB703', '#FF7A00'] as const);
  const isNightTheme = level.id === 'jesus_nascimento';

  return (
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: theme.spacing(2), gap: theme.spacing(2) }}
    >
      {/* Hero banner da história */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <LinearGradient 
          colors={colors} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }}
          style={{ 
            borderRadius: theme.radius.xl, 
            padding: theme.spacing(3), 
            alignItems: 'center',
            ...theme.shadows.large,
          }}
        >
          <Animated.Text style={{ fontSize: 64, transform: [{ scale: emojiAnim }] }}>
            {emoji}
          </Animated.Text>
          <Text style={{ 
            ...theme.typography.title, 
            color: isNightTheme ? '#FFD700' : '#fff', 
            textAlign: 'center', 
            marginTop: 12,
            textShadowColor: 'rgba(0,0,0,0.3)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}>
            {level.title}
          </Text>
          <Text style={{ 
            ...theme.typography.body, 
            color: isNightTheme ? '#ddd' : 'rgba(255,255,255,0.9)', 
            textAlign: 'center', 
            marginTop: 4,
          }}>
            {level.short}
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Conteúdo da história */}
      <Card style={{ gap: theme.spacing(1.5) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 24 }}>📖</Text>
          <Text style={{ ...theme.typography.subtitle, color: theme.colors.primary }}>A História</Text>
        </View>

        <SpeakButton text={storyText} enabled={state.settings.narration} autoPlay label="Ouvir historinha" />

        <View style={{ 
          backgroundColor: theme.colors.bg, 
          padding: theme.spacing(2), 
          borderRadius: theme.radius.lg,
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.primary2,
          gap: 12,
        }}>
          <Text style={{ 
            ...theme.typography.body, 
            color: theme.colors.text, 
            lineHeight: 26,
            fontSize: 17,
          }}>
            {level.story.line1}
          </Text>
          <Text style={{ 
            ...theme.typography.body, 
            color: theme.colors.text, 
            lineHeight: 26,
            fontSize: 17,
          }}>
            {level.story.line2}
          </Text>
          {level.story.line3 && (
            <Text style={{ 
              ...theme.typography.body, 
              color: theme.colors.text, 
              lineHeight: 26,
              fontSize: 17,
              fontStyle: 'italic',
            }}>
              {level.story.line3}
            </Text>
          )}
        </View>

        <View style={{
          backgroundColor: theme.colors.accent + '15',
          padding: 12,
          borderRadius: theme.radius.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
          <Text style={{ fontSize: 18 }}>💡</Text>
          <Text style={{ ...theme.typography.small, color: theme.colors.accent, flex: 1, fontStyle: 'italic' }}>
            Agora, jogue o mini-jogo para explorar essa história!
          </Text>
        </View>
      </Card>

      {/* Botões */}
      <PrimaryButton title="🎮 Jogar mini-jogo" onPress={() => navigation.replace('MiniGame', { levelId: level.id })} />
      <PrimaryButton title="🗺️ Voltar ao mapa" onPress={() => navigation.goBack()} variant="accent" />
    </ScrollView>
  );
}