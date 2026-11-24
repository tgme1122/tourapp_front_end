import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "@/constants/theme";

type Props = {
  name: string;
  initials: string;
  phone: string;
  email: string;
  role: string;
  photoUri?: string | null;
  onEditPress?: () => void;
  onAvatarPress?: () => void;
};

export default function ProfileHeader({
  name, initials, phone, email, role, photoUri, onEditPress, onAvatarPress,
}: Props) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onAvatarPress}>
        <View style={styles.avatar}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
        <View style={styles.camera}>
          <Ionicons name="camera" size={12} color={colors.white} />
        </View>
      </Pressable>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>

        <View style={styles.line}>
          <Ionicons name="call-outline" size={13} color={colors.muted} />
          <Text style={styles.lineText}>{phone}</Text>
        </View>
        <View style={styles.line}>
          <Ionicons name="mail-outline" size={13} color={colors.muted} />
          <Text style={styles.lineText} numberOfLines={1}>{email}</Text>
        </View>

        <View style={styles.role}>
          <Ionicons name="person" size={11} color={colors.primary} />
          <Text style={styles.roleText}>{role}</Text>
        </View>
      </View>

      <Pressable style={styles.edit} onPress={onEditPress}>
        <Ionicons name="create-outline" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginHorizontal: 16, marginTop: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl,
    backgroundColor: colors.background,
    ...shadows.soft,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, overflow: "hidden",
    backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  photo: { width: 72, height: 72 },
  avatarText: { fontSize: 24, fontWeight: "800", color: colors.primary },
  camera: {
    position: "absolute", right: -2, bottom: -2,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 2, borderColor: colors.background,
    alignItems: "center", justifyContent: "center",
  },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 18, fontWeight: "800", color: colors.text },
  line: { flexDirection: "row", alignItems: "center", gap: 6 },
  lineText: { fontSize: 12, color: colors.muted, flexShrink: 1 },
  role: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center",
    gap: 4, marginTop: 4, paddingHorizontal: 10, height: 24,
    borderRadius: 12, backgroundColor: colors.primarySoft,
  },
  roleText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  edit: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center",
  },
});