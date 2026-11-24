import { useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, Pressable, Modal, Platform, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync,
  useAudioRecorder, useAudioRecorderState,
} from "expo-audio";
import { colors, noFocusOutline, radius, shadows } from "@/constants/theme";
import { AttachmentInput } from "@/services/chats";
import { notify } from "@/utils/confirm";

type Props = {
  onSend: (text: string) => void;
  onSendAttachment: (input: AttachmentInput) => void;
};

const formatTimer = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function ChatInput({ onSend, onSendAttachment }: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [fallbackSec, setFallbackSec] = useState(0);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recState = useAudioRecorderState(recorder, 200);
  const canSend = text.trim().length > 0;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recorder.isRecording) {
        recorder.stop().catch(() => {});
        setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
      }
    };
  }, [recorder]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const liveSec =
    recState.durationMillis > 0
      ? Math.floor(recState.durationMillis / 1000)
      : fallbackSec;

  const sendText = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
  };

  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        notify("Ruxsat kerak", "Ovozli xabar yozish uchun mikrofonga ruxsat bering.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAtRef.current = Date.now();
      setFallbackSec(0);
      setRecording(true);
      stopTimer();
      timerRef.current = setInterval(() => {
        setFallbackSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 250);
    } catch {
      stopTimer();
      setRecording(false);
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
      notify("Mikrofon ishlamadi", "Qurilmada ovoz yozishni boshlab bo'lmadi.");
    }
  };

  const cancelRecording = async () => {
    stopTimer();
    setRecording(false);
    try {
      await recorder.stop();
    } catch {
      // e'tiborsiz qoldiramiz
    }
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
  };

  const finishAndSendRecording = async () => {
    const dur = Math.max(
      1,
      recState.durationMillis > 0
        ? Math.round(recState.durationMillis / 1000)
        : Math.round((Date.now() - startedAtRef.current) / 1000)
    );
    stopTimer();
    setRecording(false);
    try {
      await recorder.stop();
    } catch {
      // to'xtatishda xato bo'lsa ham uri tekshiramiz
    }
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});

    const uri = recorder.uri ?? recState.url;
    if (!uri) {
      notify("Yozuv topilmadi", "Ovozli xabarni saqlab bo'lmadi. Qayta urinib ko'ring.");
      return;
    }

    onSendAttachment({
      type: "voice",
      file: {
        uri,
        mimeType: Platform.OS === "web" ? "audio/webm" : "audio/m4a",
        fileName: Platform.OS === "web" ? `voice-${Date.now()}.webm` : `voice-${Date.now()}.m4a`,
      },
      durationSec: dur,
    });
  };

  const pickFromGallery = async () => {
    setMenuOpen(false);
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    onSendAttachment({
      type: "image",
      file: { uri: a.uri, mimeType: a.mimeType, fileName: a.fileName },
      text: text.trim() || undefined,
    });
    if (text.trim()) setText("");
  };

  const pickFromCamera = async () => {
    setMenuOpen(false);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        notify("Ruxsat kerak", "Rasmga olish uchun kameraga ruxsat bering.");
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.85,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];
      onSendAttachment({
        type: "image",
        file: { uri: a.uri, mimeType: a.mimeType, fileName: a.fileName },
        text: text.trim() || undefined,
      });
      if (text.trim()) setText("");
    } catch {
      notify("Kamera mavjud emas", "Bu qurilmada kamerani ochib bo'lmadi.");
    }
  };

  const pickFile = async () => {
    setMenuOpen(false);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "*/*",
      });
      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];
      onSendAttachment({
        type: "file",
        file: {
          uri: a.uri,
          mimeType: a.mimeType,
          fileName: a.name,
          file: a.file,
        },
        text: text.trim() || undefined,
      });
      if (text.trim()) setText("");
    } catch {
      notify("Fayl tanlanmadi", "Faylni ochib bo'lmadi. Qayta urinib ko'ring.");
    }
  };

  if (recording) {
    return (
      <View style={styles.bar}>
        <Pressable style={styles.cancelRec} onPress={cancelRecording} hitSlop={6}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </Pressable>

        <View style={styles.recBox}>
          <View style={styles.recDot} />
          <Text style={styles.recTime}>{formatTimer(liveSec)}</Text>
          <Text style={styles.recLabel}>Ovoz yozilmoqda...</Text>
        </View>

        <Pressable style={styles.send} onPress={finishAndSendRecording}>
          <Ionicons name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <View style={styles.bar}>
        <Pressable style={styles.attach} onPress={() => setMenuOpen(true)} hitSlop={6}>
          <Ionicons name="attach-outline" size={22} color={colors.textSecondary} />
        </Pressable>

        <View style={styles.field}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Xabar yozing..."
            placeholderTextColor={colors.muted}
            multiline
          />
        </View>

        {canSend ? (
          <Pressable style={styles.send} onPress={sendText}>
            <Ionicons name="send" size={18} color={colors.white} />
          </Pressable>
        ) : (
          <Pressable style={styles.send} onPress={startRecording}>
            <Ionicons name="mic-outline" size={21} color={colors.white} />
          </Pressable>
        )}
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Biriktirma yuborish</Text>

            <Pressable style={styles.option} onPress={pickFromGallery}>
              <View style={[styles.optIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="image-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>Rasm tanlash</Text>
                <Text style={styles.optSub}>Galereyadan rasm yuborish</Text>
              </View>
            </Pressable>

            {Platform.OS !== "web" && (
              <Pressable style={styles.option} onPress={pickFromCamera}>
                <View style={[styles.optIcon, { backgroundColor: "#E8F0FE" }]}>
                  <Ionicons name="camera-outline" size={22} color={colors.verified} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optTitle}>Kamera</Text>
                  <Text style={styles.optSub}>Yangi rasmga olish</Text>
                </View>
              </Pressable>
            )}

            <Pressable style={styles.option} onPress={pickFile}>
              <View style={[styles.optIcon, { backgroundColor: colors.successSoft }]}>
                <Ionicons name="document-text-outline" size={22} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>Hujjat yoki fayl</Text>
                <Text style={styles.optSub}>PDF, Word, Excel yoki ZIP fayl</Text>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  attach: {
    width: 44, height: 46, borderRadius: 23,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
  },
  field: {
    flex: 1, flexDirection: "row", alignItems: "flex-end",
    minHeight: 46, paddingHorizontal: 16, borderRadius: radius.pill,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    ...shadows.soft,
  },
  input: {
    flex: 1, maxHeight: 110, paddingTop: 12, paddingBottom: 12,
    fontSize: 15, color: colors.text, ...noFocusOutline,
  },
  send: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
    ...shadows.soft,
  },
  cancelRec: {
    width: 44, height: 46, borderRadius: 23,
    backgroundColor: colors.dangerSoft, alignItems: "center", justifyContent: "center",
  },
  recBox: {
    flex: 1, height: 46, paddingHorizontal: 16, borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft, flexDirection: "row", alignItems: "center", gap: 10,
  },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger },
  recTime: { fontSize: 15, fontWeight: "800", color: colors.danger },
  recLabel: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    paddingHorizontal: 16, paddingTop: 10, gap: 10,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background,
  },
  handle: {
    alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border,
  },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 4 },
  option: {
    flexDirection: "row", alignItems: "center", gap: 14, padding: 12,
    borderRadius: 16, backgroundColor: colors.surface,
  },
  optIcon: {
    width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  optTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  optSub: { fontSize: 12, color: colors.muted },
});
