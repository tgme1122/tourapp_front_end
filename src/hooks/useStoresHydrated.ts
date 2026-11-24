import { useEffect, useState } from "react";
import { useApp } from "@/store/app";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";
import { useSettings } from "@/store/settings";
import { useCards } from "@/store/cards";
import { useReviews } from "@/store/reviews";

const stores = [useApp, useAuth, useUser, useSettings, useCards, useReviews];

export function useStoresHydrated() {
  const [ready, setReady] = useState(() => stores.every((s) => s.persist.hasHydrated()));

  useEffect(() => {
    const check = () => setReady(stores.every((s) => s.persist.hasHydrated()));
    const unsubs = stores.map((s) => s.persist.onFinishHydration(check));
    check();
    return () => unsubs.forEach((u) => u());
  }, []);

  return ready;
}