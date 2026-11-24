import { useEffect, useState } from "react";
import {
  View, Text, Pressable, Modal, ScrollView, TextInput, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, noFocusOutline } from "@/constants/theme";
import { PolicyRule } from "@/services/agencyTours";
import PrimaryButton from "@/components/ui/PrimaryButton";

type DraftRule = { daysBefore: string; refundPercent: string };

type Props = {
  visible: boolean;
  initial: PolicyRule[];
  isDefault: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (rules: PolicyRule[]) => void;
};

export default function PolicySheet({
  visible, initial, isDefault, loading, onClose, onSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<DraftRule[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setRows(
        initial.map((r) => ({
          daysBefore: String(r.daysBefore),
          refundPercent: String(r.refundPercent),
        }))
      );
      setError(null);
    }
  }, [visible, initial]);

  const updateRow = (idx: number, key: keyof DraftRule, value: string) => {
    const clean = value.replace(/\D/g, "");
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: clean } : r)));
  };

  const addRow = () => {
    if (rows.length >= 6) return;
    setRows((prev) => [...prev, { daysBefore: "", refundPercent: "" }]);
  };

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = () => {
    setError(null);
    const parsed: PolicyRule[] = [];
    for (const r of rows) {
      if (r.daysBefore === "" || r.refundPercent === "") {
        setError("Barcha kataklarni to'ldiring.");
        return;
      }
      const days = Number(r.daysBefore);
      const pct = Number(r.refundPercent);
      if (days < 0 || days > 365 || pct < 0 || pct > 100) {
        setError("Kun 0–365, qaytarish foizi 0–100 oralig'ida bo'lishi kerak.");
        return;
      }
      parsed.push({ daysBefore: days, refundPercent: pct });
    }

    const uniqueDays = new Set(parsed.map((r) => r.daysBefore));
    if (uniqueDays.size !== parsed.length) {
      setError("Kunlar takrorlanmasligi kerak.");
      return;
    }

    const ordered = [...parsed].sort((a, b) => b.daysBefore - a.daysBefore);
    for (let i = 1; i < ordered.length; i += 1) {
      if (ordered[i].refundPercent > ordered[i - 1].refundPercent) {
        setError("Jo'nash yaqinlashgan sari qaytariladigan foiz oshmasligi kerak.");
        return;
      }
    }

    onSubmit(ordered);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Bekor qilish shartlari</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Jo'nashgacha necha kun qolganda necha foiz pul qaytarilishini belgilang (ko'pi bilan 6 qoida).
          </Text>

          <ScrollView style={{ maxHeight: 280 }} contentContainerStyle={{ gap: 10 }}>
            {rows.map((r, idx) => (
              <View key={idx} style={styles.ruleRow}>
                <View style={styles.inputBox}>
                  <Text style={styles.smallLabel}>Kamida (kun)</Text>
                  <TextInput
                    style={styles.input}
                    value={r.daysBefore}
                    onChangeText={(v) => updateRow(idx, "daysBefore", v)}
                    placeholder="14"
                    placeholderTextColor={colors.muted}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
                <View style={styles.inputBox}>
                  <Text style={styles.smallLabel}>Qaytarish (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={r.refundPercent}
                    onChangeText={(v) => updateRow(idx, "refundPercent", v)}
                    placeholder="100"
                    placeholderTextColor={colors.muted}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
                <Pressable onPress={() => removeRow(idx)} hitSlop={8} style={styles.delBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </View>
            ))}

            {rows.length < 6 && (
              <Pressable style={styles.addBtn} onPress={addRow}>
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={styles.addText}>Qoida qo'shish</Text>
              </Pressable>
            )}
          </ScrollView>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={{ gap: 8 }}>
            <PrimaryButton label="Saqlash" onPress={submit} loading={loading} />
            {!isDefault && (
              <PrimaryButton
                label="Standart shartlarga qaytarish"
                variant="outline"
                onPress={() => onSubmit([])}
                disabled={loading}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
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
  subtitle: { fontSize: 13, lineHeight: 18, color: colors.muted },
  ruleRow: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 10,
    borderRadius: 14, backgroundColor: colors.surface,
  },
  inputBox: { flex: 1, gap: 4 },
  smallLabel: { fontSize: 11, fontWeight: "700", color: colors.muted },
  input: {
    height: 40, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.background, fontSize: 15, fontWeight: "700",
    color: colors.text, ...noFocusOutline,
  },
  delBtn: { padding: 6, marginTop: 14 },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    height: 44, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.primary,
  },
  addText: { fontSize: 14, fontWeight: "700", color: colors.primary },
  error: { fontSize: 13, fontWeight: "600", color: colors.danger },
});
