import { Text, FlatList, View, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import { useSavedTours } from "@/hooks/useToursApi";
import { isApiError } from "@/services/api";
import BackHeader from "@/components/ui/BackHeader";
import EmptyState from "@/components/ui/EmptyState";
import ResultCard from "@/components/search/ResultCard";
import { ResultCardSkeleton } from "@/components/ui/Skeleton";

export default function SavedScreen() {
  const { data, isPending, isError, error, refetch, isRefetching } = useSavedTours();
  const tours = data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader
        title="Saqlangan turlar"
        right={tours.length > 0 ? <View style={styles.pill}><Text style={styles.count}>{tours.length}</Text></View> : undefined}
      />
      <FlatList
        data={tours}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item, index }) => <ResultCard tour={item} index={index} />}
        ListEmptyComponent={
          isPending ? (
            <View style={{ gap: 12 }}>
              <ResultCardSkeleton />
              <ResultCardSkeleton />
              <ResultCardSkeleton />
            </View>
          ) : isError ? (
            <View style={styles.empty}>
              <EmptyState
                icon="cloud-offline-outline"
                title="Yuklab bo'lmadi"
                text={isApiError(error) ? error.message : "Qayta urinib ko'ring."}
                actionLabel="Qayta urinish"
                onAction={() => refetch()}
              />
            </View>
          ) : (
            <View style={styles.empty}>
              <EmptyState
                icon="heart-outline"
                title="Saqlangan turlar yo'q"
                text="Yoqqan turlardagi yurak belgisini bossangiz, ular shu yerda saqlanadi."
                actionLabel="Turlarni ko'rish"
                onAction={() => router.navigate("/")}
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
  pill: {
    minWidth: 28, height: 28, borderRadius: 14, paddingHorizontal: 8,
    backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center",
  },
  count: { fontSize: 13, fontWeight: "800", color: colors.primary },
  empty: { flex: 1, justifyContent: "center", paddingVertical: 60 },
});
