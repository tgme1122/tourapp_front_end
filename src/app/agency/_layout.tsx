import { Redirect, Stack } from "expo-router";
import { useSessionSync } from "@/hooks/useSessionSync";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";
import { homeFor } from "@/utils/roles";

export default function AgencyLayout() {
  useSessionSync();
  const token = useAuth((s) => s.token);
  const role = useUser((s) => s.user.role);

  if (!token) return <Redirect href="/login" />;
  if (role !== "agency") return <Redirect href={homeFor(role)} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}