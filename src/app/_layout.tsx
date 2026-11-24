import { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import AnimatedSplash from "@/components/ui/AnimatedSplash";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useStoresHydrated } from "@/hooks/useStoresHydrated";
import { queryClient } from "@/services/queryClient";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";

SplashScreen.preventAutoHideAsync().catch(() => {});

const MIN_SPLASH_MS = 900;
const HYDRATION_TIMEOUT_MS = 3000;

function RealtimeBridge() {
  useRealtimeSync();
  return null;
}

function GuardedStack() {
  const token = useAuth((s) => s.token);
  const role = useUser((s) => s.user.role);
  const authed = !!token;
  const isTraveler = authed && role === "traveler";

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={authed}>
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="tour/[id]" />
      </Stack.Protected>

      <Stack.Protected guard={isTraveler}>
        <Stack.Screen name="saved" />
        <Stack.Screen name="my-reviews" />
        <Stack.Screen name="payment-methods" />
        <Stack.Screen name="add-card" />
        <Stack.Screen name="booking/[tourId]" />
        <Stack.Screen name="booking/pay/[id]" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const hydrated = useStoresHydrated();
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const id = "sayohat-no-focus-outline";
      if (!document.getElementById(id)) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent =
          "input,textarea,select,input:focus,textarea:focus,select:focus,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:none!important;outline-width:0!important;box-shadow:none!important;}";
        document.head.appendChild(s);
      }
    }
    const t1 = setTimeout(() => setMinTimePassed(true), MIN_SPLASH_MS);
    const t2 = setTimeout(() => setTimedOut(true), HYDRATION_TIMEOUT_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const appReady = hydrated || timedOut;

  const hideNativeSplash = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const finish = useCallback(() => setSplashDone(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeBridge />
      <View style={{ flex: 1 }} onLayout={hideNativeSplash}>
        {appReady && <GuardedStack />}
        {!splashDone && (
          <AnimatedSplash ready={appReady && minTimePassed} onFinish={finish} />
        )}
      </View>
    </QueryClientProvider>
  );
}