import { useState } from "react";
import {
  View, Text, Image, FlatList, useWindowDimensions, StyleSheet,
  NativeSyntheticEvent, NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

export const HERO_HEIGHT = 380;

export default function Gallery({ images }: { images: string[] }) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setPage((prev) => (prev === next ? prev : next));
  };

  return (
    <View style={{ height: HERO_HEIGHT, backgroundColor: colors.surface }}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={{ width, height: HERO_HEIGHT }} resizeMode="cover" />
        )}
      />

      <View style={styles.dots} pointerEvents="none">
        {images.map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.counter} pointerEvents="none">
        <Ionicons name="images-outline" size={14} color={colors.white} />
        <Text style={styles.counterText}>{page + 1}/{images.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: "absolute", bottom: 44, left: 0, right: 0,
    flexDirection: "row", justifyContent: "center", gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.55)" },
  dotActive: { width: 18, backgroundColor: colors.white },
  counter: {
    position: "absolute", bottom: 40, right: 16,
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: "rgba(0,0,0,0.5)",
  },
  counterText: { color: colors.white, fontSize: 12, fontWeight: "700" },
});