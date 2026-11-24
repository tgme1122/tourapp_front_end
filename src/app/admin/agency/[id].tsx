import { useState } from "react";
import {
  View, Text, Image, ScrollView, Pressable, Switch, ActivityIndicator, StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import {
  useAgencyDetail, useApproveAgency, useCheckDocument, useRejectAgency, useSuspendAgency,
} from "@/hooks/useAdminApi";
import { isApiError } from "@/services/api";
import { initialsFrom } from "@/services/mappers";
import { confirmAction, notify } from "@/utils/confirm";
import { formatDate, parseServerDate } from "@/utils/format";
import { AgencyDocument, DOC_LABELS, REQUIRED_DOCS } from "@/types/agency";
import BackHeader from "@/components/ui/BackHeader";
import EmptyState from "@/components/ui/EmptyState";
import PrimaryButton from "@/components/ui/PrimaryButton";
import AgencyStatusBadge from "@/components/admin/AgencyStatusBadge";
import DocumentViewer from "@/components/admin/DocumentViewer";
import ReasonSheet from "@/components/admin/ReasonSheet";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const docIcon = (type: string): IconName =>
  type === "director_passport" ? "id-card-outline" : "document-text-outline";

const dateText = (iso?: string | null) => {
  const d = iso ? parseServerDate(iso) : null;
  return d ? formatDate(d) : "";
};

function Info({ label, value, danger }: { label: string; value?: string | null; danger?: boolean }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, danger && { color: colors.danger }]}>{value}</Text>
    </View>
  );
}

export default function AgencyDetailScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: agency, isPending, isError, error, refetch } = useAgencyDetail(id);

  const approve = useApproveAgency();
  const reject = useRejectAgency();
  const suspend = useSuspendAgency();
  const check = useCheckDocument(id);

  const [viewing, setViewing] = useState<AgencyDocument | null>(null);
  const [reasonMode, setReasonMode] = useState<"reject" | "suspend" | null>(null);

  if (isPending) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BackHeader title="Agentlik" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !agency) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BackHeader title="Agentlik" />
        <View style={styles.center}>
          <EmptyState
            icon="cloud-offline-outline"
            title="Yuklab bo'lmadi"
            text={isApiError(error) ? error.message : "Agentlik topilmadi."}
            actionLabel="Qayta urinish"
            onAction={() => refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const docs = agency.documents ?? [];
  const missing = REQUIRED_DOCS.filter((t) => !docs.some((d) => d.type === t));
  const checkedCount = docs.filter((d) => d.is_checked).length;

  // Tasdiqlash shartlari (backend ham tekshiradi)
  const blockers: string[] = [];
  if (!agency.email_verified) blockers.push("Egasining emaili tasdiqlanmagan");
  if (missing.length > 0) {
    blockers.push(`Majburiy hujjat yuklanmagan: ${missing.map((t) => DOC_LABELS[t]).join(", ")}`);
  }
  const canApprove = blockers.length === 0;

  const status = agency.status;
  const showApprove = status === "pending" || status === "rejected" || status === "suspended";
  const showReject = status === "pending";
  const showSuspend = status === "approved";
  const busy = approve.isPending || reject.isPending || suspend.isPending;

  const fail = (title: string) => (e: unknown) =>
    notify(title, isApiError(e) ? e.message : "Qayta urinib ko'ring.");

  const onApprove = async () => {
    const ok = await confirmAction({
      title: status === "suspended" ? "Blokdan chiqarish" : "Agentlikni tasdiqlash",
      message: `«${agency.name}» tasdiqlanadi va tur qo'sha oladi. Egasiga email yuboriladi.`,
      confirmText: "Tasdiqlash",
    });
    if (!ok) return;
    approve.mutate(agency.id, { onError: fail("Tasdiqlab bo'lmadi") });
  };

  const onReason = (reason: string) => {
    if (reasonMode === "reject") {
      reject.mutate(
        { id: agency.id, reason },
        {
          onSuccess: () => setReasonMode(null),
          onError: fail("Rad etib bo'lmadi"),
        }
      );
    } else if (reasonMode === "suspend") {
      suspend.mutate(
        { id: agency.id, reason },
        {
          onSuccess: () => setReasonMode(null),
          onError: fail("Bloklab bo'lmadi"),
        }
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader title="Agentlik" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Sarlavha */}
        <View style={styles.hero}>
          {agency.logo_url ? (
            <Image source={{ uri: agency.logo_url }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, styles.logoFallback]}>
              <Text style={styles.initials}>{initialsFrom(agency.name)}</Text>
            </View>
          )}
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.name}>{agency.name}</Text>
            <AgencyStatusBadge status={status} />
          </View>
        </View>

        {!!agency.rejection_reason && (status === "rejected" || status === "suspended") && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>
              {status === "rejected" ? "Rad etish sababi" : "Bloklash sababi"}
            </Text>
            <Text style={styles.reasonText}>{agency.rejection_reason}</Text>
          </View>
        )}

        {/* Egasi */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Egasi</Text>
          <Info label="Ism" value={agency.owner_name} />
          <Info label="Email" value={agency.owner_email} />
          <Info
            label="Email holati"
            value={agency.email_verified ? "Tasdiqlangan" : "Tasdiqlanmagan"}
            danger={!agency.email_verified}
          />
          <Info label="Telefon" value={agency.owner_phone} />
          <Info label="Ro'yxatdan o'tgan" value={dateText(agency.created_at)} />
          <Info label="Ko'rib chiqilgan" value={dateText(agency.reviewed_at)} />
        </View>

        {/* Agentlik ma'lumotlari */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Agentlik ma'lumotlari</Text>
          <Info label="Litsenziya" value={agency.license_number} />
          <Info label="STIR" value={agency.tax_id} />
          <Info label="Hudud" value={[agency.region, agency.city].filter(Boolean).join(", ")} />
          <Info label="Manzil" value={agency.address} />
          <Info label="Telefon" value={agency.contact_phone} />
          <Info label="Veb-sayt" value={agency.website} />
          {!!agency.description && <Text style={styles.desc}>{agency.description}</Text>}
        </View>

        {/* Hujjatlar */}
        <View style={styles.card}>
          <View style={styles.docHead}>
            <Text style={styles.cardTitle}>Hujjatlar</Text>
            <Text style={styles.muted}>Tekshirilgan: {checkedCount}/{docs.length}</Text>
          </View>

          {docs.map((doc) => (
            <View key={doc.id} style={styles.doc}>
              <View style={styles.docIcon}>
                <Ionicons name={docIcon(doc.type)} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.docTitle} numberOfLines={1}>
                  {DOC_LABELS[doc.type] ?? doc.type}
                </Text>
                <Pressable onPress={() => setViewing(doc)} hitSlop={6}>
                  <Text style={styles.docLink}>Ko'rish</Text>
                </Pressable>
              </View>
              <View style={styles.checkBox}>
                <Text style={styles.checkLabel}>Tekshirildi</Text>
                <Switch
                  value={!!doc.is_checked}
                  onValueChange={(v) => check.mutate({ documentId: doc.id, isChecked: v })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.teal}
                />
              </View>
            </View>
          ))}

          {missing.map((t) => (
            <View key={t} style={[styles.doc, styles.docMissing]}>
              <View style={[styles.docIcon, { backgroundColor: colors.dangerSoft }]}>
                <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docTitle}>{DOC_LABELS[t]}</Text>
                <Text style={[styles.muted, { color: colors.danger }]}>Yuklanmagan (majburiy)</Text>
              </View>
            </View>
          ))}

          {docs.length === 0 && missing.length === 0 && (
            <Text style={styles.muted}>Hujjat yo'q</Text>
          )}
        </View>

        {showApprove && !canApprove && (
          <View style={styles.blockBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.blockTitle}>Hozircha tasdiqlab bo'lmaydi</Text>
              {blockers.map((b) => (
                <Text key={b} style={styles.blockText}>• {b}</Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Qaror tugmalari */}
      {(showApprove || showReject || showSuspend) && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {showReject && (
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Rad etish"
                variant="outline"
                onPress={() => setReasonMode("reject")}
                disabled={busy}
              />
            </View>
          )}
          {showSuspend && (
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Bloklash"
                variant="outline"
                onPress={() => setReasonMode("suspend")}
                disabled={busy}
              />
            </View>
          )}
          {showApprove && (
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label={status === "suspended" ? "Blokdan chiqarish" : "Tasdiqlash"}
                onPress={onApprove}
                loading={approve.isPending}
                disabled={!canApprove || busy}
              />
            </View>
          )}
        </View>
      )}

      <ReasonSheet
        visible={reasonMode !== null}
        title={reasonMode === "reject" ? "Arizani rad etish" : "Agentlikni bloklash"}
        description={
          reasonMode === "reject"
            ? "Sabab agentlik egasiga yuboriladi. U ma'lumotlarni to'g'rilab qayta topshira oladi."
            : "Bloklangan agentlik tur qo'sha olmaydi va bronlarni qabul qilmaydi."
        }
        confirmLabel={reasonMode === "reject" ? "Rad etish" : "Bloklash"}
        loading={reject.isPending || suspend.isPending}
        onClose={() => setReasonMode(null)}
        onSubmit={onReason}
      />

      <DocumentViewer doc={viewing} onClose={() => setViewing(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center" },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  hero: { flexDirection: "row", alignItems: "center", gap: 14 },
  logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.surface },
  logoFallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  initials: { fontSize: 24, fontWeight: "800", color: colors.primary },
  name: { fontSize: 22, fontWeight: "800", color: colors.text },
  reasonBox: { padding: 14, gap: 4, borderRadius: 16, backgroundColor: colors.dangerSoft },
  reasonLabel: { fontSize: 12, fontWeight: "800", color: colors.danger },
  reasonText: { fontSize: 14, lineHeight: 20, color: colors.text },
  card: { padding: 16, gap: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  infoLabel: { fontSize: 14, color: colors.muted },
  infoValue: { flex: 1, textAlign: "right", fontSize: 14, fontWeight: "700", color: colors.text },
  desc: { fontSize: 14, lineHeight: 21, color: colors.text },
  muted: { fontSize: 12, color: colors.muted },
  docHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  doc: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14,
    backgroundColor: colors.surface,
  },
  docMissing: { backgroundColor: colors.dangerSoft },
  docIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  docTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  docLink: { fontSize: 13, fontWeight: "700", color: colors.primary },
  checkBox: { alignItems: "center", gap: 2 },
  checkLabel: { fontSize: 10, color: colors.muted },
  blockBox: {
    flexDirection: "row", gap: 10, padding: 14, borderRadius: 16, backgroundColor: colors.warningSoft,
  },
  blockTitle: { fontSize: 14, fontWeight: "800", color: colors.warning },
  blockText: { fontSize: 13, lineHeight: 18, color: colors.text },
  footer: {
    flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background,
  },
});