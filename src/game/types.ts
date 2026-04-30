export type Character = {
  name: string;
  playerName: string;
  skinColor: string;      // hex
  hairColor: string;      // hex
  hairStyle: HairStyle;
  eyeColor: string;       // hex
  outfitColor: string;    // hex
  outfitStyle: OutfitStyle;
  personality: string;
};

export type HairStyle = "long" | "short" | "twin" | "bob" | "ponytail";
export type OutfitStyle = "dress" | "uniform" | "hoodie" | "yukata";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
};

export type Room = "sala" | "cozinha" | "banheiro" | "quarto";

export type Mood = "calm" | "soft" | "tense" | "angry" | "hopeful";

export type ChatPreset = "economic" | "normal";

export type ChatSettings = {
  preset: ChatPreset;
  maxTokens: number;
  maxMessageLength: number;
  recentLimit: number;
};

export const CHAT_PRESETS: Record<ChatPreset, Omit<ChatSettings, "preset">> = {
  economic: { maxTokens: 60, maxMessageLength: 300, recentLimit: 4 },
  normal: { maxTokens: 120, maxMessageLength: 600, recentLimit: 8 },
};

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  preset: "normal",
  ...CHAT_PRESETS.normal,
};

export type SaveState = {
  character: Character;
  portrait?: string | null; // legado — não usado mais
  messages: ChatMessage[];
  warningSeen: boolean;
  discoveredClues?: string[];
  chatSettings?: ChatSettings;
};

export const DEFAULT_CHARACTER: Character = {
  name: "Aiko",
  playerName: "",
  skinColor: "#f5d6c0",
  hairColor: "#1a1530",
  hairStyle: "long",
  eyeColor: "#8b5cf6",
  outfitColor: "#2a1f3d",
  outfitStyle: "dress",
  personality: "Doce e atenciosa por fora, possessiva por dentro.",
};
