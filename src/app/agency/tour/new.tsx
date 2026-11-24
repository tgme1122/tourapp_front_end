import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { colors } from "@/constants/theme";
import { useAgency } from "@/hooks/useAgency";
import { useCreateTour } from "@/hooks/useAgencyToursApi";
import { isApiError } from "@/services/api";
import BackHeader from "@/components/ui/BackHeader";
import TourForm from "@/components/agency/TourForm";

export default function NewTourScreen() {
  const { agencyRole, isManager } = useAgency();
  const create = useCreateTour();
  const [error, setError] = useState<string | null>(null);

  if (agencyRole && !isManager) return <Redirect href="/agency/tours" />;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <BackHeader title="Yangi tur" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.info}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Tur qoralama sifatida yaratiladi. Keyingi sahifada rasm qo'shib, nashr qilasiz.
            </Text>
          </View>

          <TourForm
            withDepartures
            submitLabel="Qoralama sifatida yaratish"
            submitting={create.isPending}
            error={error}
            onSubmit={(input, departures) => {
              setError(null);
              create.mutate(
                { input, departures },
                {
                  onSuccess: (id) =>
                    id
                      ? router.replace({ pathname: "/agency/tour/[id]", params: { id } })
                      : router.replace("/agency/tours"),
                  onError: (e) =>
                    setError(isApiError(e) ? e.message : "Turni yaratib bo'lmadi. Qayta urinib ko'ring."),
                }
              );
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  info: {
    flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, backgroundColor: colors.primarySoft,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.text },
});