import { useEffect } from "react";
import {
  View, Text, Pressable, ScrollView, Linking, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { useBooking, useCancelBooking } from "@/hooks/useBookingsApi";
import { usePayBooking } from "@/hooks/useBookingFlowApi";
import { isApiError } from "@/services/api";
import { PAY_PROVIDERS } from "@/services/bookingFlow";
import { Booking } from "@/types/booking";
import { confirmAction, notify } from "@/utils/confirm";
import { formatPrice } from "@/utils/format";
import HoldTimer, { useCountdown } from "@/components/bookings/HoldTimer";
import EmptyState from "@/components/ui/EmptyState";
import PrimaryButton from "@/components/ui/PrimaryButton";

type Props = {
  bookingId: string;
  onPaid: (booking: Booking) => void;
  onClosed: () => void;
};

export default function PaymentPanel({ bookingId, onPaid, onClosed }: Props) {
  const { data: booking, isPending, isError, error, refetch } = useBooking(bookingId, true);
  const pay = usePayBooking();
  const cancel = useCancelBooking();
  const timer = useCountdown(booking?.status === "pending_payment" ? booking.holdExpiresAt : null);

  // To'lov o'tgach bron o'zi "confirmed" bo'ladi
  useEffect(() => {
    if (booking && (booking.status === "confirmed" || booking.status === "completed")) {
      onPaid(booking);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.status]);

  // Muddat tugasa, serverdan haqiqiy holatni olamiz
  useEffect(() => {
    if (timer.expired) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.expired]);

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || !booking) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon="cloud-offline-outline"
          title="Yuklab bo'lmadi"
          text={isApiError(error) ? error.message : "Qayta urinib ko'ring."}
          actionLabel="Qayta urinish"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  if (booking.status === "expired" || booking.status === "cancelled" || booking.status === "refunded") {
    const title =
      booking.status === "expired" ? "Band qilish muddati tugadi" : "Bron bekor qilingan";
    return (
      <View style={styles.center}>
        <EmptyState
          icon="hourglass-outline"
          title={title}
          text="Joy sotuvga qaytarildi. Kerak bo'lsa, qaytadan bron qilishingiz mumkin."
          actionLabel="Orqaga"
          onAction={onClosed}
        />
      </View>
    );
  }

  if (booking.status !== "pending_payment") {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const startPayment = (provider: string) => {
    pay.mutate(
      { bookingId: booking.id, provider },
      {
        onSuccess: ({ payUrl }) => {
          if (payUrl) {
            Linking.openURL(payUrl).catch(() => notify("Ochilmadi", "To'lov sahifasini ochib bo'lmadi."));
          } else {
            notify(
              "To'lov tizimi ulanmagan",
              "To'lov sahifasi manzili (payUrl) hali yo'q. To'lov tizimi ulangach bu tugma ishlaydi."
            );
          }
        },
        onError: (e) =>
          notify("To'lovni boshlab bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring."),
      }
    );
  };

  const cancelBooking = async () => {
    const ok = await confirmAction({
      title: "Bronni bekor qilish",
      message: "Band qilingan joy sotuvga qaytariladi.",
      confirmText: "Bekor qilish",
      cancelText: "Yo'q",
      destructive: true,
    });
    if (!ok) return;
    cancel.mutate(booking.id, {
      onSuccess: onClosed,
      onError: (e) => notify("Bekor qilib bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring."),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <HoldTimer expiresAt={booking.holdExpiresAt} />

      <View style={styles.card}>
        <Text style={styles.cardTitle} numberOfLines={2}>{booking.title}</Text>
        <Text style={styles.muted}>{booking.dates} · {booking.guests} kishi</Text>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>To'lov summasi</Text>
          <Text style={styles.total}>{formatPrice(booking.total)}</Text>
        </View>
      </View>

      <Text style={styles.section}>To'lov usuli</Text>
      <View style={{ gap: 10 }}>
        {PAY_PROVIDERS.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.method, pay.isPending && { opacity: 0.6 }]}
            disabled={pay.isPending}
            onPress={() => startPayment(p.id)}
          >
            <View style={styles.methodIcon}>
              <Ionicons name="card-outline" size={22} color={colors.primary} />
            </View>
            <Text style={styles.methodLabel}>{p.label}</Text>
            {pay.isPending && pay.variables?.provider === p.id ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            )}
          </Pressable>
        ))}
      </View>

      <View style={styles.note}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
        <Text style={styles.noteText}>
          Karta ma'lumotlari ilovada kiritilmaydi va saqlanmaydi: to'lov tanlangan to'lov tizimining
          xavfsiz sahifasida bajariladi. To'lovdan so'ng bron avtomatik tasdiqlanadi.
        </Text>
      </View>

      <PrimaryButton label="Holatni tekshirish" variant="outline" onPress={() => refetch()} />

      <Pressable style={styles.cancel} onPress={cancelBooking} disabled={cancel.isPending}>
        <Text style={styles.cancelText}>Bronni bekor qilish</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", paddingVertical: 40 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  card: { padding: 16, gap: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 17, fontWeight: "800", color: colors.text, lineHeight: 22 },
  muted: { fontSize: 13, color: colors.muted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalLabel: { fontSize: 14, color: colors.muted },
  total: { fontSize: 22, fontWeight: "800", color: colors.primary },
  section: { fontSize: 16, fontWeight: "800", color: colors.text },
  method: {
    flexDirection: "row", alignItems: "center", gap: 12, height: 60, paddingHorizontal: 14,
    borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background,
  },
  methodIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  methodLabel: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.text },
  note: {
    flexDirection: "row", gap: 10, padding: 12, borderRadius: 14, backgroundColor: colors.successSoft,
  },
  noteText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.success, fontWeight: "600" },
  cancel: { height: 44, alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 14, fontWeight: "700", color: colors.danger },
});