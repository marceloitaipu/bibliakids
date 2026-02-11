// Mini-game: Quiz Relâmpago da Criação
// Responda rápido! Qual dia Deus criou cada coisa?
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import ConfettiBurst from '../../components/ConfettiBurst';
import { useSfx } from '../../sfx/useSfx';
import { useApp } from '../../state/AppState';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

type Question = {
  item: string;
  emoji: string;
  correctDay: number;
  hint: string;
};

const QUESTIONS: Question[] = [
  { item: 'Luz', emoji: '💡', correctDay: 1, hint: 'Deus disse: Haja luz!' },
  { item: 'Céu (Firmamento)', emoji: '🌤️', correctDay: 2, hint: 'Separou as águas' },
  { item: 'Terra e Plantas', emoji: '🌿', correctDay: 3, hint: 'A terra seca apareceu' },
  { item: 'Sol, Lua e Estrelas', emoji: '☀️🌙⭐', correctDay: 4, hint: 'Governar dia e noite' },
  { item: 'Peixes e Aves', emoji: '🐟🦅', correctDay: 5, hint: 'Encham as águas e os céus' },
  { item: 'Animais e o Homem', emoji: '🦁👨', correctDay: 6, hint: 'À imagem de Deus' },
  { item: 'Descanso de Deus', emoji: '😴✨', correctDay: 7, hint: 'Deus abençoou este dia' },
];

const TOTAL_TIME = 45;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CreationPlaceGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess, playPerfect } = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'play' | 'done'>('intro');
  const [questions] = useState(() => shuffleArray(QUESTIONS));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [burst, setBurst] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentQ = questions[currentIdx];

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentIdx / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIdx, progressAnim, questions.length]);

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep('done');
    playPerfect();
  }, [playPerfect]);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
    playTap();
    startTimer();
  };

  const selectDay = (day: number) => {
    if (showResult || currentIdx >= questions.length || timeLeft <= 0) return;
    playTap();

    const correct = day === currentQ.correctDay;

    if (correct) {
      const points = 100 + (streak * 25) + Math.floor(timeLeft * 2);
      setScore(s => s + points);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
      setShowResult('correct');
      
      if (streak >= 2) playPerfect();
      else playSuccess();

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      if (state.settings.animations) {
        setBurst(true);
        setTimeout(() => setBurst(false), 400);
      }
    } else {
      setMistakes(m => m + 1);
      setStreak(0);
      setShowResult('wrong');
      playFail();

      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 15, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 15, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      setShowResult(null);
      if (currentIdx + 1 >= questions.length) {
        finish();
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 700);
  };

  useEffect(() => {
    if (timeLeft <= 0 && step === 'play') finish();
  }, [timeLeft, step, finish]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleDone = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = questions.length > 0 ? Math.max(0, 1 - mistakes / questions.length) : 1;
    const finalScore = Math.round(50 + accuracy * 50);
    onDone({ completed: true, score: finalScore, mistakes, seconds });
  };

  const instruction = 'Quiz Relâmpago! Em qual dia da criação Deus fez cada coisa? Quanto mais rápido, mais pontos!';

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 56 }}>⚡🌍</Text>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Quiz da Criação</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          
          <View style={{ backgroundColor: theme.colors.primary + '20', padding: 12, borderRadius: 12, width: '100%' }}>
            <Text style={{ ...theme.typography.small, textAlign: 'center', fontWeight: '700' }}>
              ⏱️ {TOTAL_TIME}s • 🎯 7 perguntas • 🔥 Combos = bônus!
            </Text>
          </View>
        </Card>
        <PrimaryButton title="⚡ Começar Quiz!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    const rating = score >= 1200 ? '🏆 MESTRE!' : score >= 800 ? '⭐ Excelente!' : score >= 500 ? '👍 Bom!' : '📚 Estude mais!';
    
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations && score >= 800} />
          <Text style={{ fontSize: 56 }}>{score >= 800 ? '🎉' : '📖'}</Text>
          <Text style={{ ...theme.typography.title, color: theme.colors.ok }}>{rating}</Text>
          
          <View style={{ backgroundColor: theme.colors.stroke, padding: 16, borderRadius: 16, width: '100%', gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>💎 Pontuação:</Text>
              <Text style={{ fontWeight: '900', color: theme.colors.primary, fontSize: 18 }}>{score}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>✓ Acertos:</Text>
              <Text style={{ fontWeight: '800', color: theme.colors.ok }}>{questions.length - mistakes}/{questions.length}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>🔥 Melhor combo:</Text>
              <Text style={{ fontWeight: '800', color: theme.colors.primary2 }}>{bestStreak}x</Text>
            </View>
          </View>
        </Card>
        <PrimaryButton title="✓ Continuar" onPress={handleDone} variant="success" />
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const timeColor = timeLeft <= 10 ? theme.colors.bad : timeLeft <= 20 ? theme.colors.warn : theme.colors.ok;

  return (
    <View style={{ gap: theme.spacing(1.5) }}>
      {/* Header: Timer + Score */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ backgroundColor: timeColor, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>⏱️ {timeLeft}s</Text>
        </View>
        {streak >= 2 && (
          <View style={{ backgroundColor: '#FF6B00', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>🔥 {streak}x</Text>
          </View>
        )}
        <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>💎 {score}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={{ height: 6, backgroundColor: theme.colors.stroke, borderRadius: 3, overflow: 'hidden' }}>
        <Animated.View style={{ height: '100%', backgroundColor: theme.colors.ok, width: progressWidth }} />
      </View>

      {/* Question Card */}
      <Animated.View style={{ transform: [{ translateX: shakeAnim }, { scale: scaleAnim }] }}>
        <LinearGradient colors={['#5B86E5', '#36D1DC'] as const} style={{ borderRadius: 20, padding: 20, alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 }}>
            Pergunta {currentIdx + 1}/{questions.length}
          </Text>
          <Text style={{ fontSize: 52, marginVertical: 8 }}>{currentQ.emoji}</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
            Em qual dia Deus criou:
          </Text>
          <Text style={{ color: '#FFD700', fontSize: 22, fontWeight: '900', marginTop: 4, textAlign: 'center' }}>
            {currentQ.item}?
          </Text>
          
          {showResult === 'wrong' && (
            <View style={{ marginTop: 10, backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontSize: 11 }}>💡 {currentQ.hint}</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Feedback */}
      {showResult && (
        <View style={{ backgroundColor: showResult === 'correct' ? theme.colors.ok : theme.colors.bad, padding: 10, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
            {showResult === 'correct' ? `✓ Correto! Dia ${currentQ.correctDay}` : `✗ Era o dia ${currentQ.correctDay}`}
          </Text>
        </View>
      )}

      {/* Day Buttons */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5, 6, 7].map(day => (
          <Pressable key={day} onPress={() => selectDay(day)} disabled={showResult !== null}
            style={{ width: day === 7 ? '66%' : '31%', opacity: showResult !== null ? 0.5 : 1 }}>
            <LinearGradient
              colors={showResult && day === currentQ.correctDay ? ['#4CAF50', '#388E3C'] as const : ['#FF9800', '#EF6C00'] as const}
              style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>{day}º</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </View>

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
