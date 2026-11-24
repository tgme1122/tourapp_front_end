import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { initialsFrom } from "@/services/mappers";
import { formatDate, parseServerDate } from "@/utils/format";
import { AdminAgency } from "@/types/agency";
import AgencyStatusBadge from "./AgencyStatusBadge";

type Props = { agency: AdminAgency; onPress: () => void };

export default function AgencyRow({ agency, onPress }: Props) {
  const created = parseServerDate(agency.created_at);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.surface }]}
    >
      {agency.logo_url ? (
        <Image source={{ uri: agency.logo_url }} style={styles.logo} />
      ) : (
        <View style={[styles.logo, styles.logoFallback]}>
          <Text style={styles.initials}>{initialsFrom(agency.name)}</Text>
        </View>
      )}

      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.name} numberOfLines={1}>{agency.name}</Text>
        <Text style={styles.muted} numberOfLines={1}>
          {[agency.owner_name, agency.city].filter(Boolean).join(" · ")}
        </Text>
        <Text style={styles.muted} numberOfLines={1}>
          STIR {agency.tax_id}{created ? ` · ${formatDate(created)}` : ""}
        </Text>
        <View style={styles.badges}>
          <AgencyStatusBadge status={agency.status} />
          {!agency.email_verified && (
            <View style={styles.warn}>
              <Ionicons name="mail-unread-outline" size={12} color={colors.danger} />
              <Text style={styles.warnText}>Email tasdiqlanmagan</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 12, marginHorizontal: 16,
    borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
  },
  logo: { width: 54, height: 54, borderRadius: 16, backgroundColor: colors.surface },
  logoFallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  initials: { fontSize: 18, fontWeight: "800", color: colors.primary },
  name: { fontSize: 16, fontWeight: "800", color: colors.text },
  muted: { fontSize: 12, color: colors.muted },
  badges: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 2 },
  warn: {
    flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, height: 24,
    borderRadius: 12, backgroundColor: colors.dangerSoft,
  },
  warnText: { fontSize: 11, fontWeight: "700", color: colors.danger },
});