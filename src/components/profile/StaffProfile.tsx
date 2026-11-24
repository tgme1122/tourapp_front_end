import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { useAuth } from "@/store/auth";
import { fullName, initialsOf, useUser } from "@/store/user";
import { confirmAction } from "@/utils/confirm";

type Props = { roleLabel: string; title?: string; children?: React.ReactNode };

export default function StaffProfile({ roleLabel, title, children }: Props) {
  const user = useUser((s) => s.user);
  const signOut = useAuth((s) => s.signOut);

  const logout = async () => {
    const ok = await confirmAction({
      title: "Chiqish",
      message: "Hisobingizdan chiqmoqchimisiz?",
      confirmText: "Chiqish",
      destructive: true,
    });
    if (!ok) return;
    signOut();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.header}>Profil</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialsOf(user)}</Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.name} numberOfLines={1}>{title ?? fullName(user)}</Text>
            <Text style={styles.muted} numberOfLines={1}>{fullName(user)}</Text>
            <Text style={styles.muted} numberOfLines={1}>{user.email}</Text>
            {!!user.phone && <Text style={styles.muted}>{user.phone}</Text>}
            <View style={styles.role}>
              <Text style={styles.roleText}>{roleLabel}</Text>
            </View>
          </View>
        </View>

        {children}

        <View style={styles.bottom}>
          <Pressable style={styles.logout} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={colors.primary} />
            <Text style={styles.logoutText}>Chiqish</Text>
          </Pressable>
          <Text style={styles.version}>Versiya {Constants.expoConfig?.version ?? "1.0.0"}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: -0.5,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl,
    backgroundColor: colors.background, ...shadows.soft,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "800", color: colors.primary },
  name: { fontSize: 18, fontWeight: "800", color: colors.text },
  muted: { fontSize: 13, color: colors.muted },
  role: {
    alignSelf: "flex-start", marginTop: 4, paddingHorizontal: 10, height: 24, borderRadius: 12,
    backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center",
  },
  roleText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  bottom: { marginTop: 8, gap: 14, alignItems: "center" },
  logout: {
    alignSelf: "stretch", flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 52, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: colors.primary },
  version: { fontSize: 12, color: colors.muted },
});