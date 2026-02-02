import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import ConfettiBurst from '../components/ConfettiBurst';
import { useSfx } from '../sfx/useSfx';
import { useApp } from '../state/AppState';
import { MiniGameRegistry } from '../minigames/registry';
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

  if (!level) return null;

  const cfg: MiniGameConfig = (level as any).minigame ?? { type: 'noe_pairs', pairsToMatch: 3 };
  const GameComp = MiniGameRegistry[cfg.type];
  const gameTitle = prettyName[cfg.type] ?? 'Mini-jogo';

  const onDone = (r: MiniGameResult) => {
    setResult(r);
    playSuccess();
    if (state.settings.animations) {
      setBurst(true);
      setTimeout(() => setBurst(false), 800);
    }
  };

  return (
    <View style={{ flex: 1, padding: theme.spacing(2), gap: theme.spacing(2) }}>
      <Card style={{ gap: 8, position: 'relative', overflow: 'hidden' }}>
        <ConfettiBurst show={burst && state.settings.animations} />
        <Text style={theme.typography.title}>{level.title}</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>Mini-jogo: {gameTitle}</Text>
      </Card>

      <GameComp {...(cfg as any)} narrationEnabled={state.settings.narration} onDone={onDone} />

      {result && (
        <Card style={{ gap: 6 }}>
          <Text style={theme.typography.subtitle}>Resultado</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>
            Pontos: {result.score} • Erros: {result.mistakes} • Tempo: {result.seconds}s
          </Text>
          <PrimaryButton title="Ir para a pergunta" onPress={() => navigation.replace('Quiz', { levelId: level.id })} />
        </Card>
      )}

      {!result && (
        <PrimaryButton
          title="Voltar ao mapa"
          onPress={() => navigation.replace('Map')}
          style={{ backgroundColor: theme.colors.accent }}
        />
      )}
    </View>
  );
}