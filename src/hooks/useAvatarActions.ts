import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@/store/user";
import { deleteAvatar, uploadAvatar } from "@/services/users";
import { isApiError } from "@/services/api";
import { queryClient } from "@/services/queryClient";
import { notify } from "@/utils/confirm";

export function useAvatarActions() {
  const photoUri = useUser((s) => s.user.photoUri);
  const update = useUser((s) => s.update);

  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const refreshMe = () => queryClient.invalidateQueries({ queryKey: ["me"] });
  const message = (e: unknown) => (isApiError(e) ? e.message : "Qayta urinib ko'ring.");

  const pickAndUpload = async () => {
    setVisible(false);

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (res.canceled) return;

    const asset = res.assets[0];
    const previous = photoUri;
    update({ photoUri: asset.uri }); // darrov ko'rsatamiz

    setBusy(true);
    try {
      await uploadAvatar({ uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName });
      await refreshMe(); // serverdagi haqiqiy manzilni olamiz
    } catch (e) {
      update({ photoUri: previous });
      notify("Rasmni saqlab bo'lmadi", message(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setVisible(false);
    const previous = photoUri;
    update({ photoUri: null });

    setBusy(true);
    try {
      await deleteAvatar();
      await refreshMe();
    } catch (e) {
      update({ photoUri: previous });
      notify("Rasmni o'chirib bo'lmadi", message(e));
    } finally {
      setBusy(false);
    }
  };

  // Rasm yo'q bo'lsa to'g'ridan-to'g'ri tanlash, bor bo'lsa menyu
  const openMenu = () => {
    if (busy) return;
    if (!photoUri) {
      pickAndUpload();
      return;
    }
    setVisible(true);
  };

  return {
    openMenu,
    busy,
    sheetProps: {
      visible,
      hasPhoto: !!photoUri,
      onPick: pickAndUpload,
      onRemove: remove,
      onClose: () => setVisible(false),
    },
  };
}