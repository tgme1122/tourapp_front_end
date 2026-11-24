import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

type Props = { title: string; children: React.ReactNode };

export default function DetailSection({ title, children }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 26, paddingHorizontal: 16 },
  title: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 12 },
});