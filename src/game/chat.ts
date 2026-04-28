import type { Character, ChatMessage } from "./types";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export async function streamChat({
  history,
  character,
  onDelta,
  onDone,
  onError,
}: {
  history: ChatMessage[];
  character: Character;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON}` },
      body: JSON.stringify({
        character,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!resp.ok || !resp.body) {
      let msg = "Falha na comunicação com a IA.";
      try { const j = await resp.json(); if (j?.error) msg = j.error; } catch {}
      if (resp.status === 429) msg = "Calma! Você está enviando rápido demais. Espere um instante.";
      if (resp.status === 402) msg = "Os créditos de IA acabaram. Adicione créditos no workspace.";
      onError(msg);
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let done = false;

    while (!done) {
      const { done: d, value } = await reader.read();
      if (d) break;
      buf += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buf.indexOf("\n")) !== -1) {
        let line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line || line.startsWith(":")) continue;
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { done = true; break; }
        try {
          const p = JSON.parse(json);
          const c = p.choices?.[0]?.delta?.content;
          if (c) onDelta(c);
        } catch {
          buf = line + "\n" + buf;
          break;
        }
      }
    }
    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Erro desconhecido");
  }
}

export async function generatePortrait(character: Character): Promise<string> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-portrait`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 25000);
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON}` },
    body: JSON.stringify({ character }),
    signal: controller.signal,
  }).finally(() => window.clearTimeout(timeout));
  if (!resp.ok) {
    const j = await resp.json().catch(() => ({}));
    throw new Error(j.error || "Falha ao gerar retrato");
  }
  const data = await resp.json();
  const raw = data.image as string;
  try {
    return await removeGreenBackground(raw);
  } catch (e) {
    console.warn("chroma key falhou, usando original:", e);
    return raw;
  }
}

// Remove fundo verde (chroma key) usando canvas no navegador.
async function removeGreenBackground(src: string): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const p = data.data;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], g = p[i + 1], b = p[i + 2];
    // Verde dominante e claro -> transparente
    if (g > 110 && g > r + 30 && g > b + 30) {
      p[i + 3] = 0;
    } else if (g > r + 12 && g > b + 12) {
      // Spill verde nas bordas: reduz canal verde
      p[i + 1] = Math.max(r, b);
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem"));
    img.src = src;
  });
}
