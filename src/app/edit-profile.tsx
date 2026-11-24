import { useState } from "react";
import {
  View, Text, Image, ScrollView, Pressable, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import { useAvatarActions } from "@/hooks/useAvatarActions";
import { useUser, initialsOf } from "@/store/user";
import { toProfile } from "@/services/auth";
import { updateMe } from "@/services/users";
import { isApiError } from "@/services/api";
import { queryClient } from "@/services/queryClient";
import { formatPhone, isValidPhone } from "@/utils/validation";
import BackHeader from "@/components/ui/BackHeader";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import AvatarSheet from "@/components/ui/AvatarSheet";

type Errors = Partial<Record<"firstName" | "lastName" | "phone", string>>;

export default function EditProfileScreen() {
  const user = useUser((s) => s.user);
  const setUser = useUser((s) => s.setUser);
  const update = useUser((s) => s.update);
  const avatar = useAvatarActions();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const changed =
    firstName.trim() !== user.firstName ||
    lastName.trim() !== user.lastName ||
    phone !== user.phone;

  const save = async () => {
    setFormError(null);

    const next: Errors = {};
    if (firstName.trim().length < 2) next.firstName = "Ismingizni kiriting";
    if (lastName.trim().length < 2) next.lastName = "Familiyangizni kiriting";
    if (!isValidPhone(phone)) next.phone = "Telefon raqamini to'liq kiriting";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const input = { firstName: firstName.trim(), lastName: lastName.trim(), phone };
      const updated = await updateMe(input);

      if (updated && typeof updated === "object" && "email" in updated) {
        setUser(toProfile(updated)); // server qaytargan haqiqiy ma'lumot
      } else {
        update(input);
      }
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.back();
    } catch (e) {
      if (isApiError(e)) {
        const fe = e.fieldErrors;
        const m: Errors = {};
        if (fe.first_name) m.firstName = fe.first_name;
        if (fe.last_name) m.lastName = fe.last_name;
        if (fe.phone) m.phone = fe.phone;

        if (Object.keys(m).length > 0) setErrors(m);
        else if (/telefon|phone/i.test(e.message)) setErrors({ phone: e.message });
        else setFormError(e.message);
      } else {
        setFormError("Xatolik yuz berdi. Qayta urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <BackHeader title="Profilni tahrirlash" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <Pressable style={styles.avatarWrap} onPress={avatar.openMenu}>
            <View style={styles.avatar}>
              {user.photoUri ? (
                <Image source={{ uri: user.photoUri }} style={styles.photo} />
              ) : (
                <Text style={styles.avatarText}>{initialsOf(user)}</Text>
              )}
            </View>
            <View style={styles.camera}>
              <Ionicons name="camera" size={16} color={colors.white} />
            </View>
          </Pressable>
          <Text style={styles.changePhoto}>Rasmni o'zgartirish</Text>

          <View style={styles.form}>
            <FormField
              label="Ism" icon="person-outline" value={firstName}
              onChangeText={setFirstName} error={errors.firstName}
              placeholder="Ismingiz" autoCapitalize="words"
            />
            <FormField
              label="Familiya" icon="person-outline" value={lastName}
              onChangeText={setLastName} error={errors.lastName}
              placeholder="Familiyangiz" autoCapitalize="words"
            />
            <FormField
              label="Telefon" icon="call-outline" value={phone}
              onChangeText={(t) => setPhone(formatPhone(t))} error={errors.phone}
              placeholder="+998 90 123 45 67" keyboardType="phone-pad"
            />

            <View style={{ gap: 6 }}>
              <FormField
                label="Email" icon="mail-outline" value={user.email}
                editable={false} style={{ color: colors.muted }}
              />
              <Text style={styles.hint}>Email manzilini o'zgartirib bo'lmaydi</Text>
            </View>

            {formError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Saqlash" onPress={save} loading={loading} disabled={!changed} />
        </View>
      </KeyboardAvoidingView>
      <AvatarSheet {...avatar.sheetProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, alignItems: "center" },
  avatarWrap: { marginTop: 8 },
  avatar: {
    width: 104, height: 104, borderRadius: 52, overflow: "hidden",
    backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center",
  },
  photo: { width: 104, height: 104 },
  avatarText: { fontSize: 34, fontWeight: "800", color: colors.primary },
  camera: {
    position: "absolute", right: 0, bottom: 0,
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary,
    borderWidth: 3, borderColor: colors.background,
    alignItems: "center", justifyContent: "center",
  },
  changePhoto: { marginTop: 10, fontSize: 14, fontWeight: "700", color: colors.primary },
  form: { alignSelf: "stretch", gap: 16, marginTop: 24 },
  hint: { fontSize: 12, color: colors.muted },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: 12,
    borderRadius: 12, backgroundColor: colors.dangerSoft,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.danger },
  footer: {
    padding: 16, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});