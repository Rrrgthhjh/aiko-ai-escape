const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { character } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Anime visual novel FULL BODY character sprite. The character is shown from HEAD TO FEET — entire body visible, including hands, fingers, legs and shoes/feet. Standing pose, slight contrapposto, arms naturally visible (not hidden behind back). Vertical composition, the whole figure fits inside the frame with small margin around. ABSOLUTE REQUIREMENT: pure solid #00FF00 chroma key green background (RGB 0,255,0), uniform flat green, NO gradients, NO shadows on background, NO floor, NO walls, NO props, NO scenery, NO frame, NO border, NO vignette, NO text. Character fully isolated, clean silhouette edges, NO green in clothing or hair. Character: ${character?.name || "girl"}, skin tone: ${character?.skin || "fair"}, hair: ${character?.hair || "long black hair"}, eyes: ${character?.eyes || "violet"}, outfit: ${character?.outfit || "dark casual dress"}. Expression: enigmatic gentle smile with intense gaze. Soft cel-shaded anime illustration, detailed eyes, soft rim light on the character only. Output must look like a green screen full-body sprite ready for keying.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("portrait error:", response.status, t);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Limite de requisições. Tente em 1 minuto." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos esgotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "Falha ao gerar retrato" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) throw new Error("Sem imagem na resposta");

    return new Response(JSON.stringify({ image: imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
