import type { Character, ChatMessage } from "./types";
import type { ChatSettings } from "./types";
import { DEFAULT_CHAT_SETTINGS } from "./types";

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
  chatSettings?: ChatSettings;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const settings = arguments[0].chatSettings ?? DEFAULT_CHAT_SETTINGS;
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON}` },
      body: JSON.stringify({
        character,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
        settings: { maxTokens: settings.maxTokens, recentLimit: settings.recentLimit },
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

