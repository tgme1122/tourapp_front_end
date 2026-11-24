import { useEffect, useState } from "react";
import {
  View, Text, Pressable, Modal, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { NewDeparture } from "@/services/agencyTours";
import { dmyToISO, formatDateMask, todayISO } from "@/utils/validation";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";

type Props = {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (d: NewDeparture) => void;
};

export default function DepartureSheet({ visible, loading, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState("");
  const [errors, setErrors] = useState<{ date?: string; seats?: string }>({});

  useEffect(() => {
    if (visible) {
      setDate("");
      setSeats("");
      setErrors({});
    }
  }, [visible]);

  const submit = () => {
    const iso = dmyToISO(date);
    const n = Number(seats);
    const e: typeof errors = {};
    if (!iso || iso < todayISO()) e.date = "Sana kelajakda bo'lishi kerak";
    if (!n || n < 1 || n > 500) e.seats = "Joylar soni 1 dan 500 gacha";
    setErrors(e);
    if (e.date || e.seats || !iso) return;
    onSubmit({ startISO: iso, seatsTotal: n });
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
            <Text style={styles.title}>Jo'nash qo'shish</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <FormField
            label="Boshlanish sanasi" icon="calendar-outline" value={date} error={errors.date}
            placeholder="KK.OO.YYYY" maxLength={10} keyboardType="number-pad"
            onChangeText={(v) => setDate(formatDateMask(v))}
          />
          <FormField
            label="Joylar soni" icon="people-outline" value={seats} error={errors.seats}
            placeholder="20" maxLength={3} keyboardType="number-pad"
            onChangeText={(v) => setSeats(v.replace(/\D/g, ""))}
          />

          <PrimaryButton label="Qo'shish" onPress={submit} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    paddingHorizontal: 16, paddingTop: 10, gap: 14,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background,
  },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
});