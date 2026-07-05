import type { ChatMessage, Mood, Room } from "./types";
import { extractActions, detectMoodFromActions } from "./actionParser";

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
const shyWords = ["fofa", "linda", "bonita", "gata", "amo você", "te amo", "beijo", "gosto de você", "cheirosa", "querida"];
const happyWords = ["haha", "kkkk", "rsrs", "engraçad", "brincadeira", "feliz", "alegr", "divertid", "adorei", "que legal"];
const sadWords = ["triste", "sozinh", "vazio", "chorar", "chorei", "solidão", "abandon", "perdi", "morreu", "saudade"];
const surprisedWords = ["sério?", "sério!", "o quê", "o que?!", "não acredito", "impossível", "jura", "nossa", "uau", "meu deus"];
const cryingWords = ["me machuca", "me odeia", "vai me deixar", "vai embora", "não me ama", "não me quer", "sou horrível", "sou péssim"];

const MOOD_TRIGGERS: Record<Exclude<Mood, "calm" | "hopeful" | "soft" | "tense">, string[]> = {
  shy: shyWords,
  happy: happyWords,
  sad: sadWords,
  surprised: surprisedWords,
  crying: cryingWords,
  angry: angryWords,
};

function findTriggers(text: string, words: string[]): string[] {
  return words.filter((w) => text.includes(w));
}

export function analyzeGameState(messages: ChatMessage[], discoveredCount: number) {
  const userText = messages.filter((m) => m.role === "user").map((m) => m.content.toLowerCase()).join(" ");
  const soft = softWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const tense = tenseWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const angry = angryWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const shy = shyWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const happy = happyWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const sad = sadWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const surprised = surprisedWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const crying = cryingWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  // Considera apenas a última mensagem do usuário para "reação imediata"
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content.toLowerCase() ?? "";
  const recentShy = shyWords.some((w) => lastUser.includes(w));
  const recentHappy = happyWords.some((w) => lastUser.includes(w));
  const recentSad = sadWords.some((w) => lastUser.includes(w));
  const recentSurprised = surprisedWords.some((w) => lastUser.includes(w));
  const recentCrying = cryingWords.some((w) => lastUser.includes(w));
  const recentAngry = angryWords.some((w) => lastUser.includes(w));
  const turns = messages.filter((m) => m.role === "user").length;

  const persuasion = Math.max(0, Math.min(100, 12 + turns * 4 + soft * 9 + discoveredCount * 12 - angry * 12));
  const suspicion = Math.max(0, Math.min(100, 18 + tense * 10 + angry * 18 + discoveredCount * 8 - soft * 4));

  // ————————————————————————————————————————————
  // Prioridade #1: emoção sinalizada por AÇÃO (*...*)
  // Lê as ações da última mensagem da IA e do jogador.
  // ————————————————————————————————————————————
  const lastAiContent = [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
  const lastUserContent = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const actionMood = detectMoodFromActions([
    ...extractActions(lastAiContent),
    ...extractActions(lastUserContent),
  ]);
  if (actionMood) {
    return {
      mood: actionMood.mood,
      persuasion,
      suspicion,
      triggers: [actionMood.trigger],
      confidence: 95,
    };
  }

  let mood: Mood = "calm";
  // Reações imediatas à última fala têm prioridade
  if (recentCrying) mood = "crying";
  else if (recentAngry) mood = "angry";
  else if (recentSurprised) mood = "surprised";
  else if (recentShy) mood = "shy";
  else if (recentHappy) mood = "happy";
  else if (recentSad) mood = "sad";
  else if (crying > 0 && suspicion > 60) mood = "crying";
  else if (persuasion >= 70) mood = "hopeful";
  else if (angry > 0 || suspicion >= 70) mood = "angry";
  else if (surprised > 0) mood = "surprised";
  else if (suspicion >= 45) mood = "tense";
  else if (sad > 0) mood = "sad";
  else if (happy > 0) mood = "happy";
  else if (shy > 0) mood = "shy";
  else if (soft > 0) mood = "soft";

  // Palavras que dispararam a mudança (baseado na última fala; fallback: histórico).
  const triggerBank =
    mood === "shy" ? shyWords :
    mood === "happy" ? happyWords :
    mood === "sad" ? sadWords :
    mood === "surprised" ? surprisedWords :
    mood === "crying" ? cryingWords :
    mood === "angry" ? angryWords :
    mood === "tense" ? tenseWords :
    mood === "soft" ? softWords :
    [];
  let triggers = findTriggers(lastUser, triggerBank);
  if (triggers.length === 0) triggers = findTriggers(userText, triggerBank).slice(-3);

  // Confiança do detector: quão fortes são os sinais para esse humor.
  const raw =
    mood === "shy" ? shy * 30 :
    mood === "happy" ? happy * 28 :
    mood === "sad" ? sad * 28 :
    mood === "surprised" ? surprised * 34 :
    mood === "crying" ? crying * 40 + (suspicion > 60 ? 15 : 0) :
    mood === "angry" ? angry * 32 + (suspicion >= 70 ? 20 : 0) :
    mood === "tense" ? Math.max(0, suspicion - 30) * 1.4 :
    mood === "soft" ? soft * 20 :
    mood === "hopeful" ? Math.max(0, persuasion - 60) * 2 :
    20;
  const confidence = Math.max(10, Math.min(100, Math.round(raw + (triggers.length ? 20 : 0))));

  return { mood, persuasion, suspicion, triggers, confidence };
}

export const MOOD_LABELS: Record<Mood, string> = {
  calm: "controlada",
  soft: "tocada",
  tense: "desconfiada",
  angry: "ferida",
  hopeful: "vulnerável",
  shy: "envergonhada",
  happy: "feliz",
  sad: "triste",
  surprised: "surpresa",
  crying: "chorando",
};
