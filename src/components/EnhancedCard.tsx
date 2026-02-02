import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

export default function EnhancedCard({ 
  children, 
  style,
  gradient = false,
  glowColor,
}: { 
  children: React.ReactNode; 
  style?: ViewStyle;
  gradient?: boolean;
  glowColor?: string;
}) {
  const shadowColor = glowColor || theme.colors.shadow;

  if (gradient) {
    return (
      <LinearGradient
        colors={['#FFFFFF', '#FFF9F0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          {
            borderRadius: 24,
            padding: 16,
            borderWidth: 2,
            borderColor: theme.colors.stroke,
            shadowColor: shadowColor,
            shadowOpacity: 0.15,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          },
          style,
        ]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: 24,
          padding: 16,
          borderWidth: 2,
          borderColor: theme.colors.stroke,
          shadowColor: shadowColor,
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
