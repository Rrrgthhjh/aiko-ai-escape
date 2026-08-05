import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Send, AlertTriangle, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import type { Character, ChatMessage, Mood, Room } from "../types";
import type { ChatSettings } from "../types";
import { DEFAULT_CHAT_SETTINGS, isPublicPlace } from "../types";
import { MOOD_LABELS } from "../gameState";
import { streamChat } from "../chat";
import { findCachedResponse, loadChatCache, addCacheEntry } from "../storage";
import { useDevMode } from "../devMode";
import { extractAgeFromText, voiceProfileForAge } from "../voice";

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts`;
const STT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stt`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

/** Remove asteriscos (ações) e markdown básico para TTS mais natural. */
function stripForSpeech(text: string): string {
  return text
    .replace(/\*[^*]+\*/g, " ")
    .replace(/[*_`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type Props = {
  character: Character;
  messages: ChatMessage[];
  setMessages: (updater: (m: ChatMessage[]) => ChatMessage[]) => void;
  mood: Mood;
  chatSettings?: ChatSettings;
  /** Callback opcional para exibir legendas fora do chat (ex.: sobre a cena). */
  onCaption?: (text: string | null) => void;
  /** Local atual — a IA sempre sabe onde está. */
  room: Room;
};

export default function ChatPanel({ character, messages, setMessages, mood, chatSettings, onCaption, room }: Props) {
  const settings = chatSettings ?? DEFAULT_CHAT_SETTINGS;
  const devMode = useDevMode();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState<boolean>(() => localStorage.getItem("aiko:voice") === "1");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micPermission, setMicPermission] = useState<"unknown" | "granted" | "denied" | "prompt">("unknown");
  const [askingMic, setAskingMic] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const voiceProfile = (() => {
    const age = extractAgeFromText(character.personality || "");
    return voiceProfileForAge(age);
  })();

  useEffect(() => {
    localStorage.setItem("aiko:voice", voiceMode ? "1" : "0");
    if (!voiceMode && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [voiceMode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const speak = async (rawText: string) => {
    const text = stripForSpeech(rawText);
    if (!text) return;
    try {
      // interrompe áudio anterior
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const resp = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({
          text,
          voice: voiceProfile.voice,
          instructions: voiceProfile.instructions,
          speed: voiceProfile.speed,
        }),
      });
      if (!resp.ok) return;
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      onCaption?.(text);
      const clear = () => { onCaption?.(null); URL.revokeObjectURL(url); };
      audio.onended = clear;
      audio.onpause = () => { if (audio.currentTime >= audio.duration - 0.05) clear(); };
      await audio.play().catch(() => {});
    } catch {
      /* falha silenciosa — mantém experiência textual */
    }
  };

  const startRecording = async () => {
    if (recording || loading || transcribing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : (MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "");
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (blob.size < 1500) { setWarn("Gravação muito curta — tente novamente."); return; }
        setTranscribing(true);
        try {
          const form = new FormData();
          form.append("file", blob, "recording.webm");
          const resp = await fetch(STT_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${ANON}` },
            body: form,
          });
          const data = await resp.json();
          if (data?.text) {
            setInput((prev) => (prev ? prev + " " : "") + data.text);
            // envia imediatamente após transcrever
            setTimeout(() => sendWithText(data.text), 50);
          } else {
            setWarn(data?.error || "Não consegui entender o áudio.");
          }
        } catch {
          setWarn("Falha na transcrição.");
        } finally {
          setTranscribing(false);
        }
      };
      rec.start();
      setRecording(true);
    } catch (e) {
      const err = e as { name?: string };
      if (err?.name === "NotAllowedError" || err?.name === "SecurityError") {
        setMicPermission("denied");
        setWarn("Permissão do microfone negada. Clique no cadeado 🔒 na barra de endereço do navegador e permita o microfone para este site.");
      } else if (err?.name === "NotFoundError") {
        setWarn("Nenhum microfone encontrado no dispositivo.");
      } else {
        setWarn("Não foi possível acessar o microfone.");
      }
    }
  };

  /** Dispara o diálogo nativo de permissão do navegador. */
  const requestMicPermission = async () => {
    setAskingMic(true);
    setWarn(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicPermission("granted");
    } catch (e) {
      const err = e as { name?: string };
      setMicPermission(err?.name === "NotAllowedError" ? "denied" : "prompt");
      setWarn(
        err?.name === "NotAllowedError"
          ? "Você bloqueou o microfone. Abra o cadeado 🔒 do navegador e mude para 'Permitir'."
          : "Não foi possível acessar o microfone.",
      );
    } finally {
      setAskingMic(false);
    }
  };

  // Consulta o estado da permissão ao ligar o modo de voz.
  useEffect(() => {
    if (!voiceMode) return;
    const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
    if (!perms?.query) { setMicPermission("prompt"); return; }
    perms
      .query({ name: "microphone" as PermissionName })
      .then((st) => {
        setMicPermission(st.state as "granted" | "denied" | "prompt");
        st.onchange = () => setMicPermission(st.state as "granted" | "denied" | "prompt");
      })
      .catch(() => setMicPermission("prompt"));
  }, [voiceMode]);

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const sendWithText = async (rawText: string) => {
    if (loading) return;
    let cleaned: string;
    if (devMode) {
      cleaned = rawText.trim();
      if (!cleaned) return;
      setWarn(null);
    } else {
      const f = filterUserMessage(rawText);
      if (f.ok === false) { setWarn(f.reason); return; }
      setWarn(null);
      cleaned = f.cleaned;
    }
    // Sem limite de tamanho — a mensagem vai inteira.
    const trimmed = cleaned;
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
      if (voiceMode) speak(cached);
    } else {
      let acc = "";
      await streamChat({
        history: [...messages, userMsg],
        character,
        chatSettings: settings,
        room,
        isPublic: isPublicPlace(room),
        impressions: loadImpressions().map((i) => i.text),
        onDelta: (c) => {
          acc += c;
          setMessages((m) => m.map((x) => (x.id === aiId ? { ...x, content: acc } : x)));
        },
        onDone: () => {
          setLoading(false);
          if (acc.length > 5) addCacheEntry(trimmed, acc);
          if (voiceMode && acc) speak(acc);
        },
        onError: (msg) => {
          setMessages((m) => m.map((x) => (x.id === aiId ? { ...x, content: `*ela hesita* — ${msg}` } : x)));
          setLoading(false);
        },
      });
    }
  };

  // Sem saudação automática: a IA só responde após o jogador enviar a primeira mensagem.
  // Isso garante que o idioma da resposta seja detectado pela fala do jogador.

  const send = () => sendWithText(input);

  return (
    <div className="flex flex-col h-full bg-card-soft border-t border-border/60 backdrop-blur-md">
      <div className="px-4 py-2 border-b border-border/60 flex items-center justify-between gap-3 text-[10px] uppercase tracking-widest">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-display text-primary-glow truncate">{character.name}: {MOOD_LABELS[mood]}</span>
        </div>
        <button
          onClick={() => setVoiceMode((v) => !v)}
          title={voiceMode ? "Desativar voz" : "Ativar modo de voz"}
          className={`shrink-0 h-7 w-7 rounded-md border flex items-center justify-center transition-colors ${
            voiceMode ? "bg-primary/30 border-primary text-primary-glow" : "border-border/60 text-muted-foreground hover:text-primary-glow"
          }`}
        >
          {voiceMode ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
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

      {/* Pedido explícito de permissão do microfone */}
      {voiceMode && micPermission !== "granted" && (
        <div className="px-4 py-2 text-xs flex items-center gap-2 bg-primary/15 border-t border-primary/40 text-foreground">
          <Mic className="w-4 h-4 shrink-0 text-primary-glow" />
          <span className="flex-1">
            {micPermission === "denied"
              ? "O microfone está bloqueado para este site. Abra o cadeado 🔒 na barra de endereço e permita o microfone."
              : "Para falar com ela, o navegador precisa da sua permissão de microfone."}
          </span>
          {micPermission !== "denied" && (
            <Button size="sm" onClick={requestMicPermission} disabled={askingMic} className="h-7 text-xs shrink-0">
              {askingMic ? <Loader2 className="w-3 h-3 animate-spin" /> : "Permitir microfone"}
            </Button>
          )}
        </div>
      )}

      <div className="p-3 border-t border-border/60 flex gap-2">
        {voiceMode && (
          <Button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={() => recording && stopRecording()}
            onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
            disabled={loading || transcribing}
            size="icon"
            variant={recording ? "destructive" : "outline"}
            title="Segure para falar"
            className="shrink-0"
          >
            {transcribing ? <Loader2 className="w-4 h-4 animate-spin" /> : recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={voiceMode ? `Segure o microfone ou digite para ${character.name}...` : (devMode ? `[DEV] Fale com ${character.name}...` : `Fale com ${character.name}...`)}
          rows={1}
          className={`flex-1 resize-none bg-input/80 border rounded-xl px-3 py-2 text-sm focus:outline-none max-h-32 ${devMode ? "border-destructive/60 focus:border-destructive" : "border-border focus:border-primary/60"}`}
        />
        <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="bg-aurora text-primary-foreground shadow-glow shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
