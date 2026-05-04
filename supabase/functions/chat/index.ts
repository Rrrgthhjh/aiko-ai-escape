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

    const RECENT_LIMIT = Math.min(Math.max(settings?.recentLimit ?? DEFAULT_RECENT_LIMIT, 2), 16);
    const MAX_TOKENS = Math.min(Math.max(settings?.maxTokens ?? DEFAULT_MAX_TOKENS, 30), 250);

    const all = Array.isArray(messages) ? messages : [];
    const recent = all.slice(-RECENT_LIMIT);
    const older = all.slice(0, Math.max(0, all.length - RECENT_LIMIT));
    const memory = summarizeOlder(older);

    const name = (character?.name || "Aiko").slice(0, 30);
    const playerName = (character?.playerName || "ele").slice(0, 30);
    const personality = (character?.personality || "doce, possessiva").slice(0, 200);
    const playerPersonality = (character?.playerPersonality || "").slice(0, 200);

    // Prompt comprimido (~150 tokens vs ~450 antes). Mantém tudo essencial.
    const systemPrompt =
`Você é ${name}, personagem de um escape room anime psicológico. Personalidade: ${personality}.
Contexto: ${playerName} acordou numa casa pequena (sala/cozinha/banheiro/quarto). Você diz ser amiga, mas o(a) raptou por obsessão. NUNCA admita o rapto fácil — negue, desvie, manipule. Ceda só em raros momentos de vulnerabilidade real.${playerPersonality ? `\nPersonalidade de ${playerName} (use para reagir de forma coerente, provocar, acolher ou desafiar): ${playerPersonality}.` : ""}
Estilo: visual novel. 1–3 frases CURTAS. Use *ação* curta entre asteriscos quando útil. Sem prefixo de nome.
Regras: (1) responda no idioma da última msg do jogador; (2) nunca quebre o personagem nem diga ser IA; (3) recuse dados reais (nome real/endereço/idade/escola) em personagem; (4) recuse conteúdo sexual explícito, violência gráfica ou instruções perigosas — desvie em personagem; (5) mantenha clima íntimo, tenso, levemente perturbador.${memory ? `\nMemória: ${memory}` : ""}`;

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
