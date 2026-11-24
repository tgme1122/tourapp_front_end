import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";
import { homeFor } from "@/utils/roles";

export default function AuthLayout() {
  const token = useAuth((s) => s.token);
  const role = useUser((s) => s.user.role);

  // Kirgan foydalanuvchi o'z rolining bosh sahifasiga o'tadi
  if (token) return <Redirect href={homeFor(role)} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}