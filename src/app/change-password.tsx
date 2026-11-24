import { useState } from "react";
import {
  View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { changePassword } from "@/services/agency";
import { isApiError } from "@/services/api";
import { notify } from "@/utils/confirm";
import { isStrongPassword } from "@/utils/validation";
import PasswordChecklist from "@/components/auth/PasswordChecklist";
import BackHeader from "@/components/ui/BackHeader";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";

type Errors = Partial<Record<"current" | "next" | "confirm", string>>;

export default function ChangePasswordScreen() {
  const [current, setCurrent] = useState("");
  const [nextPass, setNextPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const eye = (
    <Pressable onPress={() => setShow((v) => !v)} hitSlop={8}>
      <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
    </Pressable>
  );

  const onSubmit = async () => {
    setFormError(null);
    const e: Errors = {};
    if (!current) e.current = "Joriy parolni kiriting";
    if (!isStrongPassword(nextPass)) e.next = "Parol talablarga javob bermaydi";
    if (nextPass && nextPass === current) e.next = "Yangi parol joriysidan farq qilsin";
    if (confirm !== nextPass) e.confirm = "Parollar mos kelmadi";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      await changePassword(current, nextPass);
      notify("Saqlandi", "Parolingiz muvaffaqiyatli o'zgartirildi.");
      router.back();
    } catch (err) {
      if (isApiError(err)) {
        const fe = err.fieldErrors;
        if (fe.current_password) setErrors({ current: fe.current_password });
        else if (fe.new_password) setErrors({ next: fe.new_password });
        else setFormError(err.message);
      } else {
        setFormError("Xatolik yuz berdi. Qayta urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <BackHeader title="Parolni o'zgartirish" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <FormField
            label="Joriy parol" icon="lock-closed-outline" value={current}
            onChangeText={setCurrent} error={errors.current}
            placeholder="Joriy parol" secureTextEntry={!show} right={eye}
          />

          <View style={{ gap: 8 }}>
            <FormField
              label="Yangi parol" icon="key-outline" value={nextPass}
              onChangeText={setNextPass} error={errors.next}
              placeholder="Kamida 8 ta belgi" secureTextEntry={!show} right={eye}
            />
            <PasswordChecklist password={nextPass} />
          </View>

          <FormField
            label="Yangi parolni tasdiqlang" icon="shield-checkmark-outline" value={confirm}
            onChangeText={setConfirm} error={errors.confirm}
            placeholder="Yangi parolni qayta kiriting" secureTextEntry={!show}
          />

          {formError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Saqlash" onPress={onSubmit} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16 },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: 12,
    borderRadius: radius.md, backgroundColor: colors.dangerSoft,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.danger },
  footer: {
    padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
