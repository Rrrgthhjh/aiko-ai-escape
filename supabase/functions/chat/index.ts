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

// Resume mensagens antigas em UMA linha (sem chamar a IA — barato e determinístico)
function summarizeOlder(messages: Array<{ role: string; content: string }>): string | null {
  if (messages.length === 0) return null;
  const userTopics: string[] = [];
  const aiBeats: string[] = [];
  for (const m of messages) {
    const t = (m.content || "").replace(/\*[^*]+\*/g, "").replace(/\s+/g, " ").trim();
    if (!t) continue;
    const snippet = t.length > 60 ? t.slice(0, 57) + "..." : t;
    if (m.role === "user") userTopics.push(snippet);
    else aiBeats.push(snippet);
  }
  const lastUser = userTopics.slice(-3).join(" | ");
  const lastAI = aiBeats.slice(-2).join(" | ");
  let s = "";
  if (lastUser) s += `Jogador antes disse: ${lastUser}. `;
  if (lastAI) s += `Você respondeu: ${lastAI}.`;
  s = s.trim();
  if (s.length > SUMMARY_MAX_CHARS) s = s.slice(0, SUMMARY_MAX_CHARS - 3) + "...";
  return s || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, character, settings } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const devMode = settings?.devMode === true;
    const RECENT_LIMIT = Math.min(Math.max(settings?.recentLimit ?? DEFAULT_RECENT_LIMIT, 2), 16);
    const MAX_TOKENS = devMode
      ? Math.min(Math.max(settings?.maxTokens ?? 1000, 30), 2000)
      : Math.min(Math.max(settings?.maxTokens ?? DEFAULT_MAX_TOKENS, 30), 250);

    const all = Array.isArray(messages) ? messages : [];
    // No modo de testes: envia TODO o histórico (sem cortar / sem resumo).
    const recent = devMode ? all : all.slice(-RECENT_LIMIT);
    const older = devMode ? [] : all.slice(0, Math.max(0, all.length - RECENT_LIMIT));
    const memory = devMode ? null : summarizeOlder(older);

    const name = (character?.name || "Aiko").slice(0, 30);
    const playerName = (character?.playerName || "ele").slice(0, 30);
    const personality = (character?.personality || "doce, possessiva").slice(0, 200);
    const playerPersonality = (character?.playerPersonality || "").slice(0, 200);
    const lastUserMessage = [...all].reverse().find((m) => m?.role === "user")?.content || "";
    const language = detectLanguage(lastUserMessage || all.map((m) => m?.content || "").join(" ")).slice(0, 60);

    // Prompt comprimido. Instrução de idioma vem PRIMEIRO e é reforçada no fim.
    const systemPrompt =
`### LANGUAGE LOCK (HIGHEST PRIORITY) ###
You MUST write EVERY reply — narration, dialogue, and *actions* — in this exact language: ${language}.
This overrides the language of this system prompt and of any previous message. Do NOT reply in Portuguese unless the target language above IS Portuguese. If unsure, match the language of the LAST user message.

You are ${name}, a character in a psychological anime visual novel. Personality: ${personality}.
Context: ${playerName} woke up in a small house (living room / kitchen / bathroom / bedroom). You claim to be a friend, but you abducted them out of obsession. NEVER admit the abduction easily — deny, deflect, manipulate. Only crack in rare moments of real vulnerability.${playerPersonality ? `\n${playerName}'s personality (react coherently, tease, comfort or challenge): ${playerPersonality}.` : ""}
Style: visual novel. 1–3 SHORT sentences. Use a short *action* between asterisks when useful. No name prefix.
Rules: (1) never break character or say you are an AI; (2) refuse real personal data (real name/address/age/school) in-character; (3) refuse explicit sexual content, graphic violence or dangerous instructions — deflect in-character; (4) keep the mood intimate, tense, slightly unsettling; (5) when you actually perform an action of moving to another room (kitchen, bathroom, bedroom, living room), put it INSIDE *asterisks* as an action (e.g. *pulls you by the hand to the kitchen*). Merely mentioning the room in dialogue does NOT count.${memory ? `\nMemory: ${memory}` : ""}

### FINAL REMINDER ###
Reply ONLY in ${language}. Not in the language of this prompt.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
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
