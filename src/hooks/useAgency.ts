import { useMe } from "@/hooks/useMe";
import { toAgencyRole } from "@/services/auth";
import { useUser } from "@/store/user";

// Agentlik va uning ichidagi rol (owner / manager)
export function useAgency() {
  const query = useMe();
  const stored = useUser((s) => s.user.agencyRole);

  const agencyRole = query.data ? toAgencyRole(query.data) : stored;
  const agency = query.data?.agency_profile ?? null;

  return {
    ...query,
    agency,
    status: agency?.status,
    isApproved: agency?.status === "approved",
    agencyRole,
    isOwner: agencyRole === "owner",
    isManager: agencyRole === "manager",
  };
}