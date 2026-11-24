import { View, Text, Image, Pressable, ActivityIndicator, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { colors } from "@/constants/theme";
import { Message } from "@/types/chat";
import VoicePlayer from "./VoicePlayer";

type Props = {
  message: Message;
  onImagePress?: (url: string) => void;
};

const formatSize = (bytes?: number) => {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const openAttachment = (url?: string) => {
  if (!url) return;
  if (Platform.OS === "web") {
    (globalThis as any).open?.(url, "_blank");
  } else {
    WebBrowser.openBrowserAsync(url).catch(() => {});
  }
};

export default function MessageBubble({ message, onImagePress }: Props) {
  const mine = message.mine;
  const att = message.attachment;
  const isMedia = message.type !== "text" && !!att;

  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      <View
        style={[
          styles.bubble,
          mine ? styles.bubbleMine : styles.bubbleTheirs,
          message.type === "image" && styles.bubbleImage,
        ]}
      >
        {message.type === "image" && att && (
          <Pressable
            onPress={() => !message.pending && onImagePress?.(att.url)}
            disabled={message.pending}
            style={styles.imageWrap}
          >
            <Image source={{ uri: att.url }} style={styles.image} resizeMode="cover" />
            {message.pending && (
              <View style={[StyleSheet.absoluteFill, styles.imageLoading]}>
                <ActivityIndicator color={colors.white} />
              </View>
            )}
          </Pressable>
        )}

        {message.type === "voice" && att && (
          <VoicePlayer
            url={att.url}
            durationSec={att.durationSec}
            mine={mine}
            pending={message.pending}
          />
        )}

        {message.type === "file" && att && (
          <Pressable
            style={[
              styles.fileBox,
              { backgroundColor: mine ? "rgba(255,255,255,0.16)" : colors.background },
            ]}
            onPress={() => !message.pending && openAttachment(att.url)}
            disabled={message.pending}
          >
            <View
              style={[
                styles.fileIcon,
                { backgroundColor: mine ? "rgba(255,255,255,0.22)" : colors.primarySoft },
              ]}
            >
              {message.pending ? (
                <ActivityIndicator size="small" color={mine ? colors.white : colors.primary} />
              ) : (
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={mine ? colors.white : colors.primary}
                />
              )}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={[styles.fileName, mine && { color: colors.white }]}
                numberOfLines={1}
              >
                {att.name || "Hujjat"}
              </Text>
              {!!formatSize(att.size) && (
                <Text
                  style={[styles.fileMeta, mine && { color: "rgba(255,255,255,0.75)" }]}
                >
                  {formatSize(att.size)}
                </Text>
              )}
            </View>
            {!message.pending && (
              <Ionicons
                name="download-outline"
                size={18}
                color={mine ? colors.white : colors.muted}
              />
            )}
          </Pressable>
        )}

        {!!message.text && (
          <Text
            style={[
              styles.text,
              mine && { color: colors.white },
              message.type === "image" && { paddingHorizontal: 8, paddingTop: 4 },
            ]}
          >
            {message.text}
          </Text>
        )}

        <View style={[styles.meta, isMedia && message.type === "image" && { paddingHorizontal: 6 }]}>
          <Text style={[styles.time, mine && { color: "rgba(255,255,255,0.75)" }]}>
            {message.time}
          </Text>
          {mine && (
            <Ionicons
              name={message.pending ? "time-outline" : "checkmark-done"}
              size={15}
              color="rgba(255,255,255,0.75)"
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  rowMine: { justifyContent: "flex-end" },
  rowTheirs: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "80%", paddingHorizontal: 12, paddingTop: 9, paddingBottom: 6,
    borderRadius: 18, gap: 4,
  },
  bubbleImage: { paddingHorizontal: 4, paddingTop: 4, paddingBottom: 6 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
  imageWrap: { borderRadius: 14, overflow: "hidden", position: "relative" },
  image: { width: 220, height: 220, backgroundColor: "rgba(0,0,0,0.08)" },
  imageLoading: {
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  fileBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 8, borderRadius: 12, minWidth: 200,
  },
  fileIcon: {
    width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  fileName: { fontSize: 13, fontWeight: "700", color: colors.text },
  fileMeta: { fontSize: 11, color: colors.muted },
  text: { fontSize: 15, lineHeight: 21, color: colors.text },
  meta: { flexDirection: "row", alignItems: "center", alignSelf: "flex-end", gap: 4 },
  time: { fontSize: 11, color: colors.muted },
});
