import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import { theme } from '../theme';

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: disabled ? theme.colors.stroke : theme.colors.primary,
        paddingVertical: theme.spacing(1.5),
        borderRadius: theme.radius.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: pressed ? 0.06 : 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        transform: [{ scale: pressed ? 0.99 : 1 }],
        ...style,
      })}
    >
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{title}</Text>
    </Pressable>
  );
}
