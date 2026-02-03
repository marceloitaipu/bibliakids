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

type Lane = 0 | 1 | 2;

function randLane(): Lane {
  return Math.floor(Math.random() * 3) as Lane;
}

const { width } = Dimensions.get('window');
const laneHeight = 70;

export default function JonahGuideGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess, playPerfect } = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'play' | 'done'>('intro');
  const [lane, setLane] = useState<Lane>(1);
  const [pos, setPos] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [hitEffect, setHitEffect] = useState(false);
  const [combo, setCombo] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fishAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const obstacles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      arr.push({ at: (i + 1) * 10, lane: randLane() });
    }
    return arr;
  }, []);

  const instruction = 'Guie o grande peixe para salvar Jonas! Desvie das algas tocando nas setas para mudar de pista.';

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: pos / 100,
      useNativeDriver: false,
    }).start();
  }, [pos, progressAnim]);

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
    playTap();
  };

  const move = (dir: -1 | 1) => {
    setTouches(t => t + 1);
    playTap();
    
    setLane(l => {
      const next = (l + dir) as Lane;
      if (next < 0 || next > 2) return l;
      return next;
    });

    // Animação do peixe
    Animated.sequence([
      Animated.timing(fishAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(fishAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const tick = () => {
    const nextPos = pos + 10;
    const hit = obstacles.some(o => o.at === nextPos && o.lane === lane);
    
    if (hit) {
      setMistakes(m => m + 1);
      setCombo(0);
      setHitEffect(true);
      playFail();
      
      // Animação de shake
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      
      setTimeout(() => setHitEffect(false), 300);
    } else {
      setCombo(c => c + 1);
      if (combo >= 2) {
        playPerfect();
      } else {
        playSuccess();
      }
      
      if (state.settings.animations) {
        setBurst(true);
        setTimeout(() => setBurst(false), 400);
      }
    }

    setPos(nextPos);
    if (nextPos >= 100) finish();
  };

  const finish = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = Math.max(0, 1 - mistakes / 8);
    const score = Math.round(55 + accuracy * 45);
    playPerfect();
    onDone({ completed: true, score, mistakes, seconds });
    setStep('done');
  };

  const laneLabel = lane === 0 ? 'Topo' : lane === 1 ? 'Meio' : 'Fundo';

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 48 }}>🐋</Text>
            <Text style={{ fontSize: 28 }}>💨</Text>
            <Text style={{ fontSize: 40 }}>👨</Text>
          </View>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Jonas e o Grande Peixe</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <Text style={{ fontSize: 24 }}>⬆️ Subir</Text>
            <Text style={{ fontSize: 24 }}>🌿 Algas</Text>
            <Text style={{ fontSize: 24 }}>⬇️ Descer</Text>
          </View>
        </Card>
        <PrimaryButton title="🐋 Iniciar Jornada!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations} />
          <Text style={{ fontSize: 64 }}>🏖️</Text>
          <Text style={{ ...theme.typography.title, color: theme.colors.ok }}>Jonas Salvo!</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            O peixe levou Jonas em segurança até a praia!
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
      <View style={{ height: 16, backgroundColor: theme.colors.stroke, borderRadius: 8, overflow: 'hidden' }}>
        <Animated.View style={{ 
          height: '100%', 
          backgroundColor: theme.colors.ok,
          borderRadius: 8,
          width: progressWidth,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 4,
        }}>
          <Text style={{ fontSize: 12 }}>🐋</Text>
        </Animated.View>
        <View style={{ position: 'absolute', right: 8, top: 0, bottom: 0, justifyContent: 'center' }}>
          <Text style={{ fontSize: 14 }}>🏖️</Text>
        </View>
      </View>

      {/* Status */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ ...theme.typography.subtitle }}>
          📍 {pos}% • Pista: {laneLabel}
        </Text>
        {combo >= 3 && (
          <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>🔥 Combo x{combo}!</Text>
          </View>
        )}
      </View>

      {/* Oceano com 3 Pistas */}
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <LinearGradient
          colors={['#0077B6', '#00B4D8', '#48CAE4'] as const}
          style={{ 
            borderRadius: 20, 
            overflow: 'hidden',
          }}
        >
          {[0, 1, 2].map(l => {
            const thisLane = l as Lane;
            const hasObstacleAhead = obstacles.some(o => o.at === pos + 10 && o.lane === thisLane);
            const isFish = lane === thisLane;
            const hasJonas = pos >= 90 && isFish;
            
            return (
              <View
                key={l}
                style={{
                  height: laneHeight,
                  borderBottomWidth: l < 2 ? 2 : 0,
                  borderBottomColor: 'rgba(255,255,255,0.3)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  justifyContent: 'space-between',
                  backgroundColor: isFish ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
              >
                {/* Peixe/Jonas */}
                <View style={{ width: 60 }}>
                  {isFish && (
                    <Animated.Text style={{ 
                      fontSize: 40, 
                      transform: [{ scale: fishAnim }],
                    }}>
                      {hasJonas ? '🐋👨' : '🐋'}
                    </Animated.Text>
                  )}
                </View>

                {/* Nome da pista */}
                <Text style={{ 
                  color: '#fff', 
                  fontWeight: '800', 
                  fontSize: 14,
                  textShadowColor: 'rgba(0,0,0,0.3)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}>
                  {l === 0 ? '🔝 Topo' : l === 1 ? '➡️ Meio' : '⬇️ Fundo'}
                </Text>

                {/* Obstáculo */}
                <View style={{ width: 60, alignItems: 'flex-end' }}>
                  {hasObstacleAhead && (
                    <Text style={{ fontSize: 36 }}>🌿</Text>
                  )}
                </View>
              </View>
            );
          })}
        </LinearGradient>
      </Animated.View>

      {/* Efeito de Colisão */}
      {hitEffect && (
        <Card style={{ 
          backgroundColor: theme.colors.bad + '20', 
          borderColor: theme.colors.bad,
          padding: 10,
        }}>
          <Text style={{ ...theme.typography.small, color: theme.colors.bad, textAlign: 'center', fontWeight: '700' }}>
            💥 Bateu nas algas! Erros: {mistakes}
          </Text>
        </Card>
      )}

      {/* Controles */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable 
          onPress={() => move(-1)} 
          style={{ 
            flex: 1, 
            backgroundColor: lane === 0 ? theme.colors.stroke : theme.colors.primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: lane === 0 ? 0.5 : 1,
          }}
        >
          <Text style={{ fontSize: 28 }}>⬆️</Text>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>SUBIR</Text>
        </Pressable>

        <Pressable 
          onPress={tick} 
          style={{ 
            flex: 1.5, 
            backgroundColor: theme.colors.ok,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 28 }}>➡️</Text>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>NADAR</Text>
        </Pressable>

        <Pressable 
          onPress={() => move(1)} 
          style={{ 
            flex: 1, 
            backgroundColor: lane === 2 ? theme.colors.stroke : theme.colors.primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: lane === 2 ? 0.5 : 1,
          }}
        >
          <Text style={{ fontSize: 28 }}>⬇️</Text>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>DESCER</Text>
        </Pressable>
      </View>

      {/* Dica */}
      <Text style={{ ...theme.typography.small, color: theme.colors.muted, textAlign: 'center' }}>
        💡 Veja as algas 🌿 e mude de pista antes de nadar!
      </Text>

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
