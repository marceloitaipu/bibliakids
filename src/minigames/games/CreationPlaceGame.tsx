import React, { useMemo, useState, useEffect, useRef } from 'react';
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

type ZoneId = 'ceu' | 'mar' | 'terra';
type Item = { id: string; emoji: string; name: string; zone: ZoneId; hint: string };

const ZONES: { id: ZoneId; title: string; emoji: string; gradient: readonly [string, string] }[] = [
  { id: 'ceu', title: 'Céu', emoji: '☁️', gradient: ['#87CEEB', '#4A90D9'] as const },
  { id: 'mar', title: 'Mar', emoji: '🌊', gradient: ['#4169E1', '#1E3A8A'] as const },
  { id: 'terra', title: 'Terra', emoji: '🌿', gradient: ['#90EE90', '#228B22'] as const },
];

const ITEMS: Item[] = [
  { id: 'sun', emoji: '☀️', name: 'Sol', zone: 'ceu', hint: 'Brilha no céu durante o dia' },
  { id: 'moon', emoji: '🌙', name: 'Lua', zone: 'ceu', hint: 'Aparece à noite no céu' },
  { id: 'bird', emoji: '🦅', name: 'Águia', zone: 'ceu', hint: 'Voa bem alto nas nuvens' },
  { id: 'star', emoji: '⭐', name: 'Estrela', zone: 'ceu', hint: 'Pisca no céu à noite' },
  { id: 'fish', emoji: '🐠', name: 'Peixe', zone: 'mar', hint: 'Nada nas águas' },
  { id: 'whale', emoji: '🐋', name: 'Baleia', zone: 'mar', hint: 'O maior animal do oceano' },
  { id: 'dolphin', emoji: '🐬', name: 'Golfinho', zone: 'mar', hint: 'Salta nas ondas do mar' },
  { id: 'octopus', emoji: '🐙', name: 'Polvo', zone: 'mar', hint: 'Tem 8 braços no fundo do mar' },
  { id: 'tree', emoji: '🌳', name: 'Árvore', zone: 'terra', hint: 'Cresce na terra e dá sombra' },
  { id: 'flower', emoji: '🌻', name: 'Girassol', zone: 'terra', hint: 'Flor que olha para o sol' },
  { id: 'rabbit', emoji: '🐰', name: 'Coelho', zone: 'terra', hint: 'Pula na grama verde' },
  { id: 'lion', emoji: '🦁', name: 'Leão', zone: 'terra', hint: 'O rei da savana' },
];

function pickN<T>(arr: T[], n: number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

const { width } = Dimensions.get('window');
const itemSize = Math.min(70, (width - 100) / 3);

export default function CreationPlaceGame({
  narrationEnabled,
  onDone,
}: {
  narrationEnabled: boolean;
  onDone: (r: MiniGameResult) => void;
}) {
  const { state } = useApp();
  const { playTap, playFail, playSuccess, playPerfect } = useSfx(state.settings.sound);

  const pool = useMemo(() => {
    const ceuItems = pickN(ITEMS.filter(i => i.zone === 'ceu'), 2);
    const marItems = pickN(ITEMS.filter(i => i.zone === 'mar'), 2);
    const terraItems = pickN(ITEMS.filter(i => i.zone === 'terra'), 2);
    return [...ceuItems, ...marItems, ...terraItems].sort(() => Math.random() - 0.5);
  }, []);

  const [step, setStep] = useState<'intro' | 'play' | 'done'>('intro');
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, ZoneId>>({});
  const [mistakes, setMistakes] = useState(0);
  const [touches, setTouches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [combo, setCombo] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const placedCount = Object.keys(placed).length;
    Animated.spring(progressAnim, {
      toValue: placedCount / pool.length,
      useNativeDriver: false,
    }).start();
  }, [placed, pool.length, progressAnim]);

  const instruction = 'Deus criou o mundo! Toque em um item e depois no lugar certo: Céu, Mar ou Terra.';

  const start = () => {
    setStartedAt(Date.now());
    setStep('play');
    playTap();
  };

  const selectItem = (itemId: string) => {
    if (placed[itemId]) return;
    playTap();
    setSelected(itemId);
  };

  const placeInZone = (zone: ZoneId) => {
    if (!selected) return;
    setTouches((t) => t + 1);
    const it = pool.find((x) => x.id === selected);
    if (!it) return;

    if (it.zone !== zone) {
      setMistakes((m) => m + 1);
      setCombo(0);
      playFail();
      return;
    }

    setPlaced((p) => ({ ...p, [selected]: zone }));
    setSelected(null);
    setCombo(c => c + 1);
    
    if (combo >= 2) {
      playPerfect();
    } else {
      playSuccess();
    }

    if (state.settings.animations) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }
  };

  const allPlaced = pool.every((it) => placed[it.id]);
  
  const done = () => {
    const seconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1;
    const accuracy = touches > 0 ? Math.max(0, 1 - mistakes / touches) : 1;
    const score = Math.round(55 + accuracy * 45);
    playPerfect();
    onDone({ completed: true, score, mistakes, seconds });
    setStep('done');
  };

  const selectedItem = pool.find(x => x.id === selected);

  if (step === 'intro') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 64 }}>🌍</Text>
          <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Montar o Mundo</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            {instruction}
          </Text>
          <SpeakButton text={instruction} enabled={narrationEnabled} label="Ouvir instruções" />
          
          <View style={{ flexDirection: 'row', gap: 20, marginTop: 8 }}>
            {ZONES.map(z => (
              <View key={z.id} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32 }}>{z.emoji}</Text>
                <Text style={{ ...theme.typography.small, fontWeight: '700' }}>{z.title}</Text>
              </View>
            ))}
          </View>
        </Card>
        <PrimaryButton title="🚀 Começar!" onPress={start} />
      </View>
    );
  }

  if (step === 'done') {
    return (
      <View style={{ gap: theme.spacing(2) }}>
        <Card style={{ gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={state.settings.animations} />
          <Text style={{ fontSize: 64 }}>🎉</Text>
          <Text style={{ ...theme.typography.title, color: theme.colors.ok }}>Mundo Criado!</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
            Você montou o mundo de Deus!
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
          ✨ {Object.keys(placed).length}/{pool.length} itens
        </Text>
        {combo >= 2 && (
          <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>🔥 Combo x{combo}!</Text>
          </View>
        )}
      </View>

      {/* Dica do Item Selecionado */}
      {selectedItem && (
        <Card style={{ 
          backgroundColor: theme.colors.primary2 + '20', 
          borderColor: theme.colors.primary2,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
          <Text style={{ fontSize: 40 }}>{selectedItem.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ ...theme.typography.subtitle }}>{selectedItem.name}</Text>
            <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>
              💡 {selectedItem.hint}
            </Text>
          </View>
        </Card>
      )}

      {/* Itens para Colocar */}
      <Card style={{ gap: 12 }}>
        <Text style={{ ...theme.typography.subtitle }}>📦 Escolha um item:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {pool.map((it) => {
            const isDone = !!placed[it.id];
            const isSel = selected === it.id;
            
            return (
              <Pressable
                key={it.id}
                onPress={() => selectItem(it.id)}
                disabled={isDone}
                style={{
                  width: itemSize,
                  height: itemSize,
                  borderWidth: 3,
                  borderColor: isDone ? theme.colors.ok : isSel ? theme.colors.primary : theme.colors.stroke,
                  backgroundColor: isDone ? '#E8F5E9' : isSel ? theme.colors.primary + '20' : theme.colors.card,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isDone ? 0.5 : 1,
                }}
              >
                <Text style={{ fontSize: isDone ? 20 : 28 }}>{isDone ? '✓' : it.emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Zonas de Drop */}
      <Text style={{ ...theme.typography.subtitle, marginTop: 4 }}>
        {selected ? '👆 Toque no lugar certo:' : '👇 Primeiro escolha um item acima'}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {ZONES.map((z) => (
          <Pressable 
            key={z.id} 
            onPress={() => placeInZone(z.id)} 
            style={{ flex: 1 }}
            disabled={!selected}
          >
            <LinearGradient
              colors={z.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                borderRadius: 20,
                padding: 16,
                alignItems: 'center',
                borderWidth: selected ? 3 : 0,
                borderColor: '#fff',
                opacity: selected ? 1 : 0.6,
                minHeight: 90,
              }}
            >
              <Text style={{ fontSize: 36 }}>{z.emoji}</Text>
              <Text style={{ 
                color: '#fff', 
                fontWeight: '800', 
                fontSize: 16,
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}>
                {z.title}
              </Text>
            </LinearGradient>
          </Pressable>
        ))}
      </View>

      {/* Botão Continuar */}
      {allPlaced && (
        <PrimaryButton title="🎉 Parabéns! Continuar" onPress={done} variant="success" />
      )}

      <ConfettiBurst show={burst && state.settings.animations} />
    </View>
  );
}
