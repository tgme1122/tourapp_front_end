import { useFavorites } from "@/store/favorites";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInRight } from "react-native-reanimated";
import { categoryColors, colors, radius, shadows } from "@/constants/theme";
import { discountPercent, formatPrice } from "@/utils/format";
import { Tour } from "@/types/tour";

type Props = { tour: Tour; index?: number };

export default function HotTourCard({ tour, index = 0 }: Props) {
  const liked = useFavorites((s) => s.ids.includes(tour.id));
  const toggleFavorite = useFavorites((s) => s.toggle);
  const discount = discountPercent(tour.price, tour.oldPrice);
  const fewSeats = tour.seatsLeft != null && tour.seatsLeft > 0 && tour.seatsLeft <= 5;
  const tint = categoryColors[tour.category] ?? categoryColors.all;

  return (
    <Animated.View entering={FadeInRight.delay(Math.min(index, 5) * 80).duration(400)}>
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: "/tour/[id]", params: { id: tour.id } })}
      >
        {tour.image ? (
          <Image source={{ uri: tour.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.noImage, { backgroundColor: tint.soft }]}>
            <Ionicons name="image-outline" size={44} color={tint.accent} />
          </View>
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.25)", "rgba(0,0,0,0)", "rgba(0,0,0,0.88)"]}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.top}>
          <View style={styles.badges}>
            {tour.hot && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Ionicons name="flame" size={12} color={colors.white} />
                <Text style={styles.badgeText}>Hot</Text>
              </View>
            )}
            {discount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.success }]}>
                <Text style={styles.badgeText}>-{discount}%</Text>
              </View>
            )}
          </View>
          <Pressable
            style={styles.heart}
            hitSlop={6}
            onPress={() => toggleFavorite(tour.id)}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? colors.primary : colors.white}
            />
          </Pressable>
        </View>

        <View style={styles.bottom}>
          <View style={styles.row}>
            <Ionicons name="location-sharp" size={13} color={colors.white} />
            <Text style={styles.loc} numberOfLines={1}>{tour.city}, {tour.country}</Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>{tour.title}</Text>

          <View style={styles.row}>
            <Text style={styles.agency} numberOfLines={1}>{tour.agency}</Text>
            {tour.agencyVerified && (
              <Ionicons name="checkmark-circle" size={14} color={colors.verified} />
            )}
          </View>

          <View style={styles.footer}>
            <View>
              {tour.oldPrice ? (
                <Text style={styles.oldPrice}>{formatPrice(tour.oldPrice)}</Text>
              ) : (
                <Text style={styles.priceLabel}>Boshlanish narxi</Text>
              )}
              <Text style={styles.price}>{formatPrice(tour.price)}</Text>
            </View>
            <View style={styles.meta}>
              {fewSeats && (
                <View style={styles.seats}>
                  <Text style={styles.seatsText}>Faqat {tour.seatsLeft} joy</Text>
                </View>
              )}
              <View style={styles.row}>
                {tour.reviews > 0 && (
                  <>
                    <Ionicons name="star" size={13} color={colors.star} />
                    <Text style={styles.rating}>{tour.rating}</Text>
                    <Text style={styles.sub}>({tour.reviews})</Text>
                    <Text style={styles.sub}>·</Text>
                  </>
                )}
                <Text style={styles.sub}>{tour.days} kun</Text>
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
    width: 300, height: 330, borderRadius: radius.xl,
    overflow: "hidden", backgroundColor: colors.placeholder,
    justifyContent: "space-between", ...shadows.soft,
  },
  noImage: { alignItems: "center", justifyContent: "center" },
  top: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", padding: 12,
  },
  badges: { flexDirection: "row", gap: 6, flexShrink: 1 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, height: 26, borderRadius: 13,
  },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  heart: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.overlay, alignItems: "center", justifyContent: "center",
  },
  bottom: { padding: 16, gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  loc: { color: colors.white, fontSize: 13, fontWeight: "600", flexShrink: 1 },
  title: { color: colors.white, fontSize: 20, fontWeight: "800", lineHeight: 25 },
  agency: { color: "rgba(255,255,255,0.92)", fontSize: 13, fontWeight: "600", flexShrink: 1 },
  footer: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-end", marginTop: 6,
  },
  priceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  oldPrice: {
    color: "rgba(255,255,255,0.8)", fontSize: 12, textDecorationLine: "line-through",
  },
  price: { color: colors.white, fontSize: 19, fontWeight: "800" },
  meta: { alignItems: "flex-end", gap: 6 },
  seats: {
    paddingHorizontal: 8, height: 22, borderRadius: 11,
    backgroundColor: colors.warning, alignItems: "center", justifyContent: "center",
  },
  seatsText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  rating: { color: colors.white, fontSize: 13, fontWeight: "700" },
  sub: { color: "rgba(255,255,255,0.9)", fontSize: 13 },
});
