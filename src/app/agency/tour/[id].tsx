import { useState } from "react";
import {
  View, Text, Image, ScrollView, Pressable, RefreshControl, ActivityIndicator, StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import { useAgency } from "@/hooks/useAgency";
import {
  useAddDeparture, useArchiveTour, useCreateAddon, useDeleteAddon, useDeleteDeparture,
  useDeleteImage, useManagedTour, useSetTourPolicy, useTourAddons, useTourPolicy,
  useTourStatus, useUpdateAddon, useUploadImages,
} from "@/hooks/useAgencyToursApi";
import { isApiError } from "@/services/api";
import { confirmAction, notify } from "@/utils/confirm";
import { formatDateRange, formatPrice } from "@/utils/format";
import { todayISO } from "@/utils/validation";
import BackHeader from "@/components/ui/BackHeader";
import EmptyState from "@/components/ui/EmptyState";
import PrimaryButton from "@/components/ui/PrimaryButton";
import AddonSheet from "@/components/agency/AddonSheet";
import DepartureSheet from "@/components/agency/DepartureSheet";
import PolicySheet from "@/components/agency/PolicySheet";
import { TOUR_STATUS_STYLE } from "@/constants/tourStatus";

const MAX_IMAGES = 10;

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Check({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={styles.checkRow}>
      <Ionicons
        name={ok ? "checkmark-circle" : "ellipse-outline"}
        size={18}
        color={ok ? colors.success : colors.muted}
      />
      <Text style={[styles.checkText, ok && { color: colors.success }]}>{text}</Text>
    </View>
  );
}

export default function TourManageScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isManager } = useAgency();

  const { data: tour, isPending, isError, error, refetch, isRefetching } = useManagedTour(id);
  const status = useTourStatus(id);
  const archive = useArchiveTour(id);
  const upload = useUploadImages(id);
  const delImage = useDeleteImage(id);
  const addDep = useAddDeparture(id);
  const delDep = useDeleteDeparture(id);
  const { data: addons = [] } = useTourAddons(id);
  const createAddon = useCreateAddon(id);
  const updateAddon = useUpdateAddon(id);
  const deleteAddon = useDeleteAddon(id);
  const { data: policy } = useTourPolicy(id);
  const setPolicy = useSetTourPolicy(id);

  const [depOpen, setDepOpen] = useState(false);
  const [addonOpen, setAddonOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const fail = (title: string) => (e: unknown) =>
    notify(title, isApiError(e) ? e.message : "Qayta urinib ko'ring.");

  if (isPending) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BackHeader title="Tur" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !tour) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BackHeader title="Tur" />
        <View style={styles.center}>
          <EmptyState
            icon="cloud-offline-outline"
            title="Yuklab bo'lmadi"
            text={isApiError(error) ? error.message : "Tur topilmadi."}
            actionLabel="Qayta urinish"
            onAction={() => refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const today = todayISO();
  const hasFutureDeparture = tour.departures.some((d) => d.startISO >= today);
  const ready = tour.images.length >= 1 && hasFutureDeparture;
  const s = TOUR_STATUS_STYLE[tour.status];

  const pickImages = async () => {
    const room = MAX_IMAGES - tour.images.length;
    if (room <= 0) {
      notify("Rasm limiti", `Bitta turga ko'pi bilan ${MAX_IMAGES} ta rasm qo'shish mumkin.`);
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: room,
      quality: 0.8,
    });
    if (res.canceled) return;

    upload.mutate(
      res.assets.map((a) => ({ uri: a.uri, mimeType: a.mimeType, fileName: a.fileName })),
      { onError: fail("Rasmni yuklab bo'lmadi") }
    );
  };

  const removeImage = async (imageId: string) => {
    if (tour.status === "published" && tour.images.length <= 1) {
      notify("O'chirib bo'lmaydi", "Nashr qilingan turning oxirgi rasmini o'chirib bo'lmaydi.");
      return;
    }
    const ok = await confirmAction({
      title: "Rasmni o'chirish",
      message: "Bu rasm turdan olib tashlanadi.",
      confirmText: "O'chirish",
      destructive: true,
    });
    if (ok) delImage.mutate(imageId, { onError: fail("O'chirib bo'lmadi") });
  };

  const removeDeparture = async (departureId: string) => {
    const ok = await confirmAction({
      title: "Jo'nashni o'chirish",
      message: "Bu jo'nash sanasi o'chiriladi.",
      confirmText: "O'chirish",
      destructive: true,
    });
    if (ok) delDep.mutate(departureId, { onError: fail("O'chirib bo'lmadi") });
  };

  const removeAddon = async (addonId: string) => {
    const ok = await confirmAction({
      title: "Xizmatni o'chirish",
      message: "Bu qo'shimcha xizmat olib tashlanadi.",
      confirmText: "O'chirish",
      destructive: true,
    });
    if (ok) deleteAddon.mutate(addonId, { onError: fail("O'chirib bo'lmadi") });
  };

  const publish = () => status.mutate("published", { onError: fail("Nashr qilib bo'lmadi") });

  const archiveTourNow = async () => {
    const ok = await confirmAction({
      title: "Turni arxivlash",
      message: "Tur sayohatchilarga ko'rinmaydi. Mavjud bronlar saqlanadi.",
      confirmText: "Arxivlash",
      destructive: true,
    });
    if (!ok) return;
    archive.mutate(undefined, {
      onSuccess: () => router.back(),
      onError: fail("Arxivlab bo'lmadi"),
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader
        title={tour.title}
        right={
          isManager ? (
            <Pressable
              onPress={() => router.push({ pathname: "/agency/tour/edit/[id]", params: { id } })}
              hitSlop={8}
            >
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </Pressable>
          ) : null
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
        <View style={styles.statusRow}>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
          </View>
          {!isManager && <Text style={styles.muted}>Faqat ko'rish</Text>}
        </View>

        {/* Nashr tayyorligi */}
        {isManager && tour.status === "draft" && (
          <View style={styles.readyBox}>
            <Text style={styles.cardTitle}>Nashr qilish uchun</Text>
            <Check ok={tour.images.length >= 1} text="Kamida 1 ta rasm qo'shilgan" />
            <Check ok={hasFutureDeparture} text="Kamida 1 ta kelajakdagi jo'nash bor" />
          </View>
        )}

        {/* Rasmlar */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Rasmlar</Text>
            <Text style={styles.muted}>{tour.images.length}/{MAX_IMAGES}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {tour.images.map((img) => (
              <View key={img.id}>
                <Image source={{ uri: img.url }} style={styles.thumb} />
                {isManager && (
                  <Pressable style={styles.thumbDelete} onPress={() => removeImage(img.id)} hitSlop={6}>
                    <Ionicons name="close" size={14} color={colors.white} />
                  </Pressable>
                )}
              </View>
            ))}

            {isManager && tour.images.length < MAX_IMAGES && (
              <Pressable style={styles.thumbAdd} onPress={pickImages} disabled={upload.isPending}>
                {upload.isPending ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="add" size={26} color={colors.primary} />
                    <Text style={styles.thumbAddText}>Rasm</Text>
                  </>
                )}
              </Pressable>
            )}
          </ScrollView>

          {tour.images.length === 0 && !isManager && <Text style={styles.muted}>Rasm qo'shilmagan</Text>}
        </View>

        {/* Jo'nashlar */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Jo'nash sanalari</Text>
            {isManager && (
              <Pressable onPress={() => setDepOpen(true)} hitSlop={8}>
                <Text style={styles.link}>+ Qo'shish</Text>
              </Pressable>
            )}
          </View>

          {tour.departures.length === 0 && <Text style={styles.muted}>Jo'nash qo'shilmagan</Text>}

          {tour.departures.map((d) => {
            const booked = Math.max(0, d.seatsTotal - d.seatsLeft);
            const past = d.startISO < today;
            return (
              <View key={d.id} style={[styles.dep, past && { opacity: 0.55 }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.depDate}>
                    {formatDateRange(d.startISO, tour.days)} {d.startISO.slice(0, 4)}
                  </Text>
                  <Text style={styles.muted}>
                    {past ? "O'tgan · " : ""}Band: {booked}/{d.seatsTotal} · Bo'sh: {d.seatsLeft}
                  </Text>
                </View>
                {isManager && booked === 0 && (
                  <Pressable onPress={() => removeDeparture(d.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </Pressable>
                )}
                {isManager && booked > 0 && (
                  <Text style={styles.lockText}>Bron bor</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Qo'shimcha xizmatlar */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Qo'shimcha xizmatlar</Text>
            {isManager && (
              <Pressable onPress={() => setAddonOpen(true)} hitSlop={8}>
                <Text style={styles.link}>+ Qo'shish</Text>
              </Pressable>
            )}
          </View>

          {addons.length === 0 && <Text style={styles.muted}>Qo'shimcha xizmatlar qo'shilmagan</Text>}

          {addons.map((a) => (
            <View key={a.id} style={[styles.dep, !a.isActive && { opacity: 0.55 }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.depDate}>{a.name}</Text>
                <Text style={styles.muted}>
                  {formatPrice(a.price)} · {a.perPerson ? "1 kishi uchun" : "Bron uchun"}
                </Text>
                {!!a.description && <Text style={styles.muted}>{a.description}</Text>}
              </View>
              {isManager && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Pressable
                    onPress={() =>
                      updateAddon.mutate(
                        { addonId: a.id, patch: { isActive: !a.isActive } },
                        { onError: fail("Yangilab bo'lmadi") }
                      )
                    }
                    hitSlop={8}
                  >
                    <Ionicons
                      name={a.isActive ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={a.isActive ? colors.primary : colors.muted}
                    />
                  </Pressable>
                  <Pressable onPress={() => removeAddon(a.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Bekor qilish shartlari */}
        {policy && (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Bekor qilish shartlari</Text>
              {isManager && (
                <Pressable onPress={() => setPolicyOpen(true)} hitSlop={8}>
                  <Text style={styles.link}>Sozlash</Text>
                </Pressable>
              )}
            </View>
            {policy.isDefault && <Text style={styles.lockText}>Standart shartlar faol</Text>}
            {policy.rules.map((r) => (
              <Row
                key={r.daysBefore}
                label={r.daysBefore === 0 ? "Jo'nash kuni / kamroq" : `${r.daysBefore}+ kun oldin`}
                value={`${r.refundPercent}% qaytariladi`}
              />
            ))}
          </View>
        )}

        {/* Ma'lumot */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ma'lumot</Text>
          <Row label="Joylashuv" value={`${tour.city}, ${tour.country}`} />
          <Row label="Davomiyligi" value={`${tour.days} kun`} />
          <Row label="Narx" value={formatPrice(tour.price)} />
          <Row label="Eski narx" value={tour.oldPrice ? formatPrice(tour.oldPrice) : undefined} />
          <Row label="Mehmonxona" value={tour.hotel} />
          <Row label="Ovqat" value={tour.meals} />
          <Row label="Transport" value={tour.transport} />
          <Row label="Guruh" value={tour.groupSize} />
          <Row label="Til" value={tour.language} />
          <Row label="Bronlar" value={`${tour.bookingsCount} ta`} />
          {!!tour.description && <Text style={styles.desc}>{tour.description}</Text>}
        </View>

        {tour.itinerary.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tur dasturi</Text>
            {tour.itinerary.map((d) => (
              <View key={d.day} style={{ gap: 2 }}>
                <Text style={styles.depDate}>{d.day}-kun: {d.title}</Text>
                <Text style={styles.muted}>{d.text}</Text>
              </View>
            ))}
          </View>
        )}

        {(tour.included.length > 0 || tour.excluded.length > 0) && (
          <View style={styles.card}>
            {tour.included.length > 0 && (
              <>
                <Text style={styles.cardTitle}>Narxga kiritilgan</Text>
                {tour.included.map((t) => (
                  <Text key={t} style={styles.desc}>• {t}</Text>
                ))}
              </>
            )}
            {tour.excluded.length > 0 && (
              <>
                <Text style={[styles.cardTitle, { marginTop: 8 }]}>Narxga kiritilmagan</Text>
                {tour.excluded.map((t) => (
                  <Text key={t} style={styles.desc}>• {t}</Text>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Harakatlar (faqat menejer) */}
      {isManager && tour.status === "draft" && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <PrimaryButton
            label="Nashr qilish"
            onPress={publish}
            loading={status.isPending}
            disabled={!ready}
          />
        </View>
      )}
      {isManager && tour.status === "published" && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <PrimaryButton
            label="Arxivlash"
            variant="outline"
            onPress={archiveTourNow}
            loading={archive.isPending}
          />
        </View>
      )}

      <DepartureSheet
        visible={depOpen}
        loading={addDep.isPending}
        onClose={() => setDepOpen(false)}
        onSubmit={(d) =>
          addDep.mutate(d, {
            onSuccess: () => setDepOpen(false),
            onError: fail("Jo'nashni qo'shib bo'lmadi"),
          })
        }
      />

      <AddonSheet
        visible={addonOpen}
        loading={createAddon.isPending}
        onClose={() => setAddonOpen(false)}
        onSubmit={(input) =>
          createAddon.mutate(input, {
            onSuccess: () => setAddonOpen(false),
            onError: fail("Xizmatni qo'shib bo'lmadi"),
          })
        }
      />

      <PolicySheet
        visible={policyOpen}
        initial={policy?.rules ?? []}
        isDefault={policy?.isDefault ?? true}
        loading={setPolicy.isPending}
        onClose={() => setPolicyOpen(false)}
        onSubmit={(rules) =>
          setPolicy.mutate(rules, {
            onSuccess: () => setPolicyOpen(false),
            onError: fail("Shartlarni saqlab bo'lmadi"),
          })
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center" },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { paddingHorizontal: 12, height: 28, borderRadius: 14, justifyContent: "center" },
  badgeText: { fontSize: 12, fontWeight: "700" },
  muted: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  readyBox: { padding: 14, gap: 8, borderRadius: 18, backgroundColor: colors.warningSoft },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkText: { fontSize: 13, fontWeight: "600", color: colors.text },
  card: { padding: 16, gap: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  link: { fontSize: 14, fontWeight: "800", color: colors.primary },
  thumb: { width: 104, height: 104, borderRadius: 16, backgroundColor: colors.surface },
  thumbDelete: {
    position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center",
  },
  thumbAdd: {
    width: 104, height: 104, borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed",
    borderColor: colors.primary, alignItems: "center", justifyContent: "center", gap: 2,
  },
  thumbAddText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  dep: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14,
    backgroundColor: colors.surface,
  },
  depDate: { fontSize: 14, fontWeight: "700", color: colors.text },
  lockText: { fontSize: 11, fontWeight: "700", color: colors.muted },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  rowLabel: { fontSize: 14, color: colors.muted },
  rowValue: { flex: 1, textAlign: "right", fontSize: 14, fontWeight: "700", color: colors.text },
  desc: { fontSize: 14, lineHeight: 21, color: colors.text },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});