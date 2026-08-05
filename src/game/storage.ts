import type { SaveState } from "./types";
import { DEFAULT_CHARACTER, DEFAULT_CHAT_SETTINGS } from "./types";

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
        playerPersonality:
          (c?.playerPersonality as string) || DEFAULT_CHARACTER.playerPersonality,
        language: (c?.language as string) || DEFAULT_CHARACTER.language,
        appearance:
          (c?.appearance as SaveState["character"]["appearance"]) ?? DEFAULT_CHARACTER.appearance,
        hueShift:
          typeof c?.hueShift === "number" ? (c.hueShift as number) : DEFAULT_CHARACTER.hueShift,
      };
    }
    return parsed;
  } catch { return null; }
}

const CACHE_KEY = "kago_chat_cache";
const CACHE_MAX = 32;

type CacheEntry = { key: string; response: string; ts: number };

export function loadChatCache(): CacheEntry[] {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
  } catch { return []; }
}

export function writeChatCache(entries: CacheEntry[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(entries.slice(-CACHE_MAX)));
}

export function normalizeCacheKey(text: string): string {
  return text.toLowerCase().replace(/[^a-záàâãéèêíìóòôõúùûç0-9\s]/gi, "").replace(/\s+/g, " ").trim();
}

export function findCachedResponse(userMsg: string, cache: CacheEntry[]): string | null {
  const key = normalizeCacheKey(userMsg);
  if (key.length < 3) return null;
  const match = cache.find((e) => e.key === key);
  return match?.response ?? null;
}

export function addCacheEntry(userMsg: string, response: string) {
  const cache = loadChatCache();
  const key = normalizeCacheKey(userMsg);
  if (key.length < 3) return;
  if (cache.some((e) => e.key === key)) return;
  cache.push({ key, response, ts: Date.now() });
  writeChatCache(cache);
}

export function writeSave(s: SaveState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSave() {
  localStorage.removeItem(KEY);
}

// A IA lembra APENAS da conversa atual — não há memória entre conversas.
export function clearLegacyImpressions() {
  localStorage.removeItem("kago_impressions_v1");
}
