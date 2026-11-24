import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelBooking, listBookings,getBooking } from "@/services/bookings";
import { isWsConnected } from "@/services/ws";
import { useAuth } from "@/store/auth";
import { Booking } from "@/types/booking";

export const bookingsKey = ["bookings"] as const;

export function useBookingsList() {
  const token = useAuth((s) => s.token);
  return useQuery({ queryKey: bookingsKey, queryFn: listBookings, enabled: !!token });
}

// Bekor qilish: ekran darrov yangilanadi, xato bo'lsa orqaga qaytadi
export function useCancelBooking() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: bookingsKey });
      const previous = qc.getQueryData<Booking[]>(bookingsKey);
      qc.setQueryData<Booking[]>(bookingsKey, (old) =>
        old?.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b))
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(bookingsKey, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: bookingsKey });
      
    },
  });
}

// Bitta bron; to'lov sahifasida har 3 soniyada holatni tekshiradi
export function useBooking(id: string, poll = false) {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id),
    enabled: !!token && !!id,
    refetchInterval: (query) =>
      !isWsConnected() && poll && query.state.data?.status === "pending_payment" ? 3000 : false,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: getBooking,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingsKey });
      qc.invalidateQueries({ queryKey: ["tours"] }); // bo'sh joylar soni o'zgardi
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}