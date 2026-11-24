import { useState } from "react";
import {
  View, Text, Image, ScrollView, Pressable, Linking, ActivityIndicator, StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import { useAgency } from "@/hooks/useAgency";
import { useAgencyBooking, useBookingTravelers } from "@/hooks/useAgencyBookingsApi";
import { useBookingDecisions } from "@/hooks/useBookingDecisions";
import { isApiError } from "@/services/api";
import { formatClock, formatDate, formatPrice, parseServerDate } from "@/utils/format";
import BackHeader from "@/components/ui/BackHeader";
import EmptyState from "@/components/ui/EmptyState";
import PrimaryButton from "@/components/ui/PrimaryButton";
import ReasonSheet from "@/components/admin/ReasonSheet";
import StatusBadge from "@/components/bookings/StatusBadge";

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const dateTime = (iso: string) => {
  const d = parseServerDate(iso);
  return d ? `${formatDate(d)}, ${formatClock(d)}` : "";
};

const call = (phone: string) => {
  Linking.openURL(`tel:${phone.replace(/[^\d+]/g, "")}`).catch(() => {});
};

export default function AgencyBookingDetail() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isManager } = useAgency();
  const [revealPassports, setRevealPassports] = useState(false);
  const { data: b, isPending, isError, error, refetch } = useAgencyBooking(id);
  const canDecrypt = isManager && !!b && (b.status === "confirmed" || b.status === "completed");
  const travelersQuery = useBookingTravelers(id, canDecrypt && revealPassports);
  const decisions = useBookingDecisions();

  if (isPending) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BackHeader title="Bron" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !b) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BackHeader title="Bron" />
        <View style={styles.center}>
          <EmptyState
            icon="cloud-offline-outline"
            title="Yuklab bo'lmadi"
            text={isApiError(error) ? error.message : "Bron topilmadi."}
            actionLabel="Qayta urinish"
            onAction={() => refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const canCancel = isManager && b.status === "confirmed";
  const busy = decisions.busyId === b.id;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader title={`Bron № ${b.code}`} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.statusRow}>
          <StatusBadge status={b.status} />
          {!isManager && <Text style={styles.muted}>Faqat ko'rish</Text>}
        </View>

        <View style={styles.tour}>
          {b.image ? (
            <Image source={{ uri: b.image }} style={styles.image} />
          ) : (
            <View style={[styles.image, { backgroundColor: colors.surface }]} />
          )}
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.tourTitle} numberOfLines={3}>{b.title}</Text>
            <Text style={styles.muted}>{[b.city, b.country].filter(Boolean).join(", ")}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bron</Text>
          <Row label="Sana" value={b.dates} />
          <Row label="Mehmonlar" value={`${b.guests} kishi`} />
          <Row label="Jami summa" value={formatPrice(b.total)} />
          <Row label="Yuborilgan" value={dateTime(b.createdAt)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mijoz</Text>
          <Row label="Ism" value={b.customer.name} />
          <Row label="Email" value={b.customer.email} />
          {!!b.customer.phone && (
            <Pressable style={styles.row} onPress={() => call(b.customer.phone)}>
              <Text style={styles.rowLabel}>Telefon</Text>
              <View style={styles.callRow}>
                <Ionicons name="call-outline" size={16} color={colors.primary} />
                <Text style={[styles.rowValue, { color: colors.primary }]}>{b.customer.phone}</Text>
              </View>
            </Pressable>
          )}
        </View>

        {(!!b.contactName || !!b.contactPhone || !!b.comment) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bron uchun aloqa va izoh</Text>
            <Row label="Ism" value={b.contactName} />
            {!!b.contactPhone && (
              <Pressable style={styles.row} onPress={() => call(b.contactPhone)}>
                <Text style={styles.rowLabel}>Telefon</Text>
                <View style={styles.callRow}>
                  <Ionicons name="call-outline" size={16} color={colors.primary} />
                  <Text style={[styles.rowValue, { color: colors.primary }]}>{b.contactPhone}</Text>
                </View>
              </Pressable>
            )}
            {!!b.comment && <Text style={styles.comment}>{b.comment}</Text>}
          </View>
        )}

        {b.travelers.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Sayohatchilar ({b.travelers.length})</Text>
              {canDecrypt && (
                <Pressable
                  style={styles.revealBtn}
                  onPress={() => setRevealPassports((v) => !v)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={revealPassports ? "eye-off-outline" : "eye-outline"}
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.revealText}>
                    {revealPassports ? "Yashirish" : "Pasportni ko'rish"}
                  </Text>
                </Pressable>
              )}
            </View>

            {revealPassports && travelersQuery.isPending && (
              <ActivityIndicator color={colors.primary} size="small" />
            )}
            {revealPassports && travelersQuery.isError && (
              <Text style={styles.errorNote}>
                {isApiError(travelersQuery.error)
                  ? travelersQuery.error.message
                  : "Pasport ma'lumotlarini yuklab bo'lmadi."}
              </Text>
            )}

            {(revealPassports && travelersQuery.data ? travelersQuery.data : b.travelers).map(
              (t, idx) => (
                <View key={t.id || String(idx)} style={styles.travelerBox}>
                  <Text style={styles.travelerName}>
                    {idx + 1}. {t.firstName} {t.lastName}
                  </Text>
                  <Row label="Tug'ilgan sana" value={t.birthDate} />
                  <Row
                    label="Pasport"
                    value={revealPassports && t.passportNumber ? t.passportNumber : t.passportMask}
                  />
                  <Row label="Amal qilish muddati" value={t.passportExpiry} />
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>

      {canCancel && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {canCancel && (
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Bekor qilish"
                variant="outline"
                onPress={() => decisions.onCancel(b)}
                disabled={busy}
              />
            </View>
          )}
        </View>
      )}

      <ReasonSheet {...decisions.sheetProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center" },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  muted: { fontSize: 12, color: colors.muted },
  tour: { flexDirection: "row", gap: 12 },
  image: { width: 84, height: 84, borderRadius: 16 },
  tourTitle: { fontSize: 17, fontWeight: "800", color: colors.text, lineHeight: 22 },
  card: { padding: 16, gap: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  revealBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: colors.primarySoft,
  },
  revealText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  errorNote: { fontSize: 12, fontWeight: "600", color: colors.danger },
  travelerBox: {
    paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, gap: 6,
  },
  travelerName: { fontSize: 14, fontWeight: "800", color: colors.text },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  rowLabel: { fontSize: 14, color: colors.muted },
  rowValue: { flex: 1, textAlign: "right", fontSize: 14, fontWeight: "700", color: colors.text },
  callRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, justifyContent: "flex-end" },
  comment: { fontSize: 14, lineHeight: 21, color: colors.text, fontStyle: "italic" },
  footer: {
    flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background,
  },
});