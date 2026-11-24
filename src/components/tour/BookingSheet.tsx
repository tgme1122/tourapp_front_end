import { useEffect, useState } from "react";
import { View, Text, Image, Pressable, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius } from "@/constants/theme";
import { formatDateRange, formatPrice } from "@/utils/format";
import { Tour } from "@/types/tour";
import { Departure } from "@/types/tourDetails";

type Props = {
  visible: boolean;
  tour: Tour;
  departure?: Departure;
  onClose: () => void;
  onConfirm: (guests: number) => void;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function BookingSheet({ visible, tour, departure, onClose, onConfirm }: Props) {
  const insets = useSafeAreaInsets();
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    if (visible) setGuests(1);
  }, [visible]);

  if (!departure) return null;

  const maxGuests = Math.max(1, Math.min(10, departure.seatsLeft));
  const total = tour.price * guests;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Bronni rasmiylashtirish</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.tour}>
            <Image source={{ uri: tour.image }} style={styles.image} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.tourTitle} numberOfLines={2}>{tour.title}</Text>
              <Text style={styles.muted}>{tour.city}, {tour.country}</Text>
            </View>
          </View>

          <View style={styles.rows}>
            <Row
              label="Sana"
              value={`${formatDateRange(departure.startISO, tour.days)} ${departure.startISO.slice(0, 4)}`}
            />
            <Row label="Davomiyligi" value={`${tour.days} kun`} />
            <Row label="Agentlik" value={tour.agency} />

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Mehmonlar</Text>
              <View style={styles.stepper}>
                <Pressable
                  style={[styles.step, guests <= 1 && { opacity: 0.4 }]}
                  disabled={guests <= 1}
                  onPress={() => setGuests((g) => g - 1)}
                >
                  <Ionicons name="remove" size={18} color={colors.text} />
                </Pressable>
                <Text style={styles.count}>{guests}</Text>
                <Pressable
                  style={[styles.step, guests >= maxGuests && { opacity: 0.4 }]}
                  disabled={guests >= maxGuests}
                  onPress={() => setGuests((g) => g + 1)}
                >
                  <Ionicons name="add" size={18} color={colors.text} />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.muted}>{formatPrice(tour.price)} × {guests} kishi</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Jami</Text>
              <Text style={styles.total}>{formatPrice(total)}</Text>
            </View>
          </View>

          <Text style={styles.note}>
            Bron agentlik tomonidan tasdiqlangach faol bo'ladi. To'lov tasdiqlangandan keyin amalga oshiriladi.
          </Text>

          <Pressable style={styles.confirm} onPress={() => onConfirm(guests)}>
            <Text style={styles.confirmText}>Bronni tasdiqlash</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    paddingHorizontal: 16, paddingTop: 10, gap: 14,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background,
  },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  tour: {
    flexDirection: "row", gap: 12, padding: 10, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  image: { width: 64, height: 64, borderRadius: 12, backgroundColor: colors.surface },
  tourTitle: { fontSize: 15, fontWeight: "800", color: colors.text, lineHeight: 20 },
  muted: { fontSize: 12, color: colors.muted },
  rows: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLabel: { fontSize: 14, color: colors.muted },
  rowValue: { fontSize: 14, fontWeight: "700", color: colors.text },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  step: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
  },
  count: { minWidth: 20, textAlign: "center", fontSize: 17, fontWeight: "800", color: colors.text },
  totalBox: { padding: 14, gap: 6, borderRadius: 16, backgroundColor: colors.surface },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalLabel: { fontSize: 15, fontWeight: "700", color: colors.text },
  total: { fontSize: 22, fontWeight: "800", color: colors.primary },
  note: { fontSize: 12, lineHeight: 17, color: colors.muted },
  confirm: {
    height: 54, borderRadius: radius.pill, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  confirmText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});