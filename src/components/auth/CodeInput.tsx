import { useRef } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

type Props = { value: string; onChange: (v: string) => void; length?: number; error?: boolean };

export default function CodeInput({ value, onChange, length = 6, error }: Props) {
  const ref = useRef<TextInput>(null);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable onPress={() => ref.current?.focus()}>
      <View style={styles.row}>
        {Array.from({ length }, (_, i) => (
          <View
            key={i}
            style={[styles.box, i === activeIndex && styles.boxActive, error && styles.boxError]}
          >
            <Text style={styles.char}>{value[i] ?? ""}</Text>
          </View>
        ))}
      </View>

      {/* Ko'rinmas haqiqiy kiritish maydoni */}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
        caretHidden
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        style={styles.hidden}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, justifyContent: "space-between" },
  box: {
    flex: 1, height: 58, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
  },
  boxActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  boxError: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  char: { fontSize: 24, fontWeight: "800", color: colors.text },
  hidden: { ...StyleSheet.absoluteFill, opacity: 0 },
});