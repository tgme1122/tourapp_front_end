import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { AgencyStatus } from "@/types/agency";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const config: Record<
  AgencyStatus,
  { icon: IconName; color: string; bg: string; title: string; text: string }
> = {
  pending: {
    icon: "hourglass-outline", color: colors.warning, bg: colors.warningSoft,
    title: "Arizangiz ko'rib chiqilmoqda",
    text: "Admin ma'lumotlaringizni tekshirmoqda. Tasdiqlanishi uchun litsenziya, STIR guvohnomasi va ro'yxatga olish hujjatlari yuklangan bo'lishi kerak.",
  },
  approved: {
    icon: "checkmark-circle", color: colors.success, bg: colors.successSoft,
    title: "Agentlik tasdiqlangan",
    text: "Endi tur qo'shishingiz va bronlarni qabul qilishingiz mumkin.",
  },
  rejected: {
    icon: "close-circle", color: colors.danger, bg: colors.dangerSoft,
    title: "Ariza rad etildi",
    text: "Sababni o'qib, ma'lumot va hujjatlarni to'g'rilab qayta yuboring.",
  },
  suspended: {
    icon: "ban", color: colors.danger, bg: colors.dangerSoft,
    title: "Agentlik bloklangan",
    text: "Agentligingiz vaqtincha to'xtatilgan. Batafsil ma'lumot uchun qo'llab-quvvatlashga murojaat qiling.",
  },
};

type Props = { status: AgencyStatus; reason?: string | null };

export default function AgencyStatusCard({ status, reason }: Props) {
  const c = config[status] ?? config.pending;

  return (
    <View style={[styles.card, { backgroundColor: c.bg }]}>
      <View style={[styles.iconBox, { backgroundColor: colors.white }]}>
        <Ionicons name={c.icon} size={26} color={c.color} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[styles.title, { color: c.color }]}>{c.title}</Text>
        <Text style={styles.text}>{c.text}</Text>
        {!!reason && (status === "rejected" || status === "suspended") && (
          <View style={styles.reason}>
            <Text style={styles.reasonLabel}>Sabab</Text>
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: 14, padding: 16, borderRadius: 20 },
  iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "800" },
  text: { fontSize: 13, lineHeight: 19, color: colors.text },
  reason: { marginTop: 8, padding: 10, borderRadius: 12, backgroundColor: colors.white, gap: 2 },
  reasonLabel: { fontSize: 11, fontWeight: "700", color: colors.muted },
  reasonText: { fontSize: 13, color: colors.text },
});

