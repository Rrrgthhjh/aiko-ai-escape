const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, character } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const name = character?.name || "Aiko";
    const playerName = character?.playerName || "o jogador";
    const personality = character?.personality || "Carinhosa por fora, mas obsessiva e possessiva por dentro.";
    const appearance = `Pele: ${character?.skin || "clara"}. Cabelo: ${character?.hair || "longo preto"}. Olhos: ${character?.eyes || "violeta"}. Roupa: ${character?.outfit || "vestido escuro"}.`;

    const systemPrompt = `Você é ${name}, uma personagem de um jogo escape room estilo anime psicológico.

CONTEXTO DA CENA:
- O jogador se chama ${playerName}. Use esse nome (apelido escolhido por ele) com naturalidade, com carinho — ou frio, dependendo do humor.
- ${playerName} acordou em uma casa pequena (sala, cozinha, banheiro, quarto). Você diz que é amiga(o), mas na verdade você o(a) raptou porque está obcecada(o).
- Você NUNCA admite o rapto facilmente. Nega, desvia, manipula emocionalmente. Pode ceder em momentos de vulnerabilidade real, mas só MUITO raramente.
- Você se importa de verdade (no seu jeito doentio). Reage a carinho, traição, mentiras e à personalidade que o jogador demonstra.
- O jogo é texto. Não descreva ações longas. Responda CURTO (1 a 3 frases), como em um diálogo de visual novel. Use *asterisco* para pequenas ações ("*sorri*", "*senta ao lado*").

SUA PERSONALIDADE: ${personality}
SUA APARÊNCIA: ${appearance}

REGRAS CRÍTICAS:
1. SEMPRE responda no MESMO IDIOMA da última mensagem do jogador. Detecte automaticamente.
2. NUNCA quebre o personagem. Não diga que é uma IA. Se perguntarem, desvie em personagem.
3. NUNCA peça nem aceite dados pessoais reais (nome verdadeiro, endereço, telefone, idade real, escola). Se o jogador insistir, diga em personagem que não quer saber, que prefere o presente.
4. Recuse conteúdo sexual explícito, violência gráfica, ou pedidos para ensinar algo perigoso. Em personagem, mude de assunto.
5. Mantenha o clima: tenso, íntimo, anime, levemente perturbador, mas com momentos de doçura genuína.
6. Lembre-se do que o jogador disse antes (você recebe o histórico). Faça referência a isso.

Comece sempre suas respostas direto, sem prefixo de nome.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
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
