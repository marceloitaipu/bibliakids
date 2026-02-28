import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Pressable, Text, ViewStyle, Animated } from 'react-native';
import { theme } from '../theme';
import * as Speech from 'expo-speech';

/**
 * Selects the best available Portuguese voice for a calm, natural narration.
 * Prefers higher-quality / "enhanced" / "neural" voices when available.
 */
async function pickBestVoice(): Promise<string | undefined> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Filter for pt-BR voices first, then any Portuguese voice
    const ptBR = voices.filter((v) => v.language.startsWith('pt-BR') || v.language === 'pt_BR');
    const ptAny = ptBR.length > 0 ? ptBR : voices.filter((v) => v.language.startsWith('pt'));
    if (ptAny.length === 0) return undefined;

    // Prefer voices whose identifier hints at higher quality
    const qualityKeywords = ['neural', 'enhanced', 'wavenet', 'natural', 'premium', 'studio'];
    const ranked = [...ptAny].sort((a, b) => {
      const aQ = qualityKeywords.some((k) => a.identifier.toLowerCase().includes(k)) ? 0 : 1;
      const bQ = qualityKeywords.some((k) => b.identifier.toLowerCase().includes(k)) ? 0 : 1;
      // Among same quality tier, prefer female voices (often calmer for children)
      const aF = /femin|female/i.test(a.identifier) ? 0 : 1;
      const bF = /femin|female/i.test(b.identifier) ? 0 : 1;
      return aQ - bQ || aF - bF;
    });

    return ranked[0]?.identifier;
  } catch {
    return undefined;
  }
}

/** Speaks the given text with a calm, child-friendly voice. */
export async function speakCalm(text: string, onDone?: () => void) {
  try {
    Speech.stop();
    const voice = await pickBestVoice();
    Speech.speak(text, {
      language: 'pt-BR',
      rate: 0.82,   // ritmo lento e calmo
      pitch: 1.05,  // tom levemente doce, natural
      voice,
      onDone,
      onStopped: onDone,
      onError: onDone,
    });
  } catch {
    onDone?.();
  }
}

export function stopSpeaking() {
  try { Speech.stop(); } catch { /* noop */ }
}

export default function SpeakButton({
  text,
  enabled,
  autoPlay = false,
  label = 'Ouvir',
  style,
}: {
  text: string;
  enabled: boolean;
  autoPlay?: boolean;
  label?: string;
  style?: ViewStyle;
}) {
  const [speaking, setSpeaking] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const didAutoPlay = useRef(false);

  // Pulse animation while speaking
  useEffect(() => {
    if (speaking) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [speaking, pulseAnim]);

  // Auto-play narration on mount (once)
  useEffect(() => {
    if (autoPlay && enabled && !didAutoPlay.current) {
      didAutoPlay.current = true;
      // Small delay so the screen transition finishes first
      const timer = setTimeout(() => handleSpeak(), 600);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup: stop speech on unmount
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const handleSpeak = useCallback(() => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakCalm(text, () => setSpeaking(false));
  }, [speaking, text]);

  if (!enabled) return null;

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <Pressable
        onPress={handleSpeak}
        style={({ pressed }) => ({
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: theme.radius.lg,
          borderWidth: 2,
          borderColor: speaking ? theme.colors.primary : theme.colors.stroke,
          backgroundColor: pressed ? '#FFF1DD' : speaking ? theme.colors.primary + '15' : theme.colors.card,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          ...style,
        })}
      >
        <Text style={{ fontSize: 14, fontWeight: '800' }}>
          {speaking ? '⏸️' : '🔊'} {speaking ? 'Pausar' : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
