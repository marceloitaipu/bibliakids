// Mini-game: Jonas — Aventura em 4 Fases no Mar!
// Fases: Mar Calmo → Tempestade → Dentro da Baleia → Praia de Nínive
// Mecânicas: 3 pistas, coletáveis, power-ups, padrões de obstáculos
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

const { width } = Dimensions.get('window');
const GW = Math.min(width - 40, 360);
const GH = 320;
const LANES = 3;
const LANE_H = GH / LANES;
const OBJ_SIZE = 38;

type Phase = { name: string; emoji: string; bg: readonly [string, string, string]; dist: number; spawnRate: number; speed: number };
type ObjKind = 'obstacle' | 'fish' | 'scroll' | 'gem' | 'dolphin' | 'shield';
type Obj = { id: number; lane: number; x: number; kind: ObjKind; emoji: string; points: number };

const PHASES: Phase[] = [
  { name: 'Mar Calmo',     emoji: '🌊',  bg: ['#0077B6','#00B4D8','#48CAE4'], dist: 25, spawnRate: 0.06, speed: 2.5 },
  { name: 'Tempestade!',   emoji: '⛈️',  bg: ['#1B3A4B','#3D5A80','#5A7EA3'], dist: 55, spawnRate: 0.09, speed: 3.2 },
  { name: 'Dentro da Baleia', emoji: '🐋', bg: ['#4A0E0E','#6B2020','#8B3030'], dist: 80, spawnRate: 0.08, speed: 3.5 },
  { name: 'Praia de Nínive', emoji: '🏖️', bg: ['#0096C7','#48CAE4','#90E0EF'], dist: 100, spawnRate: 0.07, speed: 3.8 },
];

const OBSTACLES_BY_PHASE: { emoji: string; kind: ObjKind }[][] = [
  [{ emoji: '🪨', kind: 'obstacle' },{ emoji: '🌊', kind: 'obstacle' }],
  [{ emoji: '⛈️', kind: 'obstacle' },{ emoji: '🌀', kind: 'obstacle' },{ emoji: '⚡', kind: 'obstacle' }],
  [{ emoji: '🦠', kind: 'obstacle' },{ emoji: '🦴', kind: 'obstacle' }],
  [{ emoji: '🪨', kind: 'obstacle' },{ emoji: '🌊', kind: 'obstacle' }],
];

const COLLECTIBLES: { emoji: string; kind: ObjKind; points: number; weight: number }[] = [
  { emoji: '🐟', kind: 'fish',    points: 50,  weight: 5 },
  { emoji: '💎', kind: 'gem',     points: 100, weight: 3 },
  { emoji: '📜', kind: 'scroll',  points: 200, weight: 1 },
  { emoji: '🐬', kind: 'dolphin', points: 150, weight: 2 },
  { emoji: '🛡️', kind: 'shield',  points: 0,   weight: 1 },
];

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
function weightedPick<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const it of items) { r -= it.weight; if (r <= 0) return it; }
  return items[0];
}

export default function JonahGuideGame({
  narrationEnabled, onDone,
}: { narrationEnabled: boolean; onDone: (r: MiniGameResult) => void }) {
  const { state } = useApp();
  const sfx = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'play' | 'done'>('intro');
  const [whaleLane, setWhaleLane] = useState(1);
  const [objects, setObjects] = useState<Obj[]>([]);
  const [distance, setDistance] = useState(0);
  const [phase, setPhase] = useState(0);
  const [lives, setLives] = useState(3);
  const [shielded, setShielded] = useState(false);
  const [score, setScore] = useState(0);
  const [collected, setCollected] = useState({ fish: 0, gem: 0, scroll: 0, dolphin: 0 });
  const [startedAt, setStartedAt] = useState(0);
  const [burst, setBurst] = useState(false);
  const [isHit, setIsHit] = useState(false);
  const [phaseMsg, setPhaseMsg] = useState('');
  const [combo, setCombo] = useState(0);

  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const objId = useRef(0);
  const livR = useRef(3);
  const distR = useRef(0);
  const phaseR = useRef(0);
  const shieldR = useRef(false);
  const laneR = useRef(1);

  const shakeA = useRef(new Animated.Value(0)).current;
  const whaleA = useRef(new Animated.Value(1)).current;

  const getPhase = (d: number): number => {
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (i === 0) return 0;
      if (d >= PHASES[i - 1].dist) return i;
    }
    return 0;
  };

  const moveLane = (dir: 'up' | 'down') => {
    sfx.playTap();
    setWhaleLane(l => {
      const nl = dir === 'up' ? Math.max(0, l - 1) : Math.min(LANES - 1, l + 1);
      laneR.current = nl;
      return nl;
    });
  };

  const finish = useCallback((won: boolean) => {
    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = null;
    setStep('done');
    won ? sfx.playPerfect() : sfx.playFail();
  }, [sfx]);

  const gameLoop = useCallback(() => {
    const p = PHASES[phaseR.current];
    distR.current += 0.35;
    setDistance(distR.current);

    // Phase transitions
    const np = getPhase(distR.current);
    if (np !== phaseR.current) {
      phaseR.current = np;
      setPhase(np);
      setPhaseMsg(PHASES[np].name);
      sfx.playSuccess();
      setTimeout(() => setPhaseMsg(''), 2000);
    }

    if (distR.current >= 100) { finish(true); return; }

    // Move & cull objects
    setObjects(prev => {
      const spd = p.speed;
      let moved = prev.map(o => ({ ...o, x: o.x - spd })).filter(o => o.x > -OBJ_SIZE);

      // Collision check
      const lane = laneR.current;
      const whaleX1 = 30, whaleX2 = 30 + OBJ_SIZE;
      for (const o of moved) {
        if (o.lane !== lane) continue;
        const ox1 = o.x, ox2 = o.x + OBJ_SIZE;
        if (whaleX2 > ox1 && whaleX1 < ox2) {
          // Hit!
          if (o.kind === 'obstacle') {
            if (!shieldR.current) {
              livR.current -= 1;
              setLives(livR.current);
              setIsHit(true);
              setCombo(0);
              sfx.playFail();
              Animated.sequence([
                Animated.timing(shakeA, { toValue: 12, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeA, { toValue: -12, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeA, { toValue: 0, duration: 30, useNativeDriver: true }),
              ]).start();
              setTimeout(() => setIsHit(false), 500);
              if (livR.current <= 0) finish(false);
            } else {
              shieldR.current = false;
              setShielded(false);
              sfx.playTap();
            }
          } else {
            // Collectible!
            const pts = o.points + combo * 10;
            setScore(s => s + pts);
            setCombo(c => c + 1);
            if (o.kind === 'shield') { shieldR.current = true; setShielded(true); }
            if (o.kind === 'fish') setCollected(c => ({ ...c, fish: c.fish + 1 }));
            if (o.kind === 'gem') setCollected(c => ({ ...c, gem: c.gem + 1 }));
            if (o.kind === 'scroll') setCollected(c => ({ ...c, scroll: c.scroll + 1 }));
            if (o.kind === 'dolphin') setCollected(c => ({ ...c, dolphin: c.dolphin + 1 }));
            sfx.playSuccess();
            if (combo >= 3) { setBurst(true); setTimeout(() => setBurst(false), 300); }
          }
          moved = moved.filter(m => m.id !== o.id);
        }
      }

      // Spawn
      if (Math.random() < p.spawnRate) {
        const isCollectible = Math.random() < 0.35;
        if (isCollectible) {
          const c = weightedPick(COLLECTIBLES);
          moved.push({ id: objId.current++, lane: Math.floor(Math.random() * LANES), x: GW, kind: c.kind, emoji: c.emoji, points: c.points });
        } else {
          const obs = OBSTACLES_BY_PHASE[phaseR.current] ?? OBSTACLES_BY_PHASE[0];
          const o = pick(obs);
          moved.push({ id: objId.current++, lane: Math.floor(Math.random() * LANES), x: GW, kind: o.kind, emoji: o.emoji, points: 0 });
        }
      }

      // Survival score
      setScore(s => s + 3);
      return moved;
    });
  }, [sfx, finish, shakeA]);

  const start = () => {
    setStartedAt(Date.now());
    setWhaleLane(1); laneR.current = 1;
    setObjects([]); setDistance(0); distR.current = 0;
    setPhase(0);    phaseR.current = 0;
    setLives(3);    livR.current = 3;
    setShielded(false); shieldR.current = false;
    setScore(0); setCombo(0);
    setCollected({ fish: 0, gem: 0, scroll: 0, dolphin: 0 });
    objId.current = 0;
    setStep('play');
    sfx.playTap();
    loopRef.current = setInterval(gameLoop, 80);
  };

  useEffect(() => () => { if (loopRef.current) clearInterval(loopRef.current); }, []);

  const handleDone = () => {
    const s = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const won = distR.current >= 100;
    onDone({ completed: won, score: Math.round((won ? 70 : 40) + (livR.current / 3) * 30), mistakes: 3 - livR.current, seconds: s });
  };

  const instruction = 'Pilote a baleia pelo oceano! Passe por 4 fases: Mar Calmo, Tempestade, Dentro da Baleia e chegue à Praia! Colete peixes, gemas e pergaminhos, e desvie dos obstáculos!';

  /* ═══ INTRO ═══ */
  if (step === 'intro') return (
    <View style={{ gap: theme.spacing(2) }}>
      <Card style={{ gap: 16, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Text style={{ fontSize: 24 }}>⛈️🪨🌀</Text>
          <Text style={{ fontSize: 50 }}>🐋</Text>
          <Text style={{ fontSize: 24 }}>🏖️</Text>
        </View>
        <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Jonas: A Grande Aventura</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>{instruction}</Text>
        <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
          {[['🌊','Mar Calmo'],['⛈️','Tempestade'],['🐋','Dentro da Baleia'],['🏖️','Praia']].map(([e,t],i)=>(
            <View key={i} style={{ backgroundColor: (i < 2 ? '#0077B6' : i === 2 ? '#6B2020' : '#48CAE4')+'25', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700' }}>{e} {t}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {[['🐟','+50'],['💎','+100'],['📜','+200'],['🐬','+150'],['🛡️','Escudo']].map(([e,t],i)=>(
            <View key={i} style={{ backgroundColor: theme.colors.primary+'15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700' }}>{e} {t}</Text>
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: theme.colors.primary+'20', padding: 12, borderRadius: 12, width: '100%' }}>
          <Text style={{ ...theme.typography.small, textAlign: 'center', fontWeight: '700' }}>❤️ 3 vidas • 🏖️ Chegue à praia • 👆 Toque para mover!</Text>
        </View>
      </Card>
      <PrimaryButton title="🐋 Navegar!" onPress={start} />
    </View>
  );

  /* ═══ DONE ═══ */
  if (step === 'done') {
    const won = distance >= 100;
    const rat = won && lives === 3 ? '🏆 JONAS PERFEITO!' : won ? '⭐ Chegou a Nínive!' : '🌊 O mar venceu...';
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations && won} />
          <Text style={{ fontSize: 56 }}>{won ? '🏖️' : '🌊'}</Text>
          <Text style={{ ...theme.typography.title, color: won ? theme.colors.ok : theme.colors.warn }}>{rat}</Text>
          <View style={{ backgroundColor: theme.colors.stroke, padding: 16, borderRadius: 16, width: '100%', gap: 10 }}>
            {([['💎 Pontuação', `${score}`, theme.colors.primary],
               ['📍 Distância', `${Math.min(100,Math.round(distance))}%`, theme.colors.ok],
               ['🐟 Peixes', `${collected.fish}`, '#4169E1'],
               ['💎 Gemas', `${collected.gem}`, '#9C27B0'],
               ['📜 Pergaminhos', `${collected.scroll}`, '#FF9800'],
               ['🐬 Golfinhos', `${collected.dolphin}`, '#00B4D8'],
               ['❤️ Vidas', `${lives}/3`, lives > 0 ? theme.colors.ok : theme.colors.bad],
            ] as const).map(([l,v,c],i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700' }}>{l}:</Text>
                <Text style={{ fontWeight: '900', color: c, fontSize: 15 }}>{v}</Text>
              </View>
            ))}
          </View>
        </Card>
        <PrimaryButton title="✓ Continuar" onPress={handleDone} variant="success" />
      </View>
    );
  }

  /* ═══ PLAY ═══ */
  const ph = PHASES[phase];
  return (
    <View style={{ gap: theme.spacing(1) }}>
      {/* HUD */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 3 }}>
          {[...Array(3)].map((_,i) => <Text key={i} style={{ fontSize: 18, opacity: i < lives ? 1 : 0.2 }}>❤️</Text>)}
          {shielded && <Text style={{ fontSize: 16 }}>🛡️</Text>}
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {combo >= 3 && <View style={{ backgroundColor: '#FF6B00', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 10 }}>🔥{combo}x</Text>
          </View>}
          <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>💎 {score}</Text>
          </View>
        </View>
      </View>

      {/* Phase & progress */}
      <View style={{ alignItems: 'center', gap: 4 }}>
        {phaseMsg ? (
          <View style={{ backgroundColor: '#FFD70050', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 10 }}>
            <Text style={{ fontWeight: '900', fontSize: 14 }}>{ph.emoji} {phaseMsg}</Text>
          </View>
        ) : (
          <Text style={{ fontWeight: '700', fontSize: 11, color: theme.colors.muted }}>{ph.emoji} {ph.name}</Text>
        )}
      </View>

      <View style={{ height: 14, backgroundColor: theme.colors.stroke, borderRadius: 7, overflow: 'hidden', flexDirection: 'row' }}>
        {PHASES.map((p, i) => (
          <View key={i} style={{ flex: p.dist - (PHASES[i-1]?.dist ?? 0), backgroundColor: i <= phase ? p.bg[0] : 'transparent', opacity: i <= phase ? 1 : 0.2 }} />
        ))}
        <View style={{ position: 'absolute', left: `${Math.min(distance, 96)}%` }}>
          <Text style={{ fontSize: 12 }}>🐋</Text>
        </View>
        <View style={{ position: 'absolute', right: 2 }}>
          <Text style={{ fontSize: 12 }}>🏖️</Text>
        </View>
      </View>

      {/* Game area */}
      <Animated.View style={{ transform: [{ translateX: shakeA }] }}>
        <Pressable onPress={(e) => {
          const y = e.nativeEvent.locationY;
          if (y < GH / 2) moveLane('up');
          else moveLane('down');
        }} style={{ alignSelf: 'center' }}>
          <LinearGradient colors={ph.bg} style={{ width: GW, height: GH, borderRadius: 16, overflow: 'hidden' }}>

            {/* Lane dividers */}
            {[1, 2].map(i => (
              <View key={i} style={{ position: 'absolute', top: i * LANE_H, left: 0, right: 0, height: 1, backgroundColor: '#ffffff20' }} />
            ))}

            {/* Objects */}
            {objects.map(o => (
              <View key={o.id} style={{
                position: 'absolute', left: o.x, top: o.lane * LANE_H + (LANE_H - OBJ_SIZE) / 2,
                width: OBJ_SIZE, height: OBJ_SIZE, alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: OBJ_SIZE * 0.8 }}>{o.emoji}</Text>
              </View>
            ))}

            {/* Whale */}
            <Animated.View style={{
              position: 'absolute', left: 30,
              top: whaleLane * LANE_H + (LANE_H - OBJ_SIZE) / 2,
              width: OBJ_SIZE, height: OBJ_SIZE,
              transform: [{ scale: whaleA }], opacity: isHit ? 0.4 : 1,
            }}>
              <Text style={{ fontSize: OBJ_SIZE * 0.9 }}>🐋</Text>
              {shielded && <Text style={{ fontSize: 14, position: 'absolute', top: -8, right: -8 }}>🛡️</Text>}
            </Animated.View>

            {/* Lane arrows */}
            <View style={{ position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center', opacity: 0.4 }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>⬆️</Text>
            </View>
            <View style={{ position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center', opacity: 0.4 }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>⬇️</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Text style={{ ...theme.typography.small, color: theme.colors.muted, textAlign: 'center' }}>
        👆 Toque em cima para subir, embaixo para descer! Colete 🐟💎📜
      </Text>
      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
