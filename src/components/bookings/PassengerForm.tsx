import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import { formatDateMask } from "@/utils/validation";
import FormField from "@/components/ui/FormField";

export type TravelerForm = {
  type: "adult" | "child";
  age?: number;
  firstName: string;
  lastName: string;
  series: string;
  number: string;
  expiry: string; // DD.MM.YYYY
  birth: string; // DD.MM.YYYY
};

export type TravelerErrors = Partial<
  Record<"firstName" | "lastName" | "passport" | "expiry" | "birth", string>
>;

type Props = {
  index: number;
  traveler: TravelerForm;
  errors?: TravelerErrors;
  onChange: (patch: Partial<TravelerForm>) => void;
};

const latin = (t: string) => t.replace(/[^a-zA-Z\s'-]/g, "");

export default function PassengerForm({ index, traveler: t, errors = {}, onChange }: Props) {
  const title =
    t.type === "adult"
      ? `${index + 1}-sayohatchi (katta)`
      : `${index + 1}-sayohatchi (bola, ${t.age} yosh)`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>Ma'lumotlar pasportdagidek, lotin harflarida kiritilsin</Text>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <FormField
            label="Ism" value={t.firstName} error={errors.firstName}
            onChangeText={(v) => onChange({ firstName: latin(v) })}
            autoCapitalize="characters" autoCorrect={false}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FormField
            label="Familiya" value={t.lastName} error={errors.lastName}
            onChangeText={(v) => onChange({ lastName: latin(v) })}
            autoCapitalize="characters" autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ width: 96 }}>
          <FormField
            label="Seriya" value={t.series} placeholder="AA" maxLength={2}
            onChangeText={(v) => onChange({ series: v.replace(/[^a-zA-Z]/g, "").toUpperCase() })}
            autoCapitalize="characters" autoCorrect={false}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FormField
            label="Pasport raqami" value={t.number} placeholder="1234567" maxLength={7}
            error={errors.passport}
            onChangeText={(v) => onChange({ number: v.replace(/\D/g, "") })}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <FormField
            label="Amal qilish muddati" value={t.expiry} placeholder="KK.OO.YYYY" maxLength={10}
            error={errors.expiry}
            onChangeText={(v) => onChange({ expiry: formatDateMask(v) })}
            keyboardType="number-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <FormField
            label="Tug'ilgan sana" value={t.birth} placeholder="KK.OO.YYYY" maxLength={10}
            error={errors.birth}
            onChangeText={(v) => onChange({ birth: formatDateMask(v) })}
            keyboardType="number-pad"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14, gap: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  title: { fontSize: 16, fontWeight: "800", color: colors.text },
  hint: { fontSize: 12, color: colors.muted, marginTop: -6 },
  row: { flexDirection: "row", gap: 12 },
});