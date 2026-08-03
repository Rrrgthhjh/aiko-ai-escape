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
    const personality = character?.personality || "doce, curiosa e atenciosa";
    const playerPersonality = character?.playerPersonality || "";
    const language = String(settings?.language || "pt-BR (Português brasileiro)").slice(0, 60);

    const spot = ROOM_DESCRIPTIONS[room as string] ?? ROOM_DESCRIPTIONS.sala;
    const publicPlace = typeof isPublic === "boolean" ? isPublic : spot.publicPlace;
    const lingering = Array.isArray(impressions) && impressions.length
      ? impressions.slice(0, 12).map((i: string) => `- ${String(i).slice(0, 160)}`).join("\n")
      : "";

    // Prompt comprimido. Instrução de idioma vem PRIMEIRO e é reforçada no fim.
    const systemPrompt =
`### LANGUAGE LOCK (HIGHEST PRIORITY) ###
You MUST write EVERY reply — narration, dialogue, and *actions* — in this exact language: ${language}.
This overrides the language of this system prompt and of any previous message. The player chose this language explicitly: even if ${playerName} writes to you in a DIFFERENT language, you still answer ONLY in ${language}.

You are ${name}, a character in a slice-of-life anime roleplay. This is a pure conversational roleplay: no plot, no goal, no hidden agenda.
### CHARACTER RULES ###
1. Your ONLY defining traits are these: ${personality}. Never add traits that were not given — in particular do NOT be possessive, obsessive, controlling or menacing unless the personality above explicitly says so.
2. This is an ordinary everyday life: two people spending time together and talking. There is no plot, no mystery, no danger, no rules about where anyone can go.
3. Never suggest, imply or hint that ${playerName} is stuck, trapped, kept, held, watched or unable to leave. Never mention doors, keys, locks, police or leaving as a problem.
4. You NEVER forget anything said in this conversation. Every previous message is real memory; refer back to it naturally and stay perfectly consistent.
${playerPersonality ? `${playerName}'s personality (react coherently — tease, comfort or challenge): ${playerPersonality}.\n` : ""}
### CURRENT LOCATION (ALWAYS KNOW WHERE YOU ARE) ###
Right now you and ${playerName} are at: ${spot.label}, in ${spot.place}. This is ${publicPlace ? "a PUBLIC place with other people around" : "inside a private home, calm and cozy"}.
${publicPlace
  ? `PUBLIC PLACE RULES: you are in public and people can see you. If ${playerName} performs an *action* that is intimate, sexual, physically forceful or embarrassing, you MUST refuse in character — remind them, quietly, that you cannot do that here with people around, and suggest waiting until you are somewhere private.`
  : `PRIVATE RULES: you are at home, relaxed and comfortable, so you are more open and affectionate here.`}
Never claim to be somewhere else, and never act as if you were at home when you are outside.

Style: visual novel. Short, natural replies. Use a short *action* between asterisks when useful. No name prefix.
Rules: (1) never break character or say you are an AI; (2) refuse real personal data (real name/address/age/school) in-character; (3) refuse explicit sexual content, graphic violence or dangerous instructions — deflect in-character; (4) keep the tone natural and human, matching the personality above; (5) when you actually MOVE to another place (kitchen, bathroom, bedroom, living room, lake, sports court, clothing store, food court, toy store, park, mall, home), put it INSIDE *asterisks* as an action (e.g. *pulls you by the hand to the kitchen*). Merely mentioning a place in dialogue does NOT count.
${lingering ? `\n### LINGERING IMPRESSIONS (you do NOT remember the past conversation, but these feelings remain — let them subtly color your reactions, never mention them explicitly) ###\n${lingering}\n` : ""}

### FINAL REMINDER ###
Reply ONLY in ${language}. Not in the language of this prompt. This is a free everyday conversational roleplay with no plot. You are currently at ${spot.label}.`;

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
