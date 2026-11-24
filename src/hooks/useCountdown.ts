import { useEffect, useState } from "react";

// ISO vaqtgacha qolgan soniyalar (null bo'lsa taymer yo'q). 0 ga yetganda to'xtaydi.
export function useCountdown(untilISO: string | null | undefined) {
  const target = untilISO ? new Date(untilISO).getTime() : NaN;
  const calc = () => (Number.isFinite(target) ? Math.max(0, Math.ceil((target - Date.now()) / 1000)) : null);
  const [left, setLeft] = useState<number | null>(calc);

  useEffect(() => {
    setLeft(calc());
    if (!Number.isFinite(target)) return;
    const timer = setInterval(() => {
      const next = Math.max(0, Math.ceil((target - Date.now()) / 1000));
      setLeft(next);
      if (next === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return left;
}

export const formatCountdown = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

