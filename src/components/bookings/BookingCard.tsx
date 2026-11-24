import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, radius, shadows } from "@/constants/theme";
import { formatPrice } from "@/utils/format";
import { Booking, BookingStatus } from "@/types/booking";
import StatusBadge from "./StatusBadge";
import HoldTimer from "./HoldTimer";

type Props = {
  booking: Booking;
  index?: number;
  reviewed?: boolean;
  busy?: boolean;
  onPress: () => void;
  onAction: () => void;
  onSecondary?: () => void; 
};

const primary: Record<BookingStatus, string> = {
  pending_payment: "To'lash",
  confirmed: "Batafsil",
  completed: "Sharh qoldirish",
  cancelled: "Qayta bron qilish",
  expired: "Qayta bron qilish",
  refunded: "Qayta bron qilish",
};

export default function BookingCard({
  booking, index = 0, reviewed, busy, onPress, onAction, onSecondary,
}: Props) {
  const label =
    booking.status === "completed" && reviewed ? "Sharhni o'zgartirish" : primary[booking.status];
  const pending = booking.status === "pending_payment";

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
      <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.topRow}>
          <Text style={styles.code}>№ {booking.code}</Text>
          <StatusBadge status={booking.status} />
        </View>

        <View style={styles.content}>
          {booking.image ? (
            <Image source={{ uri: booking.image }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Ionicons name="image-outline" size={26} color={colors.muted} />
            </View>
          )}
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>{booking.title}</Text>
            <View style={styles.line}>
              <Ionicons name="location-sharp" size={13} color={colors.primary} />
              <Text style={styles.muted}>{booking.city}, {booking.country}</Text>
            </View>
            <View style={styles.line}>
              <Ionicons name="business-outline" size={13} color={colors.muted} />
              <Text style={styles.muted}>{booking.agency}</Text>
            </View>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.line}>
            <Ionicons name="calendar-outline" size={14} color={colors.muted} />
            <Text style={styles.detailText}>{booking.dates}</Text>
          </View>
          <View style={styles.line}>
            <Ionicons name="people-outline" size={14} color={colors.muted} />
            <Text style={styles.detailText}>{booking.guests} kishi</Text>
          </View>
        </View>

        {pending && <HoldTimer expiresAt={booking.holdExpiresAt} />}

        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Jami</Text>
            <Text style={styles.total}>{formatPrice(booking.total)}</Text>
          </View>

          <View style={styles.buttons}>
            {pending && onSecondary && (
              <Pressable
                onPress={onSecondary}
                disabled={busy}
                style={[styles.button, styles.buttonDanger, busy && { opacity: 0.5 }]}
              >
                <Text style={[styles.buttonText, { color: colors.danger }]}>Bekor qilish</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onAction}
              disabled={busy}
              style={[styles.button, busy && { opacity: 0.5 }]}
            >
              <Text style={styles.buttonText}>{label}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.background,
    ...shadows.soft,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  code: { fontSize: 12, fontWeight: "700", color: colors.muted },
  content: { flexDirection: "row", gap: 12 },
  image: { width: 86, height: 86, borderRadius: radius.lg, backgroundColor: colors.surface },
  placeholder: { alignItems: "center", justifyContent: "center" },
  info: { flex: 1, gap: 5, justifyContent: "center" },
  title: { fontSize: 15, fontWeight: "800", color: colors.text, lineHeight: 20 },
  line: { flexDirection: "row", alignItems: "center", gap: 5 },
  muted: { fontSize: 12, color: colors.muted },
  details: {
    flexDirection: "row", justifyContent: "space-between", paddingVertical: 10,
    paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.surface,
  },
  detailText: { fontSize: 13, fontWeight: "600", color: colors.text },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  totalLabel: { fontSize: 11, color: colors.muted },
  total: { fontSize: 18, fontWeight: "900", color: colors.primary },
  buttons: { flexDirection: "row", gap: 8 },
  button: {
    paddingHorizontal: 18, height: 42, borderRadius: radius.pill, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  buttonDanger: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger },
  buttonText: { fontSize: 14, fontWeight: "700", color: colors.white },
});