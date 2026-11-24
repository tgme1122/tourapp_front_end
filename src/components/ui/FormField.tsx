import { View, Text, TextInput, TextInputProps, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, noFocusOutline, radius, shadows } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  icon?: IconName;
  right?: React.ReactNode;
  inputRef?: React.Ref<TextInput>;
};

export default function FormField({ label, error, icon, right, inputRef, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, !!error && styles.boxError]}>
        {icon && <Ionicons name={icon} size={18} color={colors.muted} />}
        <TextInput
          ref={inputRef}
          style={[styles.input, style]}
          placeholderTextColor={colors.muted}
          {...rest}
        />
        {right}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: "700", color: colors.text },
  box: {
    flexDirection: "row", alignItems: "center", gap: 10,
    height: 52, paddingHorizontal: 16, borderRadius: radius.lg,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    ...shadows.soft,
  },
  boxError: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  input: { flex: 1, fontSize: 15, color: colors.text, ...noFocusOutline },
  error: { fontSize: 12, color: colors.danger },
});