import { useState } from "react";
import { useBookingMutations } from "@/hooks/useAgencyBookingsApi";
import { isApiError } from "@/services/api";
import { AgencyBooking } from "@/services/agencyBooking";
import { notify } from "@/utils/confirm";


export function useBookingDecisions() {
  const { cancel } = useBookingMutations();
  const [target, setTarget] = useState<AgencyBooking | null>(null);

  const onCancel = (b: AgencyBooking) => setTarget(b);

  const submitCancel = (reason: string) => {
    if (!target) return;
    cancel.mutate(
      { id: target.id, reason },
      {
        onSuccess: () => setTarget(null),
        onError: (e) =>
          notify("Bekor qilib bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring."),
      }
    );
  };

  return {
    onCancel,
    busyId: cancel.isPending ? cancel.variables?.id : undefined,
    sheetProps: {
      visible: target !== null,
      title: "Bronni bekor qilish",
      description: "Joylar qaytariladi va mijozga bildirishnoma yuboriladi. Sabab ixtiyoriy.",
      confirmLabel: "Bekor qilish",
      placeholder: "Sabab (ixtiyoriy)",
      minLength: 0,
      loading: cancel.isPending,
      onClose: () => setTarget(null),
      onSubmit: submitCancel,
    },
  };
}