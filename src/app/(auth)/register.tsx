import { useRef, useState } from "react";
import {
  View, Text, Pressable, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import { useAuth } from "@/store/auth";
import { isApiError } from "@/services/api";
import { formatPhone, isStrongPassword, isValidEmail, isValidPhone } from "@/utils/validation";
import AuthHeader from "@/components/auth/AuthHeader";
import PasswordChecklist from "@/components/auth/PasswordChecklist";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";

type Field = "firstName" | "lastName" | "phone" | "email" | "password" | "confirm" | "terms";
type Errors = Partial<Record<Field, string>>;

export default function RegisterScreen() {
  const signUp = useAuth((s) => s.signUp);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const onSubmit = async () => {
    setFormError(null);

    const next: Errors = {};
    if (firstName.trim().length < 2) next.firstName = "Ismingizni kiriting";
    if (lastName.trim().length < 2) next.lastName = "Familiyangizni kiriting";
    if (!isValidPhone(phone)) next.phone = "Telefon raqamini to'liq kiriting";
    if (!isValidEmail(email)) next.email = "Email manzili noto'g'ri";
    if (!isStrongPassword(password)) next.password = "Parol talablarga javob bermaydi";
    if (confirm !== password) next.confirm = "Parollar mos kelmadi";
    if (!terms) next.terms = "Davom etish uchun rozilik bering";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

        setLoading(true);
    try {
      await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone,
        password,
      });
      router.replace("/");
    } catch (e) {
      if (isApiError(e)) {
        const fe = e.fieldErrors;
        const next: Errors = {};
        if (fe.email) next.email = fe.email;
        if (fe.phone) next.phone = fe.phone;
        if (fe.password) next.password = fe.password;
        if (fe.first_name) next.firstName = fe.first_name;
        if (fe.last_name) next.lastName = fe.last_name;

        if (Object.keys(next).length > 0) setErrors(next);
        else if (/email/i.test(e.message)) setErrors({ email: e.message });
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <AuthHeader
            title="Hisob yarating"
            subtitle="Sayohatni boshlash uchun ma'lumotlaringizni kiriting"
            onBack={() => router.back()}
          />

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Ism" value={firstName} onChangeText={setFirstName}
                  error={errors.firstName} placeholder="Ismingiz"
                  autoCapitalize="words" autoComplete="given-name" returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Familiya" inputRef={lastNameRef} value={lastName}
                  onChangeText={setLastName} error={errors.lastName} placeholder="Familiyangiz"
                  autoCapitalize="words" autoComplete="family-name" returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              </View>
            </View>

            <FormField
              label="Telefon" icon="call-outline" inputRef={phoneRef} value={phone}
              onChangeText={(t) => setPhone(formatPhone(t))} error={errors.phone}
              placeholder="+998 90 123 45 67" keyboardType="phone-pad"
              autoComplete="tel" returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            <FormField
              label="Email" icon="mail-outline" inputRef={emailRef} value={email}
              onChangeText={setEmail} error={errors.email} placeholder="email@misol.uz"
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              autoComplete="email" returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <View style={{ gap: 10 }}>
              <FormField
                label="Parol" icon="lock-closed-outline" inputRef={passwordRef}
                value={password} onChangeText={setPassword} error={errors.password}
                placeholder="Parol o'ylab toping" secureTextEntry={!showPassword}
                autoCapitalize="none" autoCorrect={false} autoComplete="new-password"
                returnKeyType="next" onSubmitEditing={() => confirmRef.current?.focus()}
                right={
                  <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.muted}
                    />
                  </Pressable>
                }
              />
              <PasswordChecklist password={password} />
            </View>

            <FormField
              label="Parolni takrorlang" icon="lock-closed-outline" inputRef={confirmRef}
              value={confirm} onChangeText={setConfirm} error={errors.confirm}
              placeholder="Parolni qayta kiriting" secureTextEntry={!showPassword}
              autoCapitalize="none" autoCorrect={false} returnKeyType="done"
            />

            <View style={{ gap: 6 }}>
              <Pressable style={styles.terms} onPress={() => setTerms((v) => !v)}>
                <View style={[styles.checkbox, terms && styles.checkboxOn]}>
                  {terms && <Ionicons name="checkmark" size={16} color={colors.white} />}
                </View>
                <Text style={styles.termsText}>
                  Foydalanish shartlari va Maxfiylik siyosatiga roziman
                </Text>
              </Pressable>
              {errors.terms ? <Text style={styles.error}>{errors.terms}</Text> : null}
            </View>

            {formError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            <PrimaryButton label="Ro'yxatdan o'tish" onPress={onSubmit} loading={loading} />
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.muted}>Hisobingiz bormi? </Text>
            <Pressable onPress={() => router.replace("/login")} hitSlop={8}>
              <Text style={styles.link}>Kirish</Text>
            </Pressable>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.muted}>Tur agentligimisiz? </Text>
            <Pressable onPress={() => router.push("/register-agency")} hitSlop={8}>
              <Text style={styles.link}>Agentlik ochish</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 40, gap: 20 },
  form: { gap: 16, marginTop: 4 },
  row: { flexDirection: "row", gap: 12 },
  terms: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: {
    width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.background, alignItems: "center", justifyContent: "center",
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.text },
  error: { fontSize: 12, color: colors.danger },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: 12,
    borderRadius: 12, backgroundColor: colors.dangerSoft,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.danger },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  muted: { fontSize: 14, color: colors.muted },
  link: { fontSize: 14, fontWeight: "800", color: colors.primary },
});