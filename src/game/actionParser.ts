import type { Mood, Room } from "./types";

/**
 * Extrai o conteúdo de AÇÕES da narração.
 * A IA nem sempre usa asteriscos: também aceitamos _itálico_, (parênteses),
 * «guillemets», ~til~ e um asterisco de abertura sem fechamento no fim da linha.
 */
export function extractActions(text: string): string[] {
  if (!text) return [];
  const out: string[] = [];
  const patterns = [
    /\*\*([^*]+)\*\*/g,
    /\*([^*\n]+)\*/g,
    /_([^_\n]+)_/g,
    /\(([^)\n]+)\)/g,
    /«([^»\n]+)»/g,
    /~([^~\n]+)~/g,
  ];
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const v = m[1].toLowerCase().trim();
      if (v) out.push(v);
    }
  }
  // Asterisco aberto e nunca fechado (ex.: "*ela sorri" no fim da mensagem)
  const dangling = text.match(/\*([^*\n]{3,})$/);
  if (dangling) out.push(dangling[1].toLowerCase().trim());
  return Array.from(new Set(out));
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
  happySlight: "warm", blushLight: "warm",
  tearSingle: "distress", angrySlight: "distress",
};

/**
 * Marcadores de CANCELAMENTO/NEGAÇÃO de uma emoção.
 * Ex.: "o sorriso desaparece instantaneamente" não deve virar "feliz".
 */
const CANCEL_MARKERS = [
  "desaparec", "some do rosto", "some de", "somem", "se apaga", "apaga-se",
  "morre nos lábios", "se desfaz", "esvai", "esvanec", "se dissolve",
  "deixa de", "para de", "já não", "não consegue mais", "perde o",
  "congela no rosto", "fica sem", "murcha", "se fecha",
  "fades", "faded", "vanish", "disappear", "no longer", "dies on her lips",
  "falso", "forçad", "sem vontade", "sem graça nenhuma", "amarelo",
];

/** Para onde a emoção migra quando é cancelada no texto. */
const CANCEL_INVERSE: Partial<Record<Mood, Mood>> = {
  happy: "sad", happySlight: "sad", soft: "tense", hopeful: "tense",
  shy: "tense", blush: "tense", blushLight: "tense", flirty: "tense",
  sleepy: "tense", surprised: "tense",
  sad: "calm", crying: "sad", tearSingle: "sad",
  angry: "tense", angrySlight: "calm", scared: "tense", tense: "calm",
};

function isCancelled(haystack: string, idx: number, len: number): boolean {
  const before = haystack.slice(Math.max(0, idx - 28), idx);
  const after = haystack.slice(idx + len, idx + len + 45);
  return CANCEL_MARKERS.some((m) => after.includes(m) || before.includes(m));
}

type Segment = { text: string; factor: number };

function analyzeSegments(
  segments: Segment[],
): { mood: Mood; secondary?: Mood; trigger: string } | null {
  const scores: Partial<Record<Mood, number>> = {};
  const bestTrigger: Partial<Record<Mood, { kw: string; weight: number }>> = {};
  const lastPos: Partial<Record<Mood, number>> = {};
  let offset = 0;

  for (const seg of segments) {
    const hay = seg.text;
    if (!hay) { offset += 1; continue; }
    for (const mood of Object.keys(MOOD_ACTION_KEYWORDS) as Mood[]) {
      for (const [kw, w = 3] of MOOD_ACTION_KEYWORDS[mood]!) {
        let idx = hay.indexOf(kw);
        while (idx !== -1) {
          const weight = w * seg.factor;
          if (isCancelled(hay, idx, kw.length)) {
            // Emoção negada pelo contexto: migra para a emoção oposta.
            const inv = CANCEL_INVERSE[mood];
            if (inv) {
              scores[inv] = (scores[inv] ?? 0) + weight;
              lastPos[inv] = Math.max(lastPos[inv] ?? -1, offset + idx);
              const prevI = bestTrigger[inv];
              if (!prevI || weight > prevI.weight) bestTrigger[inv] = { kw: `${kw} (negado)`, weight };
            }
          } else {
            scores[mood] = (scores[mood] ?? 0) + weight;
            lastPos[mood] = Math.max(lastPos[mood] ?? -1, offset + idx);
            const prev = bestTrigger[mood];
            if (!prev || weight > prev.weight) bestTrigger[mood] = { kw, weight };
          }
          idx = hay.indexOf(kw, idx + kw.length);
        }
      }
    }
    offset += hay.length + 3;
  }

  const entries = Object.entries(scores) as Array<[Mood, number]>;
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  const valences = new Set(entries.map(([m]) => MOOD_VALENCE[m]));
  const hasConflict = valences.has("warm") && valences.has("distress");
  let primary: Mood;
  let secondary: Mood | undefined;
  if (hasConflict) {
    const sortedByPos = [...entries].sort(
      (a, b) => (lastPos[b[0]] ?? -1) - (lastPos[a[0]] ?? -1),
    );
    primary = sortedByPos[0][0];
  } else {
    primary = entries[0][0];
    const candidate = entries.find(
      ([m]) => m !== primary && MOOD_VALENCE[m] === MOOD_VALENCE[primary],
    );
    if (candidate && candidate[1] >= 3) secondary = candidate[0];
  }
  return { mood: primary, secondary, trigger: bestTrigger[primary]?.kw ?? primary };
}

/**
 * Autorizador CONTEXTUAL: lê a mensagem inteira.
 * Ações (*...*) pesam o dobro do texto narrativo comum, e negações
 * ("o sorriso desaparece") invertem a emoção em vez de dispará-la.
 */
export function detectMoodFromMessage(
  text: string,
): { mood: Mood; secondary?: Mood; trigger: string } | null {
  const t = (text || "").toLowerCase();
  if (!t.trim()) return null;
  const actions = extractActions(text);
  const narrative = t.replace(/\*[^*]+\*/g, " ").replace(/\s+/g, " ").trim();
  const segments: Segment[] = [
    ...actions.map((a) => ({ text: a, factor: 1 })),
    ...(narrative ? [{ text: narrative, factor: 0.55 }] : []),
  ];
  return analyzeSegments(segments);
}

export function detectMoodFromActions(
  actions: string[],
): { mood: Mood; secondary?: Mood; trigger: string } | null {
  if (!actions.length) return null;
  return analyzeSegments(actions.map((a) => ({ text: a, factor: 1 })));
}

