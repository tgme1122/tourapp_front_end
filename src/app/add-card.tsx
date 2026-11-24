import { useState } from "react";
import {
  View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { useCards } from "@/store/cards";
import {
  detectBrand, formatCardNumber, formatExpiry, isValidExpiry, luhnValid,
} from "@/utils/validation";
import BackHeader from "@/components/ui/BackHeader";
import FormField from "@/components/ui/FormField";
import { brandStyle } from "@/components/profile/PaymentCardItem";

type Errors = Partial<Record<"number" | "expiry" | "holder", string>>;

export default function AddCardScreen() {
  const add = useCards((s) => s.add);

  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [holder, setHolder] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const brand = detectBrand(number);

  const save = () => {
    const next: Errors = {};
    const digits = number.replace(/\D/g, "");
    if (digits.length !== 16 || !luhnValid(digits)) next.number = "Karta raqami noto'g'ri";
    if (!isValidExpiry(expiry)) next.expiry = "Muddat noto'g'ri yoki tugagan";
    if (holder.trim().length < 3) next.holder = "Karta egasining ismini kiriting";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // To'liq raqam saqlanmaydi, faqat oxirgi 4 raqam
    add({
      brand,
      last4: digits.slice(-4),
      expiry,
      holder: holder.trim().toUpperCase(),
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <BackHeader title="Karta qo'shish" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <FormField
            label="Karta raqami" icon="card-outline" value={number}
            onChangeText={(t) => setNumber(formatCardNumber(t))} error={errors.number}
            placeholder="0000 0000 0000 0000" keyboardType="number-pad" maxLength={19}
            right={
              brand !== "unknown" && brand in brandStyle ? (
                <View style={[styles.brand, { backgroundColor: brandStyle[brand as keyof typeof brandStyle].colors[0] }]}>
                  <Text style={styles.brandText}>{brandStyle[brand as keyof typeof brandStyle].name}</Text>
                </View>
              ) : null
            }
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormField
                label="Amal qilish muddati" icon="calendar-outline" value={expiry}
                onChangeText={(t) => setExpiry(formatExpiry(t))} error={errors.expiry}
                placeholder="MM/YY" keyboardType="number-pad" maxLength={5}
              />
            </View>
          </View>

          <FormField
            label="Karta egasi" icon="person-outline" value={holder}
            onChangeText={(t) => setHolder(t.replace(/[^a-zA-Z\s'.-]/g, ""))}
            error={errors.holder} placeholder="ISM FAMILIYA" autoCapitalize="characters"
            autoCorrect={false}
          />

          <View style={styles.note}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
            <Text style={styles.noteText}>
              Karta raqamining faqat oxirgi 4 raqami saqlanadi. To'liq raqam qurilmada qolmaydi.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.save} onPress={save}>
            <Text style={styles.saveText}>Kartani qo'shish</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16 },
  row: { flexDirection: "row", gap: 12 },
  brand: { paddingHorizontal: 8, height: 22, borderRadius: 6, justifyContent: "center" },
  brandText: { color: colors.white, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  note: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: 12,
    borderRadius: 14, backgroundColor: colors.successSoft,
  },
  noteText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.success, fontWeight: "600" },
  footer: {
    padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  save: {
    height: 54, borderRadius: radius.pill, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", ...shadows.soft,
  },
  saveText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});