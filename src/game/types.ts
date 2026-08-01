export type Character = {
  name: string;
  playerName: string;
  personality: string;
  /** Personalidade/traços do jogador — usada pela IA para reagir a você de forma coerente. */
  playerPersonality?: string;
  /** Variante visual do avatar (penteado OU roupa). Default: dress (long hair + purple dress). */
  appearance?: AppearanceVariant;
  /** Matiz CSS aplicada via filter:hue-rotate. 0 = imagem original. */
  hueShift?: number;
  // Campos legados — mantidos opcionais para retrocompatibilidade de saves antigos
  skinColor?: string;
  hairColor?: string;
  hairStyle?: HairStyle;
  eyeColor?: string;
  outfitColor?: string;
  outfitStyle?: OutfitStyle;
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

/** Locais macro do jogo. */
export type Place = "casa" | "parque" | "shopping";

/** Sub-local (cômodo/ponto) dentro de um Place. */
export type Room =
  // casa
  | "sala" | "cozinha" | "banheiro" | "quarto"
  // parque
  | "lago" | "quadra"
  // shopping
  | "loja-de-roupas" | "fast-food" | "loja-de-brinquedos";

export const PLACE_ROOMS: Record<Place, Room[]> = {
  casa: ["sala", "cozinha", "banheiro", "quarto"],
  parque: ["lago", "quadra"],
  shopping: ["loja-de-roupas", "fast-food", "loja-de-brinquedos"],
};

export const PLACE_LABELS: Record<Place, string> = {
  casa: "Casa",
  parque: "Parque",
  shopping: "Shopping",
};

export const ROOM_LABELS: Record<Room, string> = {
  sala: "Sala",
  cozinha: "Cozinha",
  banheiro: "Banheiro",
  quarto: "Quarto",
  lago: "Lago",
  quadra: "Quadra",
  "loja-de-roupas": "Loja de roupas",
  "fast-food": "Praça de alimentação",
  "loja-de-brinquedos": "Loja de brinquedos",
};

export function placeOfRoom(room: Room): Place {
  for (const p of Object.keys(PLACE_ROOMS) as Place[]) {
    if (PLACE_ROOMS[p].includes(room)) return p;
  }
  return "casa";
}

/** Locais públicos: ações íntimas devem ser recusadas pela IA. */
export function isPublicPlace(room: Room): boolean {
  return placeOfRoom(room) !== "casa";
}

export type Mood =
  | "calm"
  | "soft"
  | "tense"
  | "angry"
  | "hopeful"
  | "shy"
  | "happy"
  | "sad"
  | "surprised"
  | "crying"
  | "blush"
  | "flirty"
  | "scared"
  | "sleepy"
  // ——— variações de INTENSIDADE ———
  | "happySlight"   // sorriso pequeno
  | "blushLight"    // corar levemente
  | "tearSingle"    // uma lágrima solitária
  | "angrySlight";  // irritação contida

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
};
