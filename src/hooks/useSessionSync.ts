import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import * as authService from "@/services/auth";
import { useMe } from "@/hooks/useMe";
import { getSavedTours, savedKey } from "@/services/tours";
import { useAuth } from "@/store/auth";
import { useFavorites } from "@/store/favorites";
import { useUser } from "@/store/user";

export function useSessionSync() {
  const token = useAuth((s) => s.token);
  const role = useUser((s) => s.user.role);

  const { data } = useMe();

  const saved = useQuery({
    queryKey: savedKey,
    queryFn: getSavedTours,
    enabled: !!token && role === "traveler",
  });

  useEffect(() => {
    if (data) useUser.getState().setUser(authService.toProfile(data));
  }, [data]);

  useEffect(() => {
    if (saved.data) useFavorites.getState().setIds(saved.data.map((t) => t.id));
  }, [saved.data]);
}