// Mini-game: Daniel na Cova - Reflexo Rápido!
// Proteja Daniel dos leões que atacam de diferentes direções
import React, { useState, useRef, useEffect, useCallback } from 'react';
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

type Direction = 'up' | 'down' | 'left' | 'right';

const { width } = Dimensions.get('window');
const TOTAL_ROUNDS = 15;
const INITIAL_TIME = 2000; // ms to react
const MIN_TIME = 600;

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

export default function DanielShieldsGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess, playPerfect } = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'play' | 'done'>('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentDir, setCurrentDir] = useState<Direction | null>(null);
  const [reactionTime, setReactionTime] = useState(INITIAL_TIME);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [burst, setBurst] = useState(false);
  const [canTap, setCanTap] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lionAnim = useRef(new Animated.Value(0)).current;
  const danielAnim = useRef(new Animated.Value(1)).current;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    clearTimer();
    setStep('done');
    playPerfect();
  }, [clearTimer, playPerfect]);

  const nextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS || lives <= 0) {
      finish();
      return;
    }

    // Pick random direction
    const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    setCurrentDir(dir);
    setShowResult(null);
    setCanTap(true);
    setRoundStartTime(Date.now());

    // Animate lion appearing
    Animated.spring(lionAnim, { toValue: 1, useNativeDriver: true }).start();

    // Start timeout
    timerRef.current = setTimeout(() => {
      // Time's up!
      setCanTap(false);
      setShowResult('timeout');
      setLives(l => l - 1);
      setStreak(0);
      playFail();

      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 20, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -20, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        lionAnim.setValue(0);
        setRound(r => r + 1);
        if (lives - 1 > 0 && round + 1 < TOTAL_ROUNDS) {
          nextRound();
        } else {
          finish();
        }
      }, 800);
    }, reactionTime);
  }, [round, lives, reactionTime, lionAnim, shakeAnim, playFail, finish]);

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
    playTap();
    setTimeout(() => nextRound(), 500);
  };

  const tapDirection = (tappedDir: Direction) => {
    if (!canTap || !currentDir) return;
    
    clearTimer();
    setCanTap(false);
    playTap();

    const reactionMs = Date.now() - roundStartTime;
    
    if (tappedDir === currentDir) {
      // Correct!
      const timeBonus = Math.max(0, reactionTime - reactionMs);
      const points = 100 + Math.floor(timeBonus / 10) + (streak * 20);
      setScore(s => s + points);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
      setShowResult('correct');

      if (streak >= 4) playPerfect();
      else playSuccess();

      // Shield animation
      Animated.sequence([
        Animated.timing(danielAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(danielAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      if (state.settings.animations && streak >= 2) {
        setBurst(true);
        setTimeout(() => setBurst(false), 300);
      }

      // Speed up
      setReactionTime(t => Math.max(MIN_TIME, t - 80));
    } else {
      // Wrong direction!
      setLives(l => l - 1);
      setStreak(0);
      setShowResult('wrong');
      playFail();

      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 15, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      lionAnim.setValue(0);
      setRound(r => r + 1);
      
      if (lives <= (showResult === 'wrong' ? 1 : 0) || round + 1 >= TOTAL_ROUNDS) {
        finish();
      } else {
        nextRound();
      }
    }, 600);
  };

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const handleDone = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = round > 0 ? Math.max(0, (round - (3 - lives)) / round) : 0;
    const finalScore = Math.round(50 + accuracy * 50);
    onDone({ completed: lives > 0, score: finalScore, mistakes: 3 - lives, seconds });
  };

  const instruction = 'Proteja Daniel dos leões! Quando um leão aparecer, toque rapidamente na direção dele para criar um escudo de fé. Não deixe ele atacar!';

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 40 }}>🦁</Text>
            <Text style={{ fontSize: 50 }}>👨🛡️</Text>
            <Text style={{ fontSize: 40 }}>🦁</Text>
          </View>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Daniel na Cova</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          
          <View style={{ backgroundColor: theme.colors.primary + '20', padding: 12, borderRadius: 12, width: '100%' }}>
            <Text style={{ ...theme.typography.small, textAlign: 'center', fontWeight: '700' }}>
              ❤️ 3 vidas • 🦁 {TOTAL_ROUNDS} leões • ⚡ Fica mais rápido!
            </Text>
          </View>
        </Card>
        <PrimaryButton title="🛡️ Proteger Daniel!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    const survived = lives > 0;
    const rating = survived && bestStreak >= 10 ? '🏆 HERÓI DA FÉ!' : survived && bestStreak >= 5 ? '⭐ Corajoso!' : survived ? '👍 Sobreviveu!' : '😔 Tente novamente!';
    
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations && survived} />
          <Text style={{ fontSize: 56 }}>{survived ? '😇' : '🦁'}</Text>
          <Text style={{ ...theme.typography.title, color: survived ? theme.colors.ok : theme.colors.warn }}>{rating}</Text>
          
          <View style={{ backgroundColor: theme.colors.stroke, padding: 16, borderRadius: 16, width: '100%', gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>💎 Pontuação:</Text>
              <Text style={{ fontWeight: '900', color: theme.colors.primary, fontSize: 18 }}>{score}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>🛡️ Leões bloqueados:</Text>
              <Text style={{ fontWeight: '800', color: theme.colors.ok }}>{round - (3 - lives)}/{round}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>🔥 Melhor sequência:</Text>
              <Text style={{ fontWeight: '800', color: theme.colors.primary2 }}>{bestStreak}x</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>❤️ Vidas restantes:</Text>
              <Text style={{ fontWeight: '800', color: lives > 0 ? theme.colors.ok : theme.colors.bad }}>{lives}/3</Text>
            </View>
          </View>
        </Card>
        <PrimaryButton title="✓ Continuar" onPress={handleDone} variant="success" />
      </View>
    );
  }

  const dirEmoji: Record<Direction, string> = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };

  const handleTouch = (e: any) => {
    if (!canTap) return;
    const { locationX, locationY } = e.nativeEvent;
    const centerX = 150; // Approximate center
    const centerY = 100;
    const dx = locationX - centerX;
    const dy = locationY - centerY;
    
    // Determine which direction based on touch position
    let dir: Direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }
    tapDirection(dir);
  };

  return (
    <View style={{ gap: theme.spacing(1.5) }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[...Array(3)].map((_, i) => (
            <Text key={i} style={{ fontSize: 20, opacity: i < lives ? 1 : 0.3 }}>❤️</Text>
          ))}
        </View>
        {streak >= 3 && (
          <View style={{ backgroundColor: '#FF6B00', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>🔥 {streak}x</Text>
          </View>
        )}
        <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>💎 {score}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={{ height: 6, backgroundColor: theme.colors.stroke, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ height: '100%', backgroundColor: theme.colors.ok, width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
      </View>

      {/* Arena - Toque na direção do leão */}
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <Pressable onPress={handleTouch}>
          <LinearGradient colors={['#2C1810', '#4A3728'] as const} style={{ 
            borderRadius: 20, padding: 16, alignItems: 'center', minHeight: 200,
          }}>
          {/* Lions from each direction */}
          <View style={{ position: 'absolute', top: 10, left: '50%', marginLeft: -20 }}>
            <Animated.Text style={{ 
              fontSize: 40, 
              opacity: currentDir === 'up' ? lionAnim : 0.2,
              transform: [{ scale: currentDir === 'up' ? lionAnim : 0.8 }],
            }}>🦁</Animated.Text>
          </View>
          <View style={{ position: 'absolute', bottom: 10, left: '50%', marginLeft: -20 }}>
            <Animated.Text style={{ 
              fontSize: 40, 
              opacity: currentDir === 'down' ? lionAnim : 0.2,
              transform: [{ scale: currentDir === 'down' ? lionAnim : 0.8 }, { rotate: '180deg' }],
            }}>🦁</Animated.Text>
          </View>
          <View style={{ position: 'absolute', left: 10, top: '50%', marginTop: -20 }}>
            <Animated.Text style={{ 
              fontSize: 40, 
              opacity: currentDir === 'left' ? lionAnim : 0.2,
              transform: [{ scale: currentDir === 'left' ? lionAnim : 0.8 }],
            }}>🦁</Animated.Text>
          </View>
          <View style={{ position: 'absolute', right: 10, top: '50%', marginTop: -20 }}>
            <Animated.Text style={{ 
              fontSize: 40, 
              opacity: currentDir === 'right' ? lionAnim : 0.2,
              transform: [{ scale: currentDir === 'right' ? lionAnim : 0.8 }, { scaleX: -1 }],
            }}>🦁</Animated.Text>
          </View>

          {/* Daniel in center */}
          <Animated.View style={{ transform: [{ scale: danielAnim }] }}>
            <Text style={{ fontSize: 60, marginTop: 50 }}>👨</Text>
          </Animated.View>

          {/* Result feedback */}
          {showResult && (
            <View style={{
              position: 'absolute', bottom: 20,
              backgroundColor: showResult === 'correct' ? theme.colors.ok : theme.colors.bad,
              paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12,
            }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>
                {showResult === 'correct' ? '🛡️ Protegido!' : showResult === 'wrong' ? '❌ Direção errada!' : '⏰ Muito lento!'}
              </Text>
            </View>
          )}

          {/* Touch zone hints */}
          <View style={{ position: 'absolute', top: 5, alignItems: 'center', opacity: 0.4 }}>
            <Text style={{ color: '#fff', fontSize: 10 }}>⬆️ CIMA</Text>
          </View>
          <View style={{ position: 'absolute', bottom: 5, alignItems: 'center', opacity: 0.4 }}>
            <Text style={{ color: '#fff', fontSize: 10 }}>⬇️ BAIXO</Text>
          </View>
          <View style={{ position: 'absolute', left: 5, top: '50%', opacity: 0.4 }}>
            <Text style={{ color: '#fff', fontSize: 10 }}>⬅️</Text>
          </View>
          <View style={{ position: 'absolute', right: 5, top: '50%', opacity: 0.4 }}>
            <Text style={{ color: '#fff', fontSize: 10 }}>➡️</Text>
          </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Text style={{ ...theme.typography.small, color: theme.colors.muted, textAlign: 'center' }}>
        👆 Toque na direção do leão para bloquear!
      </Text>

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
