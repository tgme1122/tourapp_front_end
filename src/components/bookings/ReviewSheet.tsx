import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { Booking } from "@/types/booking";

const LABELS = ["", "Yomon", "Qoniqarsiz", "Yaxshi", "Juda yaxshi", "A'lo"];
const MAX = 500;

type InitialReview = { rating: number; text: string };

type Props = {
  visible: boolean;
  booking: Booking | null;
  initial?: InitialReview;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => void;
};

export default function ReviewSheet({
  visible, booking, initial, submitting, onClose, onSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    if (visible) {
      setRating(initial?.rating ?? 0);
      setText(initial?.text ?? "");
    }
  }, [visible, initial]);

  if (!booking) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{initial ? "Sharhni o'zgartirish" : "Sharh qoldirish"}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.tour}>
            <Image source={{ uri: booking.image }} style={styles.image} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.tourTitle} numberOfLines={2}>{booking.title}</Text>
              <Text style={styles.muted}>{booking.agency}</Text>
            </View>
          </View>

          <View style={styles.starsBox}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Pressable key={i} onPress={() => setRating(i)} hitSlop={4}>
                  <Ionicons
                    name={rating >= i ? "star" : "star-outline"}
                    size={40}
                    color={colors.star}
                  />
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>{rating > 0 ? LABELS[rating] : "Sayohatni baholang"}</Text>
          </View>

          <View>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={(t) => setText(t.slice(0, MAX))}
              placeholder="Sayohat haqida fikringiz (ixtiyoriy)"
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.counter}>{text.length}/{MAX}</Text>
          </View>

          <Pressable
            style={[styles.submit, (rating === 0 || submitting) && { opacity: 0.45 }]}
            disabled={rating === 0 || submitting}
            onPress={() => onSubmit(rating, text.trim())}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitText}>Yuborish</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    paddingHorizontal: 16, paddingTop: 10, gap: 14,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background,
  },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  tour: {
    flexDirection: "row", gap: 12, padding: 10, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  image: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.surface },
  tourTitle: { fontSize: 14, fontWeight: "800", color: colors.text, lineHeight: 19 },
  muted: { fontSize: 12, color: colors.muted },
  starsBox: { alignItems: "center", gap: 6 },
  stars: { flexDirection: "row", gap: 8 },
  label: { fontSize: 14, fontWeight: "700", color: colors.primary },
  input: {
    minHeight: 110, padding: 14, borderRadius: 14, fontSize: 15, color: colors.text,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  counter: { alignSelf: "flex-end", marginTop: 4, fontSize: 11, color: colors.muted },
  submit: {
    height: 54, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  submitText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});