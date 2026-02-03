import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  { id: 'rabbit', name: 'Coelho', emoji: '🐰' },
  { id: 'bird', name: 'Pássaro', emoji: '🦅' },
  { id: 'whale', name: 'Baleia', emoji: '🐋' },
  { id: 'bear', name: 'Urso', emoji: '🐻' },
  { id: 'fox', name: 'Raposa', emoji: '🦊' },
];

function pickRandom<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

const { width } = Dimensions.get('window');
const cardSize = Math.min(85, (width - 80) / 4);

export default function NoePairsGame({
  pairsToMatch = 4,
  narrationEnabled,
  onDone,
}: {
  pairsToMatch?: number;
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess, playPerfect } = useSfx(state.settings.sound);

  const target = useMemo(() => pickRandom(ANIMALS, Math.max(3, Math.min(5, pairsToMatch))), [pairsToMatch]);
  const [step, setStep] = useState<'intro' | 'play' | 'done'>('intro');
  const [burst, setBurst] = useState(false);
  const [combo, setCombo] = useState(0);

  const [picked, setPicked] = useState<Record<string, number>>({});
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const arkAnim = useRef(new Animated.Value(0)).current;

  const totalPairs = target.length;
  const donePairs = Object.values(picked).filter((c) => c >= 2).length;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: donePairs / totalPairs,
      useNativeDriver: false,
    }).start();

    if (donePairs > 0) {
      Animated.sequence([
        Animated.timing(arkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(arkAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [donePairs, totalPairs, progressAnim, arkAnim]);

  const instruction = 'Ajude Noé a salvar os animais! Toque duas vezes no mesmo animal para formar o par e entrar na arca.';

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
    playTap();
  };

  const finish = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = touches > 0 ? Math.max(0, 1 - mistakes / touches) : 1;
    const score = Math.round(60 + accuracy * 40);
    playPerfect();
    onDone({ completed: true, score, mistakes, seconds });
    setStep('done');
  };

  const onPick = (a: Animal) => {
    setTouches((t) => t + 1);
    playTap();

    const isTarget = target.some((x) => x.id === a.id);
    if (!isTarget) {
      setMistakes((m) => m + 1);
      setCombo(0);
      playFail();
      return;
    }

    setPicked((p) => {
      const prev = p[a.id] ?? 0;
      const nextCount = Math.min(2, prev + 1);
      const next = { ...p, [a.id]: nextCount };
      if (nextCount === 2) {
        setCombo(c => c + 1);
        if (combo >= 1) {
          playPerfect();
        } else {
          playSuccess();
        }
        if (state.settings.animations) {
          setBurst(true);
          setTimeout(() => setBurst(false), 650);
        }
      }
      return next;
    });
  };

  const allDone = donePairs >= totalPairs;

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 64 }}>🚢</Text>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Arca de Noé</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            {target.slice(0, 3).map((t, i) => (
              <Text key={i} style={{ fontSize: 32 }}>{t.emoji}{t.emoji}</Text>
            ))}
          </View>
          <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>
            {totalPairs} pares de animais precisam ser salvos!
          </Text>
        </Card>
        <PrimaryButton title="🚢 Salvar os Animais!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations} />
          <Text style={{ fontSize: 64 }}>🌈</Text>
          <Text style={{ ...theme.typography.title, color: theme.colors.ok }}>Animais Salvos!</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            Todos entraram na arca em duplas!
          </Text>
        </Card>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const arkScale = arkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  return (
    <View style={{ gap: theme.spacing(1.5) }}>
      {/* Barra de Progresso */}
      <View style={{ height: 12, backgroundColor: theme.colors.stroke, borderRadius: 6, overflow: 'hidden' }}>
        <Animated.View style={{ 
          height: '100%', 
          backgroundColor: theme.colors.ok,
          borderRadius: 6,
          width: progressWidth,
        }} />
      </View>

      {/* Status com Arca Animada */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Animated.Text style={{ fontSize: 28, transform: [{ scale: arkScale }] }}>🚢</Animated.Text>
          <Text style={{ ...theme.typography.subtitle }}>
            {donePairs}/{totalPairs} duplas
          </Text>
        </View>
        {combo >= 2 && (
          <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>🔥 Combo x{combo}!</Text>
          </View>
        )}
      </View>

      {/* Arca - mostra animais salvos */}
      <LinearGradient
        colors={['#8B4513', '#A0522D'] as const}
        style={{ 
          borderRadius: 20, 
          padding: 16, 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          gap: 8,
          justifyContent: 'center',
          minHeight: 80,
        }}
      >
        {target.map((t) => {
          const count = picked[t.id] ?? 0;
          const completed = count >= 2;
          return (
            <View key={t.id} style={{ alignItems: 'center' }}>
              {completed ? (
                <Text style={{ fontSize: 32 }}>{t.emoji}{t.emoji}</Text>
              ) : (
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 32, opacity: count >= 1 ? 1 : 0.3 }}>{count >= 1 ? t.emoji : '❔'}</Text>
                  <Text style={{ fontSize: 32, opacity: 0.3 }}>❔</Text>
                </View>
              )}
            </View>
          );
        })}
      </LinearGradient>

      {/* Animais para escolher */}
      <Card style={{ gap: 12 }}>
        <Text style={{ ...theme.typography.subtitle }}>🐾 Escolha os animais:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {ANIMALS.map((a) => {
            const count = picked[a.id] ?? 0;
            const isTarget = target.some((x) => x.id === a.id);
            const completed = count >= 2;
            const partial = count === 1;

            return (
              <Pressable 
                key={a.id} 
                onPress={() => onPick(a)} 
                disabled={completed}
                style={{
                  width: cardSize,
                  height: cardSize,
                  borderWidth: 3,
                  borderColor: completed ? theme.colors.ok : partial ? theme.colors.primary : theme.colors.stroke,
                  backgroundColor: completed ? '#E8F5E9' : partial ? theme.colors.primary + '20' : theme.colors.card,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: completed ? 0.5 : 1,
                }}
              >
                <Text style={{ fontSize: completed ? 20 : 28 }}>{completed ? '✓' : a.emoji}</Text>
                {partial && (
                  <View style={{ position: 'absolute', bottom: 4, backgroundColor: theme.colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>1/2</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Botão Continuar */}
      {allDone && (
        <PrimaryButton title="🌈 Continuar!" onPress={finish} variant="success" />
      )}

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
