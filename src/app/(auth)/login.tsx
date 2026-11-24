import { useRef, useState } from "react";
import {
  View, Text, Pressable, ScrollView, TextInput, Alert,
  KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import { useAuth } from "@/store/auth";
import { isApiError } from "@/services/api";
import { parseIdentifier } from "@/utils/validation";
import AuthHeader from "@/components/auth/AuthHeader";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";

const DEMO = [
  { label: "Sayohatchi 1", id: "traveler1@sayohatapp.uz", pass: "Seed12345" },
  { label: "Sayohatchi 2", id: "traveler2@sayohatapp.uz", pass: "Seed12345" },
];

export default function LoginScreen() {
  const signIn = useAuth((s) => s.signIn);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const fillDemo = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setErrors({});
    setFormError(null);
  };

  const onSubmit = async () => {
    setFormError(null);
    const parsed = parseIdentifier(identifier);

    const next: typeof errors = {};
    if (!parsed) next.identifier = "Email yoki telefon raqamini to'g'ri kiriting";
    if (!password) next.password = "Parolni kiriting";
    setErrors(next);
    if (!parsed || !password) return;

    setLoading(true);
    try {
      await signIn(parsed.value, password);
      router.replace("/");
        } catch (e) {
      if (
        isApiError(e) && e.status === 403 &&
        /tasdiq|verif/i.test(e.message) && parsed.type === "email"
      ) {
        // Email tasdiqlanmagan: tasdiqlash ekraniga o'tamiz va yangi kod so'raymiz
        router.push({
          pathname: "/verify-email",
          params: { email: parsed.value, resend: "1" },
        });
      } else {
        setFormError(isApiError(e) ? e.message : "Xatolik yuz berdi. Qayta urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = () => {
    Alert.alert(
      "Tez orada",
      "Google orqali kirish server ulangandan keyin qo'shiladi. Hozircha email yoki telefon bilan kiring."
    );
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
            title="Xush kelibsiz"
            subtitle="Hisobingizga kirib, sayohatlaringizni davom ettiring"
          />

          <View style={styles.form}>
            <FormField
              label="Email yoki telefon"
              icon="person-outline"
              value={identifier}
              onChangeText={setIdentifier}
              error={errors.identifier}
              placeholder="aziz@sayohat.uz yoki +998 90 ..."
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <FormField
              label="Parol"
              icon="lock-closed-outline"
              inputRef={passwordRef}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              returnKeyType="go"
              onSubmitEditing={onSubmit}
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

            {formError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            <PrimaryButton label="Kirish" onPress={onSubmit} loading={loading} />
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>yoki</Text>
            <View style={styles.line} />
          </View>

          <PrimaryButton
            label="Google bilan kirish"
            variant="outline"
            icon="logo-google"
            onPress={onGoogle}
          />

          <View style={styles.registerRow}>
            <Text style={styles.muted}>Hisobingiz yo'qmi? </Text>
            <Pressable onPress={() => router.push("/register")} hitSlop={8}>
              <Text style={styles.link}>Ro'yxatdan o'tish</Text>
            </Pressable>
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.muted}>Hamkor bo'lmoqchimisiz? </Text>
            <Pressable onPress={() => router.push("/register-agency")} hitSlop={8}>
              <Text style={styles.link}>Agentlik sifatida ochish</Text>
            </Pressable>
          </View>

          {__DEV__ && (
            <View style={styles.demo}>
              <View style={styles.demoHead}>
                <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.demoTitle}>Demo hisob bilan sinab ko'rish</Text>
              </View>
              {DEMO.map((d) => (
                <Pressable key={d.label} onPress={() => fillDemo(d.id, d.pass)}>
                  <Text style={styles.demoText}>
                    {d.label}: {d.id} · {d.pass}
                  </Text>
                </Pressable>
              ))}
              <Text style={styles.demoHint}>Qatorni bossangiz, maydonlar to'ladi</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 40, gap: 20 },
  form: { gap: 16, marginTop: 8 },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: 12,
    borderRadius: 12, backgroundColor: colors.dangerSoft,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.danger },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 13, color: colors.muted },
  registerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  muted: { fontSize: 14, color: colors.muted },
  link: { fontSize: 14, fontWeight: "800", color: colors.primary },
  demo: {
    gap: 6, padding: 14, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  demoHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  demoTitle: { fontSize: 13, fontWeight: "800", color: colors.text },
  demoText: { fontSize: 12, color: colors.muted, paddingVertical: 3 },
  demoHint: { fontSize: 11, color: colors.muted, marginTop: 2 },
});