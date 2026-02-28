// Mini-game: Reis Magos — Siga a Estrela (Simon Says Avançado)
// Mecânicas: sequências crescentes, presentes coletáveis, rodadas bônus,
// constelação visual, rodada relâmpago, oásis de descanso
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import ConfettiBurst from '../../components/ConfettiBurst';
import { useSfx } from '../../sfx/SoundManager';
import { useApp } from '../../state/AppState';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

type Direction = 'up' | 'down' | 'left' | 'right';
const DIRS: Direction[] = ['up', 'down', 'left', 'right'];
const MAX_LEVEL = 12;
const GIFT_LEVELS = [3, 6, 9]; // Levels where gifts are earned
const GIFTS = ['🥇 Ouro', '🧴 Incenso', '🎁 Mirra'];

const DIR_COLORS: Record<Direction, readonly [string, string]> = {
  up:    ['#4CAF50', '#2E7D32'],
  down:  ['#FF9800', '#F57C00'],
  left:  ['#2196F3', '#1565C0'],
  right: ['#9C27B0', '#6A1B9A'],
};
const DIR_EMOJI: Record<Direction, string> = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };

export default function StarPathGame({
  narrationEnabled, onDone,
}: { narrationEnabled: boolean; onDone: (r: MiniGameResult) => void }) {
  const { state } = useApp();
  const sfx = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'showing' | 'playing' | 'bonus' | 'gift' | 'done'>('intro');
  const [sequence, setSequence] = useState<Direction[]>([]);
  const [playerInput, setPlayerInput] = useState<Direction[]>([]);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [highlightDir, setHighlightDir] = useState<Direction | null>(null);
  const [showIdx, setShowIdx] = useState(0);
  const [burst, setBurst] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [giftsEarned, setGiftsEarned] = useState<string[]>([]);
  const [bonusHits, setBonusHits] = useState(0);
  const [bonusTarget, setBonusTarget] = useState<Direction | null>(null);
  const [bonusTimer, setBonusTimer] = useState(0);
  const [constellationStars, setConstellationStars] = useState(0);
  const [speedRound, setSpeedRound] = useState(false);

  const starA = useRef(new Animated.Value(1)).current;
  const shakeA = useRef(new Animated.Value(0)).current;
  const giftA = useRef(new Animated.Value(0)).current;
  const layoutRef = useRef({ w: 300, h: 200 });
  const bonusTmr = useRef<ReturnType<typeof setInterval> | null>(null);

  // Memoize background star positions
  const bgStars = useMemo(() =>
    Array.from({ length: 10 + constellationStars }, (_, i) => ({
      id: i,
      top: 5 + Math.random() * 130,
      left: 10 + Math.random() * 260,
      size: 6 + Math.random() * 10,
      op: 0.2 + Math.min(0.7, (i < constellationStars ? 0.8 : Math.random() * 0.3)),
    })), [constellationStars]);

  /* ── helpers ── */
  const addDir = useCallback(() => {
    setSequence(s => [...s, DIRS[Math.floor(Math.random() * 4)]]);
  }, []);

  const showSeq = useCallback(() => {
    setStep('showing');
    setPlayerInput([]);
    setShowIdx(0);
    addDir();
  }, [addDir]);

  // Show sequence animation
  useEffect(() => {
    if (step !== 'showing') return;
    if (showIdx < sequence.length) {
      const delay = speedRound ? 300 : 550;
      const t = setTimeout(() => {
        setHighlightDir(sequence[showIdx]);
        sfx.playTap();
        Animated.sequence([
          Animated.timing(starA, { toValue: 1.4, duration: 120, useNativeDriver: true }),
          Animated.timing(starA, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
        setTimeout(() => { setHighlightDir(null); setShowIdx(i => i + 1); }, delay * 0.6);
      }, delay);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setStep('playing'), 400);
      return () => clearTimeout(t);
    }
  }, [step, showIdx, sequence, sfx, starA, speedRound]);

  /* ── Bonus round (tap as many as you can in 5s) ── */
  const startBonus = useCallback(() => {
    setStep('bonus');
    setBonusHits(0);
    setBonusTimer(5);
    const dir = DIRS[Math.floor(Math.random() * 4)];
    setBonusTarget(dir);
    setHighlightDir(dir);

    bonusTmr.current = setInterval(() => {
      setBonusTimer(t => {
        if (t <= 1) {
          if (bonusTmr.current) clearInterval(bonusTmr.current);
          bonusTmr.current = null;
          setHighlightDir(null);
          setBonusTarget(null);
          // Continue to next level
          setTimeout(() => showSeq(), 500);
          return 0;
        }
        // Change direction randomly
        const nd = DIRS[Math.floor(Math.random() * 4)];
        setBonusTarget(nd);
        setHighlightDir(nd);
        return t - 1;
      });
    }, 1000);
  }, [showSeq]);

  useEffect(() => () => { if (bonusTmr.current) clearInterval(bonusTmr.current); }, []);

  /* ── Gift screen ── */
  const showGift = useCallback((giftIdx: number) => {
    setStep('gift');
    setGiftsEarned(g => [...g, GIFTS[giftIdx]]);
    sfx.playPerfect();
    Animated.sequence([
      Animated.timing(giftA, { toValue: 1.3, duration: 300, useNativeDriver: true }),
      Animated.timing(giftA, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setBurst(true);
    setTimeout(() => { setBurst(false); }, 600);
  }, [sfx, giftA]);

  const continueFromGift = () => {
    // Decide if bonus round or normal
    if (level % 4 === 0 && level < MAX_LEVEL) {
      startBonus();
    } else {
      showSeq();
    }
  };

  /* ── Start ── */
  const start = () => {
    setStartedAt(Date.now());
    setSequence([]); setPlayerInput([]); setLevel(1); setLives(3);
    setScore(0); setGiftsEarned([]); setBonusHits(0);
    setConstellationStars(0); setSpeedRound(false);
    showSeq();
  };

  /* ── Tap (playing) ── */
  const tapDir = (dir: Direction) => {
    if (step === 'bonus') {
      // Bonus round: tap matching direction
      sfx.playTap();
      if (dir === bonusTarget) {
        setBonusHits(h => h + 1);
        setScore(s => s + 50);
        sfx.playSuccess();
        const nd = DIRS[Math.floor(Math.random() * 4)];
        setBonusTarget(nd); setHighlightDir(nd);
      } else {
        sfx.playFail();
      }
      return;
    }

    if (step !== 'playing') return;
    sfx.playTap();
    setHighlightDir(dir);
    setTimeout(() => setHighlightDir(null), 180);

    const newInput = [...playerInput, dir];
    setPlayerInput(newInput);

    if (dir !== sequence[newInput.length - 1]) {
      sfx.playFail();
      setLives(l => l - 1);
      Animated.sequence([
        Animated.timing(shakeA, { toValue: 15, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeA, { toValue: -15, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeA, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();

      if (lives <= 1) { setStep('done'); return; }
      // Retry
      setTimeout(() => { setPlayerInput([]); setShowIdx(0); setStep('showing'); }, 800);
      return;
    }

    if (newInput.length === sequence.length) {
      // Level complete!
      const pts = level * 100 + sequence.length * 25 + (speedRound ? 200 : 0);
      setScore(s => s + pts);
      setConstellationStars(c => c + 1);

      if (level >= MAX_LEVEL) {
        sfx.playPerfect();
        setBurst(true); setTimeout(() => setBurst(false), 600);
        setStep('done');
        return;
      }

      sfx.playSuccess();
      if (state.settings.animations) { setBurst(true); setTimeout(() => setBurst(false), 300); }

      const newLevel = level + 1;
      setLevel(newLevel);
      setSpeedRound(newLevel >= 8); // Speed rounds from level 8+

      // Check for gift
      const giftIdx = GIFT_LEVELS.indexOf(level);
      if (giftIdx >= 0) {
        setTimeout(() => showGift(giftIdx), 600);
      } else if (newLevel % 4 === 0 && newLevel < MAX_LEVEL) {
        setTimeout(() => startBonus(), 800);
      } else {
        setTimeout(() => showSeq(), 700);
      }
    }
  };

  const handleDone = () => {
    const s = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    onDone({ completed: level >= MAX_LEVEL, score: Math.round(40 + (level / MAX_LEVEL) * 60), mistakes: 3 - lives, seconds: s });
  };

  const handleTouch = (e: any) => {
    if (step !== 'playing' && step !== 'bonus') return;
    const { locationX: lx, locationY: ly } = e.nativeEvent;
    const cx = layoutRef.current.w / 2, cy = layoutRef.current.h / 2;
    const dx = lx - cx, dy = ly - cy;
    tapDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  };

  const instruction = 'Siga a Estrela de Belém! Memorize e repita a sequência de direções. Colete os 3 presentes para o menino Jesus: Ouro, Incenso e Mirra! Rodadas bônus dão pontos extras!';

  /* ═══ INTRO ═══ */
  if (step === 'intro') return (
    <View style={{ gap: theme.spacing(2) }}>
      <Card style={{ gap: 16, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Text style={{ fontSize: 32 }}>👑👑👑</Text>
          <Text style={{ fontSize: 50 }}>⭐</Text>
        </View>
        <Text style={{ ...theme.typography.title, textAlign: 'center' }}>A Jornada dos Reis Magos</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>{instruction}</Text>
        <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {[['🥇','Ouro (nível 3)'],['🧴','Incenso (nível 6)'],['🎁','Mirra (nível 9)'],['⚡','Rodadas bônus!'],['🧠','Memorize a sequência'],['🌟','Forme constelações']].map(([e,t],i)=>(
            <View key={i} style={{ backgroundColor: theme.colors.primary+'18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700' }}>{e} {t}</Text>
            </View>
          ))}
        </View>
        <View style={{ backgroundColor: theme.colors.primary+'20', padding: 12, borderRadius: 12, width: '100%' }}>
          <Text style={{ ...theme.typography.small, textAlign: 'center', fontWeight: '700' }}>❤️ 3 vidas • 🎯 {MAX_LEVEL} níveis • 🎁 3 presentes</Text>
        </View>
      </Card>
      <PrimaryButton title="⭐ Seguir a Estrela!" onPress={start} />
    </View>
  );

  /* ═══ GIFT ═══ */
  if (step === 'gift') {
    const gIdx = giftsEarned.length - 1;
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 20, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.muted }}>PRESENTE ENCONTRADO!</Text>
          <Animated.Text style={{ fontSize: 72, transform: [{ scale: giftA }] }}>
            {gIdx === 0 ? '🥇' : gIdx === 1 ? '🧴' : '🎁'}
          </Animated.Text>
          <Text style={{ ...theme.typography.title, color: '#FFD700' }}>{GIFTS[gIdx]}</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {gIdx === 0 ? 'Ouro para o Rei dos Reis!' : gIdx === 1 ? 'Incenso para o Filho de Deus!' : 'Mirra para o Salvador!'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {GIFTS.map((g, i) => (
              <View key={i} style={{ opacity: i <= gIdx ? 1 : 0.3, alignItems: 'center' }}>
                <Text style={{ fontSize: 28 }}>{i === 0 ? '🥇' : i === 1 ? '🧴' : '🎁'}</Text>
                <Text style={{ fontSize: 10, fontWeight: '700' }}>{i <= gIdx ? '✓' : '?'}</Text>
              </View>
            ))}
          </View>
        </Card>
        <PrimaryButton title="⭐ Continuar jornada!" onPress={continueFromGift} />
      </View>
    );
  }

  /* ═══ DONE ═══ */
  if (step === 'done') {
    const won = level >= MAX_LEVEL;
    const rat = won ? '🏆 SÁBIO DE VERDADE!' : level >= 8 ? '⭐ Quase lá!' : level >= 5 ? '👍 Bom progresso!' : '🧠 Treine mais!';
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations && won} />
          <Text style={{ fontSize: 56 }}>{won ? '👶⭐' : '⭐'}</Text>
          <Text style={{ ...theme.typography.title, color: won ? theme.colors.ok : theme.colors.warn }}>{rat}</Text>
          <View style={{ backgroundColor: theme.colors.stroke, padding: 16, borderRadius: 16, width: '100%', gap: 10 }}>
            {([['💎 Pontuação', `${score}`, theme.colors.primary],
               ['📊 Nível', `${level}/${MAX_LEVEL}`, theme.colors.ok],
               ['🧠 Maior sequência', `${sequence.length} dirs`, theme.colors.primary2],
               ['🎁 Presentes', `${giftsEarned.length}/3`, '#FFD700'],
               ['🌟 Constelação', `${constellationStars} estrelas`, '#FFD700'],
               ['❤️ Vidas', `${lives}/3`, lives > 0 ? theme.colors.ok : theme.colors.bad],
            ] as const).map(([l,v,c],i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700' }}>{l}:</Text>
                <Text style={{ fontWeight: '900', color: c, fontSize: 15 }}>{v}</Text>
              </View>
            ))}
          </View>
          {giftsEarned.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {giftsEarned.map((g, i) => <Text key={i} style={{ fontSize: 28 }}>{i === 0 ? '🥇' : i === 1 ? '🧴' : '🎁'}</Text>)}
            </View>
          )}
        </Card>
        <PrimaryButton title="✓ Continuar" onPress={handleDone} variant="success" />
      </View>
    );
  }

  /* ═══ PLAY / SHOWING / BONUS ═══ */
  return (
    <View style={{ gap: theme.spacing(1) }}>
      {/* HUD */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 3 }}>
          {[...Array(3)].map((_,i) => <Text key={i} style={{ fontSize: 18, opacity: i < lives ? 1 : 0.2 }}>❤️</Text>)}
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {speedRound && <View style={{ backgroundColor: '#FF6B00', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 10 }}>⚡ RÁPIDO</Text>
          </View>}
          <View style={{ backgroundColor: theme.colors.ok, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>Nível {level}/{MAX_LEVEL}</Text>
          </View>
          <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>💎 {score}</Text>
          </View>
        </View>
      </View>

      {/* Gifts progress */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
        {GIFTS.map((g, i) => {
          const earned = i < giftsEarned.length;
          return (
            <View key={i} style={{ alignItems: 'center', opacity: earned ? 1 : 0.3 }}>
              <Text style={{ fontSize: 20 }}>{i === 0 ? '🥇' : i === 1 ? '🧴' : '🎁'}</Text>
              <Text style={{ fontSize: 8, fontWeight: '700' }}>{earned ? '✓' : `Nv${GIFT_LEVELS[i]}`}</Text>
            </View>
          );
        })}
      </View>

      {/* Bonus round header */}
      {step === 'bonus' && (
        <View style={{ alignItems: 'center' }}>
          <LinearGradient colors={['#FF6B00', '#FF9800']} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>⭐ RODADA BÔNUS! ⏱️ {bonusTimer}s • 🎯 {bonusHits} acertos</Text>
          </LinearGradient>
        </View>
      )}

      {/* Star sky */}
      <Animated.View style={{ transform: [{ translateX: shakeA }] }}>
        <Pressable onPress={handleTouch} disabled={step === 'showing'}>
          <LinearGradient colors={step === 'bonus' ? ['#1a0a2e', '#3D1A5E'] as const : ['#0a0a2e', '#16213e'] as const}
            style={{ borderRadius: 20, padding: 24, alignItems: 'center', minHeight: 200 }}
            onLayout={e => { layoutRef.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height }; }}>

            {bgStars.map(s => (
              <View key={s.id} style={{ position: 'absolute', top: s.top, left: s.left }}>
                <Text style={{ fontSize: s.size, opacity: s.op }}>{s.id < constellationStars ? '⭐' : '✨'}</Text>
              </View>
            ))}

            <Animated.View style={{ transform: [{ scale: starA }] }}>
              <Text style={{
                fontSize: 80,
                textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: highlightDir ? 35 : 15,
              }}>⭐</Text>
            </Animated.View>

            {highlightDir && (
              <View style={{ position: 'absolute', bottom: 25 }}>
                <Text style={{ fontSize: 44 }}>{DIR_EMOJI[highlightDir]}</Text>
              </View>
            )}

            <View style={{ position: 'absolute', bottom: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                {step === 'showing' ? `Observe... (${showIdx}/${sequence.length})` 
                  : step === 'bonus' ? `Toque na direção da seta! ${DIR_EMOJI[bonusTarget ?? 'up']}`
                  : `Sua vez! (${playerInput.length}/${sequence.length})`}
              </Text>
            </View>

            <View style={{ position: 'absolute', bottom: 4, right: 16 }}>
              <Text style={{ fontSize: 18 }}>🐫🐫🐫</Text>
            </View>

            {step === 'playing' && <>
              <View style={{ position: 'absolute', top: 4 }}><Text style={{ color: '#fff', fontSize: 14, opacity: 0.4 }}>⬆️</Text></View>
              <View style={{ position: 'absolute', bottom: 28 }}><Text style={{ color: '#fff', fontSize: 14, opacity: 0.4 }}>⬇️</Text></View>
              <View style={{ position: 'absolute', left: 8, top: '45%' }}><Text style={{ color: '#fff', fontSize: 14, opacity: 0.4 }}>⬅️</Text></View>
              <View style={{ position: 'absolute', right: 8, top: '45%' }}><Text style={{ color: '#fff', fontSize: 14, opacity: 0.4 }}>➡️</Text></View>
            </>}
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Sequence dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, flexWrap: 'wrap' }}>
        {sequence.map((d, i) => (
          <View key={i} style={{
            width: 14, height: 14, borderRadius: 7,
            backgroundColor: i < playerInput.length ? theme.colors.ok : theme.colors.stroke,
            borderWidth: step === 'showing' && i === showIdx - 1 ? 2 : 0,
            borderColor: '#FFD700',
          }} />
        ))}
      </View>

      <Text style={{ ...theme.typography.small, color: theme.colors.muted, textAlign: 'center' }}>
        👆 Toque na direção: cima, baixo, esquerda ou direita!
      </Text>
      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
