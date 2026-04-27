export type Character = {
  name: string;
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

export type SaveState = {
  character: Character;
  portrait: string | null; // data URL
  messages: ChatMessage[];
  warningSeen: boolean;
};

export const DEFAULT_CHARACTER: Character = {
  name: "",
  skin: "Clara",
  hair: "Longo, preto azulado",
  eyes: "Violeta",
  outfit: "Vestido escuro com detalhes brancos",
  personality: "Doce e atenciosa por fora, possessiva por dentro.",
};
