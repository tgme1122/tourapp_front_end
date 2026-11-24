import { create } from "zustand";
import { persist } from "zustand/middleware";
import { secureJSONStorage } from "./storage";
import * as authService from "@/services/auth";
import { configureApi } from "@/services/api";
import { queryClient } from "@/services/queryClient";
import { useUser } from "./user";
import { useCards } from "./cards";
import { useReviews } from "./reviews";
import { useFavorites } from "./favorites";
import { useSettings } from "./settings";


const resetPersonalData = () => {
  queryClient.clear();
  useFavorites.setState({ ids: [] });
  useCards.getState().clear();
  useReviews.getState().clear();
  useSettings.setState({ push: true, priceDrop: true, agencyMessages: true, language: "uz" });
};

type AuthState = {
  token: string | null;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (input: authService.RegisterInput) => Promise<void>;
  signUpAgency: (input: authService.AgencyRegisterInput) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<"signed-in" | "verified">;
  resendCode: (email: string) => Promise<void>;
  signOut: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => {
      // Token bilan /auth/me ni chaqirib, rolni tekshiramiz va profilni saqlaymiz
      const finishSignIn = async (token: string) => {
        const me = await authService.me(token);
        resetPersonalData();
        useUser.getState().setUser(authService.toProfile(me));
        queryClient.setQueryData(["me"], me);
        set({ token });
      };

      return {
        token: null,

        signIn: async (identifier, password) => {
          const { token } = await authService.login(identifier, password);
          await finishSignIn(token);
        },

        signUp: async (input) => {
          const { token } = await authService.registerTraveler(input);
          // Backend token qaytarmasa, shu ma'lumotlar bilan o'zimiz kiramiz
          const finalToken = token ?? (await authService.login(input.email, input.password)).token;
          await finishSignIn(finalToken);
        },

        signUpAgency: async (input) => {
          await authService.registerAgency(input);
        },

        verifyEmail: async (email, code) => {
          const { token } = await authService.verifyEmail(email, code);
          if (token) {
            await finishSignIn(token);
            return "signed-in";
          }
          return "verified";
        },

        resendCode: async (email) => {
          await authService.resendCode(email);
        },
          signOut: () => {
          set({ token: null });
          useUser.getState().reset();
          resetPersonalData();
        },
      };
    },
    {
      name: "auth-v1",
      storage: secureJSONStorage,
      partialize: (s) => ({ token: s.token }),
    }
  )
);

// API mijozini tokenga ulaymiz
configureApi({
  getToken: () => useAuth.getState().token,
  onUnauthorized: () => useAuth.getState().signOut(),
});