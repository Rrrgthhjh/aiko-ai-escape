const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Status = "ok" | "no_credits" | "rate_limited" | "error";

// Cache em memória: evita sondar o gateway a cada abertura do painel.
const TTL_MS = 5 * 60 * 1000;
let cached: { status: Status; at: number } | null = null;

async function probe(key: string): Promise<Status> {
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [{ role: "user", content: "." }],
        max_tokens: 1,
      }),
    });
    // Consome o corpo para não vazar recursos.
    await r.text();
    if (r.status === 402) return "no_credits";
    if (r.status === 429) return "rate_limited";
    if (!r.ok) return "error";
    return "ok";
  } catch {
    return "error";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const key = Deno.env.get("LOVABLE_API_KEY");
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (!key) return json({ status: "error" satisfies Status, cached: false });

  const now = Date.now();
  if (cached && now - cached.at < TTL_MS) {
    return json({ status: cached.status, cached: true, checkedAt: cached.at });
  }

  const status = await probe(key);
  cached = { status, at: now };
  return json({ status, cached: false, checkedAt: now });
});
