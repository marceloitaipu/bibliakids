import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function Pulse({ active, children }: { active: boolean; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) {
      scale.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.03, duration: 220, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 220, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active]);

  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}
