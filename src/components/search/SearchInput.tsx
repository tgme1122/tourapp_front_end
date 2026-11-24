import { View, TextInput, Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, noFocusOutline, radius, shadows } from "@/constants/theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onFilterPress: () => void;
  filterCount: number;
  busy: boolean;
  inputRef?: React.Ref<TextInput>;
};

export default function SearchInput({
  value, onChangeText, onSubmit, onFilterPress, filterCount, busy, inputRef,
}: Props) {
  return (
    <View style={styles.box}>
      <Ionicons name="search" size={20} color={colors.primary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Davlat, shahar yoki sayohat turini qidiring"
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        numberOfLines={1}
        ref={inputRef}
      />
      {busy ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : value.length > 0 ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.muted} />
        </Pressable>
      ) : null}
      <Pressable style={styles.filter} onPress={onFilterPress} hitSlop={4}>
        <Ionicons name="options-outline" size={18} color={colors.white} />
        {filterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{filterCount}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill,
    paddingLeft: 16, paddingRight: 6, height: 54,
    backgroundColor: colors.background, ...shadows.soft,
  },
  input: { flex: 1, fontSize: 14, color: colors.text, ...noFocusOutline },
  filter: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  badge: {
    position: "absolute", top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: colors.primary },
});
