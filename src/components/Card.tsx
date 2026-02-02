import React from 'react';
import { View, ViewStyle } from 'react-native';
import { theme } from '../theme';

export default function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.xl,
        padding: theme.spacing(2),
        borderWidth: 2,
        borderColor: theme.colors.stroke,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        ...style,
      }}
    >
      {children}
    </View>
  );
}
