import { Tabs } from "expo-router";
import { colors } from "@/constants/theme";
import { useAgencyCounts } from "@/hooks/useAdminApi";
import { tabBarOptions, tabIcon } from "@/components/ui/tabs";

export default function AdminTabs() {
  const pending = useAgencyCounts().data?.pending ?? 0;

  return (
    <Tabs screenOptions={tabBarOptions}>
      <Tabs.Screen name="index" options={{ title: "Bosh sahifa", tabBarIcon: tabIcon("grid", "grid-outline") }} />
      <Tabs.Screen
        name="agencies"
        options={{
          title: "Agentliklar",
          tabBarIcon: tabIcon("business", "business-outline"),
          tabBarBadge: pending > 0 ? pending : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      <Tabs.Screen name="users" options={{ title: "Userlar", tabBarIcon: tabIcon("people", "people-outline") }} />
      <Tabs.Screen name="tours" options={{ title: "Turlar", tabBarIcon: tabIcon("map", "map-outline") }} />
      <Tabs.Screen name="promo" options={{ title: "Promo", tabBarIcon: tabIcon("megaphone", "megaphone-outline") }} />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: tabIcon("person", "person-outline") }} />
    </Tabs>
  );
}