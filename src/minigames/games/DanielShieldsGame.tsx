import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
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

const GRID_SIZE = 9;
const { width } = Dimensions.get('window');
const cellSize = Math.min(80, (width - 80) / 3);

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
  const [activeLion, setActiveLion] = useState<number | null>(null);
  const [shielded, setShielded] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [combo, setCombo] = useState(0);
  const [burst, setBurst] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);

  const rounds = 6;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const lionAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const lionTargets = useMemo(() => {
    const positions = Array.from({ length: GRID_SIZE }, (_, i) => i);
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    return positions.slice(0, rounds);
  }, []);

  const instruction = 'Daniel está na cova dos leões! Toque rápido no leão para criar um escudo de luz e protegê-lo!';

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: round / rounds,
      useNativeDriver: false,
    }).start();
  }, [round, progressAnim]);

  const showNextLion = useCallback(() => {
    if (round >= rounds) {
      finish();
      return;
    }
    setActiveLion(lionTargets[round]);
    setTimeLeft(3);
    
    // Animação do leão aparecendo
    Animated.sequence([
      Animated.timing(lionAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Timer de 3 segundos
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Tempo esgotou - conta como erro
          if (timerRef.current) clearInterval(timerRef.current);
          setMistakes(m => m + 1);
          setCombo(0);
          playFail();
          const nextRound = round + 1;
          setRound(nextRound);
          if (nextRound >= rounds) {
            finish();
          } else {
            setTimeout(() => {
              setActiveLion(lionTargets[nextRound]);
              setTimeLeft(3);
            }, 500);
          }
          return 3;
        }
        return t - 1;
      });
    }, 1000);
  }, [round, rounds, lionTargets, lionAnim, playFail]);

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
    playTap();
    showNextLion();
  };

  const tap = (idx: number) => {
    if (activeLion === null || step !== 'play') return;
    setTouches(t => t + 1);
    
    if (idx !== activeLion) {
      setMistakes(m => m + 1);
      setCombo(0);
      playFail();
      return;
    }

    // Acerto!
    if (timerRef.current) clearInterval(timerRef.current);
    setShielded(s => new Set(s).add(idx));
    setCombo(c => c + 1);
    
    if (combo >= 2) {
      playPerfect();
    } else {
      playSuccess();
    }

    if (state.settings.animations) {
      setBurst(true);
      setTimeout(() => setBurst(false), 500);
    }

    const nextRound = round + 1;
    setRound(nextRound);
    
    if (nextRound >= rounds) {
      setTimeout(() => finish(), 500);
    } else {
      setActiveLion(null);
      setTimeout(() => {
        setActiveLion(lionTargets[nextRound]);
        setTimeLeft(3);
        
        // Novo timer
        timerRef.current = setInterval(() => {
          setTimeLeft(t => {
            if (t <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              setMistakes(m => m + 1);
              setCombo(0);
              playFail();
              return 3;
            }
            return t - 1;
          });
        }, 1000);
      }, 600);
    }
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = touches > 0 ? Math.max(0, 1 - mistakes / touches) : 1;
    const score = Math.round(55 + accuracy * 45);
    playPerfect();
    onDone({ completed: true, score, mistakes, seconds });
    setStep('done');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 48 }}>👨</Text>
            <Text style={{ fontSize: 36 }}>🦁🦁🦁</Text>
          </View>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Daniel na Cova</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>
            ⏱️ Você tem 3 segundos por leão!
          </Text>
        </Card>
        <PrimaryButton title="🛡️ Proteger Daniel!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations} />
          <Text style={{ fontSize: 64 }}>😇</Text>
          <Text style={{ ...theme.typography.title, color: theme.colors.ok }}>Daniel Protegido!</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            A fé de Daniel fechou a boca dos leões!
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
          🛡️ {round}/{rounds} leões
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {combo >= 2 && (
            <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>🔥 x{combo}</Text>
            </View>
          )}
          <View style={{ 
            backgroundColor: timeLeft <= 1 ? theme.colors.bad : theme.colors.primary2, 
            paddingHorizontal: 12, 
            paddingVertical: 4, 
            borderRadius: 12 
          }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>⏱️ {timeLeft}s</Text>
          </View>
        </View>
      </View>

      {/* Daniel no centro */}
      <LinearGradient
        colors={['#2C1810', '#4A3728'] as const}
        style={{ 
          borderRadius: 20, 
          padding: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 12, color: '#D4A574', fontWeight: '800', marginBottom: 4 }}>
          🕯️ COVA DOS LEÕES 🕯️
        </Text>
        
        {/* Grid 3x3 */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          width: cellSize * 3 + 16,
          justifyContent: 'center',
          gap: 8,
        }}>
          {Array.from({ length: GRID_SIZE }).map((_, idx) => {
            const isLion = idx === activeLion;
            const isShield = shielded.has(idx);
            const isDaniel = idx === 4; // Centro

            return (
              <Pressable
                key={idx}
                onPress={() => tap(idx)}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderWidth: 3,
                  borderColor: isLion ? '#FF6B6B' : isShield ? theme.colors.ok : '#6B4423',
                  backgroundColor: isShield ? '#E8F5E9' : '#3D2914',
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDaniel && !isLion && !isShield && (
                  <Text style={{ fontSize: 32 }}>👨</Text>
                )}
                {isLion && (
                  <Animated.Text style={{ 
                    fontSize: 40,
                    transform: [{ scale: lionAnim }],
                  }}>
                    🦁
                  </Animated.Text>
                )}
                {isShield && (
                  <Text style={{ fontSize: 32 }}>🛡️</Text>
                )}
                {!isDaniel && !isLion && !isShield && (
                  <Text style={{ fontSize: 20, opacity: 0.3 }}>✨</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      {/* Instrução */}
      <Card style={{ padding: 12 }}>
        <Text style={{ ...theme.typography.small, textAlign: 'center', color: theme.colors.muted }}>
          {activeLion !== null 
            ? '👆 Toque rápido no leão para criar um escudo!'
            : '⏳ Preparando próximo leão...'}
        </Text>
      </Card>

      {mistakes > 0 && (
        <Text style={{ ...theme.typography.small, color: theme.colors.muted, textAlign: 'center' }}>
          Erros: {mistakes} • Foque no leão que aparece!
        </Text>
      )}

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
