import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { Review } from "@/types/tourDetails";

type Props = { rating: number; count: number; reviews: Review[] };

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={value >= i ? "star" : value >= i - 0.5 ? "star-half" : "star-outline"}
          size={size}
          color={colors.star}
        />
      ))}
    </View>
  );
}

export default function ReviewsSection({ rating, count, reviews }: Props) {
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.summary}>
        <Text style={styles.big}>{rating}</Text>
        <View style={{ gap: 4 }}>
          <Stars value={rating} size={18} />
          <Text style={styles.muted}>{count} ta sharh asosida</Text>
        </View>
      </View>

      {reviews.map((r) => (
        <View key={r.id} style={styles.card}>
          <View style={styles.head}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{r.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.author}>{r.author}</Text>
              <Text style={styles.muted}>{r.date}</Text>
            </View>
            <Stars value={r.rating} size={13} />
          </View>
          <Text style={styles.text}>{r.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row", alignItems: "center", gap: 14, padding: 14,
    borderRadius: 18, backgroundColor: colors.surface,
  },
  big: { fontSize: 38, fontWeight: "800", color: colors.text },
  muted: { fontSize: 12, color: colors.muted },
  card: {
    padding: 14, gap: 10, borderRadius: 18,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 13, fontWeight: "800", color: colors.primary },
  author: { fontSize: 14, fontWeight: "700", color: colors.text },
  text: { fontSize: 14, lineHeight: 21, color: colors.text },
});