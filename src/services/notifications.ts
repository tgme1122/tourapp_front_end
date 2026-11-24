import { api } from "./api";
import { asList, logShape, num, str } from "./mappers";
import { AppNotification, NotificationTarget, NotificationType } from "@/types/notification";
import { formatChatTime, formatClock, parseServerDate } from "@/utils/format";

const TYPES: NotificationType[] = ["price_drop", "booking", "message", "promo"];

const dayGroup = (d: Date): AppNotification["day"] => {
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  return diff <= 0 ? "Bugun" : diff === 1 ? "Kecha" : "Avvalroq";
};

const toTarget = (kind: unknown, id: unknown): NotificationTarget | null => {
  const k = str(kind);
  const i = id == null ? "" : str(id);
  if (k === "tour" && i) return { kind: "tour", id: i };
  if (k === "chat" && i) return { kind: "chat", id: i };
  if (k === "bookings" || k === "booking") return { kind: "bookings" };
  return null;
};

export const toNotification = (raw: any): AppNotification => {
  const iso = str(raw.time ?? raw.created_at);
  const date = parseServerDate(iso) ?? new Date();
  const day = dayGroup(date);
  const type = str(raw.type) as NotificationType;

  return {
    id: str(raw.id),
    type: TYPES.includes(type) ? type : "promo",
    title: str(raw.title),
    text: str(raw.text ?? raw.body ?? raw.message),
    day,
    time: day === "Avvalroq" ? formatChatTime(iso) : formatClock(date),
    read: raw.read_at != null || raw.is_read === true || raw.read === true,
    target: raw.target ? toTarget(raw.target.kind, raw.target.id) : toTarget(raw.target_kind, raw.target_id),
  };
};

const stamp = (raw: any) => parseServerDate(str(raw.time ?? raw.created_at))?.getTime() ?? 0;

export const listNotifications = async (): Promise<AppNotification[]> => {
  const list = asList(await api("/notifications"));
  logShape("BILDIRISHNOMA", list[0]);
  return [...list].sort((a, b) => stamp(b) - stamp(a)).map(toNotification);
};

export const getUnreadNotifications = async (): Promise<number> => {
  const data: any = await api("/notifications/unread-count");
  if (typeof data === "number") return data;
  return num(data?.count ?? data?.unread ?? data?.unread_count ?? data?.total);
};

export const markNotificationRead = (id: string) =>
  api(`/notifications/${id}/read`, { method: "POST" });

export const markAllNotificationsRead = () =>
  api("/notifications/read-all", { method: "POST" });

export const deleteNotification = (id: string) =>
  api(`/notifications/${id}`, { method: "DELETE" });