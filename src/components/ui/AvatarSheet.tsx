import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";

type Props = {
  visible: boolean;
  hasPhoto: boolean;
  onPick: () => void;
  onRemove: () => void;
  onClose: () => void;
};

export default function AvatarSheet({ visible, hasPhoto, onPick, onRemove, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Profil rasmi</Text>

          <Pressable style={styles.row} onPress={onPick}>
            <View style={styles.iconBox}>
              <Ionicons name="image-outline" size={22} color={colors.primary} />
            </View>
            <Text style={styles.label}>Galereyadan tanlash</Text>
          </Pressable>

          {hasPhoto && (
            <Pressable style={styles.row} onPress={onRemove}>
              <View style={[styles.iconBox, { backgroundColor: colors.dangerSoft }]}>
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
              </View>
              <Text style={[styles.label, { color: colors.danger }]}>Rasmni o'chirish</Text>
            </Pressable>
          )}

          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Bekor qilish</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    paddingHorizontal: 16, paddingTop: 10, gap: 8,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background,
  },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border },
  title: { fontSize: 18, fontWeight: "800", color: colors.text, marginVertical: 10 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 14, height: 58,
    paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.surface,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  label: { fontSize: 16, fontWeight: "700", color: colors.text },
  cancel: { height: 54, alignItems: "center", justifyContent: "center", marginTop: 4 },
  cancelText: { fontSize: 16, fontWeight: "700", color: colors.muted },
});