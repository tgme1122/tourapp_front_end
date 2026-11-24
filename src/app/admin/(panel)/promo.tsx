import { useState } from "react";
import {
  View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "@/constants/theme";
import { useSendPromo } from "@/hooks/useAdminApi";
import { isApiError } from "@/services/api";
import { confirmAction, notify } from "@/utils/confirm";
import { Tour } from "@/types/tour";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import TourPicker from "@/components/admin/TourPicker";

type Errors = Partial<Record<"title" | "text", string>>;

export default function PromoScreen() {
  const send = useSendPromo();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tour, setTour] = useState<Tour | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    setFormError(null);
    const next: Errors = {};
    if (title.trim().length < 3) next.title = "Sarlavhani kiriting";
    if (text.trim().length < 3) next.text = "Matnni kiriting";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const ok = await confirmAction({
      title: "Hammaga yuborish",
      message: "Bu bildirishnoma barcha foydalanuvchilarga yuboriladi. Qaytarib bo'lmaydi.",
      confirmText: "Yuborish",
    });
    if (!ok) return;

    send.mutate(
      { title: title.trim(), text: text.trim(), tourId: tour?.id },
      {
        onSuccess: ({ sent }) => {
          notify("Yuborildi", `${sent} ta foydalanuvchiga yuborildi.`);
          setTitle("");
          setText("");
          setTour(null);
        },
        onError: (e) => {
          if (isApiError(e)) {
            const fe = e.fieldErrors;
            if (fe.title || fe.text) {
              setErrors({ title: fe.title, text: fe.text });
              return;
            }
            setFormError(e.message);
          } else {
            setFormError("Yuborib bo'lmadi. Qayta urinib ko'ring.");
          }
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.header}>Promo bildirishnoma</Text>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.info}>
            <Ionicons name="megaphone-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Xabar barcha foydalanuvchilarning bildirishnomalar bo'limida chiqadi.
            </Text>
          </View>

          <FormField
            label="Sarlavha" value={title} onChangeText={setTitle} error={errors.title}
            placeholder="Masalan: Kuzgi chegirma" maxLength={80}
          />

          <View style={{ gap: 6 }}>
            <Text style={styles.label}>Matn</Text>
            <TextInput
              style={[styles.textArea, !!errors.text && styles.textAreaError]}
              value={text}
              onChangeText={setText}
              placeholder="Masalan: Tanlangan turlarga 15% gacha chegirma"
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              maxLength={300}
            />
            {errors.text ? <Text style={styles.error}>{errors.text}</Text> : null}
          </View>

          <View style={{ gap: 6 }}>
            <Text style={styles.label}>Tur (ixtiyoriy)</Text>
            {tour ? (
              <View style={styles.tourBox}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.tourTitle} numberOfLines={1}>{tour.title}</Text>
                  <Text style={styles.tourSub} numberOfLines={1}>{tour.city}, {tour.country}</Text>
                </View>
                <Pressable onPress={() => setTour(null)} hitSlop={8}>
                  <Ionicons name="close-circle" size={22} color={colors.muted} />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.pick} onPress={() => setPickerOpen(true)}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.pickText}>Tur biriktirish</Text>
              </Pressable>
            )}
            <Text style={styles.hint}>
              Tur tanlansa, bildirishnoma bosilganda shu tur sahifasi ochiladi.
            </Text>
          </View>

          {formError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          <PrimaryButton label="Hammaga yuborish" onPress={submit} loading={send.isPending} />
        </ScrollView>
      </KeyboardAvoidingView>

      <TourPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={setTour} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: -0.5,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  content: { padding: 16, gap: 18 },
  info: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.text },
  label: { fontSize: 13, fontWeight: "700", color: colors.text },
  textArea: {
    minHeight: 110, padding: 16, borderRadius: radius.lg, fontSize: 15, color: colors.text,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    ...shadows.soft,
  },
  textAreaError: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  error: { fontSize: 12, color: colors.danger },
  pick: {
    flexDirection: "row", alignItems: "center", gap: 8, height: 52, paddingHorizontal: 14,
    borderRadius: 14, borderWidth: 1, borderStyle: "dashed", borderColor: colors.primary,
  },
  pickText: { fontSize: 14, fontWeight: "700", color: colors.primary },
  tourBox: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  tourTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  tourSub: { fontSize: 12, color: colors.muted },
  hint: { fontSize: 12, color: colors.muted },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12,
    backgroundColor: colors.dangerSoft,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.danger },
});