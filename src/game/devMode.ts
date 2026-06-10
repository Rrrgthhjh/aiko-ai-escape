const KEY = "kago_dev_mode";
export const DEV_PASSWORD = "pneumoultramicroscopicossilicovulcanoconiotico";
export const DEV_MAX_MESSAGE_LENGTH = 1000;

export function isDevMode(): boolean {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}

export function setDevMode(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {}
  try { window.dispatchEvent(new Event("kago-dev-mode-change")); } catch {}
}

import { useEffect, useState } from "react";
export function useDevMode() {
  const [on, setOn] = useState<boolean>(() => isDevMode());
  useEffect(() => {
    const h = () => setOn(isDevMode());
    window.addEventListener("kago-dev-mode-change", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("kago-dev-mode-change", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return on;
}