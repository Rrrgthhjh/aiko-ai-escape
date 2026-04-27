import type { SaveState } from "./types";

const KEY = "kago_save_v1";

export function loadSave(): SaveState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SaveState;
  } catch { return null; }
}

export function writeSave(s: SaveState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSave() {
  localStorage.removeItem(KEY);
}
