// Mini-game: Parábola do Semeador — Jardim Interativo
// Mecânicas: quiz com jardim crescendo, rega por acertos, colheita bônus,
// sementes douradas, fases de dificuldade, animação de crescimento
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, Text, Pressable, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SpeakButton from '../../components/SpeakButton';
import ConfettiBurst from '../../components/ConfettiBurst';
import { useSfx } from '../../sfx/SoundManager';
import { useApp } from '../../state/AppState';
import { theme } from '../../theme';
import type { MiniGameResult } from '../types';

/* ── Soil types ── */
type SoilId = 'road' | 'rocks' | 'thorns' | 'good';
const SOILS: { id: SoilId; label: string; emoji: string; desc: string; color: string }[] = [
  { id: 'road',   label: 'Beira da Estrada', emoji: '🛤️', desc: 'Pássaros comem a semente', color: '#9E9E9E' },
  { id: 'rocks',  label: 'Solo Pedregoso',   emoji: '🪨', desc: 'Brota rápido mas seca',    color: '#A1887F' },
  { id: 'thorns', label: 'Entre Espinhos',    emoji: '🌿', desc: 'Sufocada pelos espinhos',  color: '#689F38' },
  { id: 'good',   label: 'Boa Terra',         emoji: '🌾', desc: 'Dá muitos frutos!',        color: '#43A047' },
];

/* ── Questions (24 total, shuffled and drawn) ── */
const QUESTIONS: { text: string; answer: SoilId }[] = [
  { text: 'A semente caiu num lugar onde todo mundo passa por cima.', answer: 'road' },
  { text: 'O jovem ouve a Palavra mas desiste na primeira dificuldade.', answer: 'rocks' },
  { text: 'A pessoa acredita mas o dinheiro e a fama tomam seu coração.', answer: 'thorns' },
  { text: 'A família lê a Bíblia toda noite e pratica o amor ao próximo.', answer: 'good' },
  { text: 'A semente caiu no chão duro e os pássaros vieram comer.', answer: 'road' },
  { text: 'O jovem se emocionou na igreja mas esqueceu tudo na segunda-feira.', answer: 'rocks' },
  { text: 'O menino decorou o versículo mas videogame virou mais importante.', answer: 'thorns' },
  { text: 'A menina repartiu seu lanche com quem tinha fome.', answer: 'good' },
  { text: 'A criança ouviu a história mas não prestou atenção.', answer: 'road' },
  { text: 'A planta nasceu rápido mas morreu porque não tinha raiz.', answer: 'rocks' },
  { text: 'O garoto prometeu orar toda noite mas a preguiça venceu.', answer: 'thorns' },
  { text: 'A senhora ajuda na igreja e cuida dos mais velhos com carinho.', answer: 'good' },
  { text: 'O pássaro levou a semente direto para o ninho.', answer: 'road' },
  { text: 'No calor forte, a plantinha murchou pois não tinha solo profundo.', answer: 'rocks' },
  { text: 'A menina quis ajudar mas suas amigas a convenceram a não ir.', answer: 'thorns' },
  { text: 'O menino perdoou o amigo que o magoou, como Jesus ensinou.', answer: 'good' },
  { text: 'Nem ouviu a palavra, já estava distraído com outra coisa.', answer: 'road' },
  { text: 'Ficou animado no culto de criança mas a fé foi embora na semana.', answer: 'rocks' },
  { text: 'As preocupações do dia a dia fizeram ela esquecer de Deus.', answer: 'thorns' },
  { text: 'O pai ensina seus filhos a orar e confiar em Deus.', answer: 'good' },
  { text: 'A Palavra foi compartilhada mas ninguém parou para ouvir.', answer: 'road' },
  { text: 'Chorou ao ouvir a pregação mas no dia seguinte negou a fé.', answer: 'rocks' },
  { text: 'As tentações do mundo eram mais atraentes que os ensinamentos.', answer: 'thorns' },
  { text: 'A comunidade se uniu para ajudar os necessitados com alegria.', answer: 'good' },
];

const ROUNDS = 12;
const PHASE_ROUNDS = [4, 8, 12]; // Phase boundaries
const PLANT_STAGES = ['🌱', '🪴', '🌸', '🌳', '🍎'];
const BONUS_COMBO = 3; // Trigger harvest bonus at 3-combo

export default function ParablesSeedGame({
  narrationEnabled, onDone,
}: { narrationEnabled: boolean; onDone: (r: MiniGameResult) => void }) {
  const { state } = useApp();
  const sfx = useSfx(state.settings.sound);

  const [step, setStep] = useState<'intro' | 'playing' | 'water' | 'harvest' | 'done'>('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timer, setTimer] = useState(120);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [garden, setGarden] = useState<string[]>([]); // Plants in garden
  const [selected, setSelected] = useState<SoilId | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [burst, setBurst] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [goldenSeed, setGoldenSeed] = useState(false);
  const [waterTaps, setWaterTaps] = useState(0);
  const [harvestScore, setHarvestScore] = useState(0);
  const [harvestTaps, setHarvestTaps] = useState(0);
  const [harvestTimer, setHarvestTimer] = useState(0);

  const shakeA = useRef(new Animated.Value(0)).current;
  const seedA = useRef(new Animated.Value(0)).current;
  const plantA = useRef(new Animated.Value(0)).current;
  const tmrRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const harvestTmrRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Shuffle questions
  const questions = useMemo(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, ROUNDS);
  }, []);

  const currentQ = questions[round];
  const phase = round < 4 ? 1 : round < 8 ? 2 : 3;

  // Timer
  useEffect(() => {
    if (step !== 'playing' && step !== 'water') return;
    tmrRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          if (tmrRef.current) clearInterval(tmrRef.current);
          setStep('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (tmrRef.current) clearInterval(tmrRef.current); };
  }, [step]);

  /* ── Start ── */
  const start = () => {
    setStartedAt(Date.now());
    setRound(0); setScore(0); setCombo(0); setMaxCombo(0); setTimer(120);
    setStreak(0); setMistakes(0); setGarden([]); setStep('playing');
    setGoldenSeed(false); setSelected(null); setCorrect(null);
  };

  /* ── Answer ── */
  const answer = (soil: SoilId) => {
    if (selected !== null) return;
    setSelected(soil);
    sfx.playTap();

    const isCorrect = soil === currentQ.answer;
    setCorrect(isCorrect);

    if (isCorrect) {
      sfx.playSuccess();
      const isGolden = goldenSeed;
      const comboMult = 1 + combo * 0.15;
      const phaseMult = phase;
      const goldenMult = isGolden ? 2 : 1;
      const pts = Math.round(100 * comboMult * phaseMult * goldenMult);
      setScore(s => s + pts);
      setCombo(c => {
        const nc = c + 1;
        setMaxCombo(m => Math.max(m, nc));
        return nc;
      });
      setStreak(s => s + 1);

      // Animate seed planting
      Animated.sequence([
        Animated.timing(seedA, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(seedA, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();

      // Go to watering phase
      if (currentQ.answer === 'good') {
        setTimeout(() => setStep('water'), 600);
      } else {
        setTimeout(() => advanceRound(), 1000);
      }
    } else {
      sfx.playFail();
      setCombo(0);
      setMistakes(m => m + 1);
      Animated.sequence([
        Animated.timing(shakeA, { toValue: 12, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeA, { toValue: -12, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeA, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
      setTimeout(() => advanceRound(), 1200);
    }
  };

  /* ── Watering ── */
  const tapWater = () => {
    sfx.playTap();
    setWaterTaps(w => {
      const nw = w + 1;
      Animated.timing(plantA, { toValue: nw / 5, duration: 150, useNativeDriver: true }).start();
      if (nw >= 5) {
        // Plant fully grown!
        sfx.playPerfect();
        const plantEmoji = PLANT_STAGES[Math.min(PLANT_STAGES.length - 1, garden.length)];
        setGarden(g => [...g, plantEmoji]);
        setBurst(true); setTimeout(() => setBurst(false), 400);
        setScore(s => s + 150);

        // Check if harvest bonus triggered
        if (combo >= BONUS_COMBO && combo % BONUS_COMBO === 0) {
          setTimeout(() => startHarvest(), 600);
        } else {
          setTimeout(() => advanceRound(), 600);
        }
        return 0;
      }
      return nw;
    });
  };

  /* ── Harvest bonus ── */
  const startHarvest = useCallback(() => {
    setStep('harvest');
    setHarvestTaps(0);
    setHarvestScore(0);
    setHarvestTimer(4);
    harvestTmrRef.current = setInterval(() => {
      setHarvestTimer(t => {
        if (t <= 1) {
          if (harvestTmrRef.current) clearInterval(harvestTmrRef.current);
          setTimeout(() => advanceRoundDirect(), 500);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (harvestTmrRef.current) clearInterval(harvestTmrRef.current); }, []);

  const tapHarvest = () => {
    sfx.playTap();
    setHarvestTaps(h => h + 1);
    const pts = 25 + Math.floor(Math.random() * 50);
    setHarvestScore(s => s + pts);
    setScore(s => s + pts);
  };

  const advanceRoundDirect = () => {
    if (round + 1 >= ROUNDS) {
      setStep('done');
      return;
    }
    setRound(r => r + 1);
    setSelected(null); setCorrect(null);
    setWaterTaps(0); plantA.setValue(0);
    setGoldenSeed(Math.random() < 0.2); // 20% golden seed
    setStep('playing');
  };

  /* ── Advance round ── */
  const advanceRound = () => {
    advanceRoundDirect();
  };

  const handleDone = () => {
    const s = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    onDone({
      completed: round >= ROUNDS - 1 && mistakes < ROUNDS,
      score: Math.round(Math.min(100, 30 + ((round + 1) / ROUNDS) * 40 + (maxCombo / ROUNDS) * 30)),
      mistakes, seconds: s,
    });
  };

  const instruction = 'Seja um bom semeador! Leia cada situação e escolha o tipo de solo que ela representa. Regue as plantas na Boa Terra para fazê-las crescer! Combos destravam colheitas bônus com pontos extras!';

  /* ═══ INTRO ═══ */
  if (step === 'intro') return (
    <View style={{ gap: theme.spacing(2) }}>
      <Card style={{ gap: 16, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Text style={{ fontSize: 40 }}>🌱</Text>
          <Text style={{ fontSize: 50 }}>👨‍🌾</Text>
          <Text style={{ fontSize: 40 }}>🌾</Text>
        </View>
        <Text style={{ ...theme.typography.title, textAlign: 'center' }}>O Jardim do Semeador</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>{instruction}</Text>
        <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
          {SOILS.map(s => (
            <View key={s.id} style={{ backgroundColor: s.color + '22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700' }}>{s.emoji} {s.label}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
          {[['💧','Regue as plantas!'],['🌟','Sementes douradas 2x!'],['🧺','Colheita bônus!']].map(([e,t],i) => (
            <View key={i} style={{ backgroundColor: theme.colors.primary+'18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: '700' }}>{e} {t}</Text>
            </View>
          ))}
        </View>
        <View style={{ backgroundColor: theme.colors.primary+'20', padding: 12, borderRadius: 12, width: '100%' }}>
          <Text style={{ ...theme.typography.small, textAlign: 'center', fontWeight: '700' }}>📖 {ROUNDS} perguntas • ⏱️ 120 segundos • 🌾 Cultive seu jardim!</Text>
        </View>
      </Card>
      <PrimaryButton title="🌱 Plantar!" onPress={start} />
    </View>
  );

  /* ═══ WATERING ═══ */
  if (step === 'water') return (
    <View style={{ gap: theme.spacing(2) }}>
      <Card style={{ gap: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.ok }}>BOA TERRA! 🌾 Regue para crescer!</Text>
        <Pressable onPress={tapWater} style={{ padding: 20 }}>
          <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={{ borderRadius: 20, padding: 30, alignItems: 'center' }}>
            <Animated.Text style={{ fontSize: 72, transform: [{ scale: Animated.add(1, Animated.multiply(plantA, 0.5)) }] }}>
              {PLANT_STAGES[Math.min(waterTaps, PLANT_STAGES.length - 1)]}
            </Animated.Text>
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 12 }}>
              {[...Array(5)].map((_, i) => (
                <Text key={i} style={{ fontSize: 20, opacity: i < waterTaps ? 1 : 0.2 }}>💧</Text>
              ))}
            </View>
            <Text style={{ ...theme.typography.body, color: theme.colors.muted, marginTop: 8 }}>
              Toque para regar! ({waterTaps}/5)
            </Text>
          </LinearGradient>
        </Pressable>
      </Card>
      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );

  /* ═══ HARVEST BONUS ═══ */
  if (step === 'harvest') return (
    <View style={{ gap: theme.spacing(2) }}>
      <Card style={{ gap: 16, alignItems: 'center' }}>
        <LinearGradient colors={['#FFD54F', '#FF6F00']} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>🧺 COLHEITA BÔNUS! ⏱️ {harvestTimer}s</Text>
        </LinearGradient>
        <Pressable onPress={tapHarvest} style={{ padding: 10 }}>
          <LinearGradient colors={['#FFF8E1', '#FFECB3']} style={{ borderRadius: 20, padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 80 }}>🧺</Text>
            <Text style={{ fontSize: 28, marginTop: 8 }}>🍎🍇🍊🍋</Text>
            <Text style={{ ...theme.typography.body, fontWeight: '900', color: '#FF6F00', marginTop: 8 }}>
              Toques: {harvestTaps} • +{harvestScore} pts
            </Text>
          </LinearGradient>
        </Pressable>
        <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>Toque rápido para colher!</Text>
      </Card>
    </View>
  );

  /* ═══ DONE ═══ */
  if (step === 'done') {
    const corrects = round + 1 - mistakes;
    const pct = Math.round((corrects / (round + 1)) * 100);
    const won = corrects >= ROUNDS * 0.6;
    const rat = pct >= 90 ? '🏆 Semeador Mestre!' : pct >= 70 ? '🌾 Boa Colheita!' : pct >= 50 ? '🌱 Brotando!' : '🧑‍🌾 Continue tentando!';
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations && won} />
          <Text style={{ fontSize: 56 }}>{won ? '🌾' : '🌱'}</Text>
          <Text style={{ ...theme.typography.title, color: won ? theme.colors.ok : theme.colors.warn }}>{rat}</Text>
          <View style={{ backgroundColor: theme.colors.stroke, padding: 16, borderRadius: 16, width: '100%', gap: 10 }}>
            {([['💎 Pontuação', `${score}`, theme.colors.primary],
               ['✅ Acertos', `${corrects}/${round + 1}`, theme.colors.ok],
               ['❌ Erros', `${mistakes}`, theme.colors.bad],
               ['🔥 Maior combo', `${maxCombo}x`, theme.colors.primary2],
               ['🌳 Jardim', `${garden.length} plantas`, theme.colors.ok],
               ['⏱️ Tempo', `${120 - timer}s`, theme.colors.muted],
            ] as const).map(([l,v,c], i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700' }}>{l}:</Text>
                <Text style={{ fontWeight: '900', color: c, fontSize: 15 }}>{v}</Text>
              </View>
            ))}
          </View>
          {garden.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {garden.map((p, i) => <Text key={i} style={{ fontSize: 24 }}>{p}</Text>)}
            </View>
          )}
        </Card>
        <PrimaryButton title="✓ Continuar" onPress={handleDone} variant="success" />
      </View>
    );
  }

  /* ═══ PLAYING ═══ */
  return (
    <ScrollView contentContainerStyle={{ gap: theme.spacing(1), paddingBottom: 20 }}>
      {/* HUD */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <View style={{ backgroundColor: timer <= 20 ? theme.colors.bad : theme.colors.ok, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>⏱️ {timer}s</Text>
          </View>
          {combo > 0 && (
            <View style={{ backgroundColor: '#FF6F00', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>🔥 {combo}x</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.colors.primary+'30', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
            <Text style={{ fontWeight: '900', fontSize: 11 }}>{round + 1}/{ROUNDS}</Text>
          </View>
          <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>💎 {score}</Text>
          </View>
        </View>
      </View>

      {/* Garden */}
      {garden.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center', backgroundColor: '#E8F5E9', padding: 6, borderRadius: 12 }}>
          {garden.map((p, i) => <Text key={i} style={{ fontSize: 18 }}>{p}</Text>)}
        </View>
      )}

      {/* Question */}
      <Animated.View style={{ transform: [{ translateX: shakeA }] }}>
        <Card style={{ gap: 12, borderWidth: goldenSeed ? 2 : 0, borderColor: goldenSeed ? '#FFD700' : 'transparent' }}>
          {goldenSeed && (
            <View style={{ alignItems: 'center' }}>
              <LinearGradient colors={['#FFD54F', '#FFA000']} style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>🌟 SEMENTE DOURADA - PONTOS 2x!</Text>
              </LinearGradient>
            </View>
          )}
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.muted }}>
              Fase {phase}/3 • Pergunta {round + 1}
            </Text>
          </View>
          <Animated.View style={{ transform: [{ translateY: Animated.multiply(seedA, -20) }] }}>
            <Text style={{ fontSize: 32, textAlign: 'center' }}>{goldenSeed ? '✨🌱✨' : '🌱'}</Text>
          </Animated.View>
          <Text style={{
            ...theme.typography.body, textAlign: 'center', fontWeight: '600',
            fontSize: phase >= 3 ? 13 : 14,
          }}>
            "{currentQ.text}"
          </Text>

          {/* Correct/Wrong feedback */}
          {correct !== null && (
            <View style={{
              backgroundColor: correct ? theme.colors.ok+'20' : theme.colors.bad+'20',
              padding: 10, borderRadius: 12, alignItems: 'center',
            }}>
              <Text style={{ fontWeight: '900', color: correct ? theme.colors.ok : theme.colors.bad }}>
                {correct ? '✅ Correto!' : `❌ Era: ${SOILS.find(s=>s.id===currentQ.answer)?.emoji} ${SOILS.find(s=>s.id===currentQ.answer)?.label}`}
              </Text>
              {correct && goldenSeed && <Text style={{ fontSize: 11, color: '#FF6F00', fontWeight: '700' }}>🌟 Pontos dobrados!</Text>}
            </View>
          )}
        </Card>
      </Animated.View>

      {/* Soil choices */}
      <View style={{ gap: 8 }}>
        {SOILS.map(soil => {
          const isSelected = selected === soil.id;
          const isAnswer = correct !== null && soil.id === currentQ.answer;
          return (
            <Pressable key={soil.id} onPress={() => answer(soil.id)} disabled={selected !== null}>
              <LinearGradient
                colors={isAnswer ? [theme.colors.ok+'40', theme.colors.ok+'20'] as const
                  : isSelected && !correct ? [theme.colors.bad+'40', theme.colors.bad+'20'] as const
                  : [soil.color+'18', soil.color+'08'] as const}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  padding: 14, borderRadius: 14,
                  borderWidth: isAnswer ? 2 : isSelected ? 2 : 1,
                  borderColor: isAnswer ? theme.colors.ok : isSelected ? theme.colors.bad : theme.colors.stroke,
                  opacity: selected !== null && !isSelected && !isAnswer ? 0.4 : 1,
                }}
              >
                <Text style={{ fontSize: 28 }}>{soil.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', fontSize: 14 }}>{soil.label}</Text>
                  <Text style={{ fontSize: 11, color: theme.colors.muted }}>{soil.desc}</Text>
                </View>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>

      <ConfettiBurst show={burst && state.settings.animations} />
    </ScrollView>
  );
}
