const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- Defaults (overridable by client settings) ---
const DEFAULT_RECENT_LIMIT = 8;
const SUMMARY_MAX_CHARS = 240; // resumo curto das mensagens mais antigas
const DEFAULT_MAX_TOKENS = 120;

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
    const language = (settings?.language || "pt-BR (português brasileiro)").toString().slice(0, 60);

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
