import { Platform } from "react-native";
import { api, isApiError } from "./api";
import { rawPhone, type ApiUser } from "./auth";

export type UpdateProfileInput = {
  firstName: string;
  lastName: string;
  phone: string;
};

// Profilni serverda yangilaydi. Server yangilangan foydalanuvchini qaytarsa, shuni olamiz.
export const updateMe = (input: UpdateProfileInput) =>
  api<ApiUser | undefined>("/users/me", {
    method: "PATCH",
    body: {
      first_name: input.firstName,
      last_name: input.lastName,
      phone: rawPhone(input.phone),
    },
  });

export const deleteMe = () => api<void>("/users/me", { method: "DELETE" });

// ---------------------------------------------------------------- avatar
type PickedFile = { uri: string; mimeType?: string | null; fileName?: string | null };

const buildForm = async (field: string, file: PickedFile) => {
  const form = new FormData();
  const name = file.fileName ?? "avatar.jpg";

  if (Platform.OS === "web") {
    const blob = await (await fetch(file.uri)).blob();
    form.append(field, blob, name);
  } else {
    form.append(field, {
      uri: file.uri,
      name,
      type: file.mimeType ?? "image/jpeg",
    } as unknown as Blob);
  }
  return form;
};

export const uploadAvatar = async (file: PickedFile) => {
  const send = async (field: string) =>
    api<ApiUser | undefined>("/users/me/avatar", {
      method: "PUT",
      form: await buildForm(field, file),
    });

  try {
    return await send("file");
  } catch (e) {
    // Maydon nomi boshqacha bo'lsa, server 422 da qaysi nom kerakligini aytadi
    if (isApiError(e) && e.status === 422) {
      const field = Object.keys(e.fieldErrors)[0];
      if (field && field !== "file") return send(field);
    }
    throw e;
  }
};

export const deleteAvatar = () => api<void>("/users/me/avatar", { method: "DELETE" });