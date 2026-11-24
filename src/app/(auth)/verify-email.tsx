import { useEffect, useState } from "react";
import {
  View, Text, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import { useAuth } from "@/store/auth";
import { isApiError } from "@/services/api";
import AuthHeader from "@/components/auth/AuthHeader";
import CodeInput from "@/components/auth/CodeInput";
import PrimaryButton from "@/components/ui/PrimaryButton";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyEmailScreen() {
  const { email = "", resend } = useLocalSearchParams<{ email?: string; resend?: string }>();
  const verifyEmail = useAuth((s) => s.verifyEmail);
  const resendCode = useAuth((s) => s.resendCode);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  // Kirishdan kelgan bo'lsa (email tasdiqlanmagan), yangi kod so'raymiz
  useEffect(() => {
    if (resend === "1" && email) resendCode(email).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Qayta yuborish uchun sanoq
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const submit = async (value: string) => {
    if (loading || !email) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const result = await verifyEmail(email, value);
      if (result === "verified") {
        Alert.alert("Email tasdiqlandi", "Endi hisobingizga kirishingiz mumkin.", [
          { text: "Kirish", onPress: () => router.replace("/login") },
        ]);
      } else {
        router.replace("/");
      }
    } catch (e) {
      setError(isApiError(e) ? e.message : "Xatolik yuz berdi. Qayta urinib ko'ring.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  // 6 ta raqam yig'ilganda avtomatik yuboriladi
  const onChange = (v: string) => {
    setCode(v);
    setError(null);
    if (v.length === CODE_LENGTH) submit(v);
  };

  const onResend = async () => {
    if (seconds > 0) return;
    setError(null);
    try {
      await resendCode(email);
      setInfo("Yangi kod yuborildi");
      setSeconds(RESEND_SECONDS);
    } catch (e) {
      setError(isApiError(e) ? e.message : "Kodni yuborib bo'lmadi.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <AuthHeader
            title="Emailni tasdiqlang"
            subtitle={`${email || "Email manzilingiz"} ga ${CODE_LENGTH} xonali kod yubordik`}
            onBack={() => router.back()}
          />

          <View style={{ gap: 12, marginTop: 8 }}>
            <CodeInput value={code} onChange={onChange} length={CODE_LENGTH} error={!!error} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {info ? <Text style={styles.info}>{info}</Text> : null}
          </View>

          <PrimaryButton
            label="Tasdiqlash"
            onPress={() => submit(code)}
            loading={loading}
            disabled={code.length < CODE_LENGTH || !email}
          />

          <View style={styles.resendRow}>
            <Text style={styles.muted}>Kod kelmadimi? </Text>
            {seconds > 0 ? (
              <Text style={styles.muted}>Qayta yuborish: {seconds} s</Text>
            ) : (
              <Pressable onPress={onResend} hitSlop={8}>
                <Text style={styles.link}>Qayta yuborish</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 40, gap: 24 },
  error: { fontSize: 13, fontWeight: "600", color: colors.danger },
  info: { fontSize: 13, fontWeight: "600", color: colors.success },
  resendRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  muted: { fontSize: 14, color: colors.muted },
  link: { fontSize: 14, fontWeight: "800", color: colors.primary },
});