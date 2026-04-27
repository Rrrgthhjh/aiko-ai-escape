// Filtro rígido: bloqueia xingamentos comuns (PT/EN), conteúdo sexual explícito,
// violência gráfica e dados pessoais.

const PROFANITY = [
  // PT
  "porra","caralho","merda","puta","filho da puta","fdp","cuzão","cuzao","viado","viadinho","arrombado",
  "vai se foder","vai tomar no cu","babaca","otario","otário","corno","desgraça","desgraçado","retardado",
  "burro do caralho","cacete","piranha","vagabunda","escroto","imbecil",
  // EN
  "fuck","fucking","shit","bitch","asshole","dick","pussy","cunt","motherfucker","bastard","retard","faggot","slut","whore",
  // Sexual explícito
  "sexo","transar","gozar","pau duro","pinto","peito","seios","buceta","tesão","tesao","nudes","pelada","pelado","masturbar",
  "cum","horny","nude","naked",
  // Violência gráfica
  "matar você","te matar","te estuprar","estuprar","suicidar","me matar","kill yourself","kys","rape",
];

const PERSONAL_PATTERNS: RegExp[] = [
  /\b\d{3}[.\s-]?\d{3}[.\s-]?\d{3}[-\s]?\d{2}\b/, // CPF
  /\b\d{2}[.\s-]?\d{3}[.\s-]?\d{3}[-\s]?\d?\b/,   // RG
  /\b\(?\d{2}\)?[\s-]?9?\d{4}[-\s]?\d{4}\b/,      // telefone BR
  /\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/,              // phone US
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // email
  /\b\d{1,5}\s+(rua|av|avenida|alameda|street|st\.?|avenue|ave\.?|road|rd\.?)\b/i, // endereço
  /\bmeu cep\b|\bcep\s*\d{5}/i,
  /\bmeu cart[aã]o\b|\bcredit card\b|\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
];

export type FilterResult =
  | { ok: true; cleaned: string }
  | { ok: false; reason: string };

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

export function filterUserMessage(raw: string): FilterResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: "Mensagem vazia." };
  if (trimmed.length > 600) return { ok: false, reason: "Mensagem muito longa (máx. 600)." };

  const norm = normalize(trimmed);
  for (const w of PROFANITY) {
    const wn = normalize(w);
    const re = new RegExp(`(?:^|\\s)${wn.replace(/\s+/g, "\\s+")}(?:\\s|$)`);
    if (re.test(norm)) {
      return { ok: false, reason: "Linguagem imprópria detectada. Reformule sem xingamentos ou conteúdo sensível." };
    }
  }
  for (const re of PERSONAL_PATTERNS) {
    if (re.test(trimmed)) {
      return { ok: false, reason: "Não envie dados pessoais reais (telefone, e-mail, endereço, documentos). Sua segurança vem primeiro." };
    }
  }
  return { ok: true, cleaned: trimmed };
}
