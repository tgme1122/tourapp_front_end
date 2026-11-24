import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

const GRADIENT = ["#E8663F", colors.primary] as const;

type Props = { size?: number; withText?: boolean };

export default function Logo({ size = 44, withText = false }: Props) {
  return (
    <View style={styles.row}>
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.box, { width: size, height: size, borderRadius: size * 0.3 }]}
      >
        <Ionicons name="airplane" size={size * 0.55} color={colors.white} />
      </LinearGradient>

      {withText && (
        <Text style={[styles.text, { fontSize: size * 0.5 }]}>Sayohat</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  box: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  text: { fontWeight: "800", color: colors.text, letterSpacing: -0.3 },
});