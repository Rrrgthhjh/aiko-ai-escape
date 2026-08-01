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
  lago: ["lago", "lake", "beira do lago", "pond"],
  quadra: ["quadra", "court", "cancha", "quadra de esportes", "basketball court"],
  "loja-de-roupas": ["loja de roupas", "clothing store", "provador", "tienda de ropa", "boutique"],
  "fast-food": ["praça de alimentação", "fast food", "fast-food", "lanchonete", "food court"],
  "loja-de-brinquedos": ["loja de brinquedos", "toy store", "brinquedos", "juguetería"],
};

/** Palavras que indicam ir para um local macro sem citar sub-local. */
export const PLACE_KEYWORDS: Record<"casa" | "parque" | "shopping", string[]> = {
  casa: ["para casa", "pra casa", "de volta pra casa", "de volta para casa", "back home", "a casa"],
  parque: ["parque", "park", "parque da cidade"],
  shopping: ["shopping", "mall", "centro comercial"],
};

/**
 * "Autorizador" de troca de cômodo:
 * só troca se o nome do cômodo estiver dentro de *asteriscos* (ação real, não fala).
 */
export function detectRoomFromActions(actions: string[]): Room | null {
  // Sub-locais específicos vencem locais macro (ex.: "lago" antes de "parque").
  for (const a of actions) {
    for (const room of Object.keys(ROOM_KEYWORDS) as Room[]) {
      if (ROOM_KEYWORDS[room].some((k) => a.includes(k))) return room;
    }
  }
  const FIRST_OF_PLACE: Record<"casa" | "parque" | "shopping", Room> = {
    casa: "sala", parque: "lago", shopping: "loja-de-roupas",
  };
  for (const a of actions) {
    for (const place of Object.keys(PLACE_KEYWORDS) as Array<"casa" | "parque" | "shopping">) {
      if (PLACE_KEYWORDS[place].some((k) => a.includes(k))) return FIRST_OF_PLACE[place];
    }
  }
  return null;
}

/** Palavras-chave de emoção dentro de ações (*...*). */
// Cada mood tem uma lista de gatilhos, com peso opcional. Frases mais específicas
// (multi-palavra) ganham peso maior para vencer palavras genéricas como "sorri".
const MOOD_ACTION_KEYWORDS: Partial<Record<Mood, Array<[string, number?]>>> = {
  // ——— INTENSIDADES BAIXAS (precisam vencer as versões fortes: pesos maiores) ———
  happySlight: [
    ["sorriso pequeno", 9], ["pequeno sorriso", 9], ["sorri de leve", 9],
    ["leve sorriso", 9], ["sorri levemente", 9], ["meio sorriso", 9],
    ["sorriso discreto", 9], ["canto da boca se curva", 9], ["sorri de canto", 8],
    ["esboça um sorriso", 9], ["small smile", 9], ["slight smile", 9],
    ["faint smile", 9], ["smiles faintly", 9], ["lips curl slightly", 8],
  ],
  blushLight: [
    ["cora levemente", 9], ["cora um pouco", 9], ["leve rubor", 9],
    ["rubor leve", 9], ["bochechas levemente rosadas", 9], ["um leve tom rosado", 9],
    ["cora de leve", 9], ["blushes slightly", 9], ["faint blush", 9],
    ["cheeks tinge pink", 9],
  ],
  tearSingle: [
    ["uma lágrima solitária", 10], ["lágrima solitária", 10], ["uma única lágrima", 10],
    ["uma lágrima escorre", 10], ["uma lágrima cai", 10], ["single tear", 10],
    ["a lone tear", 10], ["uma lágrima teima em cair", 10],
  ],
  angrySlight: [
    ["levemente irritada", 9], ["franze levemente o cenho", 9], ["leve irritação", 9],
    ["revira os olhos", 8], ["bufa baixinho", 8], ["aperta os lábios contrariada", 9],
    ["slightly annoyed", 9], ["frowns slightly", 9],
  ],
  shy: [
    ["cora levemente", 5], ["cora um pouco", 5], ["cora", 4], ["coro", 4],
    ["blush", 4], ["blushes", 5], ["blushing", 5],
    ["envergonh", 4], ["ruboriz", 5], ["fica vermelha", 5], ["fica ruborizada", 5],
    ["bochechas vermelhas", 5], ["bochechas coram", 5], ["bochechas rosadas", 4],
    ["olhar tímido", 4], ["olha tímida", 4], ["tímida", 3], ["tímido", 3],
    ["desvia o olhar envergonhada", 6], ["abaixa o olhar envergonhada", 6],
    ["sorri timidamente", 6], ["sorri envergonhada", 6], ["sorriso tímido", 6],
    ["gagueja", 4], ["gaguejando", 4], ["morde o lábio envergonhada", 6],
    ["esconde o rosto", 5], ["se esconde atrás", 4],
  ],
  blush: [
    ["cora intensamente", 7], ["cora muito", 7], ["fica completamente vermelha", 8],
    ["fica escarlate", 8], ["ruboriza intensamente", 7], ["cobre o rosto envergonhada", 7],
    ["cobre o rosto com as mãos", 6], ["esconde o rosto vermelh", 7],
    ["rosto pega fogo", 7], ["queima de vergonha", 6], ["deeply blushes", 6],
    ["face flushes deeply", 6],
  ],
  flirty: [
    ["sorri maliciosa", 7], ["sorri sedutora", 7], ["sorri provocante", 7],
    ["dá uma piscadela", 6], ["pisca sedutora", 7], ["morde o lábio provocante", 7],
    ["olha de canto", 4], ["se aproxima sensualmente", 7], ["sussurra no ouvido", 6],
    ["encosta o corpo em você", 6], ["passa a mão pelo cabelo provocante", 6],
    ["winks", 5], ["smirks", 6], ["teases", 5],
  ],
  scared: [
    ["treme de medo", 8], ["olhar aterrorizada", 7], ["se encolhe assustada", 7],
    ["fica pálida de medo", 8], ["recua com medo", 7], ["grita de susto", 6],
    ["olhos arregalados de medo", 8], ["cobre a boca com medo", 7],
    ["dá um passo para trás assustada", 7], ["shrinks back in fear", 6],
    ["trembles in fear", 7], ["gasps in terror", 7],
  ],
  sleepy: [
    ["boceja", 6], ["esfrega os olhos", 5], ["cai no sono", 7], ["cochila", 7],
    ["olhos pesados", 6], ["mal consegue manter os olhos abertos", 7],
    ["se espreguiça sonolenta", 6], ["yawns", 5], ["rubs her eyes sleepy", 6],
    ["dozing off", 6],
  ],
  happy: [
    ["gargalha", 5], ["gargalhada", 5], ["risadinha", 4], ["ri alto", 5],
    ["ri feliz", 5], ["sorri largo", 5], ["sorri feliz", 5], ["sorri animada", 5],
    ["sorri radiante", 5], ["laughs", 4], ["grins", 4], ["beams", 4],
    ["bate palmas", 4], ["pula de alegria", 5], ["olhos brilham de alegria", 5],
    ["sorri", 2], ["smiles", 2], ["sonrí", 2],
  ],
  sad: [
    ["suspira triste", 5], ["olha para baixo triste", 5], ["cabisbaix", 4],
    ["lágrima escorre", 5], ["olhos marejados", 5], ["sighs sadly", 4],
    ["olha para baixo", 3], ["encolhe os ombros triste", 5],
  ],
  crying: [
    ["chora baixinho", 6], ["chora", 5], ["soluç", 5], ["cai em prantos", 6],
    ["lágrimas escorrem", 6], ["cries", 4], ["sobs", 5], ["chorando", 5],
  ],
  angry: [
    ["grita com raiva", 6], ["grita", 4], ["cerra os punhos", 5],
    ["range os dentes", 5], ["bate na parede", 5], ["bate a mão", 4],
    ["shouts", 4], ["glares", 4], ["franze o cenho", 4], ["olhar furioso", 5],
    ["olha com raiva", 5],
  ],
  surprised: [
    ["arregala os olhos", 5], ["boquiaberta", 5], ["engasga", 4],
    ["gasps", 4], ["eyes widen", 4], ["recua surpres", 5],
    ["dá um pulo de susto", 5], ["fica sem palavras surpres", 5],
  ],
  tense: [
    ["se afasta tensa", 5], ["recua um passo", 4], ["fica tensa", 5],
    ["aperta os punhos", 3], ["morde o lábio nervosa", 5], ["prende a respiração", 4],
  ],
  soft: [
    ["acaricia", 4], ["abraça", 4], ["sorri suavemente", 4],
    ["encosta a mão", 3], ["fala baixinho", 3], ["olha carinhosa", 4],
  ],
  hopeful: [
    ["olha esperançosa", 5], ["respira aliviada", 5], ["sorri esperançosa", 5],
  ],
};

/**
 * "Autorizador" de troca de emoção pelas ações:
 * pontua todas as ações e escolhe o humor com maior soma de pesos.
 * Frases mais específicas (ex.: "sorri timidamente") vencem palavras genéricas ("sorri").
 *
 * Prioridade quando várias emoções aparecem na mesma mensagem:
 *  - Emoções compatíveis (mesma valência) são MISTURADAS: retorna primária + secundária.
 *  - Emoções incompatíveis (ex.: raiva + feliz): a ÚLTIMA no texto vence.
 */
const MOOD_VALENCE: Record<Mood, "warm" | "distress" | "neutral"> = {
  calm: "neutral", soft: "warm", hopeful: "warm", shy: "warm",
  happy: "warm", blush: "warm", flirty: "warm", sleepy: "warm",
  sad: "distress", crying: "distress", angry: "distress",
  tense: "distress", scared: "distress", surprised: "neutral",
};

export function detectMoodFromActions(
  actions: string[],
): { mood: Mood; secondary?: Mood; trigger: string } | null {
  if (!actions.length) return null;
  const scores: Partial<Record<Mood, number>> = {};
  const bestTrigger: Partial<Record<Mood, { kw: string; weight: number }>> = {};
  // Rastreia posição da última ocorrência de cada mood (para desempate por "última").
  const lastPos: Partial<Record<Mood, number>> = {};
  const joined = actions.join(" | ");
  for (const mood of Object.keys(MOOD_ACTION_KEYWORDS) as Mood[]) {
    const kws = MOOD_ACTION_KEYWORDS[mood]!;
    for (const [kw, w = 3] of kws) {
      let from = 0;
      let idx = joined.indexOf(kw, from);
      if (idx === -1) continue;
      while (idx !== -1) {
        scores[mood] = (scores[mood] ?? 0) + w;
        lastPos[mood] = Math.max(lastPos[mood] ?? -1, idx);
        from = idx + kw.length;
        idx = joined.indexOf(kw, from);
      }
      const prev = bestTrigger[mood];
      if (!prev || w > prev.weight) bestTrigger[mood] = { kw, weight: w };
    }
  }
  const entries = Object.entries(scores) as Array<[Mood, number]>;
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  // Detecta valências presentes
  const valences = new Set(entries.map(([m]) => MOOD_VALENCE[m]));
  const hasConflict = valences.has("warm") && valences.has("distress");
  let primary: Mood;
  let secondary: Mood | undefined;
  if (hasConflict) {
    // Última emoção mencionada vence
    const sortedByPos = [...entries].sort(
      (a, b) => (lastPos[b[0]] ?? -1) - (lastPos[a[0]] ?? -1),
    );
    primary = sortedByPos[0][0];
  } else {
    primary = entries[0][0];
    // Se há uma segunda emoção compatível com peso relevante, mistura
    const candidate = entries.find(
      ([m]) => m !== primary && MOOD_VALENCE[m] === MOOD_VALENCE[primary],
    );
    if (candidate && candidate[1] >= 3) secondary = candidate[0];
  }
  return { mood: primary, secondary, trigger: bestTrigger[primary]?.kw ?? primary };
}

const LANGUAGE_LABELS = {
  pt: "pt-BR (português brasileiro)",
  en: "en (English)",
  es: "es (español)",
  fr: "fr (français)",
  de: "de (deutsch)",
  it: "it (italiano)",
} as const;

type LatinLanguage = keyof typeof LANGUAGE_LABELS;

const LANGUAGE_PATTERNS: Record<LatinLanguage, Array<[RegExp, number]>> = {
  pt: [
    [/\b(voc[eê]s?|c[êe]|n[aã]o|ent[aã]o|ol[aá]|obrigad[ao]|tamb[eé]m|estou|est[aá]|estamos|tenho|quero|vamos|fome|cozinha|banheiro|quarto|sala|aqui|agora|comigo|pra|pro|n[eé]|cad[eê])\b/gi, 4],
    [/\b(meu|minha|seu|sua|isso|essa|esse|aquele|aquela|porque|porqu[eê]|quando|onde|como|muito|mais|mas|com|para|por|uma|uns?|das?|dos?|nas?|nos?)\b/gi, 2],
    [/[ãõ]|ç|\b\w+(?:ções|ção|ões)\b/gi, 5],
    [/\b(vou|pode|posso|preciso|fica|ficar|fala|falar|olha|olhar|sinto|acho|sabe|quer|gosto|desculpa)\b/gi, 2],
  ],
  en: [
    [/\b(the|you|your|yours|are|is|am|was|were|what|why|where|when|how|hello|hi|thanks|thank|please|because|with|from|this|that|have|want|need|can|can't|dont|don't|i'm|im|let's)\b/gi, 3],
    [/\b(kitchen|bathroom|bedroom|living room|hungry|look|feel|talk|come|go|stay)\b/gi, 3],
  ],
  es: [
    [/\b(hola|gracias|pero|estoy|est[aá]s|estamos|t[uú]|usted|ustedes|qu[eé]|por qu[eé]|d[oó]nde|cu[aá]ndo|c[oó]mo|quiero|tengo|vamos|hambre|cocina|baño|habitaci[oó]n|sala|aqu[ií]|ahora|conmigo)\b/gi, 4],
    [/[ñ¿¡]|\b\w+(?:ción|ciones)\b/gi, 5],
    [/\b(mi|mis|tu|sus?|eso|esa|ese|porque|muy|m[aá]s|con|para|por|una|unos?|las?|los?|del)\b/gi, 2],
  ],
  fr: [
    [/\b(bonjour|salut|merci|mais|je|tu|vous|nous|suis|êtes|etre|être|avec|pourquoi|o[uù]|quand|comment|veux|besoin|allons|faim|cuisine|salle de bain|chambre|ici|maintenant|mon|ma|mes|ton|ta|tes|ceci|cela|parce que|tr[eè]s)\b/gi, 4],
    [/\b(le|la|les|des|du|de|un|une|dans|sur|pas|plus|bien|faire|aller)\b/gi, 1],
    [/[œæ]|\b\w+(?:eaux|eux|ais|ait|ment)\b/gi, 2],
  ],
  de: [
    [/\b(hallo|danke|bitte|nicht|und|ich|du|sie|wir|ihr|bin|bist|sind|warum|wo|wann|wie|will|möchte|moechte|brauche|gehen|hunger|küche|kueche|bad|schlafzimmer|zimmer|hier|jetzt|mit)\b/gi, 4],
    [/[äöüß]/gi, 5],
    [/\b(der|die|das|den|dem|ein|eine|einen|mein|dein|sein|kein|aber|sehr|für|fuer|von|zu)\b/gi, 2],
  ],
  it: [
    [/\b(ciao|grazie|perch[eé]|sono|sei|siamo|tu|voi|dove|quando|come|voglio|ho|bisogno|andiamo|fame|cucina|bagno|camera|stanza|qui|adesso|con me|mio|mia|tuo|tua|questo|questa|molto)\b/gi, 4],
    [/\b(il|lo|la|gli|le|un|una|del|della|dei|delle|ma|per|con|non|pi[uù])\b/gi, 2],
    [/\b\w+(?:zione|zioni|mente)\b/gi, 3],
  ],
};

function scorePatterns(text: string, patterns: Array<[RegExp, number]>): number {
  return patterns.reduce((score, [pattern, weight]) => {
    const matches = text.match(pattern);
    return score + (matches?.length ?? 0) * weight;
  }, 0);
}

/** Detecção de idioma por pontuação, evitando que acentos comuns como “à” virem francês. */
export function detectLanguage(text: string): string {
  const raw = (text || "").trim();
  const t = raw.toLowerCase().normalize("NFC");
  if (!t) return LANGUAGE_LABELS.pt;
  if (/[一-龯ぁ-んァ-ン]/.test(t)) return "ja (日本語)";
  if (/[가-힣]/.test(t)) return "ko (한국어)";
  if (/[\u0400-\u04FF]/.test(t)) return "ru (русский)";

  const scores = Object.fromEntries(
    (Object.keys(LANGUAGE_PATTERNS) as LatinLanguage[]).map((lang) => [lang, scorePatterns(t, LANGUAGE_PATTERNS[lang])]),
  ) as Record<LatinLanguage, number>;

  // “à” é muito comum em português (“vamos à cozinha”), então nunca deve decidir francês sozinho.
  if (/\bà\b/.test(t) && /\b(vamos|vou|ir|indo|estou|fome|cozinha|sala|quarto|banheiro)\b/.test(t)) {
    scores.pt += 6;
  }

  // Desempate pró-PT para frases curtas do jogo, já que o app é PT-BR por padrão.
  const entries = (Object.entries(scores) as Array<[LatinLanguage, number]>).sort((a, b) => b[1] - a[1]);
  const [bestLang, bestScore] = entries[0];
  const [, secondScore] = entries[1];

  if (bestScore <= 0) return LANGUAGE_LABELS.pt;
  if (bestLang !== "pt" && scores.pt > 0 && bestScore - scores.pt <= 2) return LANGUAGE_LABELS.pt;
  if (bestScore === secondScore && scores.pt === bestScore) return LANGUAGE_LABELS.pt;

  return LANGUAGE_LABELS[bestLang];
}