import { View, Text, Image, FlatList, Pressable, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { useDeleteReview, useMyReviews } from "@/hooks/useReviewsApi";
import { isApiError } from "@/services/api";
import { MyReviewItem } from "@/services/reviews";
import { confirmAction, notify } from "@/utils/confirm";
import BackHeader from "@/components/ui/BackHeader";
import EmptyState from "@/components/ui/EmptyState";
import { ResultCardSkeleton } from "@/components/ui/Skeleton";
import Stars from "@/components/ui/Stars";

export default function MyReviewsScreen() {
  const { data: items = [], isPending, isError, error, refetch, isRefetching } = useMyReviews();
  const remove = useDeleteReview();

  const confirmRemove = async (r: MyReviewItem) => {
    const ok = await confirmAction({
      title: "Sharhni o'chirish",
      message: "Bu sharh o'chirib yuboriladi.",
      confirmText: "O'chirish",
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(r.id, {
      onError: (e) => notify("O'chirib bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring."),
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader title="Mening sharhlarim" right={<Text style={styles.count}>{items.length}</Text>} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: "/tour/[id]", params: { id: item.tourId } })}
          >
            <View style={styles.top}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.placeholder]}>
                  <Ionicons name="image-outline" size={20} color={colors.muted} />
                </View>
              )}
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.title} numberOfLines={2}>{item.tourTitle}</Text>
                <Text style={styles.muted}>{item.city} · {item.date}</Text>
                <Stars value={item.rating} size={14} />
              </View>
              <Pressable onPress={() => confirmRemove(item)} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
            {item.text ? <Text style={styles.text}>{item.text}</Text> : null}
          </Pressable>
        )}
        ListEmptyComponent={
          isPending ? (
            <View style={{ gap: 12 }}>
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
                icon="chatbox-ellipses-outline"
                title="Sharhlaringiz yo'q"
                text="Yakunlangan sayohatdan keyin Bronlar bo'limida sharh qoldirishingiz mumkin."
                actionLabel="Bronlarga o'tish"
                onAction={() => router.navigate("/bookings")}
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
  count: { fontSize: 16, fontWeight: "800", color: colors.primary },
  card: {
    padding: 14, gap: 10, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
    ...shadows.soft,
  },
  top: { flexDirection: "row", gap: 12 },
  image: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.surface },
  placeholder: { alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "800", color: colors.text, lineHeight: 19 },
  muted: { fontSize: 12, color: colors.muted },
  text: { fontSize: 14, lineHeight: 21, color: colors.text },
  empty: { flex: 1, justifyContent: "center", paddingBottom: 80 },
});
