export type Character = {
  name: string;
  playerName: string;
  skin: string;
  hair: string;
  eyes: string;
  outfit: string;
  personality: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
};

export type Room = "sala" | "cozinha" | "banheiro" | "quarto";

export type Mood = "calm" | "soft" | "tense" | "angry" | "hopeful";

export type SaveState = {
  character: Character;
  portrait: string | null; // data URL
  messages: ChatMessage[];
  warningSeen: boolean;
  discoveredClues?: string[];
};

export const DEFAULT_CHARACTER: Character = {
  name: "Aiko",
  playerName: "",
  skin: "Clara",
  hair: "Longo preto azulado",
  eyes: "Violeta",
  outfit: "Vestido escuro com detalhes brancos",
  personality: "Doce e atenciosa por fora, possessiva por dentro.",
};
