import React from 'react';
import { Text, View } from 'react-native';

export default function StarsRow({ stars }: { stars: number }) {
  const s = Math.max(0, Math.min(3, stars));
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3].map((i) => (
        <Text key={i} style={{ fontSize: 18 }}>
          {i <= s ? '⭐' : '✩'}
        </Text>
      ))}
    </View>
  );
}
