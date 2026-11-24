import { ActivityIndicator, View } from "react-native";
import { Tabs } from "expo-router";
import { colors } from "@/constants/theme";
import { useAgency } from "@/hooks/useAgency";
import { useUnreadChats } from "@/hooks/useChatsApi";
import { tabBarOptions, tabIcon } from "@/components/ui/tabs";

export default function AgencyTabs() {
  const { agencyRole, isPending } = useAgency();
  const unreadChats = useUnreadChats().data ?? 0;

  // Rol aniq bo'lguncha kutamiz (menejer owner ekranini bir lahza ham ko'rmasin)
  if (!agencyRole && isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const owner = agencyRole === "owner";
  const ownerOnly = owner ? {} : { href: null as null };
  const managerOnly = owner ? { href: null as null } : {};

  return (
    <Tabs screenOptions={tabBarOptions}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="dashboard"
        options={{ title: "Asosiy", tabBarIcon: tabIcon("stats-chart", "stats-chart-outline"), ...ownerOnly }}
      />
      <Tabs.Screen name="tours" options={{ title: "Turlar", tabBarIcon: tabIcon("map", "map-outline") }} />
      <Tabs.Screen name="bookings" options={{ title: "Bronlar", tabBarIcon: tabIcon("ticket", "ticket-outline") }} />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Xabarlar",
          tabBarIcon: tabIcon("chatbubble-ellipses", "chatbubble-ellipses-outline"),
          tabBarBadge: unreadChats > 0 ? unreadChats : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
          ...managerOnly,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: tabIcon("person", "person-outline") }} />
    </Tabs>
  );
}