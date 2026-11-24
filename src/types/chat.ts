export type Conversation = {
  id: string;
  agency: string;
  initials: string;
  verified: boolean;
  tourTitle: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
};

export type MessageType = "text" | "image" | "voice" | "file";

export type MessageAttachment = {
  url: string;
  name?: string;
  mime?: string;
  size?: number;
  durationSec?: number;
};

export type Message = {
  id: string;
  type: MessageType;
  text: string;
  attachment?: MessageAttachment;
  mine: boolean;
  time: string;
  ts?: number;
  pending?: boolean;
};
