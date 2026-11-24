import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createJSONStorage, StateStorage } from "zustand/middleware";

export const persistStorage = createJSONStorage(() => AsyncStorage);

// Telefonda: Keychain / Keystore (xavfsiz).
// Veb (faqat sinov uchun): oddiy brauzer xotirasi, u xavfsiz emas.
const secureStateStorage: StateStorage =
  Platform.OS === "web"
    ? AsyncStorage
    : {
        getItem: (name) => SecureStore.getItemAsync(name),
        setItem: (name, value) => SecureStore.setItemAsync(name, value),
        removeItem: (name) => SecureStore.deleteItemAsync(name),
      };

export const secureJSONStorage = createJSONStorage(() => secureStateStorage);