import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import ConfettiBurst from '../../components/ConfettiBurst';
import { useSfx } from '../../sfx/useSfx';
import { useApp } from '../../state/AppState';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

type SoilType = 'road' | 'rocks' | 'thorns' | 'good';
type Seed = { id: string; emoji: string; name: string };

const SOILS: { id: SoilType; name: string; emoji: string; desc: string; gradient: readonly [string, string]; correct: boolean }[] = [
  { id: 'road', name: 'Estrada', emoji: '🛤️', desc: 'Os pássaros comem!', gradient: ['#8B7355', '#696969'] as const, correct: false },
  { id: 'rocks', name: 'Pedras', emoji: '🪨', desc: 'Sem raízes profundas!', gradient: ['#A9A9A9', '#708090'] as const, correct: false },
  { id: 'thorns', name: 'Espinhos', emoji: '🌵', desc: 'Os espinhos sufocam!', gradient: ['#556B2F', '#8B4513'] as const, correct: false },
  { id: 'good', name: 'Terra Boa', emoji: '🌱', desc: 'Cresce muito!', gradient: ['#228B22', '#32CD32'] as const, correct: true },
];

const SEEDS: Seed[] = [
  { id: 'wheat', emoji: '🌾', name: 'Trigo' },
  { id: 'corn', emoji: '🌽', name: 'Milho' },
  { id: 'sunflower', emoji: '🌻', name: 'Girassol' },
  { id: 'tree', emoji: '🌳', name: 'Árvore' },
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
const soilSize = Math.min(80, (width - 60) / 4);

export default function ParablesSeedGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess, playPerfect } = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'play' | 'done'>('intro');
  const [seeds] = useState(() => pickRandom(SEEDS, 4));
  const [currentSeedIdx, setCurrentSeedIdx] = useState(0);
  const [planted, setPlanted] = useState<Record<string, SoilType>>({});
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; message: string } | null>(null);
  const [combo, setCombo] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const seedAnim = useRef(new Animated.Value(1)).current;

  const instruction = 'Jesus contou a parábola do semeador! Plante cada semente na terra boa para que cresça forte e dê muitos frutos.';

  const currentSeed = seeds[currentSeedIdx];
  const correctPlantsCount = Object.values(planted).filter(s => s === 'good').length;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: currentSeedIdx / seeds.length,
      useNativeDriver: false,
    }).start();
  }, [currentSeedIdx, seeds.length, progressAnim]);

  useEffect(() => {
    // Animação pulsante da semente atual
    if (step === 'play') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(seedAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(seedAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [step, seedAnim]);

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
    playTap();
  };

  const plantIn = (soilId: SoilType) => {
    if (!currentSeed || feedback) return;
    setTouches(t => t + 1);
    playTap();

    const soil = SOILS.find(s => s.id === soilId);
    if (!soil) return;

    setPlanted(p => ({ ...p, [currentSeed.id]: soilId }));

    if (soil.correct) {
      setCombo(c => c + 1);
      setFeedback({ type: 'correct', message: `🌱 ${currentSeed.name} vai crescer muito!` });
      
      if (combo >= 1) {
        playPerfect();
      } else {
        playSuccess();
      }
      
      if (state.settings.animations) {
        setBurst(true);
        setTimeout(() => setBurst(false), 500);
      }
    } else {
      setMistakes(m => m + 1);
      setCombo(0);
      setFeedback({ type: 'wrong', message: `❌ ${soil.desc} Tente a terra boa!` });
      playFail();
    }

    setTimeout(() => {
      setFeedback(null);
      
      // Só avança se plantou na terra boa
      if (soil.correct) {
        const nextIdx = currentSeedIdx + 1;
        if (nextIdx >= seeds.length) {
          finish();
        } else {
          setCurrentSeedIdx(nextIdx);
        }
      }
    }, 1200);
  };

  const finish = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = touches > 0 ? Math.max(0, 1 - mistakes / touches) : 1;
    const score = Math.round(55 + accuracy * 45);
    playPerfect();
    onDone({ completed: true, score, mistakes, seconds });
    setStep('done');
  };

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {SOILS.map(s => (
              <Text key={s.id} style={{ fontSize: 28 }}>{s.emoji}</Text>
            ))}
          </View>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>O Semeador</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          
          <View style={{ 
            backgroundColor: theme.colors.ok + '20', 
            padding: 12, 
            borderRadius: 12,
            marginTop: 8,
          }}>
            <Text style={{ ...theme.typography.small, color: theme.colors.ok, textAlign: 'center' }}>
              💡 Dica: A terra boa 🌱 é onde as sementes crescem melhor!
            </Text>
          </View>
        </Card>
        <PrimaryButton title="🌾 Começar a Plantar!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations} />
          <Text style={{ fontSize: 64 }}>🌻🌾🌳🌽</Text>
          <Text style={{ ...theme.typography.title, color: theme.colors.ok }}>Colheita Abundante!</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            Todas as sementes foram plantadas na terra boa!
          </Text>
        </Card>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
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

      {/* Status */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ ...theme.typography.subtitle }}>
          🌱 {correctPlantsCount}/{seeds.length} sementes
        </Text>
        {combo >= 2 && (
          <View style={{ backgroundColor: theme.colors.ok, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>🌟 Combo x{combo}!</Text>
          </View>
        )}
      </View>

      {/* Semente Atual */}
      {currentSeed && (
        <Card style={{ 
          alignItems: 'center', 
          gap: 12,
          backgroundColor: theme.colors.primary2 + '15',
          borderColor: theme.colors.primary2,
        }}>
          <Text style={{ ...theme.typography.subtitle }}>Plante esta semente:</Text>
          <Animated.View style={{ transform: [{ scale: seedAnim }] }}>
            <Text style={{ fontSize: 64 }}>{currentSeed.emoji}</Text>
          </Animated.View>
          <Text style={{ ...theme.typography.body, fontWeight: '700' }}>{currentSeed.name}</Text>
        </Card>
      )}

      {/* Feedback */}
      {feedback && (
        <Card style={{ 
          backgroundColor: feedback.type === 'correct' ? '#E8F5E9' : theme.colors.bad + '20',
          borderColor: feedback.type === 'correct' ? theme.colors.ok : theme.colors.bad,
          padding: 12,
        }}>
          <Text style={{ 
            ...theme.typography.body, 
            color: feedback.type === 'correct' ? theme.colors.ok : theme.colors.bad,
            textAlign: 'center',
            fontWeight: '700',
          }}>
            {feedback.message}
          </Text>
        </Card>
      )}

      {/* Tipos de Solo */}
      <Text style={{ ...theme.typography.subtitle }}>Escolha onde plantar:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {SOILS.map((soil) => (
          <Pressable
            key={soil.id}
            onPress={() => plantIn(soil.id)}
            disabled={feedback !== null}
            style={{ width: '48%' }}
          >
            <LinearGradient
              colors={soil.gradient}
              style={{
                borderRadius: 16,
                padding: 14,
                alignItems: 'center',
                borderWidth: 3,
                borderColor: soil.correct ? theme.colors.ok : 'transparent',
                opacity: feedback !== null ? 0.5 : 1,
              }}
            >
              <Text style={{ fontSize: 36 }}>{soil.emoji}</Text>
              <Text style={{ 
                color: '#fff', 
                fontWeight: '800', 
                fontSize: 14,
                marginTop: 4,
                textShadowColor: 'rgba(0,0,0,0.5)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}>
                {soil.name}
              </Text>
              <Text style={{ 
                color: '#fff', 
                fontSize: 10,
                opacity: 0.8,
                textAlign: 'center',
              }}>
                {soil.desc}
              </Text>
            </LinearGradient>
          </Pressable>
        ))}
      </View>

      {mistakes > 0 && (
        <Text style={{ ...theme.typography.small, color: theme.colors.muted, textAlign: 'center' }}>
          Tentativas erradas: {mistakes} • Procure a terra boa! 🌱
        </Text>
      )}

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
