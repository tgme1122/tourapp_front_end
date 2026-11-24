import { useState } from "react";
import {
  View, Text, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import { useAgency } from "@/hooks/useAgency";
import { useManagedTour, useUpdateTour } from "@/hooks/useAgencyToursApi";
import { isApiError } from "@/services/api";
import { toTourInput } from "@/services/agencyTours";
import BackHeader from "@/components/ui/BackHeader";
import EmptyState from "@/components/ui/EmptyState";
import TourForm from "@/components/agency/TourForm";

export default function EditTourScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const { agencyRole, isManager } = useAgency();
  const { data: tour, isPending, isError, error, refetch } = useManagedTour(id);
  const update = useUpdateTour(id);
  const [formError, setFormError] = useState<string | null>(null);

  if (agencyRole && !isManager) return <Redirect href="/agency/tours" />;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <BackHeader title="Turni tahrirlash" />

      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError || !tour ? (
        <View style={styles.center}>
          <EmptyState
            icon="cloud-offline-outline"
            title="Yuklab bo'lmadi"
            text={isApiError(error) ? error.message : "Tur topilmadi."}
            actionLabel="Qayta urinish"
            onAction={() => refetch()}
          />
        </View>
      ) : (
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
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                Narxni kamaytirsangiz, turni saqlagan foydalanuvchilarga avtomatik xabar boradi.
                Jo'nash va rasmlarni tur sahifasida boshqarasiz.
              </Text>
            </View>

            <TourForm
              initial={toTourInput(tour)}
              submitLabel="Saqlash"
              submitting={update.isPending}
              error={formError}
              onSubmit={(input) => {
                setFormError(null);
                update.mutate(input, {
                  onSuccess: () => router.back(),
                  onError: (e) =>
                    setFormError(isApiError(e) ? e.message : "Saqlab bo'lmadi. Qayta urinib ko'ring."),
                });
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center" },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  info: {
    flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, backgroundColor: colors.primarySoft,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.text },
});