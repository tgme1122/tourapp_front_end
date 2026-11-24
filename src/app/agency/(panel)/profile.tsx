import { View, Text, Image, Pressable, ScrollView, RefreshControl, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { router } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { useAgency } from "@/hooks/useAgency";
import { useMembers, useUploadLogo } from "@/hooks/useAgencyApi";
import { isApiError, mediaUrl } from "@/services/api";
import { useAuth } from "@/store/auth";
import { fullName, useUser } from "@/store/user";
import { confirmAction, notify } from "@/utils/confirm";
import { REQUIRED_DOCS } from "@/types/agency";
import AgencyStatusCard from "@/components/agency/AgencyStatusCard";
import SettingsSection from "@/components/profile/SettingsSection";
import SettingsRow from "@/components/profile/SettingsRow";
import ScreenHeader from "@/components/ui/ScreenHeader";

const initials = (name: string) =>
  name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "A";

export default function AgencyProfileScreen() {
  const { agency, isOwner, isApproved, refetch, isRefetching } = useAgency();
  const user = useUser((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const uploadLogo = useUploadLogo();
  const members = useMembers(isOwner && isApproved);

  const logo = mediaUrl(agency?.logo_url);
  const docs = agency?.documents ?? [];
  const missing = REQUIRED_DOCS.filter((t) => !docs.some((d) => d.type === t)).length;
  const activeManagers = (members.data ?? []).filter((m) => m.role === "manager" && m.is_active).length;

  const changeLogo = async () => {
    if (!isOwner || uploadLogo.isPending) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (res.canceled) return;
    const a = res.assets[0];
    uploadLogo.mutate(
      { uri: a.uri, mimeType: a.mimeType, fileName: a.fileName },
      { onError: (e) => notify("Logoni saqlab bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring.") }
    );
  };

  const logout = async () => {
    const ok = await confirmAction({
      title: "Chiqish", message: "Hisobingizdan chiqmoqchimisiz?", confirmText: "Chiqish", destructive: true,
    });
    if (!ok) return;
    signOut();
    router.replace("/login");
  };

  const go = (href: string) => router.push(href as never);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Profil" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); if (isOwner && isApproved) members.refetch(); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ---------- Sarlavha kartasi */}
        <View style={styles.hero}>
          <Pressable onPress={changeLogo} disabled={!isOwner}>
            <View style={styles.logo}>
              {logo ? (
                <Image source={{ uri: logo }} style={styles.logoImg} />
              ) : (
                <Text style={styles.logoText}>{initials(agency?.name ?? "")}</Text>
              )}
              {uploadLogo.isPending && (
                <View style={styles.logoBusy}><ActivityIndicator color={colors.white} /></View>
              )}
            </View>
            {isOwner && (
              <View style={styles.camera}>
                <Ionicons name="camera" size={13} color={colors.white} />
              </View>
            )}
          </Pressable>

          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={2}>{agency?.name ?? "Agentlik"}</Text>
              {agency?.verified && <Ionicons name="checkmark-circle" size={18} color={colors.verified} />}
            </View>
            {!!agency?.city && (
              <View style={styles.line}>
                <Ionicons name="location-outline" size={13} color={colors.muted} />
                <Text style={styles.muted} numberOfLines={1}>
                  {[agency.city, agency.region].filter(Boolean).join(", ")}
                </Text>
              </View>
            )}
            <View style={styles.line}>
              <Ionicons name="person-outline" size={13} color={colors.muted} />
              <Text style={styles.muted} numberOfLines={1}>{fullName(user)}</Text>
            </View>
            <View style={styles.role}>
              <Text style={styles.roleText}>{isOwner ? "Agentlik egasi" : "Menejer"}</Text>
            </View>
          </View>
        </View>

        {agency && !isApproved && (
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <AgencyStatusCard status={agency.status} reason={agency.rejection_reason} />
          </View>
        )}

        {!!agency?.description && (
          <View style={styles.about}>
            <Text style={styles.aboutTitle}>Agentlik haqida</Text>
            <Text style={styles.aboutText} numberOfLines={4}>{agency.description}</Text>
          </View>
        )}

        {/* ---------- Agentlik boshqaruvi */}
        <SettingsSection title="Agentlik">
          <SettingsRow
            icon="business-outline"
            label={isOwner ? "Agentlik ma'lumotlari" : "Agentlik ma'lumotlari (ko'rish)"}
            onPress={() => go("/agency/edit")}
            last={!isOwner}
          />
          {isOwner && (
            <>
              <SettingsRow
                icon="document-text-outline"
                label="Hujjatlar"
                value={missing > 0 ? `${missing} ta yetishmaydi` : docs.length}
                onPress={() => go("/agency/documents")}
              />
              <SettingsRow
                icon="people-outline"
                label="Xodimlar"
                value={isApproved ? activeManagers : undefined}
                onPress={() => go("/agency/members")}
              />
              <SettingsRow
                icon="stats-chart-outline"
                label="Hisobotlar"
                onPress={() => go("/agency/dashboard")}
                last
              />
            </>
          )}
        </SettingsSection>

        {/* ---------- Ish */}
        <SettingsSection title="Ish">
          <SettingsRow icon="map-outline" label="Turlar" onPress={() => go("/agency/tours")} />
          <SettingsRow
            icon="ticket-outline" label="Bronlar"
            onPress={() => go("/agency/bookings")} last={isOwner}
          />
          {!isOwner && (
            <SettingsRow
              icon="add-circle-outline" label="Yangi tur qo'shish"
              onPress={() => go("/agency/tour/new")} last
            />
          )}
        </SettingsSection>

        {/* ---------- Shaxsiy hisob */}
        <SettingsSection title="Hisob">
          <SettingsRow icon="person-circle-outline" label="Shaxsiy ma'lumotlar" onPress={() => go("/edit-profile")} />
          <SettingsRow icon="lock-closed-outline" label="Parolni o'zgartirish" onPress={() => go("/change-password")} />
          <SettingsRow icon="help-circle-outline" label="Admin bilan bog'lanish" onPress={() => go("/help")} last />
        </SettingsSection>

        <View style={styles.bottom}>
          <Pressable style={styles.logout} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={colors.primary} />
            <Text style={styles.logoutText}>Chiqish</Text>
          </Pressable>
          <Text style={styles.version}>Versiya {Constants.expoConfig?.version ?? "1.0.0"}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: {
    flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 16, marginTop: 16,
    padding: 16, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background, ...shadows.soft,
  },
  logo: {
    width: 76, height: 76, borderRadius: 22, overflow: "hidden", backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  logoImg: { width: 76, height: 76 },
  logoText: { fontSize: 26, fontWeight: "900", color: colors.primary },
  logoBusy: {
    ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  camera: {
    position: "absolute", right: -4, bottom: -4, width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.background,
    alignItems: "center", justifyContent: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { flexShrink: 1, fontSize: 18, fontWeight: "800", color: colors.text },
  line: { flexDirection: "row", alignItems: "center", gap: 5 },
  muted: { flexShrink: 1, fontSize: 12, color: colors.muted },
  role: {
    alignSelf: "flex-start", marginTop: 4, paddingHorizontal: 10, height: 24, borderRadius: radius.pill,
    backgroundColor: colors.primarySoft, justifyContent: "center",
  },
  roleText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  about: {
    marginHorizontal: 16, marginTop: 16, padding: 14, gap: 6, borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  aboutTitle: { fontSize: 13, fontWeight: "800", color: colors.text },
  aboutText: { fontSize: 13, lineHeight: 19, color: colors.muted },
  bottom: { paddingHorizontal: 16, marginTop: 24, gap: 14, alignItems: "center" },
  logout: {
    alignSelf: "stretch", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    height: 52, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: colors.primary },
  version: { fontSize: 12, color: colors.muted },
});
