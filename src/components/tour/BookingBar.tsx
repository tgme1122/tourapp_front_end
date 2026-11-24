import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "@/constants/theme";
import { formatPrice } from "@/utils/format";

type Props = {
  price: number;
  oldPrice?: number;
  disabled?: boolean;
  onPress: () => void;
  onChat?: () => void;
  chatLoading?: boolean;
};

export default function BookingBar({
  price,
  oldPrice,
  disabled,
  onPress,
  onChat,
  chatLoading,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {onChat && (
        <Pressable
          style={styles.chatButton}
          onPress={onChat}
          disabled={chatLoading}
          hitSlop={4}
        >
          {chatLoading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.text} />
              <Text style={styles.chatText}>Xabar</Text>
            </>
          )}
        </Pressable>
      )}

      <Pressable
        style={[styles.bookButton, disabled && { opacity: 0.5 }]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={styles.bookContent}>
          <Text style={styles.bookText}>Bron qilish</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    backgroundColor: colors.background,
    ...shadows.card,
  },
  chatButton: {
    height: 54,
    paddingHorizontal: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  chatText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  bookButton: {
    flex: 1,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  bookContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bookText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
});
