import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDeparture, AddonInput, archiveTour, createTour, createTourAddon, deleteDeparture,
  deleteTourAddon, deleteTourImage, getManagedTour, getTourPolicy, listMyTours, listTourAddons,
  NewDeparture, PolicyRule, setTourPolicy, setTourStatus, TourInput, TourStatus, updateTour,
  updateTourAddon, uploadTourImages,
} from "@/services/agencyTours";
import { PickedFile } from "@/services/upload";
import { useAuth } from "@/store/auth";

export const myToursKey = ["agency", "tours"] as const;
export const myTourKey = (id: string) => ["agency", "tour", id] as const;
export const tourAddonsKey = (id: string) => ["agency", "tour", id, "addons"] as const;
export const tourPolicyKey = (id: string) => ["agency", "tour", id, "policy"] as const;

export function useMyTours(enabled: boolean) {
  const token = useAuth((s) => s.token);
  return useQuery({ queryKey: myToursKey, queryFn: listMyTours, enabled: !!token && enabled });
}

export function useManagedTour(id: string) {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: myTourKey(id),
    queryFn: () => getManagedTour(id),
    enabled: !!token && !!id,
  });
}

// Har qanday o'zgarishdan keyin menejer va sayohatchi ro'yxatlari yangilanadi
function useTourMutation<V, R = unknown>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: myToursKey });
      qc.invalidateQueries({ queryKey: ["agency", "tour"] });
      qc.invalidateQueries({ queryKey: ["tours"] });
    },
  });
}

export const useCreateTour = () =>
  useTourMutation((v: { input: TourInput; departures: NewDeparture[] }) =>
    createTour(v.input, v.departures)
  );

export const useUpdateTour = (id: string) =>
  useTourMutation((input: TourInput) => updateTour(id, input));

export const useTourStatus = (id: string) =>
  useTourMutation((status: TourStatus) => setTourStatus(id, status));

export const useArchiveTour = (id: string) => useTourMutation(() => archiveTour(id));

export const useAddDeparture = (id: string) =>
  useTourMutation((d: NewDeparture) => addDeparture(id, d));

export const useDeleteDeparture = (id: string) =>
  useTourMutation((departureId: string) => deleteDeparture(id, departureId));

export const useUploadImages = (id: string) =>
  useTourMutation((files: PickedFile[]) => uploadTourImages(id, files));

export const useDeleteImage = (id: string) =>
  useTourMutation((imageId: string) => deleteTourImage(id, imageId));

export function useTourAddons(id: string) {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: tourAddonsKey(id),
    queryFn: () => listTourAddons(id),
    enabled: !!token && !!id,
  });
}

export function useTourPolicy(id: string) {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: tourPolicyKey(id),
    queryFn: () => getTourPolicy(id),
    enabled: !!token && !!id,
  });
}

function useTourOptionMutation<V, R = unknown>(id: string, fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tourAddonsKey(id) });
      qc.invalidateQueries({ queryKey: tourPolicyKey(id) });
      qc.invalidateQueries({ queryKey: ["booking", "options", id] });
    },
  });
}

export const useCreateAddon = (id: string) =>
  useTourOptionMutation(id, (input: AddonInput) => createTourAddon(id, input));

export const useUpdateAddon = (id: string) =>
  useTourOptionMutation(id, (v: { addonId: string; patch: Partial<AddonInput> }) =>
    updateTourAddon(id, v.addonId, v.patch)
  );

export const useDeleteAddon = (id: string) =>
  useTourOptionMutation(id, (addonId: string) => deleteTourAddon(id, addonId));

export const useSetTourPolicy = (id: string) =>
  useTourOptionMutation(id, (rules: PolicyRule[]) => setTourPolicy(id, rules));