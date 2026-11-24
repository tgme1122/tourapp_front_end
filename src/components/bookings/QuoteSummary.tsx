import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, radius, shadows } from "@/constants/theme";
import { Quote } from "@/services/bookingFlow";
import { formatPrice } from "@/utils/format";

type Props = { quote?: Quote; loading?: boolean; error?: string | null };

export default function QuoteSummary({ quote, loading, error }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Narx hisobi</Text>

      {error && !quote ? (
        <Text style={styles.error}>{error}</Text>
      ) : !quote ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          {quote.lines.map((l, i) => (
            <View key={`${l.label}-${i}`} style={styles.row}>
              <Text style={styles.label}>{l.label}</Text>
              <Text style={styles.value}>{formatPrice(l.amount)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Jami</Text>
            <View style={styles.totalWrap}>
              {loading && <ActivityIndicator size="small" color={colors.primary} />}
              <Text style={styles.total}>{formatPrice(quote.total)}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: 16, gap: 10, borderRadius: radius.xl,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    ...shadows.soft,
  },
  title: { fontSize: 15, fontWeight: "800", color: colors.text },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  label: { flex: 1, fontSize: 14, color: colors.muted },
  value: { fontSize: 14, fontWeight: "700", color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
  totalLabel: { fontSize: 15, fontWeight: "700", color: colors.text },
  totalWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  total: { fontSize: 22, fontWeight: "800", color: colors.primary },
  error: { fontSize: 13, color: colors.danger },
});