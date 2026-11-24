import { ScrollView, Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { formatDateRange } from "@/utils/format";
import { Departure } from "@/types/tourDetails";

type Props = {
  departures: Departure[];
  days: number;
  selectedId?: string;
  onSelect: (id: string) => void;
};

export default function DeparturePicker({ departures, days, selectedId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {departures.map((d) => {
        const soldOut = d.seatsLeft === 0;
        const active = d.id === selectedId;
        return (
          <Pressable
            key={d.id}
            disabled={soldOut}
            onPress={() => onSelect(d.id)}
            style={[styles.card, active && styles.cardActive, soldOut && styles.cardOff]}
          >
            <View style={styles.top}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={active ? colors.primary : colors.muted}
              />
              {active && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
            </View>
            <Text style={styles.date}>{formatDateRange(d.startISO, days)}</Text>
            <Text
              style={[
                styles.seats,
                soldOut && { color: colors.danger },
                !soldOut && d.seatsLeft <= 5 && { color: colors.warning },
              ]}
            >
              {soldOut ? "Joy qolmagan" : `Qolgan joy: ${d.seatsLeft}`}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 10 },
  card: {
    minWidth: 138, padding: 12, gap: 4, borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background,
  },
  cardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  cardOff: { opacity: 0.55 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: 15, fontWeight: "800", color: colors.text },
  seats: { fontSize: 12, fontWeight: "600", color: colors.success },
});