import { ColorValue, Platform, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export const tabIcon = (active: IconName, inactive: IconName) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return (
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Ionicons name={focused ? active : inactive} size={22} color={color} />
      </View>
    );
  };

export const tabBarOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.muted,
  tabBarLabelStyle: { fontSize: 11, fontWeight: "700" as const, marginTop: -2 },
  tabBarStyle: {
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
};

const styles = StyleSheet.create({
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