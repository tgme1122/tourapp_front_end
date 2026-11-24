import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, shadows } from "@/constants/theme";
import { useUser, initialsOf } from "@/store/user";

type Props = { unread: number };

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? "Xayrli tun" : h < 12 ? "Xayrli tong" : h < 18 ? "Xayrli kun" : "Xayrli kech";
};

export default function HomeHeader({ unread }: Props) {
  const user = useUser((s) => s.user);

  return (
    <View style={styles.row}>
      <Pressable style={styles.avatar} onPress={() => router.navigate("/profile")}>
        {user.photoUri ? (
          <Image source={{ uri: user.photoUri }} style={styles.photo} />
        ) : (
          <Text style={styles.avatarText}>{initialsOf(user)}</Text>
        )}
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text style={styles.hello}>{greeting()} 👋</Text>
        <Text style={styles.name} numberOfLines={1}>
          {user.firstName ? `Salom, ${user.firstName}` : "Sayohatga tayyormisiz?"}
        </Text>
      </View>

      <Pressable style={styles.bell} onPress={() => router.push("/notifications")}>
        <Ionicons name="notifications-outline" size={22} color={colors.text} />
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24, overflow: "hidden",
    backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center",
  },
  photo: { width: 48, height: 48 },
  avatarText: { color: colors.primary, fontWeight: "800", fontSize: 15 },
  hello: { fontSize: 12, fontWeight: "600", color: colors.muted },
  name: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 1 },
  bell: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: colors.background,
    alignItems: "center", justifyContent: "center", ...shadows.soft,
  },
  badge: {
    position: "absolute", top: 2, right: 2, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 4, borderWidth: 2, borderColor: colors.background,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: "700" },
});
