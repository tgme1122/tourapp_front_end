import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors } from "@/constants/theme";
import { useAvatarActions } from "@/hooks/useAvatarActions";
import { useUser, fullName, initialsOf } from "@/store/user";
import { useSettings, languageLabels } from "@/store/settings";
import { useFavorites } from "@/store/favorites";
import { useCards } from "@/store/cards";
import ScreenHeader from "@/components/ui/ScreenHeader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SettingsSection from "@/components/profile/SettingsSection";
import SettingsRow from "@/components/profile/SettingsRow";
import { useApp } from "@/store/app";
import { useAuth } from "@/store/auth";
import { confirmAction, notify } from "./../../utils/confirm";
import { deleteMe } from "@/services/users";
import { isApiError } from "@/services/api";
import { useBookingsList } from "@/hooks/useBookingsApi";
import { useMyReviews } from "@/hooks/useReviewsApi";
import AvatarSheet from "@/components/ui/AvatarSheet";

export default function ProfileScreen() {
  const signOut = useAuth((s) => s.signOut);
  const user = useUser((s) => s.user);
  const { push, priceDrop, agencyMessages, language, update } = useSettings();
  const { data: bookingList } = useBookingsList();
  const bookingsCount = bookingList?.length ?? 0;
  const savedCount = useFavorites((s) => s.ids.length);

  const reviewsCount = useMyReviews().data?.length ?? 0;
  const cardsCount = useCards((s) => s.cards.length);

  const avatar = useAvatarActions();

      const handleLogout = async () => {
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

  const handleDelete = async () => {
    const ok = await confirmAction({
      title: "Hisobni o'chirish",
      message: "Hisobingiz va unga bog'liq ma'lumotlar o'chiriladi. Bu amalni qaytarib bo'lmaydi.",
      confirmText: "O'chirish",
      destructive: true,
    });
    if (!ok) return;

    try {
      await deleteMe();
      signOut();
      router.replace("/login");
    } catch (e) {
      notify(
        "Hisobni o'chirib bo'lmadi",
        isApiError(e) ? e.message : "Qayta urinib ko'ring."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Profil" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <ProfileHeader
            name={fullName(user)}
            initials={initialsOf(user)}
            phone={user.phone}
            email={user.email}
            role={user.role === "agency" ? "Agentlik" : "Sayohatchi"}
            photoUri={user.photoUri}
            onEditPress={() => router.push("/edit-profile")}
            onAvatarPress={avatar.openMenu}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <SettingsSection title="Sayohatlarim">
            <SettingsRow
              icon="heart-outline" label="Saqlangan turlar" value={savedCount}
              onPress={() => router.push("/saved")}
            />
            <SettingsRow
              icon="ticket-outline" label="Bronlar tarixi" value={bookingsCount}
              onPress={() => router.push("/bookings")}
            />
            <SettingsRow
              icon="chatbox-ellipses-outline" label="Mening sharhlarim" value={reviewsCount}
              onPress={() => router.push("/my-reviews")} last
            />
          </SettingsSection>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <SettingsSection title="Bildirishnomalar">
            <SettingsRow
              icon="notifications-outline" label="Push xabarlar"
              switchValue={push} onSwitchChange={(v) => update({ push: v })}
            />
            <SettingsRow
              icon="trending-down" label="Narx tushishi"
              switchValue={priceDrop} onSwitchChange={(v) => update({ priceDrop: v })}
            />
            <SettingsRow
              icon="chatbubble-outline" label="Agentlik xabarlari"
              switchValue={agencyMessages} onSwitchChange={(v) => update({ agencyMessages: v })} last
            />
          </SettingsSection>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <SettingsSection title="Sozlamalar">
            <SettingsRow
              icon="card-outline" label="To'lov usullari" value={cardsCount}
              onPress={() => router.push("/payment-methods")}
            />
            <SettingsRow
              icon="language-outline" label="Til" value={languageLabels[language]}
              onPress={() => router.push("/language")}
            />
            <SettingsRow
              icon="help-circle-outline" label="Yordam markazi"
              onPress={() => router.push("/help")} last
            />
          </SettingsSection>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.bottom}>
          <Pressable style={styles.logout} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.primary} />
            <Text style={styles.logoutText}>Chiqish</Text>
          </Pressable>

          <Pressable style={styles.delete} onPress={handleDelete} hitSlop={8}>
            <Text style={styles.deleteText}>Hisobni o'chirish</Text>
          </Pressable>

                    <Pressable
            onLongPress={
              __DEV__
                ? () => {
                    useApp.getState().resetOnboarding();
                    router.replace("/onboarding");
                  }
                : undefined
            }
          >
            <Text style={styles.version}>
              Versiya {Constants.expoConfig?.version ?? "1.0.0"}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
      <AvatarSheet {...avatar.sheetProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  bottom: { paddingHorizontal: 16, marginTop: 24, gap: 14, alignItems: "center" },
  logout: {
    alignSelf: "stretch",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    height: 52, borderRadius: 999,
    borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primarySoft,
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: colors.primary },
  delete: { paddingVertical: 4 },
  deleteText: { fontSize: 14, fontWeight: "600", color: colors.danger },
  version: { fontSize: 12, color: colors.muted },
});