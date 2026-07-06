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