import { useEffect, useState } from "react";
import {
  View, Text, TextInput, Pressable, Modal, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, noFocusOutline } from "@/constants/theme";
import PrimaryButton from "@/components/ui/PrimaryButton";

const MIN = 5;
const MAX = 500;

type Props = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  minLength?: number; 
  placeholder?: string;
};

export default function ReasonSheet({
  visible, title, description, confirmLabel, loading,minLength, placeholder, onClose, onSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");

  useEffect(() => {
    if (visible) setText("");
  }, [visible]);

  const valid = text.trim().length >= (minLength ?? MIN);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {!!description && <Text style={styles.desc}>{description}</Text>}

          <View>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={(t) => setText(t.slice(0, MAX))}
              placeholder={placeholder ?? "Sababni yozing (kamida 5 ta belgi)"}
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <Text style={styles.counter}>{text.trim().length}/{MAX}</Text>
          </View>

          <PrimaryButton
            label={confirmLabel}
            onPress={() => onSubmit(text.trim())}
            loading={loading}
            disabled={!valid}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    paddingHorizontal: 16, paddingTop: 10, gap: 14,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background,
  },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  desc: { fontSize: 14, lineHeight: 20, color: colors.muted },
  input: {
    minHeight: 120, padding: 14, borderRadius: 14, fontSize: 15, color: colors.text,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    ...noFocusOutline,
  },
  counter: { alignSelf: "flex-end", marginTop: 4, fontSize: 11, color: colors.muted },
});