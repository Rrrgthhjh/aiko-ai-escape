import type { Mood, Room } from "./types";

/** Extrai o conteúdo entre asteriscos (ações da narração). */
export function extractActions(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/\*([^*]+)\*/g) || [];
  return matches.map((m) => m.slice(1, -1).toLowerCase().trim()).filter(Boolean);
}

const ROOM_KEYWORDS: Record<Room, string[]> = {
  sala: ["sala", "living room", "sala de estar", "salón", "salon"],
  cozinha: ["cozinha", "kitchen", "cocina"],
  banheiro: ["banheiro", "bathroom", "baño", "toilet", "lavabo"],
  quarto: ["quarto", "bedroom", "dormitorio", "recámara"],
};

/**
 * "Autorizador" de troca de cômodo:
 * só troca se o nome do cômodo estiver dentro de *asteriscos* (ação real, não fala).
 */
export function detectRoomFromActions(actions: string[]): Room | null {
  for (const a of actions) {
    for (const room of Object.keys(ROOM_KEYWORDS) as Room[]) {
      if (ROOM_KEYWORDS[room].some((k) => a.includes(k))) return room;
    }
  }
  return null;
}

/** Palavras-chave de emoção dentro de ações (*...*). */
const MOOD_ACTION_KEYWORDS: Partial<Record<Mood, string[]>> = {
  shy: ["cora", "coro", "blush", "envergonh", "ruboriz", "bochechas vermelhas", "olhar tímido", "tímida"],
  happy: ["sorri", "gargalha", "risadinha", "smiles", "laughs", "sonrí"],
  sad: ["suspira triste", "olha para baixo", "lágrima escorre", "sighs sadly", "cabisbaix"],
  crying: ["chora", "soluç", "lágrimas escorrem", "cries", "sobs"],
  angry: ["grita", "cerra os punhos", "range os dentes", "bate", "shouts", "glares", "franze o cenho"],
  surprised: ["arregala os olhos", "boquiaberta", "engasga", "gasps", "eyes widen", "recua surpres"],
  tense: ["se afasta", "recua", "tensa", "aperta os punhos", "morde o lábio"],
  soft: ["acaricia", "abraça", "sorri suavemente", "encosta a mão"],
  hopeful: ["olha esperançosa", "respira aliviada"],
};

/**
 * "Autorizador" de troca de emoção pelas ações:
 * lê apenas o que está dentro de *asteriscos*.
 */
export function detectMoodFromActions(actions: string[]): { mood: Mood; trigger: string } | null {
  for (const a of actions) {
    for (const mood of Object.keys(MOOD_ACTION_KEYWORDS) as Mood[]) {
      const kws = MOOD_ACTION_KEYWORDS[mood]!;
      const hit = kws.find((k) => a.includes(k));
      if (hit) return { mood, trigger: hit };
    }
  }
  return null;
}

/** Detecção simples de idioma baseada em marcadores. */
export function detectLanguage(text: string): string {
  const t = (text || "").toLowerCase();
  if (!t.trim()) return "pt-BR (português brasileiro)";
  if (/[一-龯ぁ-んァ-ン]/.test(t)) return "ja (日本語)";
  if (/[가-힣]/.test(t)) return "ko (한국어)";
  if (/[\u0400-\u04FF]/.test(t)) return "ru (русский)";
  if (/[ãõ]|\bvocê\b|\bnão\b|\bobrigad|\bentão\b|\bmuito\b|\baqui\b/.test(t)) return "pt-BR (português brasileiro)";
  if (/[ñ¿¡]|\bhola\b|\bgracias\b|\bpero\b|\bestoy\b|\btú\b|\bqué\b/.test(t)) return "es (español)";
  if (/[àâçéèêëîïôûùüÿ]|\bbonjour\b|\bmerci\b|\bpourquoi\b|\bvous\b/.test(t)) return "fr (français)";
  if (/[äöüß]|\bdanke\b|\bbitte\b|\bnicht\b|\bund\b|\bich\b/.test(t)) return "de (deutsch)";
  if (/[àèéìòù]|\bciao\b|\bgrazie\b|\bperché\b|\bsono\b/.test(t)) return "it (italiano)";
  if (/\b(the|you|hello|hi|what|how|are|please|thanks|why|where)\b/.test(t)) return "en (English)";
  return "pt-BR (português brasileiro)";
}