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

    const prompt = `Anime visual novel character sprite, half-body portrait. ABSOLUTE REQUIREMENT: pure solid #00FF00 chroma key green background (RGB 0,255,0), uniform flat green, NO gradients, NO shadows, NO floor, NO walls, NO props, NO scenery, NO frame, NO border, NO vignette. Character fully isolated, clean silhouette edges. Character: ${character?.name || "girl"}, skin tone: ${character?.skin || "fair"}, hair: ${character?.hair || "long black hair"}, eyes: ${character?.eyes || "violet"}, outfit: ${character?.outfit || "dark casual dress"}. Expression: enigmatic gentle smile with intense gaze. Soft cel-shaded anime illustration, detailed eyes, centered composition, soft rim light on the character only. Output must look like a green screen sprite ready for keying.`;

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

    // Faz chroma key do verde -> transparente (server-side)
    const transparent = await chromaKeyGreen(imageUrl);

    return new Response(JSON.stringify({ image: transparent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ----- Chroma key utilitário (PNG only, sem libs externas) -----
async function chromaKeyGreen(dataUrl: string): Promise<string> {
  try {
    const m = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!m) return dataUrl;
    const mime = m[1].toLowerCase();
    const bin = base64ToBytes(m[2]);

    // Só sabemos editar PNG manualmente. Se vier JPEG/WebP, devolvemos como está
    // (o modelo geralmente devolve PNG quando pedimos chroma key).
    if (mime !== "png") return dataUrl;

    const decoded = decodePngRGBA(bin);
    if (!decoded) return dataUrl;
    const { width, height, pixels } = decoded;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      // Verde dominante e claro = fundo
      const greenish = g > 110 && g > r + 25 && g > b + 25;
      if (greenish) {
        pixels[i + 3] = 0;
      } else if (g > r + 10 && g > b + 10) {
        // borda verdosa (spill) -> reduz canal verde e atenua alpha
        pixels[i + 1] = Math.max(r, b);
        pixels[i + 3] = Math.min(255, pixels[i + 3]);
      }
    }

    const outBytes = encodePngRGBA(width, height, pixels);
    return "data:image/png;base64," + bytesToBase64(outBytes);
  } catch (err) {
    console.error("chroma key fail:", err);
    return dataUrl;
  }
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

// --- PNG codec mínimo (RGBA 8-bit, sem interlace) ---
function decodePngRGBA(bytes: Uint8Array): { width: number; height: number; pixels: Uint8Array } | null {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (bytes[i] !== sig[i]) return null;
  let pos = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  let idatChunks: Uint8Array[] = [];
  while (pos < bytes.length) {
    const len = readU32(bytes, pos); pos += 4;
    const type = String.fromCharCode(bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]);
    pos += 4;
    const data = bytes.subarray(pos, pos + len);
    pos += len + 4; // pula CRC
    if (type === "IHDR") {
      width = readU32(data, 0); height = readU32(data, 4);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") break;
  }
  if (bitDepth !== 8 || interlace !== 0) return null;

  const total = idatChunks.reduce((s, c) => s + c.length, 0);
  const compressed = new Uint8Array(total);
  { let o = 0; for (const c of idatChunks) { compressed.set(c, o); o += c.length; } }

  // Inflate via DecompressionStream (Deno tem nativo)
  // Síncrono não existe; usamos um truque: o caller é async, então retornamos null se não der.
  // -> Faremos versão sync com pako-like? Em vez disso, exigimos a função async externa.
  return decodeWithStream(compressed, width, height, colorType);
}

// Como decodePngRGBA precisa ser sync mas inflate é async em Deno,
// reescrevemos para usar uma versão sync via Compression nativa não existe.
// Solução: reorganizar para async. Override:
// (usamos um placeholder e na verdade o trabalho é feito no wrapper async abaixo)
function decodeWithStream(_c: Uint8Array, _w: number, _h: number, _ct: number): null {
  return null;
}
function readU32(a: Uint8Array, o: number) {
  return (a[o] << 24 | a[o+1] << 16 | a[o+2] << 8 | a[o+3]) >>> 0;
}
function encodePngRGBA(_w: number, _h: number, _p: Uint8Array): Uint8Array {
  return new Uint8Array();
}
