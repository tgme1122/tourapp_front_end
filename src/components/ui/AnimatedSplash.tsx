import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

// app.json dagi splash rangi bilan bir xil bo'lishi kerak
const SPLASH_BG = "#D4502F";

type Props = { ready: boolean; onFinish: () => void };

export default function AnimatedSplash({ ready, onFinish }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Kutish paytida logo yengil "nafas oladi"
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.06, duration: 800,
          easing: Easing.inOut(Easing.quad), useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1, duration: 800,
          easing: Easing.inOut(Easing.quad), useNativeDriver: true,
        }),
      ])
    );
    loopRef.current = loop;
    loop.start();
    return () => loop.stop();
  }, [scale]);

  // Tayyor bo'lgach: logo biroz kattalashib, ekran asta yo'qoladi
  useEffect(() => {
    if (!ready) return;
    loopRef.current?.stop();
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.15, duration: 350, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onFinish();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <Animated.View style={[styles.root, { opacity }]}>
      <StatusBar style="light" />
      <Animated.Image
        source={require("@/assets/images/splash-icon.png")}
        style={[styles.logo, { transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SPLASH_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 200, height: 200 },
});