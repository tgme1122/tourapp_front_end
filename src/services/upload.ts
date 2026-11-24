import { Platform } from "react-native";

export type PickedFile = {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
  file?: File | null;
};

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "audio/mp4": "m4a",
  "audio/m4a": "m4a",
  "audio/x-m4a": "m4a",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/mpeg": "mp3",
  "application/pdf": "pdf",
};

const extFromMime = (mime?: string | null): string | null => {
  if (!mime) return null;
  const base = mime.split(";")[0].trim().toLowerCase();
  return MIME_EXT[base] ?? null;
};

export const appendFile = async (
  form: FormData,
  field: string,
  file: PickedFile,
  fallbackName = "image.jpg"
) => {
  const rawName = file.fileName?.trim() || fallbackName;
  if (Platform.OS === "web") {
    if (file.file) {
      form.append(field, file.file, rawName);
      return;
    }
    const res = await fetch(file.uri);
    const blob = await res.blob();
    const ext = extFromMime(blob.type || file.mimeType);
    const finalName = /\.[a-z0-9]+$/i.test(rawName)
      ? rawName
      : `${rawName.replace(/\.+$/, "") || "file"}.${ext ?? "bin"}`;
    form.append(field, blob, finalName);
  } else {
    form.append(field, {
      uri: file.uri,
      name: rawName,
      type: file.mimeType ?? "application/octet-stream",
    } as unknown as Blob);
  }
};
