export type NotificationType = "price_drop" | "booking" | "message" | "promo";

export type NotificationTarget =
  | { kind: "tour"; id: string }
  | { kind: "bookings" }
  | { kind: "chat"; id: string };

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  text: string;
  time: string;
  day: "Bugun" | "Kecha" | "Avvalroq";
  read: boolean;
  target: NotificationTarget| null;
};