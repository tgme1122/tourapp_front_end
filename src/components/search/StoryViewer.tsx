import { useEffect, useRef, useState } from "react";
import {
  View, Text, Image, Pressable, Modal, Animated, Easing, StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { discountPercent, formatPrice } from "@/utils/format";
import { Tour } from "@/types/tour";

const STORY_DURATION = 5000;

type Props = {
  tours: Tour[];
  initialIndex: number;
  onClose: () => void;
  onSeen: (id: string) => void;
  onOpenTour: (id: string) => void;
};

export default function StoryViewer({ tours, initialIndex, onClose, onSeen, onOpenTour }: Props) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const progress = useRef(new Animated.Value(0)).current;
  const stoppedAt = useRef(0);
  const paused = useRef(false);

  const tour = tours[index];

  const start = (from: number) => {
    progress.setValue(from);
    Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION * (1 - from),
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) goNext();
    });
  };

  const goNext = () => {
    if (index < tours.length - 1) setIndex(index + 1);
    else onClose();
  };

  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
    else start(0);
  };

  const pause = () => {
    paused.current = true;
    progress.stopAnimation((value) => {
      stoppedAt.current = value;
    });
  };

  const resume = () => {
    if (!paused.current) return;
    paused.current = false;
    start(stoppedAt.current);
  };

  useEffect(() => {
    if (!tour) return;
    onSeen(tour.id);
    start(0);
    return () => progress.stopAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!tour) return null;

  const discount = discountPercent(tour.price, tour.oldPrice);
  const topPad = Math.max(insets.top, 24) + 4;
  const bottomPad = Math.max(insets.bottom, 16) + 8;

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Image source={{ uri: tour.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0)"]}
          style={styles.topShade}
          pointerEvents="none"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.9)"]}
          style={styles.bottomShade}
          pointerEvents="none"
        />

        {/* Chap = oldingi, o'ng = keyingi, bosib turish = to'xtatish */}
        <View style={styles.zones}>
          <Pressable style={{ flex: 1 }} onPress={goPrev} onLongPress={pause} onPressOut={resume} />
          <Pressable style={{ flex: 2 }} onPress={goNext} onLongPress={pause} onPressOut={resume} />
        </View>

        <View style={[styles.top, { paddingTop: topPad }]} pointerEvents="box-none">
          <View style={styles.bars}>
            {tours.map((t, i) => (
              <View key={t.id} style={styles.track}>
                {i === index ? (
                  <Animated.View
                    style={[
                      styles.fill,
                      {
                        width: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                ) : (
                  <View style={[styles.fill, { width: i < index ? "100%" : "0%" }]} />
                )}
              </View>
            ))}
          </View>

          <View style={styles.header}>
            <Image source={{ uri: tour.image }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>{tour.city}</Text>
              <Text style={styles.headerSub}>{tour.agency}</Text>
            </View>
            <View style={styles.hot}>
              <Ionicons name="flame" size={12} color={colors.white} />
              <Text style={styles.hotText}>Hot</Text>
            </View>
            <Pressable style={styles.close} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.white} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.bottom, { paddingBottom: bottomPad }]} pointerEvents="box-none">
          <View style={styles.chips}>
            {discount > 0 && (
              <View style={[styles.chip, { backgroundColor: colors.primary }]}>
                <Text style={styles.chipText}>-{discount}% chegirma</Text>
              </View>
            )}
            {tour.seatsLeft !== undefined && (
              <View style={[styles.chip, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
                <Ionicons name="people" size={12} color={colors.white} />
                <Text style={styles.chipText}>Qolgan joy: {tour.seatsLeft}</Text>
              </View>
            )}
          </View>

          <View style={styles.locRow}>
            <Ionicons name="location-sharp" size={14} color={colors.white} />
            <Text style={styles.loc}>{tour.city}, {tour.country}</Text>
          </View>
          <Text style={styles.title}>{tour.title}</Text>

          <View style={styles.priceRow}>
            <View>
              {tour.oldPrice ? (
                <Text style={styles.oldPrice}>{formatPrice(tour.oldPrice)}</Text>
              ) : null}
              <Text style={styles.price}>{formatPrice(tour.price)}</Text>
            </View>
            <View style={styles.days}>
              <Ionicons name="time-outline" size={15} color={colors.white} />
              <Text style={styles.daysText}>{tour.days} kun</Text>
            </View>
          </View>

          <Pressable style={styles.cta} onPress={() => onOpenTour(tour.id)}>
            <Text style={styles.ctaText}>Batafsil ko'rish</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  topShade: { position: "absolute", top: 0, left: 0, right: 0, height: 170 },
  bottomShade: { position: "absolute", bottom: 0, left: 0, right: 0, height: 380 },
  zones: { ...StyleSheet.absoluteFill, flexDirection: "row" },
  top: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 12, gap: 12 },
  bars: { flexDirection: "row", gap: 4 },
  track: {
    flex: 1, height: 3, borderRadius: 2, overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  fill: { height: "100%", backgroundColor: colors.white },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: colors.white },
  headerTitle: { color: colors.white, fontSize: 15, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  hot: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, height: 24, borderRadius: 12, backgroundColor: colors.primary,
  },
  hotText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  close: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center",
  },
  bottom: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, gap: 8 },
  chips: { flexDirection: "row", gap: 8, marginBottom: 4 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, height: 28, borderRadius: 14,
  },
  chipText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  loc: { color: colors.white, fontSize: 13, fontWeight: "600" },
  title: { color: colors.white, fontSize: 26, fontWeight: "800", lineHeight: 32 },
  priceRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4 },
  oldPrice: { color: "rgba(255,255,255,0.7)", fontSize: 14, textDecorationLine: "line-through" },
  price: { color: colors.white, fontSize: 24, fontWeight: "800" },
  days: { flexDirection: "row", alignItems: "center", gap: 5, paddingBottom: 4 },
  daysText: { color: colors.white, fontSize: 14, fontWeight: "600" },
  cta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    height: 54, borderRadius: 16, backgroundColor: colors.primary, marginTop: 8,
  },
  ctaText: { color: colors.white, fontSize: 16, fontWeight: "700" },
}); 