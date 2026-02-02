import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

export default function StarRise({ show }: { show: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;

  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      const x = (Math.random() * 2 - 1) * 140;
      arr.push({ x, key: `${i}-${Math.random()}` });
    }
    return arr;
  }, [show]);

  useEffect(() => {
    if (!show) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, [show]);

  if (!show) return null;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
      {stars.map((s) => {
        const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [80, -160] });
        const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, s.x] });
        const opacity = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1, 0] });
        return (
          <Animated.View key={s.key} style={{ position: 'absolute', transform: [{ translateX }, { translateY }], opacity }}>
            <Text style={{ fontSize: 22 }}>⭐</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}
