import { useRef, useState } from "react";
import {
  View, Text, Pressable, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { useAuth } from "@/store/auth";
import { isApiError } from "@/services/api";
import { formatPhone, isStrongPassword, isValidEmail, isValidPhone } from "@/utils/validation";
import AuthHeader from "@/components/auth/AuthHeader";
import PasswordChecklist from "@/components/auth/PasswordChecklist";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";

type Field =
  | "firstName"
  | "lastName"
  | "phone"
  | "email"
  | "password"
  | "confirm"
  | "agencyName"
  | "licenseNumber"
  | "taxId"
  | "region"
  | "city"
  | "address"
  | "contactPhone"
  | "terms";

type Errors = Partial<Record<Field, string>>;

export default function RegisterAgencyScreen() {
  const signUpAgency = useAuth((s) => s.signUpAgency);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [agencyName, setAgencyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("+998 ");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

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
    const cleanContact = contactPhone.replace(/[^\d+]/g, "");
    const hasContact = cleanContact.length > 4;

    const next: Errors = {};
    if (firstName.trim().length < 2) next.firstName = "Ismingizni kiriting";
    if (lastName.trim().length < 2) next.lastName = "Familiyangizni kiriting";
    if (!isValidPhone(phone)) next.phone = "Telefon raqamini to'liq kiriting";
    if (!isValidEmail(email)) next.email = "Email manzili noto'g'ri";
    if (!isStrongPassword(password)) next.password = "Parol talablarga javob bermaydi";
    if (confirm !== password) next.confirm = "Parollar mos kelmadi";

    if (agencyName.trim().length < 2) next.agencyName = "Agentlik nomini kiriting";
    if (!licenseNumber.trim()) next.licenseNumber = "Litsenziya raqamini kiriting";
    if (!taxId.trim()) next.taxId = "STIR (INN) raqamini kiriting";
    if (!region.trim()) next.region = "Viloyatni kiriting";
    if (!city.trim()) next.city = "Shaharni kiriting";
    if (!address.trim()) next.address = "Manzilni kiriting";
    if (hasContact && !isValidPhone(contactPhone)) {
      next.contactPhone = "Aloqa telefon raqami noto'g'ri";
    }
    if (!terms) next.terms = "Davom etish uchun rozilik bering";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const cleanEmail = email.trim().toLowerCase();
    setLoading(true);
    try {
      await signUpAgency({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        phone,
        password,
        agencyName: agencyName.trim(),
        licenseNumber: licenseNumber.trim(),
        taxId: taxId.trim(),
        region: region.trim(),
        city: city.trim(),
        address: address.trim(),
        contactPhone: hasContact ? contactPhone : undefined,
        website: website.trim() || undefined,
        description: description.trim() || undefined,
      });
      router.replace({ pathname: "/verify-email", params: { email: cleanEmail } });
    } catch (e) {
      if (isApiError(e)) {
        const fe = e.fieldErrors;
        const m: Errors = {};
        if (fe.email) m.email = fe.email;
        if (fe.phone) m.phone = fe.phone;
        if (fe.password) m.password = fe.password;
        if (fe.first_name) m.firstName = fe.first_name;
        if (fe.last_name) m.lastName = fe.last_name;
        if (fe.agency_name) m.agencyName = fe.agency_name;
        if (fe.license_number) m.licenseNumber = fe.license_number;
        if (fe.tax_id) m.taxId = fe.tax_id;
        if (fe.region) m.region = fe.region;
        if (fe.city) m.city = fe.city;
        if (fe.address) m.address = fe.address;
        if (fe.contact_phone) m.contactPhone = fe.contact_phone;

        if (Object.keys(m).length > 0) setErrors(m);
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
            title="Agentlik hisobi"
            subtitle="Tur agentligingizni ro'yxatdan o'tkazing. Email tasdiqlangach, admin ko'rib chiqadi."
            onBack={() => router.back()}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rahbar ma'lumotlari</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Ism" value={firstName} onChangeText={setFirstName}
                  error={errors.firstName} placeholder="Ism"
                  autoCapitalize="words" returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Familiya" inputRef={lastNameRef} value={lastName}
                  onChangeText={setLastName} error={errors.lastName} placeholder="Familiya"
                  autoCapitalize="words" returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              </View>
            </View>

            <FormField
              label="Telefon" icon="call-outline" inputRef={phoneRef} value={phone}
              onChangeText={(t) => setPhone(formatPhone(t))} error={errors.phone}
              placeholder="+998 90 123 45 67" keyboardType="phone-pad"
              returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()}
            />

            <FormField
              label="Email" icon="mail-outline" inputRef={emailRef} value={email}
              onChangeText={setEmail} error={errors.email} placeholder="agency@misol.uz"
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <View style={{ gap: 10 }}>
              <FormField
                label="Parol" icon="lock-closed-outline" inputRef={passwordRef}
                value={password} onChangeText={setPassword} error={errors.password}
                placeholder="Parol o'ylab toping" secureTextEntry={!showPassword}
                autoCapitalize="none" autoCorrect={false}
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
              autoCapitalize="none" autoCorrect={false}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agentlik ma'lumotlari</Text>
            <FormField
              label="Agentlik nomi" icon="business-outline"
              value={agencyName} onChangeText={setAgencyName}
              error={errors.agencyName} placeholder="Masalan: Ipak Yo'li Travel"
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Litsenziya №" value={licenseNumber} onChangeText={setLicenseNumber}
                  error={errors.licenseNumber} placeholder="T-012345"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="STIR (INN)" value={taxId} onChangeText={setTaxId}
                  error={errors.taxId} placeholder="300123456" keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Viloyat / Hudud" value={region} onChangeText={setRegion}
                  error={errors.region} placeholder="Toshkent sh."
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Shahar / Tuman" value={city} onChangeText={setCity}
                  error={errors.city} placeholder="Toshkent"
                />
              </View>
            </View>

            <FormField
              label="Manzil" icon="location-outline"
              value={address} onChangeText={setAddress}
              error={errors.address} placeholder="Ko'cha, uy raqami"
            />
            <FormField
              label="Aloqa telefoni (ixtiyoriy)" icon="call-outline"
              value={contactPhone} onChangeText={(t) => setContactPhone(formatPhone(t))}
              error={errors.contactPhone} placeholder="+998 71 200 00 00" keyboardType="phone-pad"
            />
            <FormField
              label="Veb-sayt (ixtiyoriy)" icon="globe-outline"
              value={website} onChangeText={setWebsite}
              placeholder="https://sayohat.uz" autoCapitalize="none" autoCorrect={false}
            />
            <FormField
              label="Qisqacha tavsif (ixtiyoriy)" icon="document-text-outline"
              value={description} onChangeText={setDescription}
              placeholder="Agentligingiz faoliyati haqida" multiline
            />
          </View>

          <View style={{ gap: 6 }}>
            <Pressable style={styles.terms} onPress={() => setTerms((v) => !v)}>
              <View style={[styles.checkbox, terms && styles.checkboxOn]}>
                {terms && <Ionicons name="checkmark" size={16} color={colors.white} />}
              </View>
              <Text style={styles.termsText}>
                Hamkorlik shartlari va Maxfiylik siyosatiga roziman
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

          <PrimaryButton label="Ariza yuborish" onPress={onSubmit} loading={loading} />

          <View style={styles.loginRow}>
            <Text style={styles.muted}>Allaqachon ro'yxatdan o'tganmisiz? </Text>
            <Pressable onPress={() => router.replace("/login")} hitSlop={8}>
              <Text style={styles.link}>Kirish</Text>
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
  section: { gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
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
    borderRadius: radius.md, backgroundColor: colors.dangerSoft,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.danger },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  muted: { fontSize: 14, color: colors.muted },
  link: { fontSize: 14, fontWeight: "800", color: colors.primary },
});
