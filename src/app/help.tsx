import { useState } from "react";
import { View, Text, ScrollView, Pressable, Linking, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "@/constants/theme";
import { useUser } from "@/store/user";
import BackHeader from "@/components/ui/BackHeader";

const SUPPORT_PHONE = "+998932177749";
const SUPPORT_TELEGRAM = "https://t.me/sayohat_support";
const SUPPORT_EMAIL = "shoh234tm234@gmail.com";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const contacts: { icon: IconName; label: string; url: string }[] = [
  { icon: "call-outline", label: "Qo'ng'iroq", url: `tel:${SUPPORT_PHONE}` },
  { icon: "paper-plane-outline", label: "Telegram", url: SUPPORT_TELEGRAM },
  { icon: "mail-outline", label: "Email", url: `mailto:${SUPPORT_EMAIL}` },
];

const faq = [
  {
    q: "Bronni qanday bekor qilaman?",
    a: "Bronlar bo'limida \"Kutilmoqda\" holatidagi bronni bekor qilish mumkin. Tasdiqlangan bronlar uchun agentlik bilan chat orqali bog'laning.",
  },
  {
    q: "To'lov qachon va qanday amalga oshiriladi?",
    a: "Bron yuborilgach agentlik uni tasdiqlaydi. To'lov tasdiqlangandan keyin amalga oshiriladi.",
  },
  {
    q: "Agentlik bilan qanday bog'lanaman?",
    a: "Tur sahifasidagi agentlik kartasida \"Yozish\" tugmasini bosing yoki Xabarlar bo'limiga o'ting.",
  },
  {
    q: "Narx tushishi haqida qanday xabar olaman?",
    a: "Profil bo'limida \"Narx tushishi\" bildirishnomasini yoqing. Saqlangan turlar narxi tushganda xabar keladi.",
  },
  {
    q: "Hisobimni qanday o'chiraman?",
    a: "Profil bo'limining pastida \"Hisobni o'chirish\" tugmasi bor. U hisob ma'lumotlaringizni o'chiradi.",
  },
];

export default function HelpScreen() {
  const role = useUser((s) => s.user.role);
  const isTraveler = role === "traveler";
  const [open, setOpen] = useState<number | null>(0);

  const call = (url: string) =>
    Linking.openURL(url).catch(() =>
      Alert.alert("Ochilmadi", "Bu amalni qurilmangizda bajarib bo'lmadi.")
    );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader title={isTraveler ? "Yordam markazi" : "Admin bilan bog'lanish"} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!isTraveler && (
          <View style={styles.adminNote}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
            <Text style={styles.adminNoteText}>
              Ilovada xatolik, texnik muammo yoki tasdiqlash bo'yicha savol yuzaga kelsa, quyidagi
              kontaktlar orqali adminga xabar bering.
            </Text>
          </View>
        )}

        <Text style={styles.heading}>Tez bog'lanish</Text>
        <View style={styles.contacts}>
          {contacts.map((c) => (
            <Pressable key={c.label} style={styles.contact} onPress={() => call(c.url)}>
              <View style={styles.iconBox}>
                <Ionicons name={c.icon} size={22} color={colors.primary} />
              </View>
              <Text style={styles.contactText}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        {isTraveler ? (
          <>
            <Text style={[styles.heading, { marginTop: 24 }]}>Ko'p so'raladigan savollar</Text>
            <View style={styles.faq}>
              {faq.map((item, i) => {
                const isOpen = open === i;
                return (
                  <Pressable
                    key={item.q}
                    style={[styles.faqItem, i < faq.length - 1 && styles.divider]}
                    onPress={() => setOpen(isOpen ? null : i)}
                  >
                    <View style={styles.faqHead}>
                      <Text style={styles.q}>{item.q}</Text>
                      <Ionicons
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={colors.muted}
                      />
                    </View>
                    {isOpen && <Text style={styles.a}>{item.a}</Text>}
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.contactCard}>
            <Pressable style={[styles.detailRow, styles.divider]} onPress={() => call(`tel:${SUPPORT_PHONE}`)}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text style={styles.detailLabel}>Telefon</Text>
              <Text style={styles.detailValue}>{SUPPORT_PHONE}</Text>
            </Pressable>
            <Pressable style={[styles.detailRow, styles.divider]} onPress={() => call(SUPPORT_TELEGRAM)}>
              <Ionicons name="paper-plane-outline" size={18} color={colors.primary} />
              <Text style={styles.detailLabel}>Telegram</Text>
              <Text style={styles.detailValue}>@sayohat_support</Text>
            </Pressable>
            <Pressable style={styles.detailRow} onPress={() => call(`mailto:${SUPPORT_EMAIL}`)}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{SUPPORT_EMAIL}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 12 },
  contacts: { flexDirection: "row", gap: 10 },
  contact: {
    flex: 1, height: 96, borderRadius: radius.xl, gap: 8,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
    alignItems: "center", justifyContent: "center",
    ...shadows.soft,
  },
  iconBox: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center",
  },
  contactText: { fontSize: 13, fontWeight: "700", color: colors.text },
  faq: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: "hidden",
    backgroundColor: colors.background,
    ...shadows.soft,
  },
  faqItem: { padding: 16, gap: 10 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  faqHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  q: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.text },
  a: { fontSize: 14, lineHeight: 21, color: colors.muted },
  adminNote: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 20,
    borderRadius: radius.xl, backgroundColor: colors.primarySoft,
  },
  adminNoteText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.text },
  contactCard: {
    marginTop: 20, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl,
    backgroundColor: colors.background, overflow: "hidden", ...shadows.soft,
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16 },
  detailLabel: { fontSize: 14, fontWeight: "600", color: colors.muted },
  detailValue: { flex: 1, textAlign: "right", fontSize: 14, fontWeight: "700", color: colors.text },
});