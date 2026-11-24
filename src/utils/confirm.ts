import { Alert, Platform } from "react-native";

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

const webText = (title: string, message?: string) => (message ? `${title}\n\n${message}` : title);

// Ha/yo'q so'raydi. Telefonda Alert, vebda brauzer oynasi.
export function confirmAction({
  title, message, confirmText = "Ha", cancelText = "Bekor qilish", destructive,
}: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === "web") {
    const ok = (globalThis as any).confirm?.(webText(title, message));
    return Promise.resolve(!!ok);
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: "cancel", onPress: () => resolve(false) },
        { text: confirmText, style: destructive ? "destructive" : "default", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}

// Oddiy xabar
export function notify(title: string, message?: string) {
  if (Platform.OS === "web") {
    (globalThis as any).alert?.(webText(title, message));
    return;
  }
  Alert.alert(title, message);
}