import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { AgencyBooking } from "@/services/agencyBooking";
import { formatPrice } from "@/utils/format";
import StatusBadge from "@/components/bookings/StatusBadge";
import PrimaryButton from "@/components/ui/PrimaryButton";

type Props = {
  booking: AgencyBooking;
  canManage: boolean; // faqat menejer
  busy?: boolean;
  onPress: () => void;
  onCancel: () => void;
};

export default function AgencyBookingCard({
  booking: b, canManage, busy, onPress, onCancel,
}: Props) {
  const canCancel = canManage && b.status === "confirmed";

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.top}>
        <Text style={styles.code}>№ {b.code}</Text>
        <StatusBadge status={b.status} />
      </View>

      <View style={styles.content}>
        {b.image ? (
          <Image source={{ uri: b.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: colors.surface }]} />
        )}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.title} numberOfLines={2}>{b.title}</Text>
          <View style={styles.line}>
            <Ionicons name="calendar-outline" size={13} color={colors.muted} />
            <Text style={styles.muted}>{b.dates || "Sana yo'q"}</Text>
          </View>
          <View style={styles.line}>
            <Ionicons name="people-outline" size={13} color={colors.muted} />
            <Text style={styles.muted}>{b.guests} kishi</Text>
          </View>
        </View>
      </View>

      <View style={styles.customer}>
        <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.customerName} numberOfLines={1}>{b.customer.name || "Mijoz"}</Text>
          {!!b.customer.phone && <Text style={styles.muted}>{b.customer.phone}</Text>}
        </View>
        <Text style={styles.total}>{formatPrice(b.total)}</Text>
      </View>

      {!!b.comment && (
        <Text style={styles.comment} numberOfLines={2}>«{b.comment}»</Text>
      )}

      {canCancel && (
        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Bekor qilish" variant="outline" onPress={onCancel} disabled={busy} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14, gap: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  code: { fontSize: 12, fontWeight: "700", color: colors.muted },
  content: { flexDirection: "row", gap: 12 },
  image: { width: 72, height: 72, borderRadius: 14 },
  title: { fontSize: 15, fontWeight: "800", color: colors.text, lineHeight: 20 },
  line: { flexDirection: "row", alignItems: "center", gap: 5 },
  muted: { fontSize: 12, color: colors.muted },
  customer: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 14,
    backgroundColor: colors.surface,
  },
  customerName: { fontSize: 14, fontWeight: "700", color: colors.text },
  total: { fontSize: 15, fontWeight: "800", color: colors.text },
  comment: { fontSize: 13, lineHeight: 18, color: colors.muted, fontStyle: "italic" },
  actions: { flexDirection: "row", gap: 10 },
});