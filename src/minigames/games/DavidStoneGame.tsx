import React, { useMemo, useState, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import ConfettiBurst from '../../components/ConfettiBurst';
import { useSfx } from '../../sfx/useSfx';
import { useApp } from '../../state/AppState';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

type Stone = { id: string; emoji: string; name: string; hint: string };

const STONES: Stone[] = [
  { id: 'smooth', emoji: '⚪', name: 'Pedra Lisa', hint: 'Perfeita para voar retinho!' },
  { id: 'heavy', emoji: '🪨', name: 'Pedra Pesada', hint: 'Muito pesada para o estilingue' },
  { id: 'sharp', emoji: '🔶', name: 'Pedra Pontuda', hint: 'Pode machucar a mão' },
  { id: 'tiny', emoji: '⚫', name: 'Pedrinha Pequena', hint: 'Muito pequena para derrubar o gigante' },
  { id: 'flat', emoji: '🔷', name: 'Pedra Achatada', hint: 'Não voa direito' },
];

const { width } = Dimensions.get('window');
const stoneSize = Math.min(90, (width - 60) / 2);

export default function DavidStoneGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess, playPerfect } = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'play' | 'throw' | 'done'>('intro');
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [selectedStone, setSelectedStone] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<string | null>(null);
  const [burst, setBurst] = useState(false);

  const correctId = 'smooth';
  
  const stoneAnim = useRef(new Animated.Value(0)).current;
  const giantAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shuffled = useMemo(() => {
    const a = [...STONES];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);

  const instruction = 'Ajude Davi a derrotar o gigante Golias! Escolha a pedra perfeita para o estilingue. A pedra lisa é a melhor!';

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
    playTap();
  };

  const selectStone = (id: string) => {
    playTap();
    setSelectedStone(id);
    const stone = STONES.find(s => s.id === id);
    setShowHint(stone?.hint || null);
  };

  const throwStone = () => {
    if (!selectedStone) return;
    setTouches((t) => t + 1);
    setStep('throw');

    if (selectedStone === correctId) {
      // Animação de acerto - pedra voa e gigante cai
      playSuccess();
      Animated.sequence([
        Animated.timing(stoneAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(giantAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        playPerfect();
        setBurst(true);
        setTimeout(() => {
          setStep('done');
        }, 800);
      });
    } else {
      // Animação de erro - shake
      setMistakes((m) => m + 1);
      playFail();
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start(() => {
        setSelectedStone(null);
        setShowHint(null);
        setStep('play');
      });
    }
  };

  const finish = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = touches > 0 ? Math.max(0, 1 - mistakes / touches) : 1;
    const score = Math.round(60 + accuracy * 40);
    onDone({ completed: true, score, mistakes, seconds });
  };

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Text style={{ fontSize: 48 }}>👦</Text>
            <Text style={{ fontSize: 28 }}>🆚</Text>
            <Text style={{ fontSize: 64 }}>👹</Text>
          </View>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Davi e Golias</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
        </Card>
        <PrimaryButton title="⚔️ Enfrentar o Gigante!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={burst && state.settings.animations} />
          <Text style={{ fontSize: 64 }}>🏆</Text>
          <Text style={{ ...theme.typography.title, color: theme.colors.ok }}>Vitória!</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            Davi venceu Golias confiando em Deus!
          </Text>
          <PrimaryButton title="🎉 Continuar" onPress={finish} variant="success" />
        </Card>
      </View>
    );
  }

  const stoneTranslate = stoneAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -150],
  });

  const stoneScale = stoneAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.5, 0.5],
  });

  return (
    <View style={{ gap: theme.spacing(1.5) }}>
      {/* Cena do Gigante */}
      <LinearGradient
        colors={['#87CEEB', '#90EE90'] as const}
        style={{ 
          borderRadius: 20, 
          padding: 20, 
          alignItems: 'center',
          minHeight: 150,
          justifyContent: 'center',
        }}
      >
        <Animated.View style={{ 
          transform: [
            { scale: giantAnim },
            { translateX: shakeAnim },
          ],
          opacity: giantAnim,
        }}>
          <Text style={{ fontSize: 80 }}>👹</Text>
          <Text style={{ 
            fontSize: 12, 
            fontWeight: '800', 
            color: '#333', 
            textAlign: 'center',
            marginTop: 4,
          }}>
            GOLIAS
          </Text>
        </Animated.View>
        
        {selectedStone && step === 'throw' && (
          <Animated.View style={{ 
            position: 'absolute',
            bottom: 20,
            transform: [
              { translateY: stoneTranslate },
              { scale: stoneScale },
            ],
          }}>
            <Text style={{ fontSize: 32 }}>
              {STONES.find(s => s.id === selectedStone)?.emoji}
            </Text>
          </Animated.View>
        )}
      </LinearGradient>

      {/* Dica da Pedra Selecionada */}
      {showHint && (
        <Card style={{ 
          backgroundColor: selectedStone === correctId ? '#E8F5E9' : theme.colors.warn + '20',
          padding: 12,
          borderColor: selectedStone === correctId ? theme.colors.ok : theme.colors.warn,
        }}>
          <Text style={{ 
            ...theme.typography.small, 
            color: selectedStone === correctId ? theme.colors.ok : theme.colors.warn,
            textAlign: 'center',
            fontWeight: '700',
          }}>
            {selectedStone === correctId ? '✅ ' : '💡 '}{showHint}
          </Text>
        </Card>
      )}

      {/* Pedras para Escolher */}
      <Card style={{ gap: 12 }}>
        <Text style={{ ...theme.typography.subtitle }}>🪨 Escolha a pedra:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {shuffled.map((s) => {
            const isSelected = selectedStone === s.id;
            const isCorrect = s.id === correctId;
            
            return (
              <Pressable
                key={s.id}
                onPress={() => selectStone(s.id)}
                disabled={step === 'throw'}
                style={{
                  width: stoneSize,
                  height: stoneSize,
                  borderWidth: 3,
                  borderColor: isSelected ? (isCorrect ? theme.colors.ok : theme.colors.primary) : theme.colors.stroke,
                  backgroundColor: isSelected ? (isCorrect ? '#E8F5E9' : theme.colors.primary + '20') : theme.colors.card,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: step === 'throw' ? 0.5 : 1,
                }}
              >
                <Text style={{ fontSize: 36 }}>{s.emoji}</Text>
                <Text style={{ 
                  fontSize: 11, 
                  fontWeight: '700', 
                  marginTop: 4,
                  textAlign: 'center',
                  color: theme.colors.muted,
                }}>
                  {s.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Davi com Estilingue */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Text style={{ fontSize: 48 }}>👦</Text>
        <Text style={{ fontSize: 24 }}>🎯</Text>
        {selectedStone && (
          <PrimaryButton 
            title="🚀 Lançar Pedra!" 
            onPress={throwStone}
            variant={selectedStone === correctId ? 'success' : 'primary'}
          />
        )}
      </View>

      {mistakes > 0 && (
        <Text style={{ ...theme.typography.small, color: theme.colors.muted, textAlign: 'center' }}>
          Tentativas: {mistakes} • Lembre-se: a pedra lisa é a melhor!
        </Text>
      )}

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
