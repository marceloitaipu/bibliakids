import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  style,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'accent' | 'success';
}) {
  // Escolher gradiente baseado no variant ou style customizado
  const gradientColors = 
    variant === 'accent' ? theme.gradients.accent :
    variant === 'success' ? theme.gradients.success :
    theme.gradients.primary;

  // Se style tem backgroundColor, usar cor sólida ao invés de gradiente
  const hasCustomBg = style && 'backgroundColor' in style;

  if (disabled) {
    return (
      <Pressable
        disabled
        style={[
          {
            backgroundColor: theme.colors.stroke,
            paddingVertical: theme.spacing(1.5),
            borderRadius: theme.radius.lg,
            alignItems: 'center',
            opacity: 0.6,
          },
          style,
        ]}
      >
        <Text style={{ color: theme.colors.muted, fontSize: 16, fontWeight: '800' }}>{title}</Text>
      </Pressable>
    );
  }

  if (hasCustomBg) {
    // Usar estilo antigo se tiver backgroundColor customizado
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            paddingVertical: theme.spacing(1.5),
            borderRadius: theme.radius.lg,
            alignItems: 'center',
            ...theme.shadows.medium,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
          style,
        ]}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{
        transform: [{ scale: pressed ? 0.97 : 1 }],
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
      }]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          {
            paddingVertical: theme.spacing(1.5),
            paddingHorizontal: theme.spacing(2),
            borderRadius: theme.radius.lg,
            alignItems: 'center',
            ...theme.shadows.large,
          },
          style,
        ]}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '800',
            textShadowColor: 'rgba(0, 0, 0, 0.2)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {title}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
