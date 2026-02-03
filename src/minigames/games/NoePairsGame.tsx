import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import ConfettiBurst from '../../components/ConfettiBurst';
import { useSfx } from '../../sfx/useSfx';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';
import { useApp } from '../../state/AppState';

type Animal = { id: string; name: string; emoji: string };

const ANIMALS: Animal[] = [
  { id: 'lion', name: 'Leão', emoji: '🦁' },
  { id: 'elephant', name: 'Elefante', emoji: '🐘' },
  { id: 'zebra', name: 'Zebra', emoji: '🦓' },
  { id: 'giraffe', name: 'Girafa', emoji: '🦒' },
  { id: 'monkey', name: 'Macaco', emoji: '🐒' },
  { id: 'turtle', name: 'Tartaruga', emoji: '🐢' },
  { id: 'bird', name: 'Pássaro', emoji: '🐦' },
  { id: 'fish', name: 'Peixe', emoji: '🐟' },
];

function pickRandom<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export default function NoePairsGame({
  pairsToMatch = 3,
  narrationEnabled,
  onDone,
}: {
  pairsToMatch?: number;
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess } = useSfx(state.settings.sound);

  const target = useMemo(() => pickRandom(ANIMALS, Math.max(3, Math.min(5, pairsToMatch))), [pairsToMatch]);
  const [step, setStep] = useState<'intro' | 'play'>('intro');
  const [burst, setBurst] = useState(false);

  const [picked, setPicked] = useState<Record<string, number>>({}); // id -> count 0..2
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const totalPairs = target.length;
  const donePairs = Object.values(picked).filter((c) => c >= 2).length;

  const instruction =
    'Ajude Noé! Escolha os animais para entrar na arca em duplas. Toque duas vezes no mesmo animal para formar o par.';

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
  };

  const finish = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = touches > 0 ? Math.max(0, 1 - mistakes / touches) : 1;
    const score = Math.round(60 + accuracy * 40);
    onDone({ completed: true, score, mistakes, seconds });
  };

  const onPick = (a: Animal) => {
    setTouches((t) => t + 1);
    playTap();

    const isTarget = target.some((x) => x.id === a.id);
    if (!isTarget) {
      setMistakes((m) => m + 1);
      playFail();
      return;
    }

    setPicked((p) => {
      const prev = p[a.id] ?? 0;
      const nextCount = Math.min(2, prev + 1);
      const next = { ...p, [a.id]: nextCount };
      if (nextCount === 2) {
        playSuccess();
        if (state.settings.animations) {
          setBurst(true);
          setTimeout(() => setBurst(false), 650);
        }
      }
      return next;
    });
  };

  const allDone = donePairs >= totalPairs;
  const allText = `${instruction} Você precisa completar ${totalPairs} duplas. Você já completou ${donePairs}.`;

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 10 }}>
          <Text style={theme.typography.title}>🚢 Salvar os Animais da Arca</Text>
          <SpeakButton text={allText} enabled={narrationEnabled} label="Ouvir instruções" />
          <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>{instruction}</Text>
          <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>
            Dica: toque duas vezes no mesmo animal (🐘🐘) para formar a dupla.
          </Text>
        </Card>
        <PrimaryButton title="Começar" onPress={start} />
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing(2) }}>
      <Card style={{ gap: 10, position: 'relative', overflow: 'hidden' }}>
        <ConfettiBurst show={burst && state.settings.animations} />
        <Text style={theme.typography.subtitle}>Duplas completas: {donePairs}/{totalPairs} ⭐</Text>
        <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>
          Toque nos animais para colocar em duplas na arca.
        </Text>
        {allDone && (
          <PrimaryButton title="🎉 Continuar para as perguntas!" onPress={finish} variant="success" />
        )}
      </Card>

      <Card style={{ gap: 12 }}>
        <Text style={theme.typography.subtitle}>Animais</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {ANIMALS.map((a) => {
            const count = picked[a.id] ?? 0;
            const isTarget = target.some((x) => x.id === a.id);
            const completed = count >= 2;

            return (
              <Pressable key={a.id} onPress={() => onPick(a)} style={{ width: '30%' }} disabled={completed}>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: completed ? theme.colors.ok : isTarget ? theme.colors.primary2 : theme.colors.stroke,
                    backgroundColor: completed ? '#EAF9F0' : theme.colors.bg,
                    borderRadius: theme.radius.lg,
                    paddingVertical: 12,
                    alignItems: 'center',
                    opacity: completed ? 0.75 : 1,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{a.emoji}</Text>
                  <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 4 }}>
                    {count}/2
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <Text style={theme.typography.subtitle}>🚪 Arca (duplas alvo)</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {target.map((t) => {
            const count = picked[t.id] ?? 0;
            const completed = count >= 2;
            return (
              <View
                key={t.id}
                style={{
                  width: '30%',
                  borderWidth: 2,
                  borderColor: completed ? theme.colors.ok : theme.colors.stroke,
                  backgroundColor: completed ? '#EAF9F0' : theme.colors.card,
                  borderRadius: theme.radius.lg,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 28 }}>{completed ? t.emoji : '❔'}</Text>
                <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 4 }}>
                  {completed ? 'OK' : '—'}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      {allDone ? (
        <PrimaryButton title="Continuar ✓" onPress={finish} variant="success" />
      ) : (
        <Card style={{ backgroundColor: theme.colors.warning + '20', padding: 12 }}>
          <Text style={{ ...theme.typography.small, color: theme.colors.warning, textAlign: 'center' }}>
            ⚠️ Complete todas as {totalPairs} duplas primeiro!
          </Text>
        </Card>
      )}
    </View>
  );
}
