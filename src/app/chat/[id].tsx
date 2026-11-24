import ChatInput from "@/components/messages/ChatInput";
import MessageBubble from "@/components/messages/MessageBubble";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import { ListRowSkeleton } from "@/components/ui/Skeleton";
import { colors } from "@/constants/theme";
import { useAgency } from "@/hooks/useAgency";
import {
  useConversations, useMarkRead, useMessages, useSendAttachment, useSendMessage,
} from "@/hooks/useChatsApi";
import { isApiError } from "@/services/api";
import { AttachmentInput } from "@/services/chats";
import { notify } from "@/utils/confirm";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: conversations } = useConversations();
  const conversation = conversations?.find((c) => c.id === id);

  const { data: messages = [], isPending, isError, error, refetch } = useMessages(id);
  const send = useSendMessage(id);
  const sendAtt = useSendAttachment(id);
  const markRead = useMarkRead(id);

  // Inverted ro'yxat uchun yangisi birinchi bo'lishi kerak
  const data = useMemo(() => [...messages].reverse(), [messages]);
  const { isOwner } = useAgency();

  // Boshqa tomondan yangi xabar kelsa, "o'qildi" deb belgilaymiz
  const lastIncomingId = data.find((m) => !m.mine)?.id;
  useEffect(() => {
    if (lastIncomingId) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastIncomingId]);

  const onSend = (text: string) => {
    send.mutate(text, {
      onError: () => notify("Xabar yuborilmadi", "Internetni tekshirib, qayta urinib ko'ring."),
    });
  };

  const onSendAttachment = (input: AttachmentInput) => {
    sendAtt.mutate(input, {
      onError: (e) =>
        notify(
          "Yuborib bo'lmadi",
          isApiError(e) ? e.message : "Faylni yuborishda xatolik yuz berdi."
        ),
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Avatar initials={conversation?.initials ?? "?"} size={42} />
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {conversation?.agency ?? "Suhbat"}
            </Text>
            {conversation?.verified && (
              <Ionicons name="checkmark-circle" size={15} color={colors.verified} />
            )}
          </View>
        </View>
      </View>

      {!!conversation?.tourTitle && (
        <View style={styles.tourStrip}>
          <Ionicons name="bag-handle-outline" size={15} color={colors.primary} />
          <Text style={styles.tourText} numberOfLines={1}>{conversation.tourTitle}</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {isPending ? (
          <View style={{ flex: 1, paddingTop: 12 }}>
            <ListRowSkeleton />
            <ListRowSkeleton />
            <ListRowSkeleton />
          </View>
        ) : isError && messages.length === 0 ? (
          <View style={styles.center}>
            <EmptyState
              icon="cloud-offline-outline"
              title="Yuklab bo'lmadi"
              text={isApiError(error) ? error.message : "Internetni tekshirib, qayta urinib ko'ring."}
              actionLabel="Qayta urinish"
              onAction={() => refetch()}
            />
          </View>
        ) : (
          <FlatList
            data={data}
            inverted
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <MessageBubble message={item} onImagePress={(url) => setPreviewUrl(url)} />
            )}
          />
        )}
         {isOwner ? (
          <View style={styles.readonly}>
            <Text style={styles.readonlyText}>Faqat ko'rish. Xabarlarga menejer javob beradi.</Text>
          </View>
        ) : (
          <ChatInput onSend={onSend} onSendAttachment={onSendAttachment} />
        )}
      </KeyboardAvoidingView>

      <Modal
        visible={!!previewUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUrl(null)}
      >
        <View style={styles.previewRoot}>
          <Pressable
            style={[styles.previewClose, { top: Math.max(insets.top, 16) }]}
            onPress={() => setPreviewUrl(null)}
            hitSlop={10}
          >
            <Ionicons name="close" size={24} color={colors.white} />
          </Pressable>
          {!!previewUrl && (
            <Image source={{ uri: previewUrl }} style={styles.previewImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  back: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { fontSize: 16, fontWeight: "800", color: colors.text, flexShrink: 1 },
  tourStrip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, height: 34, backgroundColor: colors.primarySoft,
  },
  
  tourText: { flex: 1, fontSize: 12, fontWeight: "700", color: colors.primary },
  center: { flex: 1, justifyContent: "center" },
  list: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  readonly: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  readonlyText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
  previewRoot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewClose: {
    position: "absolute",
    right: 16,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: { width: "100%", height: "85%" },
});