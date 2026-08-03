import type { ChatMessage, Mood } from "./types";
import { detectMoodFromMessage } from "./actionParser";

const softWords = ["por favor", "confio", "entendo", "desculpa", "sinto", "calma", "obrigado", "obrigada"];
const tenseWords = ["mentira", "mentiu", "não confio", "estranho", "esquisito", "desconfio"];
const angryWords = ["odeio", "monstro", "louca", "maluca", "nojenta", "cala", "ameaça"];
const shyWords = ["fofa", "linda", "bonita", "gata", "amo você", "te amo", "beijo", "gosto de você", "cheirosa", "querida"];
const happyWords = ["haha", "kkkk", "rsrs", "engraçad", "brincadeira", "feliz", "alegr", "divertid", "adorei", "que legal"];
const sadWords = ["triste", "sozinh", "vazio", "chorar", "chorei", "solidão", "abandon", "perdi", "morreu", "saudade"];
const surprisedWords = ["sério?", "sério!", "o quê", "o que?!", "não acredito", "impossível", "jura", "nossa", "uau", "meu deus"];
const cryingWords = ["me machuca", "me odeia", "vai me deixar", "vai embora", "não me ama", "não me quer", "sou horrível", "sou péssim"];
const blushWords = ["me deixa vermelha", "cora forte", "que vergonha", "fiquei sem graça", "para com isso", "não fala assim", "que fofura"];
const flirtyWords = ["gostosa", "vem cá", "vem aqui", "que tal", "me beija", "brincadeira safada", "que provocante", "sedutora", "malandra"];
const scaredWords = ["me machucar", "vai me matar", "medo de você", "estou com medo", "não chega perto", "me solta", "socorro", "afasta"];
const sleepyWords = ["boa noite", "estou com sono", "que sono", "cansada", "vamos dormir", "durma", "vamos deitar", "cochilar"];

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
  const blush = blushWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const flirty = flirtyWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const scared = scaredWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  const sleepy = sleepyWords.reduce((n, w) => n + (userText.includes(w) ? 1 : 0), 0);
  // Considera apenas a última mensagem do usuário para "reação imediata"
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content.toLowerCase() ?? "";
  const recentShy = shyWords.some((w) => lastUser.includes(w));
  const recentHappy = happyWords.some((w) => lastUser.includes(w));
  const recentSad = sadWords.some((w) => lastUser.includes(w));
  const recentSurprised = surprisedWords.some((w) => lastUser.includes(w));
  const recentCrying = cryingWords.some((w) => lastUser.includes(w));
  const recentAngry = angryWords.some((w) => lastUser.includes(w));
  const recentBlush = blushWords.some((w) => lastUser.includes(w));
  const recentFlirty = flirtyWords.some((w) => lastUser.includes(w));
  const recentScared = scaredWords.some((w) => lastUser.includes(w));
  const recentSleepy = sleepyWords.some((w) => lastUser.includes(w));
  const turns = messages.filter((m) => m.role === "user").length;

  // Intensidade emocional bruta (sem barras de progresso na UI).
  const warmth = Math.max(0, Math.min(100, 12 + turns * 4 + soft * 9 - angry * 12));
  const tension = Math.max(0, Math.min(100, 8 + tense * 10 + angry * 18 - soft * 4));

  // ————————————————————————————————————————————
  // Prioridade #1: emoção sinalizada por AÇÃO (*...*)
  // Lê as ações da última mensagem da IA e do jogador.
  // ————————————————————————————————————————————
  // Autorizador CONTEXTUAL: lê a mensagem INTEIRA (ações + narração),
  // entendendo negações como "o sorriso desaparece".
  const lastAiContent = [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
  const lastUserContent = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const actionMoodResult =
    detectMoodFromMessage(lastAiContent) ?? detectMoodFromMessage(lastUserContent);
  if (actionMoodResult) {
    return {
      mood: actionMoodResult.mood,
      secondaryMood: actionMoodResult.secondary,
      triggers: [actionMoodResult.trigger],
      confidence: 95,
    };
  }

  let mood: Mood = "calm";
  // Reações imediatas à última fala têm prioridade
  if (recentScared) mood = "scared";
  else if (recentCrying) mood = "crying";
  else if (recentAngry) mood = "angry";
  else if (recentBlush) mood = "blush";
  else if (recentFlirty) mood = "flirty";
  else if (recentSleepy) mood = "sleepy";
  else if (recentSurprised) mood = "surprised";
  else if (recentShy) mood = "shy";
  else if (recentHappy) mood = "happy";
  else if (recentSad) mood = "sad";
  else if (scared > 0) mood = "scared";
  else if (crying > 0 && tension > 60) mood = "crying";
  else if (warmth >= 70) mood = "hopeful";
  else if (angry > 0 || tension >= 70) mood = "angry";
  else if (blush > 0) mood = "blush";
  else if (flirty > 0) mood = "flirty";
  else if (sleepy > 0) mood = "sleepy";
  else if (surprised > 0) mood = "surprised";
  else if (tension >= 45) mood = "tense";
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
    mood === "blush" ? blushWords :
    mood === "flirty" ? flirtyWords :
    mood === "scared" ? scaredWords :
    mood === "sleepy" ? sleepyWords :
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
    mood === "crying" ? crying * 40 + (tension > 60 ? 15 : 0) :
    mood === "angry" ? angry * 32 + (tension >= 70 ? 20 : 0) :
    mood === "tense" ? Math.max(0, tension - 30) * 1.4 :
    mood === "soft" ? soft * 20 :
    mood === "hopeful" ? Math.max(0, warmth - 60) * 2 :
    20;
  const confidence = Math.max(10, Math.min(100, Math.round(raw + (triggers.length ? 20 : 0))));

  return { mood, secondaryMood: undefined as Mood | undefined, triggers, confidence };
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
  blush: "muito ruborizada",
  flirty: "provocante",
  scared: "assustada",
  sleepy: "sonolenta",
  happySlight: "levemente contente",
  blushLight: "levemente corada",
  tearSingle: "com uma lágrima",
  angrySlight: "levemente irritada",
};
