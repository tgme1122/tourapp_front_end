import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { RoleFilter, useUserCounts, useUserList } from "@/hooks/useAdminApi";
import { useDebounced } from "@/hooks/useDebounced";
import { isApiError } from "@/services/api";
import { AdminUser, UserRole } from "@/types/admin";
import DataTable, { Badge, Column } from "@/components/admin/DataTable";
import EmptyState from "@/components/ui/EmptyState";

type ActiveFilter = "any" | "active" | "blocked";

const ROLE_TABS: { key: RoleFilter; label: string; count: "total" | "travelers" | "agencies" | "admins" }[] = [
  { key: "all", label: "Hammasi", count: "total" },
  { key: "traveler", label: "Sayyohlar", count: "travelers" },
  { key: "agency", label: "Agentliklar", count: "agencies" },
  { key: "admin", label: "Adminlar", count: "admins" },
];

const ACTIVE_TABS: { key: ActiveFilter; label: string; count?: "active" | "blocked" }[] = [
  { key: "any", label: "Barchasi" },
  { key: "active", label: "Faol", count: "active" },
  { key: "blocked", label: "Bloklangan", count: "blocked" },
];

const ROLE_LABEL: Record<UserRole, { text: string; color: string; bg: string }> = {
  traveler: { text: "Sayyoh", color: colors.verified, bg: "#E8F1FD" },
  agency: { text: "Agentlik", color: colors.warning, bg: colors.warningSoft },
  admin: { text: "Admin", color: colors.primary, bg: colors.primarySoft },
};

const COLUMNS: Column<AdminUser>[] = [
  { key: "name", title: "Ism", width: 180, value: (u) => `${u.first_name} ${u.last_name}`.trim() },
  { key: "email", title: "Email", width: 220, value: (u) => u.email },
  { key: "phone", title: "Telefon", width: 150, value: (u) => u.phone },
  {
    key: "role", title: "Rol", width: 110,
    render: (u) => <Badge text={ROLE_LABEL[u.role].text} color={ROLE_LABEL[u.role].color} bg={ROLE_LABEL[u.role].bg} />,
  },
  {
    key: "agency", title: "Agentlik", width: 200,
    render: (u) =>
      u.agency_id ? (
        <Pressable
          onPress={() => router.push({ pathname: "/admin/agency/[id]", params: { id: u.agency_id! } })}
          hitSlop={6}
        >
          <Text style={styles.link} numberOfLines={1}>{u.agency_name || "Agentlik"}</Text>
          {!!u.agency_status && <Text style={styles.sub}>{u.agency_status}</Text>}
        </Pressable>
      ) : (
        <Text style={styles.cellText}>—</Text>
      ),
  },
  {
    key: "state", title: "Holat", width: 120,
    render: (u) => (
      <Badge
        text={u.is_active ? "Faol" : "Bloklangan"}
        color={u.is_active ? colors.success : colors.danger}
        bg={u.is_active ? colors.successSoft : colors.dangerSoft}
      />
    ),
  },
  { key: "created", title: "Qo'shilgan", width: 120, value: (u) => u.created_at.slice(0, 10) },
];

export default function UsersScreen() {
  const [role, setRole] = useState<RoleFilter>("all");
  const [state, setState] = useState<ActiveFilter>("any");
  const [query, setQuery] = useState("");
  const q = useDebounced(query.trim(), 400);

  const counts = useUserCounts().data;
  const {
    data, isPending, isError, error, refetch, isRefetching,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useUserList(role, q, state === "any" ? undefined : state === "active");
  const users = useMemo(() => data?.pages.flat() ?? [], [data]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.header}>Foydalanuvchilar</Text>

      <View style={styles.searchWrap}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Ism, familiya, email yoki telefon"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {ROLE_TABS.map((t) => {
          const active = t.key === role;
          const c = counts?.[t.count];
          return (
            <Pressable key={t.key} onPress={() => setRole(t.key)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t.label}{c !== undefined ? ` (${c})` : ""}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stateRow}>
        {ACTIVE_TABS.map((t) => {
          const active = t.key === state;
          const c = t.count ? counts?.[t.count] : undefined;
          return (
            <Pressable key={t.key} onPress={() => setState(t.key)} style={[styles.stateChip, active && styles.stateActive]}>
              <Text style={[styles.stateText, active && styles.stateTextActive]}>
                {t.label}{c !== undefined ? ` (${c})` : ""}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <DataTable
        columns={COLUMNS}
        rows={users}
        keyOf={(u) => u.id}
        loading={isPending}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => refetch()}
        loadingMore={isFetchingNextPage}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onRowPress={(u) => router.push({ pathname: "/admin/user/[id]", params: { id: u.id } })}
        empty={
          isError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Yuklab bo'lmadi"
              text={isApiError(error) ? error.message : "Qayta urinib ko'ring."}
              actionLabel="Qayta urinish"
              onAction={() => refetch()}
            />
          ) : (
            <EmptyState
              icon="people-outline"
              title="Foydalanuvchi topilmadi"
              text={q ? "Boshqa so'z bilan qidirib ko'ring." : "Bu bo'limda foydalanuvchilar yo'q."}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: -0.5,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  searchWrap: { paddingHorizontal: 16, paddingTop: 4 },
  search: {
    flexDirection: "row", alignItems: "center", gap: 10, height: 48, paddingHorizontal: 16,
    borderRadius: radius.pill, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, ...shadows.soft,
  },
  input: { flex: 1, fontSize: 14, color: colors.text },
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 15, height: 38, borderRadius: radius.pill, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
    ...shadows.soft,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.text },
  chipTextActive: { color: colors.white },
  stateRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8, alignItems: "center" },
  stateChip: { paddingHorizontal: 12, height: 30, borderRadius: 15, justifyContent: "center", backgroundColor: colors.surface },
  stateActive: { backgroundColor: colors.primarySoft },
  stateText: { fontSize: 12, fontWeight: "700", color: colors.muted },
  stateTextActive: { color: colors.primary },
  cellText: { fontSize: 13, color: colors.text },
  link: { fontSize: 13, fontWeight: "700", color: colors.verified },
  sub: { fontSize: 11, color: colors.muted },
});
