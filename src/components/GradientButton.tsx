import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

export default function GradientButton({
  title,
  onPress,
  disabled,
  variant = 'primary',
  style,
  icon,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'accent' | 'success';
  style?: ViewStyle;
  icon?: string;
}) {
  const colors: readonly [string, string] = 
    variant === 'accent' ? ['#5FD4C8', '#2EC4B6'] :
    variant === 'success' ? ['#5FD99A', '#2FBF71'] :
    ['#FFB703', '#FF7A00']; // primary

  if (disabled) {
    return (
      <Pressable disabled style={[styles.button, style, { backgroundColor: theme.colors.stroke }]}>
        <Text style={styles.text}>{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, style]}
      >
        {icon && <Text style={{ fontSize: 20, marginRight: 8 }}>{icon}</Text>}
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = {
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
};
