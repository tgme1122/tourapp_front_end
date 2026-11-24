import { useState } from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

export default function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 170;

  return (
    <>
      <Text style={styles.text} numberOfLines={expanded || !long ? undefined : 4}>
        {text}
      </Text>
      {long && (
        <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8}>
          <Text style={styles.toggle}>{expanded ? "Kamroq ko'rsatish" : "Ko'proq o'qish"}</Text>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 14, lineHeight: 22, color: colors.text },
  toggle: { marginTop: 8, fontSize: 14, fontWeight: "700", color: colors.primary },
});