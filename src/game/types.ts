export type Character = {
  name: string;
  playerName: string;
  personality: string;
  /** Personalidade/traços do jogador — usada pela IA para reagir a você de forma coerente. */
  playerPersonality?: string;
  /** Variante visual legada do avatar. Mantida só para migrar saves antigos. */
  appearance?: AppearanceVariant;
  /** Campo legado da antiga paleta por filtro CSS. */
  hueShift?: number;
  /** Penteado selecionado no sistema atual. */
  hairStyle?: HairStyle;
  /** Roupa selecionada no sistema atual. */
  outfitStyle?: OutfitStyle;
  // Campos legados — mantidos opcionais para retrocompatibilidade de saves antigos
  skinColor?: string;
  hairColor?: string;
  eyeColor?: string;
  outfitColor?: string;
};

export type AppearanceVariant =
  | "dress"        // padrão: cabelo longo + vestido roxo
  | "hair-bob"
  | "hair-short"
  | "hair-twin"
  | "hair-ponytail"
  | "outfit-uniform"
  | "outfit-hoodie"
  | "outfit-yukata";

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
  portrait?: string | null; // legado
  messages: ChatMessage[];
  warningSeen: boolean;
  discoveredClues?: string[];
  chatSettings?: ChatSettings;
};

export const DEFAULT_CHARACTER: Character = {
  name: "Aiko",
  playerName: "",
  personality: "Doce e atenciosa por fora, possessiva por dentro.",
  playerPersonality: "Curioso(a), cauteloso(a) e observador(a). Tenta entender antes de agir.",
  appearance: "dress",
  hueShift: 0,
  hairStyle: "long",
  outfitStyle: "dress",
};
