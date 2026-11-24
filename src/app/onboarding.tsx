import { useRef, useState } from "react";
import {
  View, Text, Pressable, FlatList, Animated, StyleSheet, useWindowDimensions,
  NativeSyntheticEvent, NativeScrollEvent,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { Slide, slides } from "@/data/onboardingSlides";
import { useApp } from "@/store/app";
import OnboardingSlide from "@/components/onboarding/OnboardingSlide";
import PaginationDots from "@/components/onboarding/PaginationDots";

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useApp((s: { completeOnboarding: any; }) => s.completeOnboarding);

  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const last = index === slides.length - 1;

  const finish = () => {
    completeOnboarding();
    router.replace("/login");
  };

  const next = () => {
    if (last) return finish();
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    scrollX.setValue(x);
    const i = Math.round(x / width);
    setIndex((prev) => (prev === i ? prev : i));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <OnboardingSlide
            slide={item}
            width={width}
            height={height}
            topInset={insets.top}
            bottomSpace={insets.bottom + 140}
          />
        )}
      />

      {/* Tepa qism: Logo & O'tkazish */}
      <View style={[styles.top, { top: insets.top + 12 }]} pointerEvents="box-none">
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>Sayohat</Text>
        </View>
        <Pressable
          onPress={finish}
          disabled={last}
          hitSlop={10}
          style={{ opacity: last ? 0 : 1 }}
        >
          <Text style={styles.skip}>O'tkazish</Text>
        </Pressable>
      </View>

      {/* Pastki qism: GlobeGo uslubidagi boshqaruv */}
      <View style={[styles.bottom, { bottom: insets.bottom + 20 }]} pointerEvents="box-none">
        <PaginationDots count={slides.length} scrollX={scrollX} width={width} />

        <View style={styles.pillContainer}>
          <Pressable style={styles.continueBtn} onPress={next}>
            <Text style={styles.continueText}>{last ? "Boshlash" : "Davom etish"}</Text>
          </Pressable>
          {!last && (
            <Pressable style={styles.slideHint} onPress={next}>
              <Text style={styles.slideText}>Suring</Text>
              <Ionicons name="arrow-forward" size={15} color="rgba(255,255,255,0.7)" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  top: {
    position: "absolute", left: 24, right: 24,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandName: { fontSize: 28, fontWeight: "900", color: colors.white, letterSpacing: -0.5 },
  skip: { fontSize: 15, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  bottom: { position: "absolute", left: 24, right: 24, gap: 18 },
  pillContainer: {
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  continueBtn: {
    height: "100%",
    paddingHorizontal: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  continueText: { fontSize: 16, fontWeight: "800", color: colors.text },
  slideHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 20,
  },
  slideText: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.85)" },
});
