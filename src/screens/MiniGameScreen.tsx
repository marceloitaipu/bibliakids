import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import ConfettiBurst from '../components/ConfettiBurst';
import ErrorBoundary from '../components/ErrorBoundary';
import { useSfx } from '../sfx/useSfx';
import { useApp } from '../state/AppState';
import { MiniGameRegistry } from '../minigames/registry';
import { analytics } from '../utils/analytics';
import type { MiniGameConfig, MiniGameResult } from '../minigames/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useBgm } from '../bgm/useBgm';

type Props = NativeStackScreenProps<RootStackParamList, 'MiniGame'>;

const prettyName: Record<string, string> = {
  creation_place: 'Montar o Mundo',
  noe_pairs: 'Animais na Arca',
  david_stone: 'A Pedra da Coragem',
  daniel_shields: 'Proteger Daniel',
  jonah_guide: 'Guiar o Grande Peixe',
  star_path: 'Seguir a Estrela',
  parables_seed: 'Plantar no Solo Certo',
};

export default function MiniGameScreen({ route, navigation }: Props) {
  const { data, state } = useApp();
  const level = data.levels.find((l) => l.id === route.params.levelId);
  useBgm(level?.id, state.settings.music);
  const { playSuccess } = useSfx(state.settings.sound);
  const [result, setResult] = useState<MiniGameResult | null>(null);
  const [burst, setBurst] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gameKey, setGameKey] = useState(0);

  useEffect(() => {
    // Simular pequeno delay para loading state
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const cfg: MiniGameConfig = level 
    ? ((level as any).minigame ?? { type: 'noe_pairs', pairsToMatch: 3 })
    : { type: 'noe_pairs', pairsToMatch: 3 };
  const GameComp = MiniGameRegistry[cfg.type];
  const gameTitle = prettyName[cfg.type] ?? 'Mini-jogo';

  useEffect(() => {
    if (level) {
      analytics.trackMiniGameStart(level.id, cfg.type);
    }
  }, [level?.id, cfg.type]);

  const onDone = useCallback((r: MiniGameResult) => {
    setResult(r);
    playSuccess();
    
    // Analytics
    if (level) {
      analytics.trackMiniGameComplete(level.id, cfg.type, r.score, r.mistakes);
    }
    
    if (state.settings.animations) {
      setBurst(true);
      setTimeout(() => setBurst(false), 800);
    }
  }, [level?.id, cfg.type, playSuccess, state.settings.animations]);

  const handleRetry = useCallback(() => {
    setResult(null);
    setGameKey(k => k + 1);
    if (level) {
      analytics.trackMiniGameStart(level.id, cfg.type);
    }
  }, [level?.id, cfg.type]);

  const handleGoBack = useCallback(() => {
    navigation.replace('Map');
  }, [navigation]);

  if (!level) return null;

  return (
    <View style={{ flex: 1, padding: theme.spacing(2), gap: theme.spacing(2) }}>
      <Card style={{ gap: 8, position: 'relative', overflow: 'hidden' }}>
        <ConfettiBurst show={burst && state.settings.animations} />
        <Text style={theme.typography.title} accessibilityRole="header">{level.title}</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>Mini-jogo: {gameTitle}</Text>
      </Card>

      {isLoading ? (
        <Card style={{ alignItems: 'center', padding: 40 }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, marginTop: 12 }}>
            Preparando o jogo...
          </Text>
        </Card>
      ) : (
        <ErrorBoundary
          fallbackTitle="Ops! O jogo travou"
          fallbackMessage="Não se preocupe, vamos tentar novamente!"
          onRetry={handleRetry}
          onGoBack={handleGoBack}
        >
          <GameComp 
            key={gameKey}
            {...(cfg as any)} 
            narrationEnabled={state.settings.narration} 
            onDone={onDone} 
          />
        </ErrorBoundary>
      )}

      {result && (
        <Card style={{ gap: 6 }}>
          <Text style={theme.typography.subtitle} accessibilityRole="header">Resultado</Text>
          <Text 
            style={{ ...theme.typography.body, color: theme.colors.muted }}
            accessibilityLabel={`Pontos: ${result.score}. Erros: ${result.mistakes}. Tempo: ${result.seconds} segundos`}
          >
            Pontos: {result.score} • Erros: {result.mistakes} • Tempo: {result.seconds}s
          </Text>
          <PrimaryButton 
            title="Ir para as perguntas" 
            onPress={() => navigation.replace('Quiz', { levelId: level.id })} 
          />
        </Card>
      )}

      {!result && !isLoading && (
        <PrimaryButton
          title="Voltar ao mapa"
          onPress={handleGoBack}
          variant="accent"
        />
      )}
    </View>
  );
}