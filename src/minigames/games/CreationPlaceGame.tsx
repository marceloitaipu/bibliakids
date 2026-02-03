import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import ConfettiBurst from '../../components/ConfettiBurst';
import { useSfx } from '../../sfx/useSfx';
import { useApp } from '../../state/AppState';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

type ZoneId = 'ceu' | 'mar' | 'terra';
type Item = { id: string; emoji: string; name: string; zone: ZoneId };

const ZONES: { id: ZoneId; title: string; emoji: string }[] = [
  { id: 'ceu', title: 'Céu', emoji: '☁️' },
  { id: 'mar', title: 'Mar', emoji: '🌊' },
  { id: 'terra', title: 'Terra', emoji: '🌿' },
];

const ITEMS: Item[] = [
  { id: 'sun', emoji: '🌞', name: 'Sol', zone: 'ceu' },
  { id: 'moon', emoji: '🌙', name: 'Lua', zone: 'ceu' },
  { id: 'bird', emoji: '🐦', name: 'Pássaro', zone: 'ceu' },
  { id: 'fish', emoji: '🐟', name: 'Peixe', zone: 'mar' },
  { id: 'whale', emoji: '🐋', name: 'Baleia', zone: 'mar' },
  { id: 'dolphin', emoji: '🐬', name: 'Golfinho', zone: 'mar' },
  { id: 'tree', emoji: '🌳', name: 'Árvore', zone: 'terra' },
  { id: 'flower', emoji: '🌸', name: 'Flor', zone: 'terra' },
  { id: 'rabbit', emoji: '🐇', name: 'Coelho', zone: 'terra' },
];

function pickN<T>(arr: T[], n: number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export default function CreationPlaceGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess } = useSfx(state.settings.sound);

  const pool = useMemo(() => pickN(ITEMS, 6), []);
  const [step, setStep] = useState<'intro' | 'play'>('intro');
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, ZoneId>>({});
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);

  const instruction =
    'Monte o mundo! Primeiro toque em um item, depois toque no lugar certo: Céu, Mar ou Terra.';

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
  };

  const placeInZone = (zone: ZoneId) => {
    if (!selected) return;
    setTouches((t) => t + 1);
    playTap();
    const it = pool.find((x) => x.id === selected);
    if (!it) return;

    if (it.zone !== zone) {
      setMistakes((m) => m + 1);
      playFail();
      return;
    }
    setPlaced((p) => ({ ...p, [selected]: zone }));
    setSelected(null);
    playSuccess();
  };

  const allPlaced = pool.every((it) => placed[it.id]);
  const done = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = touches > 0 ? Math.max(0, 1 - mistakes / touches) : 1;
    const score = Math.round(55 + accuracy * 45);
    if (state.settings.animations) {
      setBurst(true);
      setTimeout(() => setBurst(false), 800);
    }
    onDone({ completed: true, score, mistakes, seconds });
  };

  const allText = `${instruction} Itens para colocar: ${pool.map((p) => p.name).join(', ')}.`;

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 10 }}>
          <Text style={theme.typography.title}>🌍 Montar o Mundo</Text>
          <SpeakButton text={allText} enabled={narrationEnabled} label="Ouvir instruções" />
          <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>{instruction}</Text>
        </Card>
        <PrimaryButton title="Começar" onPress={start} />
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing(2) }}>
      <Card style={{ gap: 8, position: 'relative', overflow: 'hidden' }}>
        <ConfettiBurst show={burst && state.settings.animations} />
        <Text style={theme.typography.subtitle}>Itens colocados: {Object.keys(placed).length}/{pool.length}</Text>
        <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>
          Selecione um item e depois o lugar certo.
        </Text>
      </Card>

      <Card style={{ gap: 10 }}>
        <Text style={theme.typography.subtitle}>Itens</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {pool.map((it) => {
            const doneItem = !!placed[it.id];
            const isSel = selected === it.id;
            return (
              <Pressable
                key={it.id}
                onPress={() => {
                  if (doneItem) return;
                  playTap();
                  setSelected(it.id);
                }}
                disabled={doneItem}
                style={{ width: '30%', opacity: doneItem ? 0.55 : 1 }}
              >
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: doneItem ? theme.colors.ok : isSel ? theme.colors.primary : theme.colors.stroke,
                    backgroundColor: doneItem ? '#EAF9F0' : theme.colors.bg,
                    borderRadius: theme.radius.lg,
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{it.emoji}</Text>
                  <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 4 }}>
                    {doneItem ? 'OK' : isSel ? 'Escolhido' : 'Toque'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <Text style={theme.typography.subtitle}>Lugares</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {ZONES.map((z) => (
            <Pressable key={z.id} onPress={() => placeInZone(z.id)} style={{ flex: 1 }}>
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
                <Text style={{ fontSize: 24 }}>{z.emoji}</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', marginTop: 4 }}>{z.title}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </Card>

      <PrimaryButton 
        title="Continuar" 
        onPress={() => {
          if (!allPlaced) {
            playFail();
            return;
          }
          done();
        }} 
      />
    </View>
  );
}
