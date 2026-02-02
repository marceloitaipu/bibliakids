import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

type Spot = { id: string; emoji: string };

const SPOTS: Spot[] = [
  { id: 'a', emoji: '✨' },
  { id: 'b', emoji: '✨' },
  { id: 'c', emoji: '✨' },
  { id: 'd', emoji: '✨' },
  { id: 'e', emoji: '✨' },
  { id: 'f', emoji: '✨' },
  { id: 'g', emoji: '✨' },
  { id: 'h', emoji: '✨' },
];

export default function DanielShieldsGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const [step, setStep] = useState<'intro' | 'play'>('intro');
  const [activeLion, setActiveLion] = useState<string | null>(null);
  const [shielded, setShielded] = useState<Record<string, boolean>>({});
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const rounds = 6;
  const [round, setRound] = useState(0);

  const lionTargets = useMemo(() => {
    const a = [...SPOTS.map((s) => s.id)];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, rounds);
  }, []);

  const instruction =
    'Proteja Daniel! Em cada rodada, um leão aparece. Toque no mesmo lugar para criar um escudo de luz.';

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
    setActiveLion(lionTargets[0]);
  };

  const tap = (id: string) => {
    if (!activeLion) return;
    setTouches((t) => t + 1);
    if (id !== activeLion) {
      setMistakes((m) => m + 1);
      return;
    }
    // acerto
    setShielded((s) => ({ ...s, [id]: true }));
    const nextRound = round + 1;
    setRound(nextRound);
    if (nextRound >= rounds) {
      finish(nextRound);
    } else {
      setActiveLion(lionTargets[nextRound]);
    }
  };

  const finish = (doneRounds: number) => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = touches > 0 ? Math.max(0, 1 - mistakes / touches) : 1;
    const score = Math.round(55 + accuracy * 45);
    onDone({ completed: true, score, mistakes, seconds });
  };

  const allText = `${instruction} Rodadas: ${rounds}.`;

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 10 }}>
          <Text style={theme.typography.title}>🦁 Proteger Daniel</Text>
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
        <Text style={theme.typography.subtitle}>Rodada {round + 1}/{rounds}</Text>
        <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>
          Toque no lugar do leão para acender um escudo!
        </Text>
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
          {SPOTS.map((s) => {
            const isLion = s.id === activeLion;
            const isShield = !!shielded[s.id];
            return (
              <Pressable key={s.id} onPress={() => tap(s.id)} style={{ width: '23%' }}>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: isShield ? theme.colors.ok : isLion ? theme.colors.warn : theme.colors.stroke,
                    backgroundColor: isShield ? '#EAF9F0' : theme.colors.card,
                    borderRadius: theme.radius.lg,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{isLion ? '🦁' : isShield ? '🛡️' : '✨'}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>
    </View>
  );
}
