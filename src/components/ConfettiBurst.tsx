import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

export default function ConfettiBurst({
  show,
  emoji = ['✨', '⭐', '🌈', '🎉'],
}: {
  show: boolean;
  emoji?: string[];
}) {
  const anim = useRef(new Animated.Value(0)).current;

  const parts = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      const x = (Math.random() * 2 - 1) * 120;
      const y = -40 - Math.random() * 140;
      const rot = (Math.random() * 2 - 1) * 40;
      const e = emoji[Math.floor(Math.random() * emoji.length)];
      arr.push({ x, y, rot, e, key: `${i}-${Math.random()}` });
    }
    return arr;
  }, [show]);

  useEffect(() => {
    if (!show) return;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();
  }, [show]);

  if (!show) return null;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center' }}>
      {parts.map((p) => {
        const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.x] });
        const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.y] });
        const opacity = anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] });
        const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rot}deg`] });

        return (
          <Animated.View
            key={p.key}
            style={{
              position: 'absolute',
              transform: [{ translateX }, { translateY }, { rotate }],
              opacity,
            }}
          >
            <Text style={{ fontSize: 22 }}>{p.e}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}
