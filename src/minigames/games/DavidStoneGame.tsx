import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

type Stone = { id: string; emoji: string; name: string };

const STONES: Stone[] = [
  { id: 'smooth', emoji: '🪨', name: 'Pedra lisa' },
  { id: 'heavy', emoji: '🪨', name: 'Pedra pesada' },
  { id: 'sharp', emoji: '🪨', name: 'Pedra pontuda' },
  { id: 'tiny', emoji: '🪨', name: 'Pedrinha' },
  { id: 'flat', emoji: '🪨', name: 'Pedra achatada' },
];

export default function DavidStoneGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const [step, setStep] = useState<'intro' | 'play' | 'done'>('intro');
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [winner, setWinner] = useState<boolean | null>(null);

  // “Pedra lisa” é a correta (simples e didático)
  const correctId = 'smooth';

  const shuffled = useMemo(() => {
    const a = [...STONES];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);

  const instruction =
    'Ajude Davi! Escolha a pedra certa para usar no estilingue. Dica: a pedra lisa é a melhor para voar retinho.';

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
  };

  const pick = (id: string) => {
    setTouches((t) => t + 1);
    if (id === correctId) {
      setWinner(true);
      setStep('done');
      return;
    }
    setMistakes((m) => m + 1);
    setWinner(false);
  };

  const finish = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = touches > 0 ? Math.max(0, 1 - mistakes / touches) : 1;
    const score = Math.round(60 + accuracy * 40);
    onDone({ completed: true, score, mistakes, seconds });
  };

  const allText = instruction;

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 10 }}>
          <Text style={theme.typography.title}>🏹 A Pedra da Coragem</Text>
          <SpeakButton text={allText} enabled={narrationEnabled} label="Ouvir instruções" />
          <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>{instruction}</Text>
        </Card>
        <PrimaryButton title="Começar" onPress={start} />
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing(2) }}>
      <Card style={{ gap: 8 }}>
        <Text style={theme.typography.subtitle}>Escolha uma pedra</Text>
        <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>
          Você consegue! Lembre: Davi confiou em Deus. ✨
        </Text>
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {shuffled.map((s) => (
            <Pressable key={s.id} onPress={() => step === 'play' && pick(s.id)} style={{ width: '48%' }}>
              <View
                style={{
                  borderWidth: 2,
                  borderColor: theme.colors.stroke,
                  backgroundColor: theme.colors.card,
                  borderRadius: theme.radius.xl,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 30 }}>{s.emoji}</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', marginTop: 6 }}>{s.name}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </Card>

      {winner !== null && (
        <Card style={{ gap: 8 }}>
          <Text style={theme.typography.subtitle}>{winner ? 'Acertou! ✅' : 'Quase! 🙂'}</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>
            {winner
              ? 'A pedra lisa voa melhor! Davi foi corajoso e confiou em Deus.'
              : 'Tente de novo. Davi escolheu com calma e confiança.'}
          </Text>
          {winner && <PrimaryButton title="Continuar" onPress={finish} />}
        </Card>
      )}
    </View>
  );
}
