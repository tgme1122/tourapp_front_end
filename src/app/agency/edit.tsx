import { useEffect, useState } from "react";
import {
  View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { useAgency } from "@/hooks/useAgency";
import { useUpdateAgency } from "@/hooks/useAgencyApi";
import { AgencyUpdateInput } from "@/services/agency";
import { isApiError } from "@/services/api";
import { rawPhone } from "@/services/auth";
import { confirmAction, notify } from "@/utils/confirm";
import { formatPhone, isValidPhone } from "@/utils/validation";
import BackHeader from "@/components/ui/BackHeader";
import FormField from "@/components/ui/FormField";
import PrimaryButton from "@/components/ui/PrimaryButton";

type Form = {
  name: string; description: string; license_number: string; tax_id: string;
  region: string; city: string; address: string; contact_phone: string; website: string;
};
type Errors = Partial<Record<keyof Form, string>>;

const REQUIRED: (keyof Form)[] = ["name", "license_number", "tax_id", "region", "city", "address"];
const SENSITIVE: (keyof Form)[] = ["license_number", "tax_id"];

export default function AgencyEditScreen() {
  const { agency, isOwner, isApproved } = useAgency();
  const update = useUpdateAgency();
  const readOnly = !isOwner;

  const initial: Form = {
    name: agency?.name ?? "",
    description: agency?.description ?? "",
    license_number: agency?.license_number ?? "",
    tax_id: agency?.tax_id ?? "",
    region: agency?.region ?? "",
    city: agency?.city ?? "",
    address: agency?.address ?? "",
    contact_phone: agency?.contact_phone ? formatPhone(agency.contact_phone) : "",
    website: agency?.website ?? "",
  };

  const [form, setForm] = useState<Form>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Agentlik ma'lumoti keyinroq yuklansa, formani to'ldiramiz
  useEffect(() => {
    if (agency) setForm(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agency?.id]);

  const set = (k: keyof Form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const changedKeys = (Object.keys(form) as (keyof Form)[]).filter((k) => {
    if (k === "contact_phone") return rawPhone(form[k]) !== rawPhone(initial[k]);
    return form[k].trim() !== initial[k].trim();
  });

  const save = async () => {
    setFormError(null);
    const next: Errors = {};
    REQUIRED.forEach((k) => {
      if (form[k].trim().length < 2) next[k] = "Kamida 2 ta belgi kiriting";
    });
    const cleanPhone = rawPhone(form.contact_phone);
    if (cleanPhone && cleanPhone !== "+998" && !isValidPhone(form.contact_phone)) {
      next.contact_phone = "Telefon raqamini to'liq kiriting";
    }
    if (form.website.trim() && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+.*$/i.test(form.website.trim())) {
      next.website = "Veb-sayt manzili noto'g'ri";
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || changedKeys.length === 0) return;

    // Rekvizitlar o'zgarsa, tasdiqlangan agentlik qayta tekshiruvga tushadi
    if (isApproved && changedKeys.some((k) => SENSITIVE.includes(k))) {
      const ok = await confirmAction({
        title: "Qayta tekshiruv",
        message:
          "Litsenziya yoki STIR o'zgarsa, agentlik admin tomonidan qayta tekshiriladi va shu vaqtgacha " +
          "tasdiqlanmagan holatga o'tadi. Davom etasizmi?",
        confirmText: "Davom etish",
      });
      if (!ok) return;
    }

    const input: AgencyUpdateInput = {};
    changedKeys.forEach((k) => {
      if (k === "contact_phone") {
        const clean = rawPhone(form.contact_phone);
        input.contact_phone = clean && clean !== "+998" ? clean : null;
        return;
      }
      const v = form[k].trim();
      (input as Record<string, string | null>)[k] =
        (k === "description" || k === "website") && !v ? null : v;
    });

    update.mutate(input, {
      onSuccess: () => {
        notify("Saqlandi", "Agentlik ma'lumotlari yangilandi.");
        router.back();
      },
      onError: (e) => {
        if (isApiError(e) && Object.keys(e.fieldErrors).length) {
          setErrors(e.fieldErrors as Errors);
        } else {
          setFormError(isApiError(e) ? e.message : "Saqlab bo'lmadi. Qayta urinib ko'ring.");
        }
      },
    });
  };

  const field = (
    k: keyof Form, label: string, icon: React.ComponentProps<typeof Ionicons>["name"],
    extra?: Partial<React.ComponentProps<typeof FormField>>
  ) => (
    <FormField
      label={label} icon={icon} value={form[k]} onChangeText={set(k)} error={errors[k]}
      editable={!readOnly} style={readOnly ? { color: colors.muted } : undefined} {...extra}
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <BackHeader title="Agentlik ma'lumotlari" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {readOnly && (
            <View style={styles.info}>
              <Ionicons name="eye-outline" size={18} color={colors.primary} />
              <Text style={styles.infoText}>Ma'lumotlarni faqat agentlik egasi o'zgartira oladi.</Text>
            </View>
          )}

          <Text style={styles.section}>Asosiy</Text>
          {field("name", "Agentlik nomi", "business-outline", { maxLength: 160 })}
          <View style={{ gap: 6 }}>
            <Text style={styles.label}>Tavsif</Text>
            <TextInput
              style={[styles.textArea, readOnly && { color: colors.muted }]}
              value={form.description}
              onChangeText={set("description")}
              editable={!readOnly}
              placeholder="Agentligingiz haqida qisqacha: tajriba, yo'nalishlar, afzalliklar"
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            {!readOnly && <Text style={styles.hint}>{form.description.length}/1000</Text>}
          </View>

          <Text style={styles.section}>Rekvizitlar</Text>
          {field("license_number", "Litsenziya raqami", "ribbon-outline", { autoCapitalize: "characters" })}
          {field("tax_id", "STIR", "card-outline", { keyboardType: "number-pad", maxLength: 20 })}
          {isApproved && !readOnly && (
            <Text style={styles.warn}>
              Litsenziya yoki STIR o'zgarsa, agentlik qayta tekshiruvga yuboriladi.
            </Text>
          )}

          <Text style={styles.section}>Manzil</Text>
          {field("region", "Viloyat", "map-outline")}
          {field("city", "Shahar / tuman", "location-outline")}
          {field("address", "Manzil", "navigate-outline")}

          <Text style={styles.section}>Aloqa</Text>
          {field("contact_phone", "Aloqa telefoni", "call-outline", {
            keyboardType: "phone-pad", placeholder: "+998 90 123 45 67",
            onChangeText: (t: string) => set("contact_phone")(formatPhone(t)),
          })}
          {field("website", "Veb-sayt", "globe-outline", {
            autoCapitalize: "none", keyboardType: "url", placeholder: "https://example.uz",
          })}

          {formError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}
        </ScrollView>

        {!readOnly && (
          <View style={styles.footer}>
            <PrimaryButton
              label="Saqlash" onPress={save} loading={update.isPending} disabled={changedKeys.length === 0}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  section: { fontSize: 15, fontWeight: "800", color: colors.text, marginTop: 8 },
  label: { fontSize: 13, fontWeight: "700", color: colors.text },
  hint: { fontSize: 11, color: colors.muted, textAlign: "right" },
  textArea: {
    minHeight: 110, padding: 16, borderRadius: radius.lg, fontSize: 15, color: colors.text,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, ...shadows.soft,
  },
  warn: { fontSize: 12, color: colors.warning, fontWeight: "600" },
  info: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },
  infoText: { flex: 1, fontSize: 13, color: colors.text },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.danger },
  footer: {
    padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
