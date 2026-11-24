import { useUser } from "@/store/user";
import { api, apiUrl } from "./api";
import { asList, initialsFrom, logShape, num, str } from "./mappers";
import { appendFile, PickedFile } from "./upload";
import { Conversation, Message, MessageType } from "@/types/chat";
import { formatChatTime, formatClock, parseServerDate } from "@/utils/format";

export const toConversation = (raw: any): Conversation => {
  const a = raw.agency;
  const agencyObj = a && typeof a === "object" ? a : {};
  const tour = raw.tour ?? {};
  const last = raw.last_message ?? {};
  const isAgencyUser = useUser.getState().user.role === "agency";

  // Agentlik foydalanuvchisiga "agency" maydonida mijozning ismi keladi
  const name = str(
    typeof a === "string"
      ? a
      : agencyObj.name ?? raw.agency_name ?? raw.customer?.name ?? raw.customer_name,
    "Suhbat"
  );

  return {
    id: str(raw.id),
    agency: name,
    initials: initialsFrom(name),
    verified:
      !isAgencyUser &&
      Boolean(
        agencyObj.verified ??
          agencyObj.is_verified ??
          (agencyObj.status ? agencyObj.status === "approved" : true)
      ),
    tourTitle: str(tour.title ?? raw.tour_title),
    lastMessage: str(raw.last_message_text ?? last.text),
    time: formatChatTime(str(raw.last_message_at ?? last.created_at ?? raw.updated_at)),
    unread: num(raw.unread_count ?? raw.unread ?? raw.unread_messages),
  };
};

const stamp = (raw: any) =>
  parseServerDate(str(raw.time ?? raw.last_message_at ?? raw.last_message?.created_at ?? raw.updated_at))?.getTime() ?? 0;

export const listConversations = async (): Promise<Conversation[]> => {
  const list = asList(await api("/chats"));
  logShape("SUHBAT", list[0]);
  return [...list].sort((a, b) => stamp(b) - stamp(a)).map(toConversation);
};

const toMsgType = (v: unknown): MessageType => {
  const s = str(v);
  return s === "image" || s === "voice" || s === "file" ? s : "text";
};

export const toMessage = (raw: any, myId: string): Message => {
  const date = parseServerDate(str(raw.time ?? raw.created_at ?? raw.sent_at));
  const senderId = str(raw.sender_id ?? raw.sender?.id);
  const att = raw.attachment;
  const attUrl = att?.url ? apiUrl(str(att.url)) : "";

  return {
    id: str(raw.id),
    type: toMsgType(raw.type),
    text: str(raw.text ?? raw.content ?? raw.body),
    attachment: attUrl
      ? {
          url: attUrl,
          name: att?.name ? str(att.name) : undefined,
          mime: att?.mime ? str(att.mime) : undefined,
          size: att?.size != null ? num(att.size) : undefined,
          durationSec: att?.duration_sec != null ? num(att.duration_sec) : undefined,
        }
      : undefined,
    mine:
      typeof raw.mine === "boolean" ? raw.mine
      : typeof raw.is_mine === "boolean" ? raw.is_mine
      : senderId === myId,
    time: date ? formatClock(date) : "",
    ts: date?.getTime() ?? 0,
  };
};

export const getMessages = async (conversationId: string, myId: string): Promise<Message[]> => {
  const list = asList(await api(`/chats/${conversationId}/messages`));
  logShape("XABAR", list[0]);
  return list.map((m) => toMessage(m, myId)).sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));
};

export const sendMessage = (conversationId: string, text: string) =>
  api(`/chats/${conversationId}/messages`, { method: "POST", body: { text } });

export type AttachmentInput = {
  type: "image" | "voice" | "file";
  file: PickedFile;
  text?: string;
  durationSec?: number;
};

export const sendAttachment = async (conversationId: string, input: AttachmentInput) => {
  const form = new FormData();
  form.append("type", input.type);
  const fallback =
    input.type === "image"
      ? "photo.jpg"
      : input.type === "voice"
      ? "voice.m4a"
      : "document.pdf";
  await appendFile(form, "file", input.file, fallback);
  if (input.text?.trim()) form.append("text", input.text.trim());
  if (input.durationSec !== undefined) form.append("durationSec", String(Math.round(input.durationSec)));
  return api(`/chats/${conversationId}/attachments`, { method: "POST", form });
};

export const markRead = (conversationId: string) =>
  api(`/chats/${conversationId}/read`, { method: "POST" });

export const getUnreadCount = async (): Promise<number> => {
  const data: any = await api("/chats/unread-count");
  if (typeof data === "number") return data;
  return num(data?.count ?? data?.unread ?? data?.unread_count ?? data?.total);
};

// Tur sahifasidan suhbat boshlash uchun (turlar qadamida ulanadi)
export const startConversation = (input: { agencyId: string; tourId?: string }) =>
  api<any>("/chats", {
    method: "POST",
    body: { agency_id: input.agencyId, tour_id: input.tourId },
  });