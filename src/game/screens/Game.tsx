import { useEffect, useMemo, useState } from "react";
import { Eye, Pause, ChevronLeft, ChevronRight, EyeOff, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Scene3D from "../components/Scene3D";
import ChatPanel from "../components/ChatPanel";
import PauseMenu from "../components/PauseMenu";
import RoomPicker from "../components/RoomPicker";
import AvatarSVG from "../components/AvatarSVG";
import CreditIndicator from "../components/CreditIndicator";
import MoodOverlay from "../components/MoodOverlay";
import type { SaveState, Character, ChatMessage, Mood, Room } from "../types";
import { DEFAULT_CHAT_SETTINGS } from "../types";
import type { ChatSettings } from "../types";
import { writeSave } from "../storage";
import { toast } from "sonner";
import { analyzeGameState, MOOD_LABELS } from "../gameState";
import { extractActions, detectRoomFromActions } from "../actionParser";
import { playRoomAmbience, stopAmbience } from "../audio";

export default function Game({
  initial, onExit,
}: { initial: SaveState; onExit: () => void }) {
  const [character, setCharacter] = useState<Character>(initial.character);
  const [messages, _setMessages] = useState<ChatMessage[]>(initial.messages);
  const [room, setRoom] = useState<Room>("sala");
  const [paused, setPaused] = useState(false);
  const [hudHidden, setHudHidden] = useState(false);
  const [moodOverlayOn, setMoodOverlayOn] = useState(false);
  const [chatSettings, setChatSettings] = useState<ChatSettings>(initial.chatSettings ?? DEFAULT_CHAT_SETTINGS);
  const ROOM_ORDER: Room[] = ["sala", "cozinha", "banheiro", "quarto"];
  const roomIdx = ROOM_ORDER.indexOf(room);
  const [transitioning, setTransitioning] = useState(false);
  const changeRoom = (target: Room) => {
    if (target === room || transitioning) return;
    setTransitioning(true);
    window.setTimeout(() => {
      setRoom(target);
      window.setTimeout(() => setTransitioning(false), 320);
    }, 280);
  };
  const goPrev = () => changeRoom(ROOM_ORDER[(roomIdx - 1 + ROOM_ORDER.length) % ROOM_ORDER.length]);
  const goNext = () => changeRoom(ROOM_ORDER[(roomIdx + 1) % ROOM_ORDER.length]);
  const gameState = useMemo(() => analyzeGameState(messages, 0), [messages]);
  const expressionStyles: Record<Mood, string> = {
    calm: "saturate-100 contrast-100",
    soft: "saturate-125 brightness-110",
    tense: "saturate-75 contrast-125 hue-rotate-15",
    angry: "saturate-150 contrast-125 brightness-90",
    hopeful: "saturate-125 brightness-125 drop-shadow-[0_0_28px_hsl(var(--primary)/0.55)]",
    shy: "saturate-125 brightness-105 drop-shadow-[0_0_22px_hsl(var(--primary)/0.45)]",
    happy: "saturate-125 brightness-115 drop-shadow-[0_0_24px_hsl(var(--accent)/0.5)]",
    sad: "saturate-75 brightness-90",
    surprised: "saturate-110 brightness-110 contrast-110",
    crying: "saturate-90 brightness-95 hue-rotate-[-8deg]",
    blush: "saturate-150 brightness-110 drop-shadow-[0_0_26px_hsl(var(--primary)/0.55)]",
    flirty: "saturate-125 brightness-110 contrast-110 drop-shadow-[0_0_22px_hsl(var(--accent)/0.55)]",
    scared: "saturate-75 brightness-90 contrast-125 hue-rotate-[-15deg]",
    sleepy: "saturate-90 brightness-95 contrast-90",
  };

  // wrapper que persiste sempre
  const setMessages = (updater: (m: ChatMessage[]) => ChatMessage[]) => {
    _setMessages((prev) => {
      const next = updater(prev);
      writeSave({ character, portrait: null, messages: next, warningSeen: true, chatSettings });
      return next;
    });
  };

  // persiste personagem
  useEffect(() => {
    writeSave({ character, portrait: null, messages, warningSeen: true, chatSettings });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, chatSettings]);

  // Ambiente sonoro por cômodo
  useEffect(() => {
    playRoomAmbience(room);
    return () => { /* mantido entre trocas */ };
  }, [room]);
  useEffect(() => () => stopAmbience(), []);

  // Autorizador de troca de cômodo: só troca se o cômodo aparecer DENTRO de *asteriscos*
  // (isto é, como AÇÃO da IA ou do jogador — não apenas citado em fala).
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    const target = detectRoomFromActions(extractActions(last.content));
    if (target && target !== room && !transitioning) {
      changeRoom(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleClearMemory = () => {
    _setMessages(() => {
      writeSave({ character, portrait: null, messages: [], warningSeen: true, chatSettings });
      return [];
    });
    toast.success(`${character.name} esqueceu tudo.`);
  };

  const handleUpdateCharacter = async (c: Character) => {
    setCharacter(c);
    _setMessages(() => {
      writeSave({ character: c, portrait: null, messages: [], warningSeen: true, chatSettings });
      return [];
    });
    toast.success("A IA mudou. A memória foi apagada.");
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Top bar (oculta com HUD) */}
      {!hudHidden && (
        <div className="absolute top-3 left-3 right-16 z-30 flex items-center justify-between gap-2 pointer-events-none">
          <RoomPicker current={room} onPick={changeRoom} />
          <div className="pointer-events-auto flex items-center gap-2">
            <CreditIndicator />
            <Button onClick={() => setPaused(true)} size="icon" variant="outline" className="bg-card-soft border-primary/40">
              <Pause className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Botão de mostrar/ocultar HUD — SEMPRE visível */}
      <button
        onClick={() => setHudHidden((v) => !v)}
        aria-label={hudHidden ? "Mostrar interface" : "Ocultar interface"}
        title={hudHidden ? "Mostrar interface" : "Ocultar interface"}
        className="fixed top-3 right-3 z-50 w-10 h-10 rounded-full bg-card-soft/90 hover:bg-primary/30 border border-primary/60 backdrop-blur-md flex items-center justify-center text-primary-glow shadow-glow transition-all"
      >
        {hudHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>

      {/* Toggle do overlay de emoção — visível sempre que o HUD estiver visível */}
      {!hudHidden && (
        <button
          onClick={() => setMoodOverlayOn((v) => !v)}
          aria-label={moodOverlayOn ? "Ocultar overlay de emoção" : "Mostrar overlay de emoção"}
          title={moodOverlayOn ? "Ocultar overlay de emoção" : "Mostrar overlay de emoção"}
          className={`fixed top-14 right-3 z-50 w-10 h-10 rounded-full border backdrop-blur-md flex items-center justify-center shadow-glow transition-all ${
            moodOverlayOn
              ? "bg-primary/30 border-primary text-primary-glow"
              : "bg-card-soft/90 border-primary/60 text-primary-glow hover:bg-primary/20"
          }`}
        >
          <Activity className="w-4 h-4" />
        </button>
      )}

      {/* Cena 3D + retrato sobreposto */}
      <div className="relative flex-1 min-h-0">
        <Scene3D room={room} mood={gameState.mood} />
        {/* Overlay de transição entre cômodos */}
        <div
          className={`pointer-events-none absolute inset-0 z-30 bg-background transition-opacity duration-300 ${
            transitioning ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Setas point-and-click laterais (ocultam com HUD) */}
        {!hudHidden && (
          <>
            <button
              onClick={goPrev}
              aria-label="Cômodo anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-16 sm:w-14 sm:h-20 rounded-2xl bg-card-soft/70 hover:bg-primary/30 border border-primary/40 backdrop-blur-md flex items-center justify-center shadow-glow text-primary-glow transition-all"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            <button
              onClick={goNext}
              aria-label="Próximo cômodo"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-16 sm:w-14 sm:h-20 rounded-2xl bg-card-soft/70 hover:bg-primary/30 border border-primary/40 backdrop-blur-md flex items-center justify-center shadow-glow text-primary-glow transition-all"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </>
        )}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center z-10">
          <div className="animate-char-sway origin-bottom h-[78%] sm:h-[92%] max-h-[640px] flex items-end">
            <div className="animate-char-breathe h-full flex items-end">
              <AvatarSVG
                character={character}
                mood={gameState.mood}
                secondaryMood={gameState.secondaryMood}
                className={`h-full w-auto select-none transition-all duration-700 animate-char-blink ${expressionStyles[gameState.mood]}`}
                style={{ filter: "drop-shadow(0 18px 32px hsl(var(--primary) / 0.45))" }}
              />
            </div>
          </div>
        </div>
        {!hudHidden && moodOverlayOn && (
          <MoodOverlay
            mood={gameState.mood}
            confidence={gameState.confidence}
            triggers={gameState.triggers}
          />
        )}
        {!hudHidden && (
        <div className="absolute top-16 left-3 flex flex-col gap-2 z-20">
          <div className="bg-card-soft border border-border/60 rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            {room} · {MOOD_LABELS[gameState.mood]}
          </div>
        </div>
        )}
      </div>

      {/* Chat (oculta com HUD) */}
      {!hudHidden && (
        <div className="h-[44%] sm:h-[40%] min-h-[260px] z-20">
          <ChatPanel character={character} messages={messages} setMessages={setMessages} mood={gameState.mood} persuasion={gameState.persuasion} suspicion={gameState.suspicion} chatSettings={chatSettings} />
        </div>
      )}

      {paused && (
        <PauseMenu
          character={character}
          messages={messages}
          onClose={() => setPaused(false)}
          onSaveExit={() => { writeSave({ character, portrait: null, messages, warningSeen: true, chatSettings }); onExit(); }}
          onClearMemory={handleClearMemory}
          onUpdateCharacter={handleUpdateCharacter}
          chatSettings={chatSettings}
          onUpdateChatSettings={(s) => {
            setChatSettings(s);
            writeSave({ character, portrait: null, messages, warningSeen: true, chatSettings: s });
            toast.success("Configurações atualizadas!");
          }}
        />
      )}
    </div>
  );
}
