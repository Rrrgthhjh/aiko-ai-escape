import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Send, AlertTriangle, Loader2 } from "lucide-react";
import type { Character, ChatMessage, Mood } from "../types";
import type { ChatSettings } from "../types";
import { DEFAULT_CHAT_SETTINGS } from "../types";
import { streamChat } from "../chat";
import { filterUserMessage } from "../contentFilter";
import { MOOD_LABELS } from "../gameState";
import { findCachedResponse, loadChatCache, addCacheEntry } from "../storage";
import { useDevMode, DEV_MAX_MESSAGE_LENGTH } from "../devMode";

type Props = {
  character: Character;
  messages: ChatMessage[];
  setMessages: (updater: (m: ChatMessage[]) => ChatMessage[]) => void;
  mood: Mood;
  persuasion: number;
  suspicion: number;
  chatSettings?: ChatSettings;
};

export default function ChatPanel({ character, messages, setMessages, mood, persuasion, suspicion, chatSettings }: Props) {
  const settings = chatSettings ?? DEFAULT_CHAT_SETTINGS;
  const devMode = useDevMode();
  const effectiveMaxLength = devMode ? DEV_MAX_MESSAGE_LENGTH : settings.maxMessageLength;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Sem saudação automática: a IA só responde após o jogador enviar a primeira mensagem.
  // Isso garante que o idioma da resposta seja detectado pela fala do jogador.

  const send = async () => {
    if (loading) return;
    let cleaned: string;
    if (devMode) {
      cleaned = input.trim();
      if (!cleaned) { setWarn("Mensagem vazia."); return; }
      setWarn(null);
    } else {
      const f = filterUserMessage(input);
      if (f.ok === false) { setWarn(f.reason); return; }
      setWarn(null);
      cleaned = f.cleaned;
    }
    const trimmed = cleaned.slice(0, effectiveMaxLength);
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const aiId = crypto.randomUUID();
    setMessages((m) => [...m, { id: aiId, role: "assistant", content: "", ts: Date.now() }]);

    const cached = findCachedResponse(trimmed, loadChatCache());
    if (cached) {
      setMessages((m) => m.map((x) => (x.id === aiId ? { ...x, content: cached } : x)));
      setLoading(false);
    } else {
      let acc = "";
      await streamChat({
        history: [...messages, userMsg],
        character,
        chatSettings: settings,
        onDelta: (c) => {
          acc += c;
          setMessages((m) => m.map((x) => (x.id === aiId ? { ...x, content: acc } : x)));
        },
        onDone: () => {
          setLoading(false);
          if (acc.length > 5) addCacheEntry(trimmed, acc);
        },
        onError: (msg) => {
          setMessages((m) => m.map((x) => (x.id === aiId ? { ...x, content: `*ela hesita* — ${msg}` } : x)));
          setLoading(false);
        },
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-card-soft border-t border-border/60 backdrop-blur-md">
      <div className="px-4 py-2 border-b border-border/60 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-center text-[10px] uppercase tracking-widest">
        <span className="font-display text-primary-glow">{character.name}: {MOOD_LABELS[mood]}</span>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${persuasion}%` }} />
        </div>
        <span className="text-muted-foreground">convencimento</span>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-destructive transition-all duration-500" style={{ width: `${suspicion}%` }} />
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-muted-foreground text-sm italic text-center pt-8">{character.name} está te observando...</div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary/90 text-primary-foreground rounded-br-sm"
                  : "bg-muted/70 text-foreground rounded-bl-sm border border-primary/20"
              }`}
            >
              {m.role === "assistant" && (
                <div className="text-[10px] uppercase tracking-widest text-primary-glow mb-1 font-display">{character.name}</div>
              )}
              <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_em]:text-primary-glow/80">
                <ReactMarkdown>{m.content || (loading ? "…" : "")}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" /> {character.name} está digitando...
          </div>
        )}
      </div>

      {warn && (
        <div className="px-4 py-2 text-xs flex items-center gap-2 bg-destructive/20 border-t border-destructive/40 text-destructive-foreground">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {warn}
        </div>
      )}

      <div className="p-3 border-t border-border/60 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={devMode ? `[DEV] Fale com ${character.name}...` : `Fale com ${character.name}...`}
          rows={1}
          maxLength={effectiveMaxLength}
          className={`flex-1 resize-none bg-input/80 border rounded-xl px-3 py-2 text-sm focus:outline-none max-h-32 ${devMode ? "border-destructive/60 focus:border-destructive" : "border-border focus:border-primary/60"}`}
        />
        <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="bg-aurora text-primary-foreground shadow-glow shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
