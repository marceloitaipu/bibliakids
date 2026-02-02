import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

type Choice = 'left' | 'right';

export default function StarPathGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const [step, setStep] = useState<'intro' | 'play' | 'done'>('intro');
  const [idx, setIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const path = useMemo(() => {
    const arr: Choice[] = [];
    for (let i = 0; i < 5; i++) arr.push(Math.random() > 0.5 ? 'left' : 'right');
    return arr;
  }, []);

  const instruction =
    'Siga a estrela! Em cada passo, escolha esquerda ou direita. Se escolher certo, a estrela brilha!';

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
  };

  const pick = (c: Choice) => {
    setTouches((t) => t + 1);
    const correct = path[idx];
    if (c !== correct) setMistakes((m) => m + 1);
    const next = idx + 1;
    if (next >= path.length) finish();
    else setIdx(next);
  };

  const finish = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = touches > 0 ? Math.max(0, 1 - mistakes / touches) : 1;
    const score = Math.round(55 + accuracy * 45);
    onDone({ completed: true, score, mistakes, seconds });
    setStep('done');
  };

  const allText = `${instruction} São ${path.length} passos.`;

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 10 }}>
          <Text style={theme.typography.title}>⭐ Seguir a Estrela</Text>
          <SpeakButton text={allText} enabled={narrationEnabled} label="Ouvir instruções" />
          <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>{instruction}</Text>
        </Card>
        <PrimaryButton title="Começar" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    return (
      <Card style={{ gap: 10 }}>
        <Text style={theme.typography.subtitle}>Chegou! ✨</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>
          A estrela guiou você. Muito bem!
        </Text>
      </Card>
    );
  }

  return (
    <View style={{ gap: theme.spacing(2) }}>
      <Card style={{ gap: 8 }}>
        <Text style={theme.typography.subtitle}>Passo {idx + 1}/{path.length}</Text>
        <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>
          Escolha o caminho.
        </Text>
      </Card>

      <Card style={{ gap: 10, alignItems: 'center' }}>
        <Text style={{ fontSize: 44 }}>⭐</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>
          {idx === 0 ? 'Vamos começar!' : 'Continue seguindo…'}
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={() => pick('left')} style={{ flex: 1 }}>
          <View style={{ borderWidth: 2, borderColor: theme.colors.stroke, backgroundColor: theme.colors.card, borderRadius: theme.radius.xl, paddingVertical: 16, alignItems: 'center' }}>
            <Text style={{ fontSize: 22 }}>⬅️</Text>
            <Text style={{ fontSize: 14, fontWeight: '800', marginTop: 6 }}>Esquerda</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => pick('right')} style={{ flex: 1 }}>
          <View style={{ borderWidth: 2, borderColor: theme.colors.stroke, backgroundColor: theme.colors.card, borderRadius: theme.radius.xl, paddingVertical: 16, alignItems: 'center' }}>
            <Text style={{ fontSize: 22 }}>➡️</Text>
            <Text style={{ fontSize: 14, fontWeight: '800', marginTop: 6 }}>Direita</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
