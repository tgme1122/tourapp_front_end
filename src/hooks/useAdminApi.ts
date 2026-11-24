import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAgency, checkDocument, getAgency, getAgencyCounts, listAgencies,
  rejectAgency, sendPromo, suspendAgency,
} from "@/services/admin";
import {
  getAdminTour, getAdminUser, getTourCounts, getUserCounts, listAdminTours, listTourBookings,
  listUsers,
} from "@/services/admin";
import { TourSort, TourStatus, UserRole } from "@/types/admin";
import { isWsConnected } from "@/services/ws";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";
import { AdminAgency, AgencyStatus } from "@/types/agency";

const PAGE = 20;
export type StatusFilter = AgencyStatus | "all";

const useAdminEnabled = () => {
  const token = useAuth((s) => s.token);
  const role = useUser((s) => s.user.role);
  return !!token && role === "admin";
};

export function useAgencyCounts() {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "counts"],
    queryFn: getAgencyCounts,
    enabled,
    refetchInterval: () => (isWsConnected() ? false : 60000),
  });
}

// Cheksiz ro'yxat: pastga tushganda keyingi sahifa yuklanadi
export function useAgencyList(status: StatusFilter, q: string) {
  const enabled = useAdminEnabled();
  return useInfiniteQuery({
    queryKey: ["admin", "agencies", status, q],
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listAgencies({
        status: status === "all" ? undefined : status,
        q: q || undefined,
        limit: PAGE,
        offset: pageParam,
      }),
    getNextPageParam: (last, all) => (last.length < PAGE ? undefined : all.length * PAGE),
  });
}

export type RoleFilter = UserRole | "all";

export function useUserCounts() {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "user-counts"],
    queryFn: getUserCounts,
    enabled,
    refetchInterval: () => (isWsConnected() ? false : 60000),
  });
}

export function useAdminUser(id: string) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: () => getAdminUser(id),
    enabled: enabled && !!id,
  });
}

export function useUserList(role: RoleFilter, q: string, isActive?: boolean) {
  const enabled = useAdminEnabled();
  return useInfiniteQuery({
    queryKey: ["admin", "users", role, q, isActive ?? "any"],
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listUsers({
        role: role === "all" ? undefined : role,
        isActive,
        q: q || undefined,
        limit: PAGE,
        offset: pageParam,
      }),
    getNextPageParam: (last, all) => (last.length < PAGE ? undefined : all.length * PAGE),
  });
}

export type TourListFilter = { status?: TourStatus; sort: TourSort; q: string; agencyId?: string };

export function useTourCounts() {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "tour-counts"],
    queryFn: getTourCounts,
    enabled,
    refetchInterval: () => (isWsConnected() ? false : 60000),
  });
}

export function useAdminTour(id: string) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "tour", id],
    queryFn: () => getAdminTour(id),
    enabled: enabled && !!id,
  });
}

export function useTourBookings(id: string) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "tour", id, "bookings"],
    queryFn: () => listTourBookings(id),
    enabled: enabled && !!id,
  });
}

export function useAdminTourList(f: TourListFilter) {
  const enabled = useAdminEnabled();
  return useInfiniteQuery({
    queryKey: ["admin", "tours", f.status ?? "all", f.sort, f.q, f.agencyId ?? ""],
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listAdminTours({
        status: f.status,
        sort: f.sort,
        q: f.q || undefined,
        agencyId: f.agencyId,
        limit: PAGE,
        offset: pageParam,
      }),
    getNextPageParam: (last, all) => (last.length < PAGE ? undefined : all.length * PAGE),
  });
}


export function useAgencyDetail(id: string) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "agency", id],
    queryFn: () => getAgency(id),
    enabled: enabled && !!id,
  });
}

// Qarordan keyin hamma admin ma'lumoti (hisoblagich, ro'yxat, tafsilot) yangilanadi
function useAdminMutation<V>(fn: (v: V) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
}

export const useApproveAgency = () => useAdminMutation((id: string) => approveAgency(id));

export const useRejectAgency = () =>
  useAdminMutation((v: { id: string; reason: string }) => rejectAgency(v.id, v.reason));

export const useSuspendAgency = () =>
  useAdminMutation((v: { id: string; reason: string }) => suspendAgency(v.id, v.reason));

// "Tekshirildi" belgisi darrov o'zgaradi, xato bo'lsa qaytadi
export function useCheckDocument(agencyId: string) {
  const qc = useQueryClient();
  const key = ["admin", "agency", agencyId] as const;

  return useMutation({
    mutationFn: (v: { documentId: string; isChecked: boolean }) =>
      checkDocument(agencyId, v.documentId, v.isChecked),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<AdminAgency>(key);
      qc.setQueryData<AdminAgency>(
        key,
        (old) =>
          old && {
            ...old,
            documents: old.documents?.map((d) =>
              d.id === v.documentId ? { ...d, is_checked: v.isChecked } : d
            ),
          }
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export const useSendPromo = () => useMutation({ mutationFn: sendPromo });