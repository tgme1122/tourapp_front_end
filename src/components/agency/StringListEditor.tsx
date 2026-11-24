import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

type Props = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
};

export default function StringListEditor({ label, items, onChange, placeholder }: Props) {
  const [text, setText] = useState("");

  const add = () => {
    const v = text.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setText("");
  };

  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>

      {items.length > 0 && (
        <View style={styles.chips}>
          {items.map((item) => (
            <Pressable
              key={item}
              style={styles.chip}
              onPress={() => onChange(items.filter((i) => i !== item))}
            >
              <Text style={styles.chipText}>{item}</Text>
              <Ionicons name="close" size={14} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <Pressable style={styles.add} onPress={add}>
          <Ionicons name="add" size={22} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "700", color: colors.text },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 34,
    borderRadius: 17, backgroundColor: colors.primarySoft,
  },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.primary },
  row: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1, height: 48, paddingHorizontal: 14, borderRadius: 14, fontSize: 15, color: colors.text,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  add: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
});