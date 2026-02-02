import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import { theme } from '../theme';
import * as Speech from 'expo-speech';

export default function SpeakButton({
  text,
  enabled,
  label = 'Ouvir',
  style,
}: {
  text: string;
  enabled: boolean;
  label?: string;
  style?: ViewStyle;
}) {
  if (!enabled) return null;

  const speak = () => {
    try {
      Speech.stop();
      Speech.speak(text, {
        language: 'pt-BR',
        rate: 0.95,
        pitch: 1.05,
      });
    } catch (e) {
      // fail silently (device may not support TTS)
    }
  };

  return (
    <Pressable
      onPress={speak}
      style={({ pressed }) => ({
        alignSelf: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: theme.radius.lg,
        borderWidth: 2,
        borderColor: theme.colors.stroke,
        backgroundColor: pressed ? '#FFF1DD' : theme.colors.card,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        ...style,
      })}
    >
      <Text style={{ fontSize: 14, fontWeight: '800' }}>🔊 {label}</Text>
    </Pressable>
  );
}
