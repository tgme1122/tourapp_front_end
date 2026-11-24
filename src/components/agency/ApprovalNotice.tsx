import { Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import { useAgency } from "@/hooks/useAgency";
import AgencyStatusCard from "@/components/agency/AgencyStatusCard";

export default function ApprovalNotice() {
  const { agency, isOwner, refetch, isRefetching } = useAgency();
  if (!agency) return null;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <AgencyStatusCard status={agency.status} reason={agency.rejection_reason} />
      <Text style={styles.text}>
        {isOwner
          ? "Agentlik tasdiqlanmaguncha bu bo'lim ishlamaydi. Holatni yangilash uchun pastga tortib qo'yib yuboring."
          : "Agentlik tasdiqlanmaguncha bu bo'lim ishlamaydi. Agentlik egasi bilan bog'laning."}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  text: { fontSize: 13, lineHeight: 19, color: colors.muted, textAlign: "center" },
});