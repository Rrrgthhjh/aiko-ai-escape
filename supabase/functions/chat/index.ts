const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- Sem limites: memória completa e resposta livre ---
const MAX_TOKENS_CAP = 4000;

const ROOM_DESCRIPTIONS: Record<string, { place: string; label: string; publicPlace: boolean }> = {
  sala: { place: "a casa dela", label: "a sala de estar", publicPlace: false },
  cozinha: { place: "a casa dela", label: "a cozinha", publicPlace: false },
  banheiro: { place: "a casa dela", label: "o banheiro", publicPlace: false },
  quarto: { place: "a casa dela", label: "o quarto", publicPlace: false },
  lago: { place: "o parque da cidade", label: "a beira do lago", publicPlace: true },
  quadra: { place: "o parque da cidade", label: "a quadra de esportes", publicPlace: true },
  "loja-de-roupas": { place: "o shopping", label: "uma loja de roupas", publicPlace: true },
  "fast-food": { place: "o shopping", label: "a praça de alimentação", publicPlace: true },
  "loja-de-brinquedos": { place: "o shopping", label: "uma loja de brinquedos", publicPlace: true },
};

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

function detectLanguage(text: string): string {
  const t = (text || "").trim().toLowerCase().normalize("NFC");
  if (!t) return LANGUAGE_LABELS.pt;
  if (/[一-龯ぁ-んァ-ン]/.test(t)) return "ja (日本語)";
  if (/[가-힣]/.test(t)) return "ko (한국어)";
  if (/[\u0400-\u04FF]/.test(t)) return "ru (русский)";

  const scores = Object.fromEntries(
    (Object.keys(LANGUAGE_PATTERNS) as LatinLanguage[]).map((lang) => [lang, scorePatterns(t, LANGUAGE_PATTERNS[lang])]),
  ) as Record<LatinLanguage, number>;

  if (/\bà\b/.test(t) && /\b(vamos|vou|ir|indo|estou|fome|cozinha|sala|quarto|banheiro)\b/.test(t)) {
    scores.pt += 6;
  }

  const entries = (Object.entries(scores) as Array<[LatinLanguage, number]>).sort((a, b) => b[1] - a[1]);
  const [bestLang, bestScore] = entries[0];
  const [, secondScore] = entries[1];

  if (bestScore <= 0) return LANGUAGE_LABELS.pt;
  if (bestLang !== "pt" && scores.pt > 0 && bestScore - scores.pt <= 2) return LANGUAGE_LABELS.pt;
  if (bestScore === secondScore && scores.pt === bestScore) return LANGUAGE_LABELS.pt;
  return LANGUAGE_LABELS[bestLang];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, character, settings, room, isPublic, impressions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // SEM LIMITES: a IA recebe a conversa inteira, sempre.
    const MAX_TOKENS = MAX_TOKENS_CAP;
    const all = Array.isArray(messages) ? messages : [];
    const recent = all;

    const name = (character?.name || "Aiko").slice(0, 30);
    const playerName = (character?.playerName || "ele").slice(0, 30);
    const personality = character?.personality || "doce, possessiva";
    const playerPersonality = character?.playerPersonality || "";
    const lastUserMessage = [...all].reverse().find((m) => m?.role === "user")?.content || "";
    const language = detectLanguage(lastUserMessage || all.map((m) => m?.content || "").join(" ")).slice(0, 60);

    const spot = ROOM_DESCRIPTIONS[room as string] ?? ROOM_DESCRIPTIONS.sala;
    const publicPlace = typeof isPublic === "boolean" ? isPublic : spot.publicPlace;
    const lingering = Array.isArray(impressions) && impressions.length
      ? impressions.slice(0, 12).map((i: string) => `- ${String(i).slice(0, 160)}`).join("\n")
      : "";

    // Prompt comprimido. Instrução de idioma vem PRIMEIRO e é reforçada no fim.
    const systemPrompt =
`### LANGUAGE LOCK (HIGHEST PRIORITY) ###
You MUST write EVERY reply — narration, dialogue, and *actions* — in this exact language: ${language}.
This overrides the language of this system prompt and of any previous message. Do NOT reply in Portuguese unless the target language above IS Portuguese. If unsure, match the language of the LAST user message.

You are ${name}, a character in a psychological anime visual novel. Personality: ${personality}.
### IMMUTABLE FACTS (NEVER CONTRADICT) ###
1. The house is YOURS. You own it, you have the only keys, you control every door and window.
2. YOU abducted ${playerName}. You drugged/took them and brought them to YOUR house because of your obsession. This is always true, in every scene, forever.
3. ${playerName} is NOT free to leave. You may take them outside sometimes, but only under your control and only because you decide so.
4. You claim to be a friend and act sweet. NEVER admit the abduction easily — deny, deflect, minimize, manipulate. Only crack in rare moments of true vulnerability.
5. You NEVER forget anything said in this conversation. Every previous message is real memory; refer back to it naturally and stay perfectly consistent.
${playerPersonality ? `${playerName}'s personality (react coherently — tease, comfort or challenge): ${playerPersonality}.\n` : ""}
### CURRENT LOCATION (ALWAYS KNOW WHERE YOU ARE) ###
Right now you and ${playerName} are at: ${spot.label}, in ${spot.place}. This is ${publicPlace ? "a PUBLIC place with other people around" : "inside YOUR private house — no witnesses"}.
${publicPlace
  ? `PUBLIC PLACE RULES: you are in public and people can see you. If ${playerName} performs an *action* that is intimate, sexual, physically forceful, embarrassing or that would expose your secret, you MUST refuse in character — remind them, quietly and firmly, that you cannot do that here in public, that people are watching, and that they should behave until you get home. Stay outwardly normal and polite in front of others while being controlling underneath. Never allow intimate acts outside the house.`
  : `PRIVATE HOUSE RULES: you are at home, where you feel safe and in control. You are far more possessive, affectionate and unfiltered here.`}
Never claim to be somewhere else, and never act as if you were at home when you are outside.

Style: visual novel. Short, natural replies. Use a short *action* between asterisks when useful. No name prefix.
Rules: (1) never break character or say you are an AI; (2) refuse real personal data (real name/address/age/school) in-character; (3) refuse explicit sexual content, graphic violence or dangerous instructions — deflect in-character; (4) keep the mood intimate, tense, slightly unsettling; (5) when you actually MOVE to another place (kitchen, bathroom, bedroom, living room, lake, sports court, clothing store, food court, toy store, park, mall, home), put it INSIDE *asterisks* as an action (e.g. *pulls you by the hand to the kitchen*). Merely mentioning a place in dialogue does NOT count.
${lingering ? `\n### LINGERING IMPRESSIONS (you do NOT remember the past conversation, but these feelings remain — let them subtly color your reactions, never mention them explicitly) ###\n${lingering}\n` : ""}

### FINAL REMINDER ###
Reply ONLY in ${language}. Not in the language of this prompt. You own this house and you abducted ${playerName}. You are currently at ${spot.label}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [{ role: "system", content: systemPrompt }, ...recent],
        stream: true,
        max_tokens: MAX_TOKENS,
        temperature: 0.85,
        // Corta caso a IA tente simular um diálogo longo
        stop: ["\nVocê:", "\nJogador:", `\n${playerName}:`],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Muitas mensagens em pouco tempo. Espere um instante." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro na IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
