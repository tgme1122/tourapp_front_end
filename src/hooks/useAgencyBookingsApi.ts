import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelAgencyBooking, getAgencyBooking, getBookingTravelers, listAgencyBookings,
} from "@/services/agencyBooking";
import { isWsConnected } from "@/services/ws";
import { useAuth } from "@/store/auth";
import { BookingStatus } from "@/types/booking";

const PAGE = 20;
export type BookingFilter = BookingStatus | "all";

export function useAgencyBookings(status: BookingFilter, enabled: boolean) {
  const token = useAuth((s) => s.token);
  return useInfiniteQuery({
    queryKey: ["agency", "bookings", status],
    enabled: !!token && enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listAgencyBookings({
        status: status === "all" ? undefined : status,
        limit: PAGE,
        offset: pageParam,
      }),
    getNextPageParam: (last, all) => (last.length < PAGE ? undefined : all.length * PAGE),
    refetchInterval: () => (isWsConnected() ? false : 60000),
  });
}

export function useAgencyBooking(id: string) {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: ["agency", "booking", id],
    queryFn: () => getAgencyBooking(id),
    enabled: !!token && !!id,
  });
}

export function useBookingTravelers(id: string, enabled: boolean) {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: ["agency", "booking", id, "travelers"],
    queryFn: () => getBookingTravelers(id),
    enabled: !!token && !!id && enabled,
  });
}

export function useBookingMutations() {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["agency", "bookings"] });
    qc.invalidateQueries({ queryKey: ["agency", "booking"] });
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["tours"] }); // bo'sh joylar soni o'zgarishi mumkin
  };

  const cancel = useMutation({
    mutationFn: (v: { id: string; reason?: string }) => cancelAgencyBooking(v.id, v.reason),
    onSuccess: refresh,
  });
  return { cancel };
}
