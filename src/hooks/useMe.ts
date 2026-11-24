import { useQuery } from "@tanstack/react-query";
import * as authService from "@/services/auth";
import { isWsConnected } from "@/services/ws";
import { useAuth } from "@/store/auth";

// Kutilayotgan agentlik uchun holat WebSocket orqali yangilanadi (zaxira polling 60s)
export function useMe() {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: ["me"],
    queryFn: () => authService.me(),
    enabled: !!token,
    refetchInterval: (query) =>
      !isWsConnected() && query.state.data?.agency_profile?.status === "pending" ? 60000 : false,
  });
}