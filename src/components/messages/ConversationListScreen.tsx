import { useMemo, useState } from "react";
import {
  View, TextInput, FlatList, RefreshControl, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { ListRowSkeleton } from "@/components/ui/Skeleton";
import { useConversations } from "@/hooks/useChatsApi";
import { isApiError } from "@/services/api";
import ScreenHeader from "@/components/ui/ScreenHeader";
import EmptyState from "@/components/ui/EmptyState";
import ConversationItem from "@/components/messages/ConversationItem";

type Props = { emptyText?: string; searchPlaceholder?: string };

export default function ConversationListScreen({
  emptyText = "Tur sahifasidagi «Xabar» tugmasi orqali agentlik bilan suhbat boshlang.",
  searchPlaceholder = "Agentlik yoki tur bo'yicha qidiring",
}: Props) {
  const { data, isPending, isError, error, refetch, isRefetching } = useConversations();
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const all = data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (c) => c.agency.toLowerCase().includes(q) || c.tourTitle.toLowerCase().includes(q)
    );
  }, [data, query]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Xabarlar" />

      <View style={styles.searchWrap}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.muted}
          />
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <ConversationItem
            item={item}
            onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          isPending ? (
            <View>
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
                icon="chatbubbles-outline"
                title={query ? "Xabarlar topilmadi" : "Suhbatlar yo'q"}
                text={query ? "Boshqa so'z bilan qidirib ko'ring." : emptyText}
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
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  search: {
    flexDirection: "row", alignItems: "center", gap: 10, height: 48, paddingHorizontal: 16,
    borderRadius: radius.pill, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border,
    ...shadows.soft,
  },
  input: { flex: 1, fontSize: 14, color: colors.text },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: 86 },
  empty: { flex: 1, justifyContent: "center", paddingVertical: 60 },
});