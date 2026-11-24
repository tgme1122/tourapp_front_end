import { useEffect } from "react";
import { View, Text, Image, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Reanimated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";
import { Slide } from "@/data/onboardingSlides";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function FloatingChip({ icon, style, delay }: { icon: IconName; style: ViewStyle; delay: number }) {
  const y = useSharedValue(-8);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(withTiming(8, { duration: 2200, easing: Easing.inOut(Easing.quad) }), -1, true)
    );
  }, [delay, y]);

  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Reanimated.View style={[styles.chip, style, animated]}>
      <Ionicons name={icon} size={24} color={colors.white} />
    </Reanimated.View>
  );
}

type Props = {
  slide: Slide;
  width: number;
  height: number;
  topInset: number;
  bottomSpace: number;
};

export default function OnboardingSlide({ slide, width, height, topInset, bottomSpace }: Props) {
  const art = Math.min(width * 0.9, height * 0.4);

  return (
    <View style={{ width, height, overflow: "hidden" }}>
      {slide.image ? (
        <>
          <Image source={slide.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.05)", "rgba(0,0,0,0.85)"]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : (
        <>
          <LinearGradient
            colors={slide.colors}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.art, { width: art, height: art, marginTop: topInset + 84 }]}>
            {[0.3, 0.46, 0.64].map((k, i) => {
              const r = art * k;
              return (
                <View
                  key={i}
                  style={[
                    styles.ring,
                    {
                      width: r * 2, height: r * 2, borderRadius: r,
                      left: art / 2 - r, top: art / 2 - r,
                      opacity: 1 - i * 0.3,
                    },
                  ]}
                />
              );
            })}

            <View style={[styles.center, { left: art / 2 - 68, top: art / 2 - 68 }]}>
              <Ionicons name={slide.icon} size={64} color={colors.white} />
            </View>

            {slide.chips.map((c, i) => (
              <FloatingChip key={i} icon={c.icon} style={c.style} delay={i * 350} />
            ))}
          </View>
        </>
      )}

      <View style={[styles.text, { bottom: bottomSpace }]}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.sub}>{slide.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  art: { alignSelf: "center" },
  ring: {
    position: "absolute", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.25)",
  },
  center: {
    position: "absolute", width: 136, height: 136, borderRadius: 68,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  chip: {
    position: "absolute", width: 56, height: 56, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  text: { position: "absolute", left: 24, right: 24, gap: 12 },
  title: { fontSize: 34, fontWeight: "800", lineHeight: 40, letterSpacing: -0.5, color: colors.white },
  sub: { fontSize: 16, lineHeight: 24, color: "rgba(255,255,255,0.88)" },
});