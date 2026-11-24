import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { parseServerDate } from "@/utils/format";

const pad = (n: number) => String(n).padStart(2, "0");

export function useCountdown(expiresAt?: string | null) {
  const target = expiresAt ? parseServerDate(expiresAt)?.getTime() : undefined;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!target) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);

  const left = target ? Math.max(0, target - now) : null;
  const text =
    left == null ? "" : `${pad(Math.floor(left / 60000))}:${pad(Math.floor((left % 60000) / 1000))}`;

  return { left, text, expired: left === 0 };
}

export default function HoldTimer({ expiresAt }: { expiresAt?: string | null }) {
  const { text, expired } = useCountdown(expiresAt);
  if (!expiresAt) return null;

  return (
    <View style={[styles.box, expired && { backgroundColor: colors.dangerSoft }]}>
      <Ionicons
        name="timer-outline"
        size={16}
        color={expired ? colors.danger : colors.warning}
      />
      <Text style={[styles.text, expired && { color: colors.danger }]}>
        {expired ? "Band qilish muddati tugadi" : `Joy ${text} gacha band qilingan`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 36,
    borderRadius: 12, backgroundColor: colors.warningSoft,
  },
  text: { fontSize: 13, fontWeight: "700", color: colors.warning },
});