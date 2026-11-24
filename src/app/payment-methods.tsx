import { View, Text, FlatList, Pressable, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { useCards, PaymentCard } from "@/store/cards";
import BackHeader from "@/components/ui/BackHeader";
import EmptyState from "@/components/ui/EmptyState";
import PaymentCardItem from "@/components/profile/PaymentCardItem";

export default function PaymentMethodsScreen() {
  const cards = useCards((s) => s.cards);
  const defaultId = useCards((s) => s.defaultId);
  const setDefault = useCards((s) => s.setDefault);
  const remove = useCards((s) => s.remove);

  const confirmRemove = (card: PaymentCard) => {
    Alert.alert("Kartani o'chirish", `•••• ${card.last4} kartasi o'chiriladi.`, [
      { text: "Bekor qilish", style: "cancel" },
      { text: "O'chirish", style: "destructive", onPress: () => remove(card.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <BackHeader title="To'lov usullari" />

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: 16, gap: 22 }}
        renderItem={({ item }) => (
          <PaymentCardItem
            card={item}
            isDefault={item.id === defaultId}
            onMakeDefault={() => setDefault(item.id)}
            onRemove={() => confirmRemove(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <EmptyState
              icon="card-outline"
              title="Karta qo'shilmagan"
              text="To'lovni tezroq amalga oshirish uchun kartangizni qo'shing."
            />
          </View>
        }
        ListFooterComponent={
          cards.length > 0 ? (
            <View style={styles.note}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
              <Text style={styles.noteText}>
                Ilovada kartaning faqat oxirgi 4 raqami saqlanadi.
              </Text>
            </View>
          ) : null
        }
      />

      <View style={styles.footer}>
        <Pressable style={styles.add} onPress={() => router.push("/add-card")}>
          <Ionicons name="add" size={22} color={colors.white} />
          <Text style={styles.addText}>Karta qo'shish</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  empty: { flex: 1, justifyContent: "center", paddingBottom: 60 },
  note: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: 12,
    borderRadius: 14, backgroundColor: colors.successSoft,
  },
  noteText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.success, fontWeight: "600" },
  footer: {
    padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  add: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    height: 54, borderRadius: radius.pill, backgroundColor: colors.primary,
    ...shadows.soft,
  },
  addText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});