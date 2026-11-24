import { useState } from "react";
import {
  View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Redirect } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { useAgency } from "@/hooks/useAgency";
import {
  useDeleteDocument, useResubmitAgency, useUploadDocument,
} from "@/hooks/useAgencyApi";
import { isApiError } from "@/services/api";
import { AgencyDocument, DOC_LABELS, DocumentType, REQUIRED_DOCS } from "@/types/agency";
import { confirmAction, notify } from "@/utils/confirm";
import AgencyStatusCard from "@/components/agency/AgencyStatusCard";
import DocumentViewer from "@/components/admin/DocumentViewer";
import BackHeader from "@/components/ui/BackHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";

const DOC_TYPES: { key: DocumentType; label: string; required?: boolean }[] = [
  { key: "license", label: "Litsenziya", required: true },
  { key: "tax_certificate", label: "STIR guvohnomasi", required: true },
  { key: "registration", label: "Ro'yxatga olish guvohnomasi", required: true },
  { key: "director_passport", label: "Direktor pasporti" },
  { key: "other", label: "Boshqa hujjat" },
];

const MAX_DOCUMENTS = 10;

export default function AgencyDocumentsScreen() {
  const { agency, agencyRole, isOwner, isApproved, refetch, isRefetching } = useAgency();
  const upload = useUploadDocument();
  const remove = useDeleteDocument();
  const resubmit = useResubmitAgency();

  const [selectedType, setSelectedType] = useState<DocumentType>("license");
  const [viewing, setViewing] = useState<AgencyDocument | null>(null);

  if (agencyRole && !isOwner) return <Redirect href="/agency/tours" />;

  const docs = agency?.documents ?? [];
  const missing = REQUIRED_DOCS.filter((t) => !docs.some((d) => d.type === t));
  const suspended = agency?.status === "suspended";
  const canUpload = !suspended && docs.length < MAX_DOCUMENTS;

  const pickAndUpload = async (type: DocumentType = selectedType) => {
    if (!canUpload || upload.isPending) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (res.canceled) return;
    const a = res.assets[0];
    upload.mutate(
      { type, file: { uri: a.uri, mimeType: a.mimeType, fileName: a.fileName } },
      {
        onSuccess: () => notify("Yuklandi", "Hujjat muvaffaqiyatli qo'shildi."),
        onError: (e) => notify("Yuklab bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring."),
      }
    );
  };

  const onDelete = async (doc: AgencyDocument) => {
    const ok = await confirmAction({
      title: "Hujjatni o'chirish",
      message: `«${DOC_LABELS[doc.type] ?? doc.type}» o'chiriladi.`,
      confirmText: "O'chirish",
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(doc.id, {
      onError: (e) => notify("O'chirib bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring."),
    });
  };

  const onResubmit = () => {
    resubmit.mutate(undefined, {
      onSuccess: () =>
        notify("Yuborildi", "Arizangiz admin tomonidan qayta ko'rib chiqish uchun yuborildi."),
      onError: (e) =>
        notify("Yuborib bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring."),
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader
        title="Hujjatlar"
        right={
          <View style={styles.countPill}>
            <Text style={styles.countText}>{docs.length}/{MAX_DOCUMENTS}</Text>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {agency && <AgencyStatusCard status={agency.status} reason={agency.rejection_reason} />}

        {/* ---------- Majburiy hujjatlar holati */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Majburiy hujjatlar</Text>
          {REQUIRED_DOCS.map((t) => {
            const uploaded = docs.some((d) => d.type === t);
            return (
              <Pressable
                key={t}
                style={styles.checkRow}
                onPress={() => {
                  if (!uploaded && canUpload) {
                    setSelectedType(t);
                    pickAndUpload(t);
                  }
                }}
              >
                <Ionicons
                  name={uploaded ? "checkmark-circle" : "alert-circle-outline"}
                  size={20}
                  color={uploaded ? colors.success : colors.warning}
                />
                <Text style={styles.checkLabel}>{DOC_LABELS[t]}</Text>
                <Text style={[styles.checkState, { color: uploaded ? colors.success : colors.primary }]}>
                  {uploaded ? "Yuklangan" : "Yuklash"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ---------- Yangi hujjat yuklash */}
        {!suspended && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Yangi hujjat yuklash</Text>
            <View style={styles.chips}>
              {DOC_TYPES.map((t) => {
                const active = selectedType === t.key;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setSelectedType(t.key)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>Galereyadan JPG, PNG yoki WEBP rasm tanlang (10 MB gacha).</Text>
            <PrimaryButton
              label="Rasm tanlash va yuklash"
              icon="cloud-upload-outline"
              onPress={() => pickAndUpload(selectedType)}
              loading={upload.isPending}
              disabled={!canUpload}
            />
          </View>
        )}

        {/* ---------- Yuklangan hujjatlar */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Yuklangan hujjatlar ({docs.length})</Text>

          {docs.length === 0 ? (
            <Text style={styles.hint}>Hozircha hujjat yuklanmagan.</Text>
          ) : (
            docs.map((doc) => {
              const locked = isApproved && !!doc.is_checked;
              const deleting = remove.isPending && remove.variables === doc.id;
              return (
                <View key={doc.id} style={styles.docRow}>
                  <View style={styles.docIcon}>
                    <Ionicons
                      name={doc.type === "director_passport" ? "id-card-outline" : "document-text-outline"}
                      size={20}
                      color={colors.primary}
                    />
                  </View>

                  <Pressable style={{ flex: 1, gap: 2 }} onPress={() => setViewing(doc)}>
                    <Text style={styles.docTitle} numberOfLines={1}>
                      {DOC_LABELS[doc.type] ?? doc.type}
                    </Text>
                    <Text
                      style={[
                        styles.docState,
                        { color: doc.is_checked ? colors.success : colors.muted },
                      ]}
                    >
                      {doc.is_checked ? "Tasdiqlangan · Ko'rish" : "Tekshiruvda · Ko'rish"}
                    </Text>
                  </Pressable>

                  {!locked && (
                    <Pressable
                      style={styles.deleteBtn}
                      onPress={() => onDelete(doc)}
                      disabled={deleting}
                      hitSlop={8}
                    >
                      {deleting ? (
                        <ActivityIndicator size="small" color={colors.danger} />
                      ) : (
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      )}
                    </Pressable>
                  )}
                </View>
              );
            })
          )}
        </View>

        {agency?.status === "rejected" && (
          <PrimaryButton
            label="Arizani qayta yuborish"
            icon="send-outline"
            onPress={onResubmit}
            loading={resubmit.isPending}
            disabled={missing.length > 0}
          />
        )}
      </ScrollView>

      <DocumentViewer doc={viewing} onClose={() => setViewing(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  countPill: {
    paddingHorizontal: 12, height: 28, borderRadius: radius.pill,
    backgroundColor: colors.primarySoft, justifyContent: "center",
  },
  countText: { fontSize: 13, fontWeight: "800", color: colors.primary },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  card: {
    padding: 16, gap: 12, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background, ...shadows.soft,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  checkLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text },
  checkState: { fontSize: 13, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12, height: 34, borderRadius: radius.pill, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, justifyContent: "center",
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: "700", color: colors.text },
  chipTextActive: { color: colors.white },
  hint: { fontSize: 12, color: colors.muted },
  docRow: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 10,
    borderRadius: radius.lg, backgroundColor: colors.surface,
  },
  docIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  docTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  docState: { fontSize: 12, fontWeight: "600" },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.dangerSoft,
    alignItems: "center", justifyContent: "center",
  },
});
