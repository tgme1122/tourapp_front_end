import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RealtimeEvent, setRealtimeHandlers, syncRealtimeToken } from "@/services/ws";
import { useAuth } from "@/store/auth";

export function useRealtimeSync() {
  const token = useAuth((s) => s.token);
  const qc = useQueryClient();

  useEffect(() => {
    const onEvent = (e: RealtimeEvent) => {
      switch (e.type) {
        case "notification":
        case "notifications_sync":
          qc.invalidateQueries({ queryKey: ["notifications"] });
          break;
        case "chat_message":
          qc.invalidateQueries({ queryKey: ["chats", "list"] });
          qc.invalidateQueries({ queryKey: ["chats", "unread"] });
          if (e.conversationId) {
            qc.invalidateQueries({ queryKey: ["chats", e.conversationId] });
          }
          break;
        case "chat_read":
          // Faqat sonlar va ro'yxat. Xabarlarni qayta so'ramaymiz (aks holda sikl bo'ladi).
          qc.invalidateQueries({ queryKey: ["chats", "list"] });
          qc.invalidateQueries({ queryKey: ["chats", "unread"] });
          break;
        case "booking_update":
          qc.invalidateQueries({ queryKey: ["bookings"] });
          qc.invalidateQueries({ queryKey: ["booking"] });
          qc.invalidateQueries({ queryKey: ["agency", "bookings"] });
          qc.invalidateQueries({ queryKey: ["agency", "booking"] });
          qc.invalidateQueries({ queryKey: ["agency", "reports"] });
          qc.invalidateQueries({ queryKey: ["notifications"] });
          break;
        case "agency_status":
          qc.invalidateQueries({ queryKey: ["me"] });
          break;
        case "admin_update":
          qc.invalidateQueries({ queryKey: ["admin"] });
          break;
      }
    };

    const onResync = () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["chats", "unread"] });
      qc.invalidateQueries({ queryKey: ["chats", "list"] });
    };

    setRealtimeHandlers({ onEvent, onResync });
    return () => setRealtimeHandlers({ onEvent: null, onResync: null });
  }, [qc]);

  useEffect(() => {
    syncRealtimeToken(token);
  }, [token]);
}
