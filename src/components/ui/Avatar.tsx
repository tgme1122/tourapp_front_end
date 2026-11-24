import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

type Props = {
  initials?: string;
  uri?: string | null;
  size?: number;
  online?: boolean;
};

export default function Avatar({ initials = "?", uri, size = 48, online }: Props) {
  const half = size / 2;
  const fontSize = size * 0.38;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: half },
        ]}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: size, height: size, borderRadius: half }} />
        ) : (
          <Text style={[styles.text, { fontSize }]}>{initials}</Text>
        )}
      </View>
      {online !== undefined && (
        <View
          style={[
            styles.dot,
            {
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: size * 0.14,
              borderWidth: size * 0.05,
              backgroundColor: online ? colors.success : colors.muted,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    overflow: "hidden",
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontWeight: "800", color: colors.primary },
  dot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    borderColor: colors.background,
  },
});
