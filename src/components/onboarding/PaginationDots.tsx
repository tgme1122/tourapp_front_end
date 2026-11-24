import { View, Animated, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

type Props = { count: number; scrollX: Animated.Value; width: number };

export default function PaginationDots({ count, scrollX, width }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => {
        const range = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange: range,
          outputRange: [8, 28, 8],
          extrapolate: "clamp",
        });
        const opacity = scrollX.interpolate({
          inputRange: range,
          outputRange: [0.45, 1, 0.45],
          extrapolate: "clamp",
        });
        return <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  dot: { height: 8, borderRadius: 4, backgroundColor: colors.white },
});