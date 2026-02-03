// Mini-game: Reis Magos - Simon Says com a Estrela!
// Memorize a sequência de direções que a estrela mostra
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

type Direction = 'up' | 'down' | 'left' | 'right';

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];
const MAX_LEVEL = 10;

export default function StarPathGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess, playPerfect } = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'showing' | 'playing' | 'done'>('intro');
  const [sequence, setSequence] = useState<Direction[]>([]);
  const [playerInput, setPlayerInput] = useState<Direction[]>([]);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [highlightedDir, setHighlightedDir] = useState<Direction | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [showingIndex, setShowingIndex] = useState(0);

  const starAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const addToSequence = useCallback(() => {
    const newDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    setSequence(s => [...s, newDir]);
  }, []);

  const showSequence = useCallback(async () => {
    setStep('showing');
    setPlayerInput([]);
    setShowingIndex(0);

    // Add new direction to sequence
    addToSequence();
  }, [addToSequence]);

  // Effect to show sequence one by one
  useEffect(() => {
    if (step !== 'showing') return;
    
    if (showingIndex < sequence.length) {
      const timer = setTimeout(() => {
        setHighlightedDir(sequence[showingIndex]);
        playTap();
        
        // Star animation
        Animated.sequence([
          Animated.timing(starAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
          Animated.timing(starAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();

        setTimeout(() => {
          setHighlightedDir(null);
          setShowingIndex(i => i + 1);
        }, 400);
      }, 600);
      
      return () => clearTimeout(timer);
    } else {
      // Done showing
      const timer = setTimeout(() => {
        setStep('playing');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, showingIndex, sequence, playTap, starAnim]);

  const start = () => {
    setStartedAt(Date.now());
    setSequence([]);
    setPlayerInput([]);
    setLevel(1);
    setLives(3);
    setScore(0);
    showSequence();
  };

  const tapDirection = (dir: Direction) => {
    if (step !== 'playing') return;
    
    playTap();
    setHighlightedDir(dir);
    setTimeout(() => setHighlightedDir(null), 200);

    const newInput = [...playerInput, dir];
    setPlayerInput(newInput);

    const currentIndex = newInput.length - 1;
    
    if (dir !== sequence[currentIndex]) {
      // Wrong!
      playFail();
      setLives(l => l - 1);
      
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      if (lives <= 1) {
        setStep('done');
        return;
      }
      
      // Retry same level
      setTimeout(() => {
        setPlayerInput([]);
        setShowingIndex(0);
        setStep('showing');
      }, 1000);
      
      return;
    }

    // Correct so far
    if (newInput.length === sequence.length) {
      // Completed the sequence!
      const points = level * 100 + sequence.length * 20;
      setScore(s => s + points);
      
      if (level >= MAX_LEVEL) {
        playPerfect();
        if (state.settings.animations) {
          setBurst(true);
          setTimeout(() => setBurst(false), 600);
        }
        setStep('done');
      } else {
        playSuccess();
        if (state.settings.animations) {
          setBurst(true);
          setTimeout(() => setBurst(false), 400);
        }
        setLevel(l => l + 1);
        setTimeout(() => {
          showSequence();
        }, 1000);
      }
    }
  };

  const handleDone = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const finalScore = Math.round(40 + (level / MAX_LEVEL) * 60);
    onDone({ completed: level >= MAX_LEVEL, score: finalScore, mistakes: 3 - lives, seconds });
  };

  const instruction = 'Siga a Estrela de Belém! Memorize a sequência de direções que a estrela mostra e repita na ordem correta. A cada nível, a sequência fica mais longa!';

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 36 }}>👑👑👑</Text>
            <Text style={{ fontSize: 50 }}>⭐</Text>
          </View>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Siga a Estrela</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          
          <View style={{ backgroundColor: theme.colors.primary + '20', padding: 12, borderRadius: 12, width: '100%' }}>
            <Text style={{ ...theme.typography.small, textAlign: 'center', fontWeight: '700' }}>
              ❤️ 3 vidas • 🎯 {MAX_LEVEL} níveis • 🧠 Memorize a sequência!
            </Text>
          </View>
        </Card>
        <PrimaryButton title="⭐ Seguir a Estrela!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    const won = level >= MAX_LEVEL;
    const rating = won ? '🏆 SÁBIO DE VERDADE!' : level >= 7 ? '⭐ Quase lá!' : level >= 4 ? '👍 Bom progresso!' : '🧠 Treine sua memória!';
    
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations && won} />
          <Text style={{ fontSize: 56 }}>{won ? '👶⭐' : '⭐'}</Text>
          <Text style={{ ...theme.typography.title, color: won ? theme.colors.ok : theme.colors.warn }}>{rating}</Text>
          
          <View style={{ backgroundColor: theme.colors.stroke, padding: 16, borderRadius: 16, width: '100%', gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>💎 Pontuação:</Text>
              <Text style={{ fontWeight: '900', color: theme.colors.primary, fontSize: 18 }}>{score}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>📊 Nível alcançado:</Text>
              <Text style={{ fontWeight: '800', color: theme.colors.ok }}>{level}/{MAX_LEVEL}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>🧠 Maior sequência:</Text>
              <Text style={{ fontWeight: '800', color: theme.colors.primary2 }}>{sequence.length} direções</Text>
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

  const dirColors: Record<Direction, readonly [string, string]> = {
    up: ['#4CAF50', '#388E3C'] as const,
    down: ['#FF9800', '#F57C00'] as const,
    left: ['#2196F3', '#1976D2'] as const,
    right: ['#9C27B0', '#7B1FA2'] as const,
  };

  const dirEmoji: Record<Direction, string> = {
    up: '⬆️',
    down: '⬇️',
    left: '⬅️',
    right: '➡️',
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
        <View style={{ backgroundColor: theme.colors.ok, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>Nível {level}/{MAX_LEVEL}</Text>
        </View>
        <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>💎 {score}</Text>
        </View>
      </View>

      {/* Star Display */}
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <LinearGradient colors={['#1a1a2e', '#16213e'] as const} style={{ 
          borderRadius: 20, padding: 24, alignItems: 'center', minHeight: 180,
        }}>
          {/* Decorative stars */}
          {[...Array(8)].map((_, i) => (
            <View key={i} style={{ 
              position: 'absolute', 
              top: 10 + Math.random() * 100,
              left: 20 + Math.random() * 200,
            }}>
              <Text style={{ fontSize: 8 + Math.random() * 8, opacity: 0.3 + Math.random() * 0.4 }}>✨</Text>
            </View>
          ))}

          {/* Main Star */}
          <Animated.View style={{ transform: [{ scale: starAnim }] }}>
            <Text style={{ 
              fontSize: 80,
              textShadowColor: '#FFD700',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: highlightedDir ? 30 : 15,
            }}>⭐</Text>
          </Animated.View>

          {/* Direction indicator when showing */}
          {highlightedDir && (
            <View style={{ position: 'absolute', bottom: 20 }}>
              <Text style={{ fontSize: 40 }}>{dirEmoji[highlightedDir]}</Text>
            </View>
          )}

          {/* Status text */}
          <View style={{ position: 'absolute', bottom: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
              {step === 'showing' ? `Observe... (${showingIndex}/${sequence.length})` : `Sua vez! (${playerInput.length}/${sequence.length})`}
            </Text>
          </View>

          {/* Wise men */}
          <View style={{ position: 'absolute', bottom: 5, right: 20 }}>
            <Text style={{ fontSize: 20 }}>👑👑👑</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Progress dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        {sequence.map((_, i) => (
          <View key={i} style={{
            width: 12, height: 12, borderRadius: 6,
            backgroundColor: i < playerInput.length ? theme.colors.ok : theme.colors.stroke,
          }} />
        ))}
      </View>

      {/* Direction Buttons */}
      <View style={{ gap: 8 }}>
        {/* Up */}
        <View style={{ alignItems: 'center' }}>
          <Pressable 
            onPress={() => tapDirection('up')} 
            disabled={step !== 'playing'}
            style={{ opacity: step === 'playing' ? 1 : 0.5 }}
          >
            <LinearGradient 
              colors={dirColors.up} 
              style={{
                width: 80, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                opacity: highlightedDir === 'up' ? 1 : 0.7,
                transform: [{ scale: highlightedDir === 'up' ? 1.1 : 1 }],
              }}
            >
              <Text style={{ fontSize: 32 }}>⬆️</Text>
            </LinearGradient>
          </Pressable>
        </View>
        
        {/* Left + Right */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 60 }}>
          <Pressable 
            onPress={() => tapDirection('left')} 
            disabled={step !== 'playing'}
            style={{ opacity: step === 'playing' ? 1 : 0.5 }}
          >
            <LinearGradient 
              colors={dirColors.left} 
              style={{
                width: 80, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                opacity: highlightedDir === 'left' ? 1 : 0.7,
                transform: [{ scale: highlightedDir === 'left' ? 1.1 : 1 }],
              }}
            >
              <Text style={{ fontSize: 32 }}>⬅️</Text>
            </LinearGradient>
          </Pressable>
          
          <Pressable 
            onPress={() => tapDirection('right')} 
            disabled={step !== 'playing'}
            style={{ opacity: step === 'playing' ? 1 : 0.5 }}
          >
            <LinearGradient 
              colors={dirColors.right} 
              style={{
                width: 80, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                opacity: highlightedDir === 'right' ? 1 : 0.7,
                transform: [{ scale: highlightedDir === 'right' ? 1.1 : 1 }],
              }}
            >
              <Text style={{ fontSize: 32 }}>➡️</Text>
            </LinearGradient>
          </Pressable>
        </View>
        
        {/* Down */}
        <View style={{ alignItems: 'center' }}>
          <Pressable 
            onPress={() => tapDirection('down')} 
            disabled={step !== 'playing'}
            style={{ opacity: step === 'playing' ? 1 : 0.5 }}
          >
            <LinearGradient 
              colors={dirColors.down} 
              style={{
                width: 80, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                opacity: highlightedDir === 'down' ? 1 : 0.7,
                transform: [{ scale: highlightedDir === 'down' ? 1.1 : 1 }],
              }}
            >
              <Text style={{ fontSize: 32 }}>⬇️</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
