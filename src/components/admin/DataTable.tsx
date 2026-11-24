import { ReactNode } from "react";
import {
  View, Text, FlatList, Pressable, ScrollView, RefreshControl, ActivityIndicator, StyleSheet,
} from "react-native";
import { colors } from "@/constants/theme";

export type Column<T> = {
  key: string;
  title: string;
  width: number;
  align?: "left" | "right";
  render?: (item: T) => ReactNode;
  value?: (item: T) => string;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  keyOf: (item: T) => string;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  loadingMore?: boolean;
  empty?: ReactNode;
  onRowPress?: (item: T) => void;
};

// Gorizontal aylanadigan jadval: sarlavha qatori + qatorlar (pastga tushganda keyingi sahifa)
export default function DataTable<T>({
  columns, rows, keyOf, loading, refreshing, onRefresh, onEndReached, loadingMore, empty, onRowPress,
}: Props<T>) {
  const width = columns.reduce((sum, c) => sum + c.width, 0);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ minWidth: width }}>
      <View style={{ width, flex: 1 }}>
        <View style={styles.headRow}>
          {columns.map((c) => (
            <Text
              key={c.key}
              style={[styles.headCell, { width: c.width, textAlign: c.align ?? "left" }]}
              numberOfLines={1}
            >
              {c.title}
            </Text>
          ))}
        </View>

        <FlatList
          data={rows}
          keyExtractor={keyOf}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            ) : undefined
          }
          onEndReachedThreshold={0.4}
          onEndReached={onEndReached}
          renderItem={({ item, index }) => (
            <Pressable
              disabled={!onRowPress}
              onPress={() => onRowPress?.(item)}
              style={[styles.row, index % 2 === 1 && styles.rowAlt]}
            >
              {columns.map((c) => (
                <View
                  key={c.key}
                  style={[styles.cell, { width: c.width, alignItems: c.align === "right" ? "flex-end" : "flex-start" }]}
                >
                  {c.render ? (
                    c.render(item)
                  ) : (
                    <Text style={styles.cellText} numberOfLines={2}>
                      {c.value ? c.value(item) || "—" : "—"}
                    </Text>
                  )}
                </View>
              ))}
            </Pressable>
          )}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={colors.primary} style={{ margin: 16 }} /> : null
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.empty}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <View style={styles.empty}>{empty}</View>
            )
          }
        />
      </View>
    </ScrollView>
  );
}

export function Badge({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: {
    flexDirection: "row", backgroundColor: colors.surface,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border,
  },
  headCell: {
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 12, fontWeight: "800", color: colors.muted,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border },
  rowAlt: { backgroundColor: "#FBFBFB" },
  cell: { paddingHorizontal: 12, paddingVertical: 12, justifyContent: "center" },
  cellText: { fontSize: 13, color: colors.text },
  empty: { flex: 1, justifyContent: "center", paddingVertical: 60 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "800" },
});

