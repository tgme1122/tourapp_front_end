import { Redirect } from "expo-router";
import { useAgency } from "@/hooks/useAgency";

export default function AgencyIndex() {
  const { isOwner } = useAgency();
  return (
    <Redirect
      href={(isOwner ? "/agency/dashboard" : "/agency/tours") as any}
    />
  );
}