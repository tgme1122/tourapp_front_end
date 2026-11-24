import { useEffect, useState } from "react";
import {
  View, Text, Image, Modal, Pressable, ActivityIndicator, Platform, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { api, apiUrl } from "@/services/api";
import { useAuth } from "@/store/auth";
import { AgencyDocument, DOC_LABELS } from "@/types/agency";
import PrimaryButton from "@/components/ui/PrimaryButton";

type State = { loading: boolean; uri?: string; pdf?: boolean; ticket?: string; error?: boolean };

export default function DocumentViewer({
  doc, onClose,
}: { doc: AgencyDocument | null; onClose: () => void }) {
  const token = useAuth((s) => s.token);
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<State>({ loading: true });

  useEffect(() => {
    if (!doc?.file_url) return;
    const url = apiUrl(doc.file_url);
    setState({ loading: true });

    let cancelled = false;
    let objectUrl: string | undefined;

    if (Platform.OS !== "web") {
      // Telefonda hujjat turini va PDF bo'lsa qisqa muddatli ko'rish ticket'ini olamiz
      const ticketPath = doc.file_url.replace(/\/file$/, "/ticket");
      api<{ ticket: string; is_pdf?: boolean }>(ticketPath, { method: "POST" })
        .then((res) => {
          if (cancelled) return;
          if (res.is_pdf) {
            const signed = `${url}?ticket=${encodeURIComponent(res.ticket)}`;
            setState({ loading: false, uri: signed, pdf: true, ticket: res.ticket });
          } else {
            setState({ loading: false, uri: url });
          }
        })
        .catch(() => {
          if (!cancelled) setState({ loading: false, uri: url });
        });
      return () => {
        cancelled = true;
      };
    }

    // Veb'da: sarlavha bilan yuklab, vaqtinchalik havola yasaymiz
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        objectUrl = (globalThis as any).URL.createObjectURL(blob);
        if (!cancelled) {
          setState({ loading: false, uri: objectUrl, pdf: blob.type === "application/pdf" });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: true });
      });

    return () => {
      cancelled = true;
      if (objectUrl) (globalThis as any).URL.revokeObjectURL(objectUrl);
    };
  }, [doc?.file_url, token]);

  const openPdf = () => {
    if (!state.uri) return;
    if (Platform.OS === "web") {
      (globalThis as any).open?.(state.uri, "_blank");
    } else {
      WebBrowser.openBrowserAsync(state.uri).catch(() => {});
    }
  };

  return (
    <Modal visible={!!doc} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.title} numberOfLines={1}>
            {doc ? DOC_LABELS[doc.type] ?? doc.type : ""}
          </Text>
          <Pressable style={styles.close} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.body}>
          {state.loading ? (
            <ActivityIndicator color={colors.white} />
          ) : state.error ? (
            <Text style={styles.message}>Hujjatni ochib bo'lmadi. Qayta urinib ko'ring.</Text>
          ) : state.pdf ? (
            <View style={{ gap: 16, alignItems: "center", padding: 24 }}>
              <Ionicons name="document-text-outline" size={64} color={colors.white} />
              <Text style={styles.message}>Bu PDF hujjat.</Text>
              <PrimaryButton label="Hujjatni ochish" onPress={openPdf} />
            </View>
          ) : state.uri ? (
            <Image
              source={{
                uri: state.uri,
                headers: Platform.OS === "web" ? undefined : { Authorization: `Bearer ${token}` },
              }}
              style={styles.image}
              resizeMode="contain"
              onError={() => setState({ loading: false, error: true })}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  title: { flex: 1, fontSize: 17, fontWeight: "800", color: colors.white },
  close: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  body: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  message: { color: colors.white, fontSize: 15, textAlign: "center", paddingHorizontal: 24 },
  note: { color: "rgba(255,255,255,0.7)", fontSize: 12, textAlign: "center", padding: 16 },
});