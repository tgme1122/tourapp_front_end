import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createManager, deleteAgencyDocument, deleteMember, getOverview, getTimeseries, getTopTours,
  listMembers, NewMemberInput, ReportRange, resubmitAgency, setMemberActive, updateMember,
  updateMyAgency, AgencyUpdateInput, UpdateMemberInput, uploadAgencyDocument, uploadAgencyLogo,
} from "@/services/agency";
import { PickedFile } from "@/services/upload";
import { useAuth } from "@/store/auth";
import type { DocumentType } from "@/types/agency";

// Agentlik profili /auth/me ichida keladi (useAgency), shuning uchun har o'zgarishdan keyin
// "me" yangilanadi.
function useProfileMutation<V, R = unknown>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export const useUpdateAgency = () =>
  useProfileMutation((input: AgencyUpdateInput) => updateMyAgency(input));

export const useUploadLogo = () => useProfileMutation((f: PickedFile) => uploadAgencyLogo(f));

export const useUploadDocument = () =>
  useProfileMutation((v: { type: DocumentType; file: PickedFile }) =>
    uploadAgencyDocument(v.type, v.file)
  );

export const useDeleteDocument = () => useProfileMutation((id: string) => deleteAgencyDocument(id));

export const useResubmitAgency = () => useProfileMutation(() => resubmitAgency());

// ---------- Xodimlar ----------
export const membersKey = ["agency", "members"] as const;

export function useMembers(enabled = true) {
  const token = useAuth((s) => s.token);
  return useQuery({ queryKey: membersKey, queryFn: listMembers, enabled: !!token && enabled });
}

function useMemberMutation<V, R = unknown>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: membersKey }),
  });
}

export const useCreateManager = () => useMemberMutation((v: NewMemberInput) => createManager(v));

export const useUpdateMember = () =>
  useMemberMutation((v: { userId: string; input: UpdateMemberInput }) =>
    updateMember(v.userId, v.input)
  );

export const useDeleteMember = () =>
  useMemberMutation((userId: string) => deleteMember(userId));

export const useSetMemberActive = () =>
  useMemberMutation((v: { userId: string; active: boolean }) => setMemberActive(v.userId, v.active));

// ---------- Hisobotlar ----------
export function useAgencyReports(range: ReportRange, group: "day" | "month", enabled = true) {
  const token = useAuth((s) => s.token);
  const on = !!token && enabled;
  const key = [range.from, range.to] as const;

  const overview = useQuery({
    queryKey: ["agency", "reports", "overview", ...key],
    queryFn: () => getOverview(range),
    enabled: on,
  });
  const series = useQuery({
    queryKey: ["agency", "reports", "series", group, ...key],
    queryFn: () => getTimeseries(range, group),
    enabled: on,
  });
  const top = useQuery({
    queryKey: ["agency", "reports", "top", ...key],
    queryFn: () => getTopTours(range, 5),
    enabled: on,
  });

  return {
    overview,
    series,
    top,
    isRefetching: overview.isRefetching || series.isRefetching || top.isRefetching,
    refetch: () => Promise.all([overview.refetch(), series.refetch(), top.refetch()]),
  };
}
