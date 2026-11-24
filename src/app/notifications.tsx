import { useMemo } from "react";
import {
  View, Text, SectionList, Pressable, RefreshControl, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, shadows } from "@/constants/theme";
import { ListRowSkeleton } from "@/components/ui/Skeleton";
import {
  useDeleteNotification, useMarkAllRead, useMarkNotificationRead,
  useNotificationList, useUnreadNotifications,
} from "@/hooks/useNotificationsApi";
import { useUser } from "@/store/user";
import { isApiError } from "@/services/api";
import { confirmAction } from "@/utils/confirm";
import { AppNotification, NotificationType } from "@/types/notification";
import BackHeader from "@/components/ui/BackHeader";
import EmptyState from "@/components/ui/EmptyState";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const typeConfig: Record<NotificationType, { icon: IconName; color: string; bg: string }> = {
  price_drop: { icon: "trending-down", color: colors.success, bg: colors.successSoft },
  booking: { icon: "ticket", color: colors.primary, bg: colors.primarySoft },
  message: { icon: "chatbubble-ellipses", color: colors.verified, bg: "#E8F0FE" },
  promo: { icon: "flame", color: colors.warning, bg: colors.warningSoft },
};

const DAYS = ["Bugun", "Kecha", "Avvalroq"] as const;

export default function NotificationsScreen() {
  const { data, isPending, isError, error, refetch, isRefetching } = useNotificationList();
  const unread = useUnreadNotifications().data ?? 0;
  const role = useUser((s) => s.user.role);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();
  const remove = useDeleteNotification();

  const items = data ?? [];
  const sections = useMemo(
    () =>
      DAYS.map((d) => ({ title: d, data: items.filter((n) => n.day === d) })).filter(
        (s) => s.data.length > 0
      ),
    [items]
  );

  const open = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
    const t = n.target;
    if (!t) return;
        const isAgency = useUser.getState().user.role === "agency";
    if (t.kind === "tour") {
      if (isAgency) router.push({ pathname: "/agency/tour/[id]", params: { id: t.id } });
      else router.push({ pathname: "/tour/[id]", params: { id: t.id } });
    }
    if (t.kind === "chat") router.push({ pathname: "/chat/[id]", params: { id: t.id } });
    if (t.kind === "bookings") router.navigate(isAgency ? "/agency/bookings" : "/bookings");
  };

  const confirmRemove = async (n: AppNotification) => {
    const ok = await confirmAction({
      title: "Bildirishnomani o'chirish",
      message: "Bu bildirishnoma o'chiriladi.",
      confirmText: "O'chirish",
      destructive: true,
    });
    if (ok) remove.mutate(n.id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader
        title="Bildirishnomalar"
        right={
          unread > 0 ? (
            <Pressable onPress={() => markAll.mutate()} hitSlop={8}>
              <Ionicons name="checkmark-done" size={24} color={colors.primary} />
            </Pressable>
          ) : null
        }
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          unread > 0 ? <Text style={styles.summary}>{unread} ta o'qilmagan xabar</Text> : null
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const c = typeConfig[item.type];
          return (
            <Pressable
              onPress={() => open(item)}
              onLongPress={() => confirmRemove(item)}
              style={({ pressed }) => [
                styles.row,
                !item.read && styles.rowUnread,
                pressed && { backgroundColor: colors.surface },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: c.bg }]}>
                <Ionicons name={c.icon} size={22} color={c.color} />
              </View>
              <View style={styles.body}>
                <View style={styles.topLine}>
                  <Text
                    style={[styles.title, !item.read && styles.titleUnread]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.text} numberOfLines={2}>{item.text}</Text>
              </View>
              {!item.read && <View style={styles.dot} />}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          isPending ? (
            <View style={{ paddingTop: 12 }}>
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
            </View>
          ) : isError ? (
            <View style={styles.empty}>
              <EmptyState
                icon="cloud-offline-outline"
                title="Yuklab bo'lmadi"
                text={isApiError(error) ? error.message : "Internetni tekshirib, qayta urinib ko'ring."}
                actionLabel="Qayta urinish"
                onAction={() => refetch()}
              />
            </View>
          ) : (
            <View style={styles.empty}>
              <EmptyState
                icon="notifications-off-outline"
                title="Bildirishnomalar yo'q"
                text={
                  role === "agency"
                    ? "Yangi bronlar va mijoz xabarlari shu yerda ko'rinadi."
                    : role === "admin"
                      ? "Tizim bildirishnomalari shu yerda ko'rinadi."
                      : "Narx tushishi, bronlar va agentlik xabarlari shu yerda ko'rinadi."
                }
              />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  summary: { paddingHorizontal: 16, paddingTop: 14, fontSize: 13, fontWeight: "700", color: colors.primary },
  sectionTitle: {
    paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8,
    fontSize: 13, fontWeight: "800", color: colors.muted,
  },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: 78 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  rowUnread: { backgroundColor: "rgba(212,80,47,0.05)" },
  iconBox: {
    width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center",
    ...shadows.soft,
  },
  body: { flex: 1, gap: 3 },
  topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.text },
  titleUnread: { fontWeight: "800" },
  time: { fontSize: 12, color: colors.muted },
  text: { fontSize: 13, lineHeight: 18, color: colors.muted },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  empty: { flex: 1, justifyContent: "center", paddingVertical: 60 },
});