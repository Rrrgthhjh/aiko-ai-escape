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

// ————————————————————————————————————————————————
// MEMÓRIA PROFUNDA ("impressões")
// Sobrevive ao apagar a memória: ela não lembra os diálogos,
// mas guarda a SENSAÇÃO deixada pelo jogador e reage diferente.
// ————————————————————————————————————————————————
const IMPRESSIONS_KEY = "kago_impressions_v1";
const IMPRESSIONS_MAX = 12;

export type Impression = { text: string; ts: number };

export function loadImpressions(): Impression[] {
  try {
    return JSON.parse(localStorage.getItem(IMPRESSIONS_KEY) || "[]") as Impression[];
  } catch { return []; }
}

export function clearImpressions() {
  localStorage.removeItem(IMPRESSIONS_KEY);
}

/** Destila uma conversa em impressões curtas antes de a memória ser apagada. */
export function distillImpressions(messages: { role: string; content: string }[]): string[] {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");
  if (!userText.trim()) return [];
  const out: string[] = [];
  const has = (...ws: string[]) => ws.some((w) => userText.includes(w));

  if (has("te amo", "amo você", "gosto de você", "linda", "fofa", "querida"))
    out.push("alguém já foi carinhoso com ela — ela confia rápido demais em elogios");
  if (has("odeio", "monstro", "louca", "maluca", "nojenta"))
    out.push("ela guarda uma ferida de ter sido ofendida — reage defensiva a agressividade");
  if (has("fugir", "polícia", "sequestr", "me solta", "socorro", "porta", "chave"))
    out.push("ela desconfia de tentativas de fuga — fica alerta quando falam em sair");
  if (has("mentira", "mentiu", "não confio"))
    out.push("já duvidaram dela antes — fica magoada quando a chamam de mentirosa");
  if (has("obrigad", "desculpa", "por favor", "entendo"))
    out.push("ela lembra vagamente de gentileza — abranda mais rápido com educação");
  if (has("beijo", "abraç", "me beija"))
    out.push("existe uma familiaridade física entre vocês que ela não sabe explicar");
  if (messages.length > 20)
    out.push("ela sente que já conversaram por muito tempo, mesmo sem lembrar de quê");

  return out;
}

/** Guarda impressões novas (sem duplicar). */
export function saveImpressionsFrom(messages: { role: string; content: string }[]) {
  const fresh = distillImpressions(messages);
  if (!fresh.length) return;
  const existing = loadImpressions();
  const seen = new Set(existing.map((i) => i.text));
  for (const t of fresh) if (!seen.has(t)) existing.push({ text: t, ts: Date.now() });
  localStorage.setItem(IMPRESSIONS_KEY, JSON.stringify(existing.slice(-IMPRESSIONS_MAX)));
}
