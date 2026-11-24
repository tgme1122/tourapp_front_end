import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBookingOptions, getQuote, payBooking, QuoteInput, submitBooking, SubmitInput,
} from "@/services/bookingFlow";
import { useAuth } from "@/store/auth";

export function useBookingOptions(tourId: string, departureId?: string) {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: ["booking-options", tourId, departureId],
    queryFn: () => getBookingOptions(tourId, departureId!),
    enabled: !!token && !!tourId && !!departureId,
    staleTime: 60000,
    retry: false,
  });
}

// Tanlov o'zgarganda narx qayta hisoblanadi (oldingi narx ko'rinib turadi)
export function useQuote(tourId: string, input: QuoteInput | null) {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: ["quote", tourId, input],
    queryFn: () => getQuote(tourId, input!),
    enabled: !!token && !!input,
    placeholderData: keepPreviousData,
    staleTime: 30000,
    retry: false,
  });
}

export function useSubmitBooking(tourId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { input: SubmitInput; key: string }) => submitBooking(tourId, v.input, v.key),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["tours"] }); // joylar soni o'zgardi
    },
  });
}

export const usePayBooking = () =>
  useMutation({
    mutationFn: (v: { bookingId: string; provider: string }) => payBooking(v.bookingId, v.provider),
  });