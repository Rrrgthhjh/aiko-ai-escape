import type { ChatMessage, Mood, Room } from "./types";

export const ROOM_CLUES: Record<Room, { id: string; label: string; reveal: string }> = {
  sala: {
    id: "photo-frame",
    label: "porta-retrato virado",
    reveal: "No porta-retrato há uma foto sua dormindo nesta casa. No verso, está escrito: 'agora ela vai ficar'.",
  },
  cozinha: {
    id: "locked-drawer",
    label: "gaveta trancada",
    reveal: "Dentro da gaveta há uma chave pequena e um bilhete amassado: 'não deixar perto da porta'.",
  },
  banheiro: {
    id: "mirror-mark",
    label: "espelho embaçado",
    reveal: "No vapor do espelho aparece uma frase escrita antes: 'não confie no chá'.",
  },
  quarto: {
    id: "diary-page",
    label: "página de diário",
    reveal: "A página diz que ela ensaiou várias formas de convencer você de que tudo era normal.",
  },
};

const softWords = ["por favor", "confio", "entendo", "desculpa", "sinto", "calma", "obrigado", "obrigada"];
const tenseWords = ["mentira", "raptou", "sequestro", "fugir", "polícia", "porta", "chave", "preso", "presa"];
const angryWords = ["odeio", "monstro", "louca", "maluca", "nojenta", "cala", "ameaça"];

export function analyzeGameState(messages: ChatMessage[], discoveredCount: number) {
  const userText = messages.filter((m) => m.role === "user").map((m) => m.content.toLowerCase()).join(" ");
  const soft = softWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const tense = tenseWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const angry = angryWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const turns = messages.filter((m) => m.role === "user").length;

  const persuasion = Math.max(0, Math.min(100, 12 + turns * 4 + soft * 9 + discoveredCount * 12 - angry * 12));
  const suspicion = Math.max(0, Math.min(100, 18 + tense * 10 + angry * 18 + discoveredCount * 8 - soft * 4));

  let mood: Mood = "calm";
  if (persuasion >= 70) mood = "hopeful";
  else if (angry > 0 || suspicion >= 70) mood = "angry";
  else if (suspicion >= 45) mood = "tense";
  else if (soft > 0) mood = "soft";

  return { mood, persuasion, suspicion };
}

export const MOOD_LABELS: Record<Mood, string> = {
  calm: "controlada",
  soft: "tocada",
  tense: "desconfiada",
  angry: "ferida",
  hopeful: "vulnerável",
};
