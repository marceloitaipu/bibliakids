import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import ConfettiBurst from '../../components/ConfettiBurst';
import { useSfx } from '../../sfx/useSfx';
import { useApp } from '../../state/AppState';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

type Soil = 'pedra' | 'espinhos' | 'boa';

const SOILS: { id: Soil; title: string; emoji: string; ok: boolean }[] = [
  { id: 'pedra', title: 'Pedra', emoji: '🪨', ok: false },
  { id: 'espinhos', title: 'Espinhos', emoji: '🌵', ok: false },
  { id: 'boa', title: 'Terra boa', emoji: '🟫', ok: true },
];

export default function ParablesSeedGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess } = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'play'>('intro');
  const [seedsLeft, setSeedsLeft] = useState(6);
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [grown, setGrown] = useState(0);
  const [burst, setBurst] = useState(false);

  const instruction =
    'Plante as sementes no solo certo! Toque no solo onde você quer plantar. Só na terra boa a semente cresce.';

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
  };

  const plant = (soil: Soil) => {
    if (seedsLeft <= 0) return;
    setTouches((t) => t + 1);
    playTap();
    setSeedsLeft((s) => s - 1);
    const ok = soil === 'boa';
    if (!ok) {
      setMistakes((m) => m + 1);
      playFail();
    } else {
      setGrown((g) => g + 1);
      playSuccess();
    }

    if (seedsLeft - 1 <= 0) finish();
  };

  const finish = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = touches > 0 ? Math.max(0, 1 - mistakes / touches) : 1;
    const score = Math.round(55 + accuracy * 45);
    if (state.settings.animations) {
      setBurst(true);
      setTimeout(() => setBurst(false), 850);
    }
    onDone({ completed: true, score, mistakes, seconds });
  };

  const allText = `${instruction} Você tem ${seedsLeft} sementes.`;

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 10 }}>
          <Text style={theme.typography.title}>🌱 Plantar no Solo Certo</Text>
          <SpeakButton text={allText} enabled={narrationEnabled} label="Ouvir instruções" />
          <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>{instruction}</Text>
        </Card>
        <PrimaryButton title="Começar" onPress={start} />
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing(2) }}>
      <Card style={{ gap: 6, position: 'relative', overflow: 'hidden' }}>
        <ConfettiBurst show={burst && state.settings.animations} />
        <Text style={theme.typography.subtitle}>Sementes: {seedsLeft} • Brotos: {grown}</Text>
        <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>
          Plante tocando em um solo.
        </Text>
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {SOILS.map((s) => (
            <Pressable key={s.id} onPress={() => plant(s.id)} style={{ flex: 1 }}>
              <View style={{ borderWidth: 2, borderColor: theme.colors.stroke, backgroundColor: theme.colors.card, borderRadius: theme.radius.xl, paddingVertical: 18, alignItems: 'center' }}>
                <Text style={{ fontSize: 28 }}>{s.emoji}</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', marginTop: 6 }}>{s.title}</Text>
                <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 6 }}>
                  {s.ok ? '✅ Cresce' : '❌ Não cresce'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={{ alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 30 }}>{grown >= 4 ? '🌿🌿🌿' : grown >= 2 ? '🌿🌿' : grown >= 1 ? '🌿' : '🌱'}</Text>
        <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>Veja as sementes crescendo!</Text>
      </Card>

      <PrimaryButton title="Finalizar" onPress={finish} disabled={seedsLeft > 0} />
    </View>
  );
}
