import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import { AgencyProfile } from "@/types/agency";

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function AgencyInfoCard({ agency }: { agency: AgencyProfile }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Agentlik ma'lumotlari</Text>
      <Info label="Nomi" value={agency.name} />
      <Info label="Litsenziya" value={agency.license_number} />
      <Info label="STIR" value={agency.tax_id} />
      <Info label="Manzil" value={[agency.city, agency.address].filter(Boolean).join(", ")} />
      <Info label="Telefon" value={agency.contact_phone} />
      <Info label="Veb-sayt" value={agency.website} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 16, fontWeight: "800", color: colors.text },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  label: { fontSize: 14, color: colors.muted },
  value: { flex: 1, textAlign: "right", fontSize: 14, fontWeight: "700", color: colors.text },
});