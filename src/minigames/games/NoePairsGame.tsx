// Mini-game: Jogo da Memória - Arca de Noé
// Encontre os pares de animais! Cartas viradas estilo jogo de memória clássico
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import ConfettiBurst from '../../components/ConfettiBurst';
import { useSfx } from '../../sfx/SoundManager';
import { useApp } from '../../state/AppState';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

type CardData = { id: number; animal: string; emoji: string; matched: boolean };

const ANIMALS = [
  { animal: 'Leão', emoji: '🦁' },
  { animal: 'Elefante', emoji: '🐘' },
  { animal: 'Girafa', emoji: '🦒' },
  { animal: 'Zebra', emoji: '🦓' },
  { animal: 'Macaco', emoji: '🐒' },
  { animal: 'Urso', emoji: '🐻' },
  { animal: 'Coelho', emoji: '🐰' },
  { animal: 'Raposa', emoji: '🦊' },
];

const { width } = Dimensions.get('window');
const CARD_SIZE = Math.min(70, (width - 80) / 4);
const TOTAL_TIME = 60;

function createCards(numPairs: number): CardData[] {
  const pairs = ANIMALS.slice(0, numPairs);
  const cards: CardData[] = [];
  let id = 0;
  pairs.forEach(p => {
    cards.push({ id: id++, ...p, matched: false });
    cards.push({ id: id++, ...p, matched: false });
  });
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function NoePairsGame({
  pairsToMatch = 8,
  narrationEnabled,
  onDone,
}: {
  pairsToMatch?: number;
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess, playPerfect } = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'play' | 'done'>('intro');
  const [cards, setCards] = useState<CardData[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [canFlip, setCanFlip] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flipAnims = useRef<Animated.Value[]>([]);

  const totalPairs = Math.min(pairsToMatch, ANIMALS.length);
  const matchedPairs = matched.size;

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep('done');
    playPerfect();
  }, [playPerfect]);

  useEffect(() => {
    if (step === 'play' && (matchedPairs >= totalPairs || timeLeft <= 0)) {
      finish();
    }
  }, [matchedPairs, timeLeft, step, finish, totalPairs]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const start = () => {
    const newCards = createCards(totalPairs);
    setCards(newCards);
    flipAnims.current = newCards.map(() => new Animated.Value(0));
    setStartedAt(Date.now());
    setStep('play');
    playTap();
    
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const flipCard = (index: number) => {
    if (!canFlip || flipped.includes(index) || cards[index].matched) return;
    playTap();

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    // Animate flip
    Animated.timing(flipAnims.current[index], {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setCanFlip(false);
      
      const [first, second] = newFlipped;
      const card1 = cards[first];
      const card2 = cards[second];

      if (card1.animal === card2.animal) {
        // Match!
        playSuccess();
        setMatched(m => new Set([...m, card1.animal]));
        setCards(c => c.map((card, i) => 
          i === first || i === second ? { ...card, matched: true } : card
        ));
        
        if (state.settings.animations) {
          setBurst(true);
          setTimeout(() => setBurst(false), 400);
        }
        
        setFlipped([]);
        setCanFlip(true);
      } else {
        // No match - flip back
        playFail();
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(flipAnims.current[first], { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(flipAnims.current[second], { toValue: 0, duration: 200, useNativeDriver: true }),
          ]).start(() => {
            setFlipped([]);
            setCanFlip(true);
          });
        }, 800);
      }
    }
  };

  const handleDone = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const efficiency = moves > 0 ? Math.max(0, 1 - (moves - totalPairs) / (totalPairs * 2)) : 1;
    const timeBonus = timeLeft > 0 ? 0.1 : 0;
    const finalScore = Math.round((50 + efficiency * 40 + timeBonus * 10) * (matchedPairs / totalPairs));
    onDone({ completed: matchedPairs >= totalPairs, score: Math.max(50, finalScore), mistakes: moves - matchedPairs, seconds });
  };

  const instruction = 'Jogo da Memória! Encontre os pares de animais para salvá-los na Arca. Memorize as posições e use poucos movimentos!';

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 56 }}>🚢🧠</Text>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Memória da Arca</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          
          <View style={{ backgroundColor: theme.colors.primary + '20', padding: 12, borderRadius: 12, width: '100%' }}>
            <Text style={{ ...theme.typography.small, textAlign: 'center', fontWeight: '700' }}>
              ⏱️ {TOTAL_TIME}s • 🃏 {totalPairs} pares • 🎯 Menos movimentos = mais pontos!
            </Text>
          </View>
        </Card>
        <PrimaryButton title="🧠 Jogar!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    const won = matchedPairs >= totalPairs;
    const efficiency = Math.round((totalPairs / Math.max(1, moves)) * 100);
    const perfectMoves = totalPairs + 2; // margem de 2 erros
    const goodMoves = totalPairs * 2;
    const rating = won && moves <= perfectMoves ? '🏆 PERFEITO!' : won && moves <= goodMoves ? '⭐ Ótimo!' : won ? '👍 Bom!' : '⏰ Tempo esgotado!';
    
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations && won} />
          <Text style={{ fontSize: 56 }}>{won ? '🌈' : '⏰'}</Text>
          <Text style={{ ...theme.typography.title, color: won ? theme.colors.ok : theme.colors.warn }}>{rating}</Text>
          
          <View style={{ backgroundColor: theme.colors.stroke, padding: 16, borderRadius: 16, width: '100%', gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>🃏 Pares encontrados:</Text>
              <Text style={{ fontWeight: '900', color: theme.colors.ok }}>{matchedPairs}/{totalPairs}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>👆 Movimentos:</Text>
              <Text style={{ fontWeight: '800', color: theme.colors.primary }}>{moves}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>📊 Eficiência:</Text>
              <Text style={{ fontWeight: '800', color: efficiency >= 80 ? theme.colors.ok : theme.colors.warn }}>{efficiency}%</Text>
            </View>
          </View>
        </Card>
        <PrimaryButton title="✓ Continuar" onPress={handleDone} variant="success" />
      </View>
    );
  }

  const timeColor = timeLeft <= 10 ? theme.colors.bad : timeLeft <= 20 ? theme.colors.warn : theme.colors.ok;

  return (
    <View style={{ gap: theme.spacing(1.5) }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ backgroundColor: timeColor, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>⏱️ {timeLeft}s</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontWeight: '800', color: theme.colors.muted }}>👆 {moves}</Text>
        </View>
        <View style={{ backgroundColor: theme.colors.ok, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>🃏 {matchedPairs}/{totalPairs}</Text>
        </View>
      </View>

      {/* Arca Visual */}
      <LinearGradient colors={['#8B4513', '#A0522D'] as const} style={{ borderRadius: 16, padding: 8, alignItems: 'center' }}>
        <Text style={{ color: '#FFD700', fontWeight: '800', fontSize: 12 }}>🚢 ARCA DE NOÉ 🚢</Text>
      </LinearGradient>

      {/* Cards Grid 4x4 */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || card.matched;
          const flipAnim = flipAnims.current[index] || new Animated.Value(0);
          
          const frontRotate = flipAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          });
          const backRotate = flipAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['180deg', '360deg'],
          });

          return (
            <Pressable key={card.id} onPress={() => flipCard(index)} disabled={!canFlip || card.matched}>
              <View style={{ width: CARD_SIZE, height: CARD_SIZE }}>
                {/* Back of card */}
                <Animated.View style={{
                  position: 'absolute', width: '100%', height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: [{ rotateY: frontRotate }],
                }}>
                  <LinearGradient colors={['#3498db', '#2980b9'] as const} style={{
                    width: '100%', height: '100%', borderRadius: 12,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 2, borderColor: '#fff',
                  }}>
                    <Text style={{ fontSize: 24 }}>❓</Text>
                  </LinearGradient>
                </Animated.View>

                {/* Front of card */}
                <Animated.View style={{
                  position: 'absolute', width: '100%', height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: [{ rotateY: backRotate }],
                }}>
                  <View style={{
                    width: '100%', height: '100%', borderRadius: 12,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: card.matched ? '#E8F5E9' : '#fff',
                    borderWidth: 2, borderColor: card.matched ? theme.colors.ok : theme.colors.stroke,
                  }}>
                    <Text style={{ fontSize: CARD_SIZE * 0.5 }}>{card.emoji}</Text>
                  </View>
                </Animated.View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Hint */}
      <Text style={{ ...theme.typography.small, color: theme.colors.muted, textAlign: 'center' }}>
        💡 Memorize as posições para encontrar os pares mais rápido!
      </Text>

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
