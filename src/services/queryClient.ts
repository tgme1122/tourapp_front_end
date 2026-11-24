import { AppState } from "react-native";
import { focusManager, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = (error as { status?: number }).status ?? 0;
        if (status >= 400 && status < 500) return false; // mijoz xatolarini qayta urinmaymiz
        return failureCount < 2;
      },
    },
  },
});

// Ilova fondan qaytganda ma'lumotlarni yangilash
AppState.addEventListener("change", (state) => {
  focusManager.setFocused(state === "active");
});