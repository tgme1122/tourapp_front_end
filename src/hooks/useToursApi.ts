import { useQuery } from "@tanstack/react-query";
import {
  countriesKey, getSavedTours, getTour, getTourCountries, listTours, savedKey, tourKey, toursKey,
} from "@/services/tours";
import { useAuth } from "@/store/auth";

export function useTours() {
  const token = useAuth((s) => s.token);
  return useQuery({ queryKey: toursKey, queryFn: listTours, enabled: !!token, staleTime: 60000 });
}

export function useTourCountries() {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: countriesKey,
    queryFn: getTourCountries,
    enabled: !!token,
    staleTime: 300000,
  });
}

export function useTour(id: string) {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: tourKey(id),
    queryFn: () => getTour(id),
    enabled: !!token && !!id,
  });
}

export function useSavedTours() {
  const token = useAuth((s) => s.token);
  return useQuery({ queryKey: savedKey, queryFn: getSavedTours, enabled: !!token });
}