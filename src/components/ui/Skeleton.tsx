import { useEffect } from "react";
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from "react-native-reanimated";
import { colors, radius } from "@/constants/theme";

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

// Yuklanish paytida chiqadigan "miltillovchi" blok
export function Skeleton({ width = "100%", height = 16, borderRadius = radius.sm, style }: Props) {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: colors.placeholder }, animated, style]}
    />
  );
}

// Bosh sahifadagi gorizontal katta kartalar uchun
export function HotCardSkeleton() {
  return <Skeleton width={300} height={330} borderRadius={radius.xl} />;
}

// Qidiruv natijasi kartasi uchun
export function ResultCardSkeleton() {
  return (
    <View style={styles.result}>
      <Skeleton width={114} height={140} borderRadius={radius.lg} />
      <View style={{ flex: 1, gap: 10 }}>
        <Skeleton width="45%" height={12} />
        <Skeleton width="90%" height={16} />
        <Skeleton width="60%" height={12} />
        <View style={{ flex: 1 }} />
        <Skeleton width="50%" height={18} />
      </View>
    </View>
  );
}

// Bron kartasi uchun
export function BookingCardSkeleton() {
  return (
    <View style={styles.booking}>
      <View style={styles.row}>
        <Skeleton width={80} height={12} />
        <Skeleton width={90} height={24} borderRadius={12} />
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Skeleton width={84} height={84} borderRadius={16} />
        <View style={{ flex: 1, gap: 8, justifyContent: "center" }}>
          <Skeleton width="85%" height={16} />
          <Skeleton width="55%" height={12} />
          <Skeleton width="45%" height={12} />
        </View>
      </View>
      <Skeleton width="100%" height={40} borderRadius={12} />
      <View style={styles.row}>
        <Skeleton width={110} height={22} />
        <Skeleton width={110} height={42} borderRadius={14} />
      </View>
    </View>
  );
}

// Suhbatlar va bildirishnomalar qatori uchun
export function ListRowSkeleton() {
  return (
    <View style={styles.listRow}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={styles.row}>
          <Skeleton width="45%" height={14} />
          <Skeleton width={40} height={12} />
        </View>
        <Skeleton width="75%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  result: {
    flexDirection: "row", gap: 12, padding: 10, marginHorizontal: 16,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl,
  },
  booking: {
    padding: 14, gap: 12,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  listRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 12 },
});
