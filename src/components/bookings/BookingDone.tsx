import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { ZoomIn } from "react-native-reanimated";
import { colors } from "@/constants/theme";
import { Booking } from "@/types/booking";
import { formatPrice } from "@/utils/format";
import PrimaryButton from "@/components/ui/PrimaryButton";
import StatusBadge from "@/components/bookings/StatusBadge";

type Props = { booking: Booking; onViewBookings: () => void; onHome: () => void };

export default function BookingDone({ booking, onViewBookings, onHome }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.duration(450)} style={styles.icon}>
          <Ionicons name="checkmark" size={56} color={colors.white} />
        </Animated.View>

        <Text style={styles.title}>Bron tasdiqlandi</Text>
        <Text style={styles.text}>
          To'lov qabul qilindi. Bron haqida bildirishnoma yuborildi, ma'lumotlarni Bronlar
          bo'limida ko'rishingiz mumkin.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Bron raqami</Text>
            <Text style={styles.value}>№ {booking.code}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tur</Text>
            <Text style={styles.value} numberOfLines={2}>{booking.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sana</Text>
            <Text style={styles.value}>{booking.dates}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>To'langan</Text>
            <Text style={styles.value}>{formatPrice(booking.total)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Holati</Text>
            <StatusBadge status={booking.status} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Bronlarni ko'rish" onPress={onViewBookings} />
        <PrimaryButton label="Bosh sahifa" variant="outline" onPress={onHome} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 14 },
  icon: {
    width: 104, height: 104, borderRadius: 52, backgroundColor: colors.success,
    alignItems: "center", justifyContent: "center", marginBottom: 6,
  },
  title: { fontSize: 26, fontWeight: "800", color: colors.text },
  text: { fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: "center" },
  card: {
    alignSelf: "stretch", padding: 16, gap: 12, marginTop: 8, borderRadius: 18,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  label: { fontSize: 14, color: colors.muted },
  value: { flex: 1, textAlign: "right", fontSize: 14, fontWeight: "700", color: colors.text },
  footer: { padding: 16, gap: 10 },
});