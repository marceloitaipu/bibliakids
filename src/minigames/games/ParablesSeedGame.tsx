// Mini-game: Parábola do Semeador - Plante sementes no solo certo!
// Jogo de estratégia: arraste sementes para os solos corretos antes do tempo acabar
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, PanResponder } from 'react-native';
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
type QuestionType = { text: string; correctSoil: SoilType };

const QUESTIONS: QuestionType[] = [
  { text: 'Uma pessoa ouve a Palavra mas não entende, e o Maligno rouba', correctSoil: 'road' },
  { text: 'Recebe com alegria mas não tem raiz, desiste na dificuldade', correctSoil: 'rocks' },
  { text: 'As preocupações e riquezas sufocam a Palavra', correctSoil: 'thorns' },
  { text: 'Ouve, entende e produz frutos: 30, 60 ou 100 vezes mais', correctSoil: 'good' },
  { text: 'A semente é pisoteada e os pássaros comem', correctSoil: 'road' },
  { text: 'A planta seca porque o solo é raso', correctSoil: 'rocks' },
  { text: 'Os espinhos crescem junto e sufocam', correctSoil: 'thorns' },
  { text: 'A semente cai em terra fértil e germina', correctSoil: 'good' },
  { text: 'A fé é superficial e temporária', correctSoil: 'rocks' },
  { text: 'O amor ao dinheiro impede o crescimento espiritual', correctSoil: 'thorns' },
  { text: 'A pessoa pratica o que aprendeu', correctSoil: 'good' },
  { text: 'A distração impede de guardar a Palavra no coração', correctSoil: 'road' },
];

const SOILS: { type: SoilType; emoji: string; name: string; colors: readonly [string, string] }[] = [
  { type: 'road', emoji: '🛤️', name: 'Caminho', colors: ['#78909C', '#546E7A'] as const },
  { type: 'rocks', emoji: '🪨', name: 'Pedras', colors: ['#8D6E63', '#6D4C41'] as const },
  { type: 'thorns', emoji: '🌿', name: 'Espinhos', colors: ['#7CB342', '#558B2F'] as const },
  { type: 'good', emoji: '🌾', name: 'Boa Terra', colors: ['#8B4513', '#654321'] as const },
];

const TIME_LIMIT = 90;
const ROUNDS = 10;

export default function ParablesSeedGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess, playPerfect } = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'playing' | 'done'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedSoil, setSelectedSoil] = useState<SoilType | null>(null);

  const seedAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  // Timer
  useEffect(() => {
    if (step !== 'playing' || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          setStep('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const start = () => {
    const shuffled = shuffle(QUESTIONS).slice(0, ROUNDS);
    setQuestions(shuffled);
    setCurrentQuestion(0);
    setTimeLeft(TIME_LIMIT);
    setScore(0);
    setStreak(0);
    setMistakes(0);
    setCorrect(0);
    setStartedAt(Date.now());
    setStep('playing');
    
    // Seed drop animation
    Animated.timing(seedAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  const selectSoil = (soilType: SoilType) => {
    if (step !== 'playing' || feedback) return;
    
    playTap();
    setSelectedSoil(soilType);
    
    const q = questions[currentQuestion];
    const isCorrect = soilType === q.correctSoil;
    
    if (isCorrect) {
      playSuccess();
      setCorrect(c => c + 1);
      setStreak(s => s + 1);
      const bonus = streak >= 2 ? streak * 25 : 0;
      const points = 100 + bonus + Math.floor(timeLeft / 5) * 5;
      setScore(s => s + points);
      setFeedback('correct');
      
      if (state.settings.animations) {
        setBurst(true);
        setTimeout(() => setBurst(false), 400);
      }
    } else {
      playFail();
      setMistakes(m => m + 1);
      setStreak(0);
      setFeedback('wrong');
    }
    
    // Show feedback
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(600),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    
    // Next question
    setTimeout(() => {
      setFeedback(null);
      setSelectedSoil(null);
      
      if (currentQuestion + 1 >= questions.length) {
        playPerfect();
        setStep('done');
      } else {
        setCurrentQuestion(q => q + 1);
        seedAnim.setValue(0);
        Animated.timing(seedAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      }
    }, 1200);
  };

  const handleDone = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const finalScore = Math.round(40 + (correct / ROUNDS) * 60);
    onDone({ completed: correct >= 7, score: finalScore, mistakes, seconds });
  };

  const instruction = 'O semeador saiu a semear! Leia cada descrição e escolha o solo correto: Caminho (pássaros comem), Pedras (sem raiz), Espinhos (sufocam) ou Boa Terra (produz frutos).';

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 32 }}>🌱</Text>
            <Text style={{ fontSize: 40 }}>👨‍🌾</Text>
            <Text style={{ fontSize: 32 }}>🌾</Text>
          </View>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Parábola do Semeador</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {SOILS.map(s => (
              <View key={s.type} style={{ 
                backgroundColor: s.colors[0] + '30', 
                paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600' }}>{s.emoji} {s.name}</Text>
              </View>
            ))}
          </View>
          
          <View style={{ backgroundColor: theme.colors.primary + '20', padding: 12, borderRadius: 12, width: '100%' }}>
            <Text style={{ ...theme.typography.small, textAlign: 'center', fontWeight: '700' }}>
              ⏱️ {TIME_LIMIT}s • 🎯 {ROUNDS} sementes • 🔥 Combos dão bônus!
            </Text>
          </View>
        </Card>
        <PrimaryButton title="🌱 Plantar!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    const pct = Math.round((correct / ROUNDS) * 100);
    const rating = pct >= 90 ? '🏆 MESTRE AGRICULTOR!' : pct >= 70 ? '⭐ Ótimo plantador!' : pct >= 50 ? '👍 Bom trabalho!' : '📖 Estude a parábola!';
    const won = correct >= 7;
    
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations && won} />
          <Text style={{ fontSize: 56 }}>{won ? '🌾' : '🌱'}</Text>
          <Text style={{ ...theme.typography.title, color: won ? theme.colors.ok : theme.colors.warn }}>{rating}</Text>
          
          <View style={{ backgroundColor: theme.colors.stroke, padding: 16, borderRadius: 16, width: '100%', gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>💎 Pontuação:</Text>
              <Text style={{ fontWeight: '900', color: theme.colors.primary, fontSize: 18 }}>{score}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>✅ Acertos:</Text>
              <Text style={{ fontWeight: '800', color: theme.colors.ok }}>{correct}/{ROUNDS}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>❌ Erros:</Text>
              <Text style={{ fontWeight: '800', color: mistakes > 0 ? theme.colors.bad : theme.colors.ok }}>{mistakes}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>⏱️ Tempo usado:</Text>
              <Text style={{ fontWeight: '800' }}>{TIME_LIMIT - timeLeft}s</Text>
            </View>
          </View>
        </Card>
        <PrimaryButton title="✓ Continuar" onPress={handleDone} variant="success" />
      </View>
    );
  }

  const q = questions[currentQuestion];
  const correctSoilInfo = SOILS.find(s => s.type === q?.correctSoil);

  return (
    <View style={{ gap: theme.spacing(1.5) }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ backgroundColor: timeLeft <= 15 ? theme.colors.bad : theme.colors.ok, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>⏱️ {timeLeft}s</Text>
        </View>
        <Text style={{ fontWeight: '700', color: theme.colors.muted }}>
          {currentQuestion + 1}/{questions.length}
        </Text>
        <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>💎 {score}</Text>
        </View>
      </View>

      {/* Streak indicator */}
      {streak >= 2 && (
        <View style={{ alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.colors.warn, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>🔥 Combo x{streak}!</Text>
          </View>
        </View>
      )}

      {/* Question Card - The Seed */}
      <Animated.View style={{ 
        transform: [{ 
          translateY: seedAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }),
        }],
        opacity: seedAnim,
      }}>
        <LinearGradient colors={['#FFF8E1', '#FFE0B2'] as const} style={{ 
          borderRadius: 16, padding: 20, alignItems: 'center', gap: 12,
          borderWidth: 3, borderColor: '#FFCC80',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 28 }}>🌱</Text>
            <Text style={{ fontWeight: '900', color: '#795548', fontSize: 16 }}>SEMENTE</Text>
          </View>
          
          <Text style={{ 
            textAlign: 'center', fontWeight: '600', fontSize: 15, color: '#5D4037', lineHeight: 22,
          }}>
            "{q?.text}"
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Soil Options */}
      <Text style={{ textAlign: 'center', fontWeight: '700', color: theme.colors.muted }}>
        Em qual solo essa semente caiu?
      </Text>

      <View style={{ gap: 10 }}>
        {SOILS.map(soil => {
          const isSelected = selectedSoil === soil.type;
          const isCorrect = feedback === 'correct' && isSelected;
          const isWrong = feedback === 'wrong' && isSelected;
          const showCorrect = feedback === 'wrong' && soil.type === q?.correctSoil;
          
          return (
            <Pressable 
              key={soil.type} 
              onPress={() => selectSoil(soil.type)}
              disabled={!!feedback}
              style={{ opacity: feedback && !isSelected && !showCorrect ? 0.5 : 1 }}
            >
              <LinearGradient 
                colors={showCorrect ? ['#4CAF50', '#388E3C'] as const : isWrong ? ['#F44336', '#D32F2F'] as const : soil.colors} 
                style={{ 
                  flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, gap: 14,
                  borderWidth: isCorrect || showCorrect ? 4 : 0,
                  borderColor: '#4CAF50',
                  transform: [{ scale: isSelected ? 1.02 : 1 }],
                }}
              >
                <Text style={{ fontSize: 36 }}>{soil.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{soil.name}</Text>
                  <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                    {soil.type === 'road' && 'Pássaros comem'}
                    {soil.type === 'rocks' && 'Raiz superficial'}
                    {soil.type === 'thorns' && 'Espinhos sufocam'}
                    {soil.type === 'good' && 'Produz frutos!'}
                  </Text>
                </View>
                {isCorrect && <Text style={{ fontSize: 28 }}>✅</Text>}
                {isWrong && <Text style={{ fontSize: 28 }}>❌</Text>}
                {showCorrect && <Text style={{ fontSize: 28 }}>👈</Text>}
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
