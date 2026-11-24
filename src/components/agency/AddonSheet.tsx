import { useEffect, useState } from "react";
import {
  View, Text, Pressable, Modal, Switch, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { AddonInput } from "@/services/agencyTours";
import { formatPrice } from "@/utils/format";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";

type Props = {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: AddonInput) => void;
};

export default function AddonSheet({ visible, loading, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [perPerson, setPerPerson] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  useEffect(() => {
    if (visible) {
      setName("");
      setDescription("");
      setPrice("");
      setPerPerson(true);
      setErrors({});
    }
  }, [visible]);

  const submit = () => {
    const cleanName = name.trim();
    const n = Number(price);
    const e: typeof errors = {};
    if (cleanName.length < 2) e.name = "Nom kamida 2 ta belgi bo'lishi kerak";
    if (!n || n <= 0) e.price = "Musbat narx kiriting";
    setErrors(e);
    if (e.name || e.price) return;

    onSubmit({
      name: cleanName,
      description: description.trim() || undefined,
      price: n,
      perPerson,
      isActive: true,
    });
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
            <Text style={styles.title}>Qo'shimcha xizmat</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <FormField
            label="Xizmat nomi"
            icon="sparkles-outline"
            value={name}
            error={errors.name}
            placeholder="Masalan: VIP transfer"
            maxLength={120}
            onChangeText={setName}
          />
          <FormField
            label="Tavsif (ixtiyoriy)"
            icon="document-text-outline"
            value={description}
            placeholder="Aeroportdan mehmonxonagacha"
            maxLength={300}
            onChangeText={setDescription}
          />
          <View style={{ gap: 4 }}>
            <FormField
              label="Narxi (so'm)"
              icon="cash-outline"
              value={price}
              error={errors.price}
              placeholder="250000"
              keyboardType="number-pad"
              onChangeText={(v) => setPrice(v.replace(/\D/g, ""))}
            />
            {!!price && <Text style={styles.hint}>{formatPrice(Number(price))}</Text>}
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Har bir sayohatchi uchun</Text>
              <Text style={styles.hint}>
                {perPerson ? "Mehmonlar soniga ko'paytiriladi" : "Butun bron uchun bir marta"}
              </Text>
            </View>
            <Switch
              value={perPerson}
              onValueChange={setPerPerson}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

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
  hint: { fontSize: 12, color: colors.muted },
  switchRow: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 12,
    borderRadius: 14, backgroundColor: colors.surface,
  },
  switchTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
});
