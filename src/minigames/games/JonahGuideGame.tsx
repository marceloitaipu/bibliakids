import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

type Lane = 0 | 1 | 2;

function randLane(): Lane {
  return (Math.floor(Math.random() * 3) as Lane);
}

export default function JonahGuideGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const [step, setStep] = useState<'intro' | 'play' | 'done'>('intro');
  const [lane, setLane] = useState<Lane>(1);
  const [pos, setPos] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  // 10 obstáculos; cada um tem uma “posição” e uma pista
  const obstacles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      arr.push({ at: (i + 1) * 10, lane: randLane() });
    }
    return arr;
  }, []);

  const instruction =
    'Guie o grande peixe até Jonas! Use os botões para subir ou descer de pista e desviar das algas.';

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
  };

  const move = (dir: -1 | 1) => {
    setTouches((t) => t + 1);
    setLane((l) => {
      const next = (l + dir) as Lane;
      if (next < 0 || next > 2) return l;
      return next;
    });
  };

  const tick = () => {
    // avança 10 “passos” por clique de avançar
    const nextPos = pos + 10;
    // colisão se houver obstáculo na mesma posição e mesma lane
    const hit = obstacles.some((o) => o.at === nextPos && o.lane === lane);
    if (hit) setMistakes((m) => m + 1);

    setPos(nextPos);
    if (nextPos >= 100) finish(nextPos);
  };

  const finish = (finalPos: number) => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = Math.max(0, 1 - mistakes / 8); // tolerância leve
    const score = Math.round(55 + accuracy * 45);
    onDone({ completed: true, score, mistakes, seconds });
    setStep('done');
  };

  const laneLabel = lane === 0 ? 'Cima' : lane === 1 ? 'Meio' : 'Baixo';
  const allText = `${instruction} Você está na pista ${laneLabel}.`;

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 10 }}>
          <Text style={theme.typography.title}>🐋 Guiar o Grande Peixe</Text>
          <SpeakButton text={allText} enabled={narrationEnabled} label="Ouvir instruções" />
          <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>{instruction}</Text>
        </Card>
        <PrimaryButton title="Começar" onPress={start} />
      </View>
    );
  }

  // visual simples com 3 pistas
  return (
    <View style={{ gap: theme.spacing(2) }}>
      <Card style={{ gap: 6 }}>
        <Text style={theme.typography.subtitle}>Progresso: {pos}%</Text>
        <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>
          Pista: {laneLabel} • Erros: {mistakes}
        </Text>
      </Card>

      <Card style={{ gap: 10 }}>
        {[0, 1, 2].map((l) => {
          const thisLane = l as Lane;
          const hasObstacleAhead = obstacles.some((o) => o.at === pos + 10 && o.lane === thisLane);
          const isFish = lane === thisLane;
          return (
            <View
              key={l}
              style={{
                borderWidth: 2,
                borderColor: isFish ? theme.colors.accent : theme.colors.stroke,
                backgroundColor: theme.colors.card,
                borderRadius: theme.radius.xl,
                paddingVertical: 12,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontSize: 22 }}>{isFish ? '🐟' : '  '}</Text>
              <Text style={{ fontSize: 16, fontWeight: '800' }}>{l === 0 ? 'Cima' : l === 1 ? 'Meio' : 'Baixo'}</Text>
              <Text style={{ fontSize: 22 }}>{hasObstacleAhead ? '🌿' : '  '}</Text>
            </View>
          );
        })}
      </Card>

      <Card style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <PrimaryButton title="⬆️ Subir" onPress={() => move(-1)} />
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton title="Avançar ➜" onPress={tick} style={{ backgroundColor: theme.colors.primary2 }} />
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton title="⬇️ Descer" onPress={() => move(1)} />
        </View>
      </Card>
    </View>
  );
}
