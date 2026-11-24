import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AttachmentInput, getMessages, getUnreadCount, listConversations, markRead,
  sendAttachment, sendMessage,
} from "@/services/chats";
import { isWsConnected } from "@/services/ws";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";
import { Message } from "@/types/chat";
import { formatClock } from "@/utils/format";

// ["chats"] bilan boshlanadigan hamma narsa bir yo'la yangilanishi mumkin
export const chatsKey = ["chats"] as const;
export const listKey = ["chats", "list"] as const;
export const unreadKey = ["chats", "unread"] as const;
export const messagesKey = (id: string, myId: string) => ["chats", id, "messages", myId] as const;

export function useConversations() {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: listKey,
    queryFn: listConversations,
    enabled: !!token,
    refetchInterval: () => (isWsConnected() ? false : 30000),
  });
}

// Tab belgisi uchun (WebSocket ulangan bo'lsa polling o'chiriladi)
export function useUnreadChats() {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: unreadKey,
    queryFn: getUnreadCount,
    enabled: !!token,
    refetchInterval: () => (isWsConnected() ? false : 60000),
  });
}

// WebSocket uzilgan bo'lsagina har 5 soniyada zaxira polling ishlaydi
export function useMessages(conversationId: string) {
  const token = useAuth((s) => s.token);
  const myId = useUser((s) => s.user.id);
  return useQuery({
    queryKey: messagesKey(conversationId, myId ?? ""),
    queryFn: () => getMessages(conversationId, myId),
    enabled: !!token && !!conversationId && !!myId,
    refetchInterval: () => (isWsConnected() ? false : 5000),
  });
}

// Yuborish: xabar darrov ko'rinadi, xato bo'lsa olib tashlanadi
export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  const myId = useUser((s) => s.user.id);
  const key = messagesKey(conversationId, myId ?? "");

  return useMutation({
    mutationFn: (text: string) => sendMessage(conversationId, text),
    onMutate: async (text) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Message[]>(key);
      const temp: Message = {
        id: `tmp-${Date.now()}`,
        type: "text",
        text,
        mine: true,
        time: formatClock(new Date()),
        ts: Date.now(),
        pending: true,
      };
      qc.setQueryData<Message[]>(key, [...(previous ?? []), temp]);
      return { previous };
    },
    onError: (_e, _t, ctx) => {
      qc.setQueryData(key, ctx?.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["chats", conversationId] });
      qc.invalidateQueries({ queryKey: listKey });
    },
  });
}

export function useSendAttachment(conversationId: string) {
  const qc = useQueryClient();
  const myId = useUser((s) => s.user.id);
  const key = messagesKey(conversationId, myId ?? "");

  return useMutation({
    mutationFn: (input: AttachmentInput) => sendAttachment(conversationId, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Message[]>(key);
      const temp: Message = {
        id: `tmp-${Date.now()}`,
        type: input.type,
        text: input.text ?? "",
        attachment: {
          url: input.file.uri,
          name: input.file.fileName ?? undefined,
          mime: input.file.mimeType ?? undefined,
          durationSec: input.durationSec,
        },
        mine: true,
        time: formatClock(new Date()),
        ts: Date.now(),
        pending: true,
      };
      qc.setQueryData<Message[]>(key, [...(previous ?? []), temp]);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(key, ctx?.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["chats", conversationId] });
      qc.invalidateQueries({ queryKey: listKey });
    },
  });
}

export function useMarkRead(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markRead(conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: listKey });
      qc.invalidateQueries({ queryKey: unreadKey });
    },
  });
}