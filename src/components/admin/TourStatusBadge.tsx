import { colors } from "@/constants/theme";
import { TourStatus } from "@/types/admin";
import { Badge } from "@/components/admin/DataTable";

export const TOUR_STATUS: Record<TourStatus, { text: string; color: string; bg: string }> = {
  draft: { text: "Qoralama", color: colors.warning, bg: colors.warningSoft },
  published: { text: "Nashr etilgan", color: colors.success, bg: colors.successSoft },
  archived: { text: "Arxiv", color: colors.muted, bg: colors.surface },
};

export default function TourStatusBadge({ status }: { status: TourStatus }) {
  const s = TOUR_STATUS[status];
  return <Badge text={s.text} color={s.color} bg={s.bg} />;
}

export const money = (n: number) => `${Math.round(n).toLocaleString("ru-RU")} so'm`;

