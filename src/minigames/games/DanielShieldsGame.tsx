// Mini-game: Daniel na Cova dos Leões — Sobreviva às 3 Ondas!
// Mecânicas: bloqueio direcional, oração-escudo, anjo salvador, ataques duplos
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Animated, Vibration, type ViewStyle } from 'react-native';
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
type AttackKind = 'lion' | 'fire' | 'double';
type Wave = { attacks: number; baseTime: number; kinds: AttackKind[] };

const DIRS: Direction[] = ['up', 'down', 'left', 'right'];
const DIR_EMOJI: Record<Direction, string> = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };

const WAVES: Wave[] = [
  { attacks: 5,  baseTime: 2200, kinds: ['lion'] },
  { attacks: 6,  baseTime: 1800, kinds: ['lion', 'fire'] },
  { attacks: 7,  baseTime: 1300, kinds: ['lion', 'fire', 'double'] },
];

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randDir = () => pickRandom(DIRS);

export default function DanielShieldsGame({
  narrationEnabled, onDone,
}: { narrationEnabled: boolean; onDone: (r: MiniGameResult) => void }) {
  const { state } = useApp();
  const sfx = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'waveIntro' | 'play' | 'done'>('intro');
  const [wave, setWave] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(4);
  const [prayerCharges, setPrayerCharges] = useState(2);
  const [shieldOn, setShieldOn] = useState(false);
  const [targets, setTargets] = useState<Direction[]>([]);
  const [attackKind, setAttackKind] = useState<AttackKind>('lion');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canTap, setCanTap] = useState(false);
  const [burst, setBurst] = useState(false);
  const [angelMsg, setAngelMsg] = useState(false);
  const [totalBlocked, setTotalBlocked] = useState(0);
  const [totalAttacks, setTotalAttacks] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  const tmr = useRef<ReturnType<typeof setTimeout> | null>(null);
  const livR = useRef(4);
  const rndR = useRef(0);
  const wavR = useRef(0);

  const shakeA = useRef(new Animated.Value(0)).current;
  const lionA  = useRef(new Animated.Value(0)).current;
  const danA   = useRef(new Animated.Value(1)).current;
  const glowA  = useRef(new Animated.Value(0)).current;
  const angelA = useRef(new Animated.Value(0)).current;

  const clr = useCallback(() => { if (tmr.current) { clearTimeout(tmr.current); tmr.current = null; } }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeA, { toValue: 18, duration: 35, useNativeDriver: true }),
      Animated.timing(shakeA, { toValue: -18, duration: 35, useNativeDriver: true }),
      Animated.timing(shakeA, { toValue: 12, duration: 30, useNativeDriver: true }),
      Animated.timing(shakeA, { toValue: -12, duration: 30, useNativeDriver: true }),
      Animated.timing(shakeA, { toValue: 0, duration: 25, useNativeDriver: true }),
    ]).start();
  };

  const hurt = useCallback(() => {
    livR.current -= 1;
    setLives(livR.current);
    setStreak(0);
    sfx.playFail();
    shake();
    try { Vibration.vibrate(80); } catch {}
  }, [sfx]); // eslint-disable-line

  const finish = useCallback(() => {
    clr();
    setStep('done');
    livR.current > 0 ? sfx.playPerfect() : sfx.playFail();
  }, [clr, sfx]);

  /* ---------- angel ---------- */
  const tryAngel = useCallback(() => {
    if (livR.current >= 3 || Math.random() > 0.3) return;
    setAngelMsg(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(angelA, { toValue: -8, duration: 350, useNativeDriver: true }),
        Animated.timing(angelA, { toValue: 8, duration: 350, useNativeDriver: true }),
      ]), { iterations: 3 },
    ).start(() => {
      livR.current = Math.min(livR.current + 1, 4);
      setLives(livR.current);
      sfx.playSuccess();
      setAngelMsg(false);
    });
  }, [angelA, sfx]);

  /* ---------- prayer ---------- */
  const pray = () => {
    if (prayerCharges <= 0 || shieldOn || !canTap) return;
    setPrayerCharges(c => c - 1);
    setShieldOn(true);
    sfx.playSuccess();
    Animated.timing(glowA, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    setTimeout(() => {
      setShieldOn(false);
      Animated.timing(glowA, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }, 2500);
  };

  /* ---------- advance ---------- */
  const advance = useCallback(() => {
    setTimeout(() => {
      lionA.setValue(0);
      rndR.current += 1;
      setRound(rndR.current);
      livR.current > 0 ? nextRound() : finish();
    }, 650);
  }, []); // eslint-disable-line -- nextRound & finish bound below

  /* ---------- blocked ---------- */
  const blocked = useCallback((dirs: Direction[]) => {
    clr(); setCanTap(false);
    const pts = dirs.length * (100 + streak * 30);
    setScore(s => s + pts);
    setTotalBlocked(b => b + dirs.length);
    setStreak(s => { const n = s + 1; if (n > bestStreak) setBestStreak(n); return n; });
    setFeedback(streak >= 4 ? `🔥 COMBO x${streak + 1}!` : '🛡️ Bloqueado!');
    (streak >= 4 ? sfx.playPerfect : sfx.playSuccess)();
    Animated.sequence([
      Animated.timing(danA, { toValue: 1.25, duration: 80, useNativeDriver: true }),
      Animated.timing(danA, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    if (state.settings.animations && streak >= 2) { setBurst(true); setTimeout(() => setBurst(false), 400); }
    advance();
  }, [clr, streak, bestStreak, sfx, danA, state.settings.animations, advance]);

  /* ---------- next round ---------- */
  const nextRound = useCallback(() => {
    const w = WAVES[wavR.current];
    if (!w || rndR.current >= w.attacks || livR.current <= 0) {
      if (livR.current <= 0 || wavR.current >= WAVES.length - 1) { finish(); return; }
      wavR.current += 1; setWave(wavR.current);
      rndR.current = 0; setRound(0);
      setStep('waveIntro');
      tryAngel();
      return;
    }
    const k = pickRandom(w.kinds);
    setAttackKind(k);

    let dirs: Direction[];
    if (k === 'double') {
      const d1 = randDir();
      let d2 = randDir(); while (d2 === d1) d2 = randDir();
      dirs = [d1, d2];
    } else { dirs = [randDir()]; }
    setTargets(dirs);
    setFeedback(null);
    setCanTap(true);
    setTotalAttacks(a => a + dirs.length);
    Animated.spring(lionA, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();

    const limit = Math.max(800, w.baseTime - rndR.current * 55);
    tmr.current = setTimeout(() => {
      if (shieldOn) { blocked(dirs); return; }    // prayer auto-blocks
      setCanTap(false);
      setFeedback('⏰ Muito lento!');
      hurt(); advance();
    }, limit);
  }, [finish, hurt, tryAngel, blocked, advance, lionA, shieldOn]);

  // bind advance's dependency on nextRound
  // (we rely on React not stale-capturing because refs are used for mutable state)

  /* ---------- tap direction ---------- */
  const tap = (dir: Direction) => {
    if (!canTap) return;
    sfx.playTap();
    if (targets.includes(dir)) {
      const rest = targets.filter(d => d !== dir);
      if (rest.length === 0) blocked(targets);
      else { setTargets(rest); sfx.playSuccess(); }
    } else {
      clr(); setCanTap(false);
      setFeedback('❌ Direção errada!');
      hurt(); advance();
    }
  };

  /* ---------- start ---------- */
  const startGame = () => {
    setStartedAt(Date.now());
    livR.current = 4; wavR.current = 0; rndR.current = 0;
    setWave(0); setRound(0); setLives(4); setScore(0); setStreak(0);
    setBestStreak(0); setPrayerCharges(2); setShieldOn(false);
    setTotalBlocked(0); setTotalAttacks(0);
    setStep('waveIntro');
    sfx.playTap();
  };
  const startWave = () => { setStep('play'); sfx.playTap(); setTimeout(nextRound, 500); };

  useEffect(() => () => clr(), [clr]);

  const handleDone = () => {
    const s = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const acc = totalAttacks > 0 ? totalBlocked / totalAttacks : 0;
    onDone({ completed: livR.current > 0, score: Math.round(50 + acc * 50), mistakes: 4 - livR.current, seconds: s });
  };

  const instruction = 'Proteja Daniel na cova dos leões! Bloqueie tocando na direção certa. Use a Oração-Escudo para proteção divina. Sobreviva às 3 ondas cada vez mais difíceis!';

  /* ════ INTRO ════ */
  if (step === 'intro') return (
    <View style={{ gap: theme.spacing(2) }}>
      <Card style={{ gap: 16, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Text style={{ fontSize: 36 }}>🦁🦁</Text>
          <Text style={{ fontSize: 56 }}>🙏</Text>
          <Text style={{ fontSize: 36 }}>🦁🦁</Text>
        </View>
        <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Daniel na Cova</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>{instruction}</Text>
        <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {[['🛡️','Bloqueie leões'],['🙏','2 orações-escudo'],['😇','Anjo pode salvar'],['🔥','Combos dão bônus'],['🦁🦁','Ataques duplos!'],['⚡','Cada onda é + difícil']].map(([e,t],i)=>(
            <View key={i} style={{ backgroundColor: theme.colors.primary+'18', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: '700' }}>{e} {t}</Text>
            </View>
          ))}
        </View>
        <View style={{ backgroundColor: theme.colors.warn+'25', padding: 12, borderRadius: 12, width: '100%' }}>
          <Text style={{ ...theme.typography.small, textAlign: 'center', fontWeight: '700' }}>❤️ 4 vidas • 🌊 3 ondas • ⚡ Fique atento!</Text>
        </View>
      </Card>
      <PrimaryButton title="🛡️ Proteger Daniel!" onPress={startGame} />
    </View>
  );

  /* ════ WAVE INTRO ════ */
  if (step === 'waveIntro') {
    const names = ['Leões Famintos 🦁', 'Fogo e Leões 🔥🦁', 'Ataque Total! 🦁🦁🔥'];
    const bgs: [string,string][] = [['#2C1810','#4A3728'],['#4A1010','#6B2020'],['#1A0A2E','#3D1A5E']];
    const emojis = ['🦁','🔥','💀'];
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 14, alignItems: 'center' }}>
          <LinearGradient colors={bgs[wave]??bgs[0]} style={{ borderRadius: 16, padding: 24, width: '100%', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 48 }}>{emojis[wave]}</Text>
            <Text style={{ color: '#FFD700', fontWeight: '900', fontSize: 24 }}>ONDA {wave + 1}</Text>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{names[wave]}</Text>
            <Text style={{ color: '#ccc', fontSize: 13, textAlign: 'center' }}>
              {WAVES[wave].attacks} ataques • {wave === 2 ? 'Leões em DUPLA!' : wave === 1 ? 'Cuidado com o fogo!' : 'Bloqueie os leões!'}
            </Text>
          </LinearGradient>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[...Array(4)].map((_,i) => <Text key={i} style={{ fontSize: 22, opacity: i < lives ? 1 : 0.2 }}>❤️</Text>)}
            <Text style={{ fontSize: 14, alignSelf: 'center', marginLeft: 8, fontWeight: '700' }}>🙏 x{prayerCharges}</Text>
          </View>
        </Card>
        <PrimaryButton title={`⚔️ Enfrentar Onda ${wave+1}!`} onPress={startWave} />
      </View>
    );
  }

  /* ════ DONE ════ */
  if (step === 'done') {
    const ok = lives > 0;
    const wCleared = wave + (rndR.current >= (WAVES[wave]?.attacks ?? 0) ? 1 : 0);
    const rat = ok && bestStreak >= 8 ? '🏆 HERÓI DA FÉ!' : ok && bestStreak >= 4 ? '⭐ Escudo Divino!' : ok ? '✝️ Sobreviveu!' : wCleared >= 2 ? '💪 Quase lá!' : '😔 Tente de novo!';
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations && ok} />
          <Text style={{ fontSize: 56 }}>{ok ? '😇✨' : '🦁'}</Text>
          <Text style={{ ...theme.typography.title, color: ok ? theme.colors.ok : theme.colors.warn }}>{rat}</Text>
          <View style={{ backgroundColor: theme.colors.stroke, padding: 16, borderRadius: 16, width: '100%', gap: 10 }}>
            {([['💎 Pontuação', `${score}`, theme.colors.primary],
               ['🌊 Ondas', `${wCleared}/3`, theme.colors.ok],
               ['🛡️ Bloqueados', `${totalBlocked}/${totalAttacks}`, theme.colors.ok],
               ['🔥 Melhor combo', `${bestStreak}x`, theme.colors.primary2],
               ['❤️ Vidas', `${lives}/4`, lives > 0 ? theme.colors.ok : theme.colors.bad],
            ] as const).map(([l,v,c],i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700' }}>{l}:</Text>
                <Text style={{ fontWeight: '900', color: c, fontSize: 16 }}>{v}</Text>
              </View>
            ))}
          </View>
        </Card>
        <PrimaryButton title="✓ Continuar" onPress={handleDone} variant="success" />
      </View>
    );
  }

  /* ════ PLAY ════ */
  const wCfg = WAVES[wave];
  const aRef = useRef({ w: 300, h: 220 });
  const handleTouch = (e: any) => {
    if (!canTap) return;
    const { locationX: lx, locationY: ly } = e.nativeEvent;
    const cx = aRef.current.w / 2, cy = aRef.current.h / 2;
    const dx = lx - cx, dy = ly - cy;
    if (Math.abs(dx) < 35 && Math.abs(dy) < 35) { pray(); return; }
    tap(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  };
  const arenaColors: readonly [string,string,string][] = [['#2C1810','#4A3728','#3D2817'],['#4A1010','#6B2020','#5A1818'],['#1A0A2E','#3D1A5E','#2D0E4E']];

  return (
    <View style={{ gap: theme.spacing(1) }}>
      {/* HUD */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 2 }}>
          {[...Array(4)].map((_,i) => <Text key={i} style={{ fontSize: 17, opacity: i < lives ? 1 : 0.2 }}>❤️</Text>)}
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {streak >= 3 && <View style={{ backgroundColor: '#FF6B00', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>🔥{streak}x</Text>
          </View>}
          <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>💎 {score}</Text>
          </View>
        </View>
      </View>

      {/* Progress */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontWeight: '900', fontSize: 11, color: theme.colors.muted }}>ONDA {wave+1}</Text>
        <View style={{ flex: 1, height: 6, backgroundColor: theme.colors.stroke, borderRadius: 3, overflow: 'hidden' }}>
          <View style={{ height: '100%', backgroundColor: wave === 0 ? theme.colors.ok : wave === 1 ? '#FF9800' : theme.colors.bad, width: `${(round/(wCfg?.attacks??1))*100}%` }} />
        </View>
        <Text style={{ fontWeight: '700', fontSize: 11, color: theme.colors.muted }}>{round}/{wCfg?.attacks}</Text>
      </View>

      {/* Arena */}
      <Animated.View style={{ transform: [{ translateX: shakeA }] }}>
        <Pressable onPress={handleTouch}>
          <LinearGradient colors={arenaColors[wave]??arenaColors[0]}
            style={{ borderRadius: 20, padding: 16, alignItems: 'center', minHeight: 220 }}
            onLayout={e => { aRef.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height }; }}>

            {(DIRS).map(d => {
              const on = targets.includes(d);
              const pos: ViewStyle = d === 'up' ? { top: 6, left: 0, right: 0 }
                : d === 'down' ? { bottom: 6, left: 0, right: 0 }
                : d === 'left' ? { left: 6, top: 80 }
                : { right: 6, top: 80 };
              return (
                <View key={d} style={[{ position: 'absolute' as const, alignItems: 'center' as const }, pos]}>
                  <Animated.Text style={{ fontSize: 44, opacity: on ? lionA : 0.12, transform: [{ scale: on ? lionA : 0.7 }] }}>
                    {on && attackKind === 'fire' ? '🔥' : '🦁'}
                  </Animated.Text>
                  {on && <Text style={{ fontSize: 9, color: '#FFD700', fontWeight: '900' }}>{DIR_EMOJI[d]}</Text>}
                </View>
              );
            })}

            <Animated.View style={{ marginTop: 52, transform: [{ scale: danA }] }}>
              <Text style={{ fontSize: 60 }}>🙏</Text>
            </Animated.View>

            {shieldOn && <Animated.View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: 20, borderWidth: 4, borderColor: '#FFD700', opacity: glowA, backgroundColor: '#FFD70020',
            }} />}

            {angelMsg && (
              <Animated.View style={{ position: 'absolute', top: 10, right: 16, transform: [{ translateY: angelA }] }}>
                <Text style={{ fontSize: 32 }}>😇✨</Text>
                <Text style={{ color: '#FFD700', fontSize: 9, fontWeight: '900' }}>+1 ❤️</Text>
              </Animated.View>
            )}

            {feedback && (
              <View style={{
                position: 'absolute', bottom: 14,
                backgroundColor: (feedback.includes('❌') || feedback.includes('⏰') ? theme.colors.bad : theme.colors.ok) + 'DD',
                paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10,
              }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{feedback}</Text>
              </View>
            )}

            {attackKind === 'double' && targets.length > 1 && (
              <View style={{ position: 'absolute', top: 5, backgroundColor: '#FF000099', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 10 }}>⚠️ ATAQUE DUPLO!</Text>
              </View>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Prayer btn */}
      <View style={{ alignItems: 'center' }}>
        <Pressable onPress={pray} disabled={prayerCharges <= 0 || shieldOn}
          style={{ backgroundColor: prayerCharges > 0 ? '#FFD70030' : '#eee', borderWidth: 2,
            borderColor: prayerCharges > 0 ? '#FFD700' : '#ccc',
            paddingHorizontal: 18, paddingVertical: 8, borderRadius: 14,
            opacity: prayerCharges > 0 && !shieldOn ? 1 : 0.35 }}>
          <Text style={{ fontWeight: '900', fontSize: 13 }}>🙏 Oração-Escudo ({prayerCharges})</Text>
        </Pressable>
      </View>

      <Text style={{ ...theme.typography.small, color: theme.colors.muted, textAlign: 'center' }}>
        {shieldOn ? '✨ Escudo ativo! 2.5s de proteção' : '👆 Toque na direção do ataque! Centro = 🙏'}
      </Text>
      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
