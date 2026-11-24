import { useMemo, useState } from "react";
import {
  View, Text, TextInput, FlatList, Pressable, Modal, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { useTours } from "@/hooks/useToursApi";
import { Tour } from "@/types/tour";

type Props = { visible: boolean; onClose: () => void; onSelect: (tour: Tour) => void };

export default function TourPicker({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const { data, isPending, isError } = useTours();
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = data ?? [];
    return q
      ? all.filter((t) => `${t.title} ${t.city} ${t.agency}`.toLowerCase().includes(q))
      : all;
  }, [data, query]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Turni tanlang</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.search}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Tur yoki agentlik nomi"
              placeholderTextColor={colors.muted}
            />
          </View>

          {isPending ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 32 }} />
          ) : isError ? (
            <Text style={styles.empty}>Turlarni yuklab bo'lmadi</Text>
          ) : (
            <FlatList
              data={list}
              keyExtractor={(t) => t.id}
              style={{ maxHeight: 380 }}
              ListEmptyComponent={<Text style={styles.empty}>Tur topilmadi</Text>}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.rowSub} numberOfLines={1}>
                      {item.city}, {item.country} · {item.agency}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    paddingHorizontal: 16, paddingTop: 10, gap: 12,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background,
  },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  search: {
    flexDirection: "row", alignItems: "center", gap: 8, height: 46, paddingHorizontal: 14,
    borderRadius: 14, backgroundColor: colors.surface,
  },
  input: { flex: 1, fontSize: 14, color: colors.text },
  row: {
    flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  rowSub: { fontSize: 12, color: colors.muted },
  empty: { textAlign: "center", color: colors.muted, paddingVertical: 28 },
});