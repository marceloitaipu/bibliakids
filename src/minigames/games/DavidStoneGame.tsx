// Mini-game: Davi e Golias - Mira no Alvo!
// Acerte o alvo com timing perfeito para derrotar Golias
import React, { useState, useRef, useEffect, useCallback } from 'react';
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

const { width } = Dimensions.get('window');
const TARGET_SIZE = 180;
const ROUNDS = 5;

type HitZone = 'bullseye' | 'inner' | 'outer' | 'miss';

export default function DavidStoneGame({
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
  const [hits, setHits] = useState<HitZone[]>([]);
  const [lastHit, setLastHit] = useState<{ zone: HitZone; points: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [speed, setSpeed] = useState(2000); // ms for full oscillation

  const cursorAnim = useRef(new Animated.Value(0)).current;
  const stoneAnim = useRef(new Animated.Value(0)).current;
  const goliasAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const startOscillation = useCallback(() => {
    cursorAnim.setValue(0);
    animRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, { toValue: 1, duration: speed / 2, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 0, duration: speed / 2, easing: Easing.linear, useNativeDriver: true }),
      ])
    );
    animRef.current.start();
  }, [cursorAnim, speed]);

  const stopOscillation = () => {
    if (animRef.current) animRef.current.stop();
  };

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
    playTap();
    startOscillation();
  };

  const calculateHitZone = (position: number): HitZone => {
    // position is 0-1, center is 0.5
    const distFromCenter = Math.abs(position - 0.5);
    if (distFromCenter < 0.08) return 'bullseye'; // 16% center
    if (distFromCenter < 0.18) return 'inner';    // next 20%
    if (distFromCenter < 0.35) return 'outer';    // next 34%
    return 'miss';
  };

  const getPoints = (zone: HitZone): number => {
    switch (zone) {
      case 'bullseye': return 500;
      case 'inner': return 300;
      case 'outer': return 100;
      case 'miss': return 0;
    }
  };

  const throwStone = () => {
    if (isAnimating || round >= ROUNDS) return;
    
    stopOscillation();
    setIsAnimating(true);
    playTap();

    // Get current cursor position
    const currentPosition = (cursorAnim as any)._value || 0;
    const zone = calculateHitZone(currentPosition);
    const points = getPoints(zone);

    setLastHit({ zone, points });
    setHits(h => [...h, zone]);
    setScore(s => s + points);

    // Stone throwing animation
    Animated.timing(stoneAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      if (zone === 'bullseye') {
        playPerfect();
        // Golias falls!
        Animated.timing(goliasAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
        
        if (state.settings.animations) {
          setBurst(true);
          setTimeout(() => setBurst(false), 600);
        }
      } else if (zone !== 'miss') {
        playSuccess();
        // Shake Golias
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      } else {
        playFail();
      }

      // Reset for next round
      setTimeout(() => {
        stoneAnim.setValue(0);
        goliasAnim.setValue(1);
        setLastHit(null);
        
        const nextRound = round + 1;
        setRound(nextRound);

        if (nextRound >= ROUNDS) {
          setStep('done');
          playPerfect();
        } else {
          // Increase speed each round
          setSpeed(s => Math.max(800, s - 200));
          setIsAnimating(false);
          startOscillation();
        }
      }, 1200);
    });
  };

  useEffect(() => {
    return () => stopOscillation();
  }, []);

  const handleDone = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const bullseyes = hits.filter(h => h === 'bullseye').length;
    const accuracy = hits.length > 0 ? (hits.filter(h => h !== 'miss').length / hits.length) : 0;
    const finalScore = Math.round(50 + accuracy * 50);
    onDone({ completed: true, score: finalScore, mistakes: hits.filter(h => h === 'miss').length, seconds });
  };

  const instruction = 'Mire no alvo! Golias está se movendo - acerte o momento perfeito para lançar a pedra de Davi e derrubar o gigante!';

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 40 }}>👦🎯</Text>
            <Text style={{ fontSize: 50 }}>👹</Text>
          </View>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Davi vs Golias</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          
          <View style={{ backgroundColor: theme.colors.primary + '20', padding: 12, borderRadius: 12, width: '100%' }}>
            <Text style={{ ...theme.typography.small, textAlign: 'center', fontWeight: '700' }}>
              🎯 {ROUNDS} lançamentos • 🏆 Bullseye = 500 pts • ⚡ Fica mais rápido!
            </Text>
          </View>
        </Card>
        <PrimaryButton title="🎯 Lançar Pedra!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    const bullseyes = hits.filter(h => h === 'bullseye').length;
    const rating = score >= 2000 ? '🏆 LENDÁRIO!' : score >= 1500 ? '⭐ Excelente!' : score >= 1000 ? '👍 Bom!' : '💪 Continue treinando!';
    
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations && score >= 1500} />
          <Text style={{ fontSize: 56 }}>{score >= 1500 ? '🏆' : '⚔️'}</Text>
          <Text style={{ ...theme.typography.title, color: theme.colors.ok }}>{rating}</Text>
          
          <View style={{ backgroundColor: theme.colors.stroke, padding: 16, borderRadius: 16, width: '100%', gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>💎 Pontuação:</Text>
              <Text style={{ fontWeight: '900', color: theme.colors.primary, fontSize: 18 }}>{score}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>🎯 Bullseyes:</Text>
              <Text style={{ fontWeight: '800', color: theme.colors.ok }}>{bullseyes}/{ROUNDS}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>❌ Erros:</Text>
              <Text style={{ fontWeight: '800', color: theme.colors.bad }}>{hits.filter(h => h === 'miss').length}</Text>
            </View>
          </View>
          
          {/* Hit history */}
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
            {hits.map((hit, i) => (
              <View key={i} style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: hit === 'bullseye' ? '#FFD700' : hit === 'inner' ? theme.colors.ok : hit === 'outer' ? theme.colors.warn : theme.colors.bad,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 12 }}>{hit === 'bullseye' ? '🎯' : hit === 'miss' ? '❌' : '✓'}</Text>
              </View>
            ))}
          </View>
        </Card>
        <PrimaryButton title="✓ Continuar" onPress={handleDone} variant="success" />
      </View>
    );
  }

  const cursorPosition = cursorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TARGET_SIZE - 20],
  });

  const stoneY = stoneAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -150],
  });

  const stoneScale = stoneAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.5, 0.3],
  });

  return (
    <View style={{ gap: theme.spacing(1.5) }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>🎯 {round + 1}/{ROUNDS}</Text>
        </View>
        <View style={{ backgroundColor: theme.colors.ok, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>💎 {score}</Text>
        </View>
      </View>

      {/* Target Area */}
      <LinearGradient colors={['#87CEEB', '#90EE90'] as const} style={{ 
        borderRadius: 20, padding: 20, alignItems: 'center', minHeight: 220,
      }}>
        {/* Golias */}
        <Animated.View style={{ 
          transform: [{ translateX: shakeAnim }, { scale: goliasAnim }],
          opacity: goliasAnim,
        }}>
          <Text style={{ fontSize: 80 }}>👹</Text>
        </Animated.View>

        {/* Target zones visualization */}
        <View style={{ position: 'absolute', bottom: 20, width: TARGET_SIZE, height: 50 }}>
          {/* Zones background */}
          <View style={{ flexDirection: 'row', height: 30, borderRadius: 15, overflow: 'hidden' }}>
            <View style={{ flex: 1, backgroundColor: '#ff6b6b' }} />
            <View style={{ flex: 0.7, backgroundColor: '#ffa726' }} />
            <View style={{ flex: 0.4, backgroundColor: '#66bb6a' }} />
            <View style={{ flex: 0.3, backgroundColor: '#FFD700' }} />
            <View style={{ flex: 0.3, backgroundColor: '#FFD700' }} />
            <View style={{ flex: 0.4, backgroundColor: '#66bb6a' }} />
            <View style={{ flex: 0.7, backgroundColor: '#ffa726' }} />
            <View style={{ flex: 1, backgroundColor: '#ff6b6b' }} />
          </View>
          
          {/* Moving cursor */}
          <Animated.View style={{
            position: 'absolute',
            top: 0,
            left: cursorPosition,
            width: 20,
            height: 40,
            backgroundColor: '#333',
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 14 }}>▼</Text>
          </Animated.View>
        </View>

        {/* Flying stone */}
        {isAnimating && (
          <Animated.View style={{
            position: 'absolute',
            bottom: 80,
            transform: [{ translateY: stoneY }, { scale: stoneScale }],
          }}>
            <Text style={{ fontSize: 32 }}>🪨</Text>
          </Animated.View>
        )}
      </LinearGradient>

      {/* Last hit feedback */}
      {lastHit && (
        <View style={{ 
          backgroundColor: lastHit.zone === 'bullseye' ? '#FFD700' : lastHit.zone === 'miss' ? theme.colors.bad : theme.colors.ok,
          padding: 12, borderRadius: 12, alignItems: 'center',
        }}>
          <Text style={{ color: lastHit.zone === 'bullseye' ? '#333' : '#fff', fontWeight: '900', fontSize: 18 }}>
            {lastHit.zone === 'bullseye' ? '🎯 BULLSEYE!' : lastHit.zone === 'inner' ? '✓ Bom acerto!' : lastHit.zone === 'outer' ? '👍 Acertou!' : '❌ Errou!'} 
            {lastHit.points > 0 && ` +${lastHit.points}`}
          </Text>
        </View>
      )}

      {/* Throw button */}
      <Pressable 
        onPress={throwStone} 
        disabled={isAnimating}
        style={{ opacity: isAnimating ? 0.5 : 1 }}
      >
        <LinearGradient colors={['#FF6B00', '#FF8C00'] as const} style={{
          borderRadius: 20, paddingVertical: 20, alignItems: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>
            {isAnimating ? '⏳ Aguarde...' : '🪨 LANÇAR!'}
          </Text>
        </LinearGradient>
      </Pressable>

      {/* Davi */}
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 40 }}>👦</Text>
        <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>Davi está pronto!</Text>
      </View>

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
