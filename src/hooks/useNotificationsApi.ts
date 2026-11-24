import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteNotification, getUnreadNotifications, listNotifications,
  markAllNotificationsRead, markNotificationRead,
} from "@/services/notifications";
import { isWsConnected } from "@/services/ws";
import { useAuth } from "@/store/auth";
import { AppNotification } from "@/types/notification";

export const notificationsKey = ["notifications"] as const;
const listKey = ["notifications", "list"] as const;
const unreadKey = ["notifications", "unread"] as const;

export function useNotificationList() {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: listKey,
    queryFn: listNotifications,
    enabled: !!token,
    refetchInterval: () => (isWsConnected() ? false : 60000),
  });
}

// Qo'ng'iroqchadagi son uchun (WebSocket ulangan bo'lsa polling o'chiriladi)
export function useUnreadNotifications() {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: unreadKey,
    queryFn: getUnreadNotifications,
    enabled: !!token,
    refetchInterval: () => (isWsConnected() ? false : 60000),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationsKey });
      const previous = qc.getQueryData<AppNotification[]>(listKey);
      const wasUnread = previous?.some((n) => n.id === id && !n.read);
      qc.setQueryData<AppNotification[]>(listKey, (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (wasUnread) {
        qc.setQueryData<number>(unreadKey, (old) => Math.max(0, (old ?? 1) - 1));
      }
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(listKey, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: notificationsKey }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationsKey });
      const previous = qc.getQueryData<AppNotification[]>(listKey);
      qc.setQueryData<AppNotification[]>(listKey, (old) => old?.map((n) => ({ ...n, read: true })));
      qc.setQueryData<number>(unreadKey, 0);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(listKey, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: notificationsKey }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationsKey });
      const previous = qc.getQueryData<AppNotification[]>(listKey);
      const wasUnread = previous?.some((n) => n.id === id && !n.read);
      qc.setQueryData<AppNotification[]>(listKey, (old) => old?.filter((n) => n.id !== id));
      if (wasUnread) {
        qc.setQueryData<number>(unreadKey, (old) => Math.max(0, (old ?? 1) - 1));
      }
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(listKey, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: notificationsKey }),
  });
}