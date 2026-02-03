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

type Choice = 'left' | 'right';

const { width } = Dimensions.get('window');

export default function StarPathGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess, playPerfect } = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'play' | 'done'>('intro');
  const [idx, setIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);
  const [combo, setCombo] = useState(0);

  const starAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const path = useMemo(() => {
    const arr: Choice[] = [];
    for (let i = 0; i < 6; i++) arr.push(Math.random() > 0.5 ? 'left' : 'right');
    return arr;
  }, []);

  const instruction = 'Os Reis Magos seguem a estrela até Jesus! Escolha o caminho certo em cada passo para chegar a Belém.';

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: idx / path.length,
      useNativeDriver: false,
    }).start();
  }, [idx, path.length, progressAnim]);

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
    playTap();
    
    // Animação pulsante da estrela
    Animated.loop(
      Animated.sequence([
        Animated.timing(starAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(starAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const pick = (c: Choice) => {
    setTouches(t => t + 1);
    const correct = path[idx];
    
    if (c !== correct) {
      setMistakes(m => m + 1);
      setCombo(0);
      setLastResult('wrong');
      playFail();
      
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    } else {
      setCombo(c => c + 1);
      setLastResult('correct');
      
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

    setTimeout(() => {
      setLastResult(null);
      const next = idx + 1;
      if (next >= path.length) {
        finish();
      } else {
        setIdx(next);
      }
    }, 500);
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 36 }}>👑👑👑</Text>
            <Text style={{ fontSize: 28 }}>➡️</Text>
            <Text style={{ fontSize: 48 }}>⭐</Text>
          </View>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Seguir a Estrela</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>
            {path.length} passos até Belém!
          </Text>
        </Card>
        <PrimaryButton title="⭐ Seguir a Estrela!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations} />
          <Text style={{ fontSize: 64 }}>👶</Text>
          <Text style={{ ...theme.typography.title, color: theme.colors.ok }}>Chegaram a Belém!</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            Os Reis Magos encontraram o menino Jesus!
          </Text>
        </Card>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Determinar qual caminho é correto para dar dica visual sutil
  const correctPath = path[idx];

  return (
    <View style={{ gap: theme.spacing(1.5) }}>
      {/* Barra de Progresso */}
      <View style={{ height: 12, backgroundColor: theme.colors.stroke, borderRadius: 6, overflow: 'hidden' }}>
        <Animated.View style={{ 
          height: '100%', 
          backgroundColor: '#FFD700',
          borderRadius: 6,
          width: progressWidth,
        }} />
      </View>

      {/* Status */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ ...theme.typography.subtitle }}>
          📍 Passo {idx + 1}/{path.length}
        </Text>
        {combo >= 2 && (
          <View style={{ backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: '#333', fontWeight: '800', fontSize: 12 }}>⭐ Combo x{combo}!</Text>
          </View>
        )}
      </View>

      {/* Céu Noturno com Estrela */}
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460'] as const}
          style={{ 
            borderRadius: 20, 
            padding: 24,
            alignItems: 'center',
            minHeight: 180,
            justifyContent: 'center',
          }}
        >
          {/* Estrelinhas de fundo */}
          <View style={{ position: 'absolute', top: 20, left: 30 }}>
            <Text style={{ fontSize: 12, opacity: 0.5 }}>✨</Text>
          </View>
          <View style={{ position: 'absolute', top: 40, right: 40 }}>
            <Text style={{ fontSize: 10, opacity: 0.4 }}>✨</Text>
          </View>
          <View style={{ position: 'absolute', bottom: 30, left: 50 }}>
            <Text style={{ fontSize: 8, opacity: 0.3 }}>✨</Text>
          </View>
          <View style={{ position: 'absolute', bottom: 50, right: 60 }}>
            <Text style={{ fontSize: 14, opacity: 0.4 }}>✨</Text>
          </View>

          {/* Estrela Principal */}
          <Animated.Text style={{ 
            fontSize: 72, 
            transform: [{ scale: starAnim }],
            textShadowColor: '#FFD700',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 20,
          }}>
            ⭐
          </Animated.Text>

          {/* Feedback Visual */}
          {lastResult && (
            <View style={{ 
              position: 'absolute', 
              bottom: 20,
              backgroundColor: lastResult === 'correct' ? theme.colors.ok : theme.colors.bad,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>
                {lastResult === 'correct' ? '✓ Caminho certo!' : '✗ Tente o outro lado!'}
              </Text>
            </View>
          )}

          {/* Reis Magos */}
          <View style={{ position: 'absolute', bottom: 10 }}>
            <Text style={{ fontSize: 24 }}>👑👑👑🐫</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Texto de Instrução */}
      <Card style={{ padding: 12 }}>
        <Text style={{ ...theme.typography.body, textAlign: 'center' }}>
          Para onde a estrela guia? 🤔
        </Text>
      </Card>

      {/* Botões de Escolha */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable 
          onPress={() => pick('left')} 
          style={{ flex: 1 }}
          disabled={lastResult !== null}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2'] as const}
            style={{
              borderRadius: 20,
              paddingVertical: 20,
              alignItems: 'center',
              opacity: lastResult !== null ? 0.5 : 1,
              borderWidth: 3,
              borderColor: correctPath === 'left' ? '#FFD700' : 'transparent',
            }}
          >
            <Text style={{ fontSize: 36 }}>⬅️</Text>
            <Text style={{ 
              color: '#fff', 
              fontWeight: '800', 
              fontSize: 16,
              marginTop: 4,
            }}>
              Esquerda
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable 
          onPress={() => pick('right')} 
          style={{ flex: 1 }}
          disabled={lastResult !== null}
        >
          <LinearGradient
            colors={['#f093fb', '#f5576c'] as const}
            style={{
              borderRadius: 20,
              paddingVertical: 20,
              alignItems: 'center',
              opacity: lastResult !== null ? 0.5 : 1,
              borderWidth: 3,
              borderColor: correctPath === 'right' ? '#FFD700' : 'transparent',
            }}
          >
            <Text style={{ fontSize: 36 }}>➡️</Text>
            <Text style={{ 
              color: '#fff', 
              fontWeight: '800', 
              fontSize: 16,
              marginTop: 4,
            }}>
              Direita
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {mistakes > 0 && (
        <Text style={{ ...theme.typography.small, color: theme.colors.muted, textAlign: 'center' }}>
          Erros: {mistakes} • Observe o brilho da estrela para a dica!
        </Text>
      )}

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
