// Mini-game: Jonas - Fuja das Tempestades!
// Desvie dos obstáculos no mar enquanto a baleia leva Jonas para a segurança
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Animated, Dimensions, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import ConfettiBurst from '../../components/ConfettiBurst';
import { useSfx } from '../../sfx/useSfx';
import { useApp } from '../../state/AppState';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

const { width, height } = Dimensions.get('window');
const GAME_WIDTH = Math.min(width - 40, 350);
const GAME_HEIGHT = 300;
const WHALE_SIZE = 50;
const OBSTACLE_SIZE = 40;
const TOTAL_DISTANCE = 200; // Jogo mais longo

type Obstacle = {
  id: number;
  x: number;
  y: number;
  type: 'storm' | 'rock' | 'whirlpool';
  emoji: string;
};

const OBSTACLE_TYPES = [
  { type: 'storm' as const, emoji: '⛈️' },
  { type: 'rock' as const, emoji: '🪨' },
  { type: 'whirlpool' as const, emoji: '🌀' },
];

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
  const [whaleY, setWhaleY] = useState(GAME_HEIGHT / 2);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [distance, setDistance] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [isHit, setIsHit] = useState(false);
  const [speed, setSpeed] = useState(120); // ms per game tick (mais lento = mais fácil)

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const obstacleIdRef = useRef(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const whaleAnim = useRef(new Animated.Value(1)).current;

  const moveWhale = (direction: 'up' | 'down') => {
    playTap();
    setWhaleY(y => {
      const newY = direction === 'up' ? y - 30 : y + 30;
      return Math.max(WHALE_SIZE / 2, Math.min(GAME_HEIGHT - WHALE_SIZE / 2, newY));
    });
  };

  const checkCollision = useCallback((whalePos: number, obs: Obstacle[]): Obstacle | null => {
    const whaleLeft = 30;
    const whaleRight = 30 + WHALE_SIZE;
    const whaleTop = whalePos - WHALE_SIZE / 2;
    const whaleBottom = whalePos + WHALE_SIZE / 2;

    for (const o of obs) {
      const obsLeft = o.x;
      const obsRight = o.x + OBSTACLE_SIZE;
      const obsTop = o.y;
      const obsBottom = o.y + OBSTACLE_SIZE;

      if (whaleRight > obsLeft && whaleLeft < obsRight && 
          whaleBottom > obsTop && whaleTop < obsBottom) {
        return o;
      }
    }
    return null;
  }, []);

  const finish = useCallback((won: boolean) => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setStep('done');
    if (won) playPerfect();
    else playFail();
  }, [playFail, playPerfect]);

  const gameLoop = useCallback(() => {
    setDistance(d => {
      const newDist = d + 0.5; // Progresso mais lento
      if (newDist >= TOTAL_DISTANCE) {
        finish(true);
      }
      return newDist;
    });

    // Move obstacles left
    setObstacles(obs => {
      const moved = obs.map(o => ({ ...o, x: o.x - 3 })).filter(o => o.x > -OBSTACLE_SIZE);
      
      // Spawn new obstacles (menos frequente)
      if (Math.random() < 0.08) {
        const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
        moved.push({
          id: obstacleIdRef.current++,
          x: GAME_WIDTH,
          y: Math.random() * (GAME_HEIGHT - OBSTACLE_SIZE),
          ...type,
        });
      }
      
      return moved;
    });

    // Add score for surviving
    setScore(s => s + 5);
  }, [finish]);

  // Check collisions in separate effect
  useEffect(() => {
    if (step !== 'play' || isHit) return;
    
    const hit = checkCollision(whaleY, obstacles);
    if (hit) {
      setIsHit(true);
      playFail();
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
          finish(false);
        }
        return newLives;
      });
      
      // Remove the obstacle that hit
      setObstacles(obs => obs.filter(o => o.id !== hit.id));
      
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      
      setTimeout(() => setIsHit(false), 500);
    }
  }, [whaleY, obstacles, step, isHit, checkCollision, playFail, finish, shakeAnim]);

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
    playTap();
    setWhaleY(GAME_HEIGHT / 2);
    setObstacles([]);
    setDistance(0);
    setLives(3);
    setScore(0);
    
    gameLoopRef.current = setInterval(gameLoop, speed);
  };

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  // Speed up as distance increases
  useEffect(() => {
    if (step === 'play' && distance > 0 && distance % 20 === 0) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      const newSpeed = Math.max(15, speed - 3);
      setSpeed(newSpeed);
      gameLoopRef.current = setInterval(gameLoop, newSpeed);
    }
  }, [distance, step, speed, gameLoop]);

  const handleDone = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const won = distance >= TOTAL_DISTANCE;
    const finalScore = Math.round((won ? 70 : 40) + (lives / 3) * 30);
    onDone({ completed: won, score: finalScore, mistakes: 3 - lives, seconds });
  };

  const instruction = 'Pilote a baleia pelo mar tempestuoso! Desvie das tempestades, rochas e redemoinhos para levar Jonas em segurança até a praia.';

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 24 }}>⛈️🪨🌀</Text>
            <Text style={{ fontSize: 50 }}>🐋</Text>
            <Text style={{ fontSize: 24 }}>🏖️</Text>
          </View>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Jonas no Mar</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          
          <View style={{ backgroundColor: theme.colors.primary + '20', padding: 12, borderRadius: 12, width: '100%' }}>
            <Text style={{ ...theme.typography.small, textAlign: 'center', fontWeight: '700' }}>
              ❤️ 3 vidas • 🎯 Chegue à praia • 👆 Toque para mover!
            </Text>
          </View>
        </Card>
        <PrimaryButton title="🐋 Navegar!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    const won = distance >= TOTAL_DISTANCE;
    const rating = won && lives === 3 ? '🏆 PERFEITO!' : won ? '⭐ Chegou!' : '🌊 O mar venceu...';
    
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations && won} />
          <Text style={{ fontSize: 56 }}>{won ? '🏖️' : '🌊'}</Text>
          <Text style={{ ...theme.typography.title, color: won ? theme.colors.ok : theme.colors.warn }}>{rating}</Text>
          
          <View style={{ backgroundColor: theme.colors.stroke, padding: 16, borderRadius: 16, width: '100%', gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>💎 Pontuação:</Text>
              <Text style={{ fontWeight: '900', color: theme.colors.primary, fontSize: 18 }}>{score}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>📍 Distância:</Text>
              <Text style={{ fontWeight: '800', color: theme.colors.ok }}>{distance}%</Text>
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

  return (
    <View style={{ gap: theme.spacing(1.5) }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[...Array(3)].map((_, i) => (
            <Text key={i} style={{ fontSize: 20, opacity: i < lives ? 1 : 0.3 }}>❤️</Text>
          ))}
        </View>
        <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>💎 {score}</Text>
        </View>
      </View>

      {/* Progress to beach */}
      <View style={{ height: 16, backgroundColor: theme.colors.stroke, borderRadius: 8, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ height: '100%', backgroundColor: '#4169E1', width: `${distance}%`, borderRadius: 8 }} />
        <View style={{ position: 'absolute', left: `${Math.min(distance, 95)}%` }}>
          <Text style={{ fontSize: 14 }}>🐋</Text>
        </View>
        <View style={{ position: 'absolute', right: 4 }}>
          <Text style={{ fontSize: 14 }}>🏖️</Text>
        </View>
      </View>

      {/* Game Area - Toque para mover */}
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <Pressable 
          onPress={(e) => {
            const touchY = e.nativeEvent.locationY;
            if (touchY < GAME_HEIGHT / 2) {
              moveWhale('up');
            } else {
              moveWhale('down');
            }
          }}
          style={{ alignSelf: 'center' }}
        >
          <LinearGradient 
            colors={['#0077B6', '#00B4D8', '#48CAE4'] as const} 
            style={{ 
              width: GAME_WIDTH, 
              height: GAME_HEIGHT, 
              borderRadius: 16, 
              overflow: 'hidden',
            }}
          >
          {/* Wave effect background */}
          <View style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.3 }}>
            {[...Array(5)].map((_, i) => (
              <View key={i} style={{ 
                position: 'absolute', 
                top: i * 60, 
                left: 0, 
                right: 0, 
                height: 2, 
                backgroundColor: '#fff' 
              }} />
            ))}
          </View>

          {/* Obstacles */}
          {obstacles.map(obs => (
            <View key={obs.id} style={{
              position: 'absolute',
              left: obs.x,
              top: obs.y,
              width: OBSTACLE_SIZE,
              height: OBSTACLE_SIZE,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: OBSTACLE_SIZE * 0.8 }}>{obs.emoji}</Text>
            </View>
          ))}

          {/* Whale */}
          <Animated.View style={{
            position: 'absolute',
            left: 30,
            top: whaleY - WHALE_SIZE / 2,
            width: WHALE_SIZE,
            height: WHALE_SIZE,
            transform: [{ scale: whaleAnim }],
            opacity: isHit ? 0.5 : 1,
          }}>
            <Text style={{ fontSize: WHALE_SIZE * 0.9 }}>🐋</Text>
          </Animated.View>

          {/* Touch zone indicators */}
          <View style={{ position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center', opacity: 0.5 }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>⬆️ Toque aqui para SUBIR</Text>
          </View>
          <View style={{ position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center', opacity: 0.5 }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>⬇️ Toque aqui para DESCER</Text>
          </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Text style={{ ...theme.typography.small, color: theme.colors.muted, textAlign: 'center' }}>
        👆 Toque na parte de cima para subir, embaixo para descer!
      </Text>

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
