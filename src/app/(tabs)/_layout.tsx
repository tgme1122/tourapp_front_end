import { ColorValue, Platform, View, StyleSheet } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "@/constants/theme";
import { useApp } from "@/store/app";
import { useAuth } from "@/store/auth";
import { useSessionSync } from "@/hooks/useSessionSync";
import { useUnreadChats } from "@/hooks/useChatsApi";
import { useUser } from "@/store/user";
import { homeFor } from "@/utils/roles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const icon = (active: IconName, inactive: IconName) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return (
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Ionicons name={focused ? active : inactive} size={22} color={color} />
      </View>
    );
  };

export default function TabsLayout() {
  useSessionSync();

  const role = useUser((s) => s.user.role);
  const unreadChats = useUnreadChats().data ?? 0;
  const onboardingDone = useApp((s) => s.onboardingDone);
  const token = useAuth((s) => s.token);

  if (!onboardingDone) return <Redirect href="/onboarding" />;
  if (!token) return <Redirect href="/login" />;
  if (role === "agency" || role === "admin") return <Redirect href={homeFor(role)} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginTop: -2 },
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Asosiy",
          tabBarIcon: icon("home", "home-outline"),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Qidiruv",
          tabBarIcon: icon("compass", "compass-outline"),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bronlar",
          tabBarIcon: icon("calendar", "calendar-outline"),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Xabarlar",
          tabBarIcon: icon("chatbubble-ellipses", "chatbubble-ellipses-outline"),
          tabBarBadge: unreadChats > 0 ? unreadChats : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: icon("person", "person-outline"),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === "ios" ? 82 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 22 : 10,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
    ...shadows.card,
  },
  iconWrap: {
    width: 36,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  iconWrapActive: {
    backgroundColor: colors.primarySoft,
  },
});
