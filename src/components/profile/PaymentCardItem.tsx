import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { CardBrand, PaymentCard } from "@/store/cards";

export const brandStyle: Record<CardBrand, { name: string; colors: readonly [string, string] }> = {
  humo: { name: "HUMO", colors: ["#0E9384", "#0A5F57"] },
  uzcard: { name: "UZCARD", colors: ["#2F6FED", "#1B3FA0"] },
  visa: { name: "VISA", colors: ["#2B3AA8", "#141B5C"] },
  mastercard: { name: "MASTERCARD", colors: ["#EB5A2A", "#9C2F12"] },
  unknown: { name: "KARTA", colors: ["#4B5563", "#1F2937"] },
};

type Props = {
  card: PaymentCard;
  isDefault: boolean;
  onMakeDefault: () => void;
  onRemove: () => void;
};

export default function PaymentCardItem({ card, isDefault, onMakeDefault, onRemove }: Props) {
  const b = brandStyle[card.brand];

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={b.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.top}>
          <Text style={styles.brand}>{b.name}</Text>
          {isDefault && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Asosiy</Text>
            </View>
          )}
        </View>

        <Text style={styles.number}>•••• •••• •••• {card.last4}</Text>

        <View style={styles.bottom}>
          <View style={{ flex: 1 }}>
            <Text style={styles.caption}>KARTA EGASI</Text>
            <Text style={styles.value} numberOfLines={1}>{card.holder}</Text>
          </View>
          <View>
            <Text style={styles.caption}>MUDDATI</Text>
            <Text style={styles.value}>{card.expiry}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.actions}>
        {isDefault ? (
          <View style={styles.defaultRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.defaultText}>To'lov uchun asosiy karta</Text>
          </View>
        ) : (
          <Pressable onPress={onMakeDefault} hitSlop={8}>
            <Text style={styles.makeDefault}>Asosiy qilish</Text>
          </Pressable>
        )}

        <Pressable onPress={onRemove} hitSlop={8} style={styles.remove}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={styles.removeText}>O'chirish</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  card: { height: 168, borderRadius: 22, padding: 18, justifyContent: "space-between" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { color: colors.white, fontSize: 16, fontWeight: "800", letterSpacing: 1.5 },
  badge: {
    paddingHorizontal: 10, height: 24, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  number: { color: colors.white, fontSize: 20, fontWeight: "700", letterSpacing: 2 },
  bottom: { flexDirection: "row", alignItems: "flex-end", gap: 16 },
  caption: { color: "rgba(255,255,255,0.7)", fontSize: 10, letterSpacing: 1 },
  value: { color: colors.white, fontSize: 14, fontWeight: "700", marginTop: 2 },
  actions: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  defaultRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  defaultText: { fontSize: 13, fontWeight: "600", color: colors.success },
  makeDefault: { fontSize: 14, fontWeight: "700", color: colors.primary },
  remove: { flexDirection: "row", alignItems: "center", gap: 5 },
  removeText: { fontSize: 13, fontWeight: "600", color: colors.danger },
});