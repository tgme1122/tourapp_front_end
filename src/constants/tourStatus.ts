import { colors } from "@/constants/theme";
import type { TourStatus } from "@/services/agencyTours";

export const TOUR_STATUS_STYLE: Record<TourStatus, { label: string; color: string; bg: string }> = {
  published: { label: "Nashr qilingan", color: colors.success, bg: colors.successSoft },
  draft: { label: "Qoralama", color: colors.warning, bg: colors.warningSoft },
  archived: { label: "Arxivlangan", color: "#4B5563", bg: "#E5E7EB" },
};
