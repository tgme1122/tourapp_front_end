import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { categoryColors, colors, radius, shadows } from "@/constants/theme";
import { useFavorites } from "@/store/favorites";
import { discountPercent, formatPrice } from "@/utils/format";
import { Tour } from "@/types/tour";

type Props = { tour: Tour; index?: number };

export default function ResultCard({ tour, index = 0 }: Props) {
  const liked = useFavorites((s) => s.ids.includes(tour.id));
  const toggleFavorite = useFavorites((s) => s.toggle);
  const discount = discountPercent(tour.price, tour.oldPrice);
  const fewSeats = tour.seatsLeft != null && tour.seatsLeft > 0 && tour.seatsLeft <= 5;
  const tint = categoryColors[tour.category] ?? categoryColors.all;

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 55).duration(340)}>
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: "/tour/[id]", params: { id: tour.id } })}
      >
        <View style={styles.media}>
          {tour.image ? (
            <Image source={{ uri: tour.image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.noImage, { backgroundColor: tint.soft }]}>
              <Ionicons name="image-outline" size={30} color={tint.accent} />
            </View>
          )}
          {tour.hot && (
            <View style={styles.hot}>
              <Ionicons name="flame" size={11} color={colors.white} />
              <Text style={styles.badgeText}>Hot</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.discount}>
              <Text style={styles.badgeText}>-{discount}%</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.topRow}>
            <View style={[styles.line, { flex: 1 }]}>
              <Ionicons name="location-sharp" size={13} color={colors.primary} />
              <Text style={styles.lineText} numberOfLines={1}>{tour.city}, {tour.country}</Text>
            </View>
            <Pressable
              style={styles.heart}
              hitSlop={8}
              onPress={() => toggleFavorite(tour.id)}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={18}
                color={liked ? colors.primary : colors.muted}
              />
            </Pressable>
          </View>

          <Text style={styles.title} numberOfLines={2}>{tour.title}</Text>

          <View style={styles.line}>
            <Text style={styles.lineText} numberOfLines={1}>{tour.agency}</Text>
            {tour.agencyVerified && (
              <Ionicons name="checkmark-circle" size={14} color={colors.verified} />
            )}
            {fewSeats && (
              <View style={styles.seats}>
                <Text style={styles.seatsText}>Faqat {tour.seatsLeft} joy</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <View>
              {tour.oldPrice ? (
                <Text style={styles.oldPrice}>{formatPrice(tour.oldPrice)}</Text>
              ) : null}
              <Text style={styles.price}>{formatPrice(tour.price)}</Text>
            </View>
            <View style={styles.meta}>
              {tour.reviews > 0 && (
                <View style={styles.line}>
                  <Ionicons name="star" size={13} color={colors.star} />
                  <Text style={styles.rating}>{tour.rating.toFixed(1)}</Text>
                  <Text style={styles.lineText}>({tour.reviews})</Text>
                </View>
              )}
              <View style={styles.line}>
                <Ionicons name="time-outline" size={13} color={colors.muted} />
                <Text style={styles.lineText}>{tour.days} kun</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", gap: 12, padding: 10, marginHorizontal: 16,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl,
    backgroundColor: colors.background, ...shadows.soft,
  },
  media: { position: "relative" },
  image: { width: 114, height: 140, borderRadius: radius.lg, backgroundColor: colors.placeholder },
  noImage: { alignItems: "center", justifyContent: "center" },
  hot: {
    position: "absolute", top: 8, left: 8,
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 8, height: 22, borderRadius: 11, backgroundColor: colors.primary,
  },
  discount: {
    position: "absolute", bottom: 8, left: 8,
    paddingHorizontal: 8, height: 22, borderRadius: 11,
    backgroundColor: colors.success, alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  info: { flex: 1, gap: 4 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  heart: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
  },
  line: { flexDirection: "row", alignItems: "center", gap: 4 },
  lineText: { fontSize: 12, color: colors.muted, flexShrink: 1 },
  title: { fontSize: 15, fontWeight: "800", color: colors.text, lineHeight: 20 },
  seats: {
    marginLeft: "auto", paddingHorizontal: 7, height: 20, borderRadius: 10,
    backgroundColor: colors.warningSoft, alignItems: "center", justifyContent: "center",
  },
  seatsText: { fontSize: 10, fontWeight: "800", color: colors.warning },
  footer: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
    marginTop: "auto", paddingTop: 4,
  },
  oldPrice: { fontSize: 11, color: colors.muted, textDecorationLine: "line-through" },
  price: { fontSize: 16, fontWeight: "800", color: colors.primary },
  meta: { alignItems: "flex-end", gap: 3 },
  rating: { fontSize: 12, fontWeight: "700", color: colors.text },
});
