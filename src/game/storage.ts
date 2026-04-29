import type { SaveState } from "./types";
import { DEFAULT_CHARACTER } from "./types";

const KEY = "kago_save_v1";

export function loadSave(): SaveState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveState;
    // Migração: saves antigos usavam campos descritivos (skin/hair/eyes/outfit).
    // Se os novos campos de cor não existem, restaura a aparência padrão.
    const c = parsed.character as unknown as Record<string, unknown>;
    if (!c?.skinColor || !c?.hairColor || !c?.eyeColor || !c?.outfitColor) {
      parsed.character = {
        ...DEFAULT_CHARACTER,
        name: (c?.name as string) || DEFAULT_CHARACTER.name,
        playerName: (c?.playerName as string) || DEFAULT_CHARACTER.playerName,
        personality: (c?.personality as string) || DEFAULT_CHARACTER.personality,
      };
    }
    return parsed;
  } catch { return null; }
}

export function writeSave(s: SaveState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSave() {
  localStorage.removeItem(KEY);
}
