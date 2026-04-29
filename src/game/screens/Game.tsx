import { useEffect, useMemo, useState } from "react";
import { Eye, KeyRound, Pause, ChevronLeft, ChevronRight, Sparkles, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Scene3D from "../components/Scene3D";
import ChatPanel from "../components/ChatPanel";
import PauseMenu from "../components/PauseMenu";
import RoomPicker from "../components/RoomPicker";
import AvatarSVG from "../components/AvatarSVG";
import type { SaveState, Character, ChatMessage, Mood, Room } from "../types";
import { writeSave } from "../storage";
import { toast } from "sonner";
import { analyzeGameState, MOOD_LABELS, ROOM_CLUES } from "../gameState";
import { playRoomAmbience, stopAmbience } from "../audio";

export default function Game({
  initial, onExit,
}: { initial: SaveState; onExit: () => void }) {
  const [character, setCharacter] = useState<Character>(initial.character);
  const [messages, _setMessages] = useState<ChatMessage[]>(initial.messages);
  const [room, setRoom] = useState<Room>("sala");
  const [paused, setPaused] = useState(false);
  const [discoveredClues, setDiscoveredClues] = useState<string[]>(initial.discoveredClues ?? []);
  const [hudHidden, setHudHidden] = useState(false);
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
  const gameState = useMemo(() => analyzeGameState(messages, discoveredClues.length), [messages, discoveredClues.length]);
  const clueHere = discoveredClues.includes(ROOM_CLUES[room].id);
  const expressionStyles: Record<Mood, string> = {
    calm: "saturate-100 contrast-100",
    soft: "saturate-125 brightness-110",
    tense: "saturate-75 contrast-125 hue-rotate-15",
    angry: "saturate-150 contrast-125 brightness-90",
    hopeful: "saturate-125 brightness-125 drop-shadow-[0_0_28px_hsl(var(--primary)/0.55)]",
  };

  // wrapper que persiste sempre
  const setMessages = (updater: (m: ChatMessage[]) => ChatMessage[]) => {
    _setMessages((prev) => {
      const next = updater(prev);
      writeSave({ character, portrait: null, messages: next, warningSeen: true, discoveredClues });
      return next;
    });
  };

  // persiste personagem
  useEffect(() => {
    writeSave({ character, portrait: null, messages, warningSeen: true, discoveredClues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, discoveredClues]);

  // Ambiente sonoro por cômodo
  useEffect(() => {
    playRoomAmbience(room);
    return () => { /* mantido entre trocas */ };
  }, [room]);
  useEffect(() => () => stopAmbience(), []);

  const handleClearMemory = () => {
    _setMessages(() => {
      writeSave({ character, portrait: null, messages: [], warningSeen: true, discoveredClues });
      return [];
    });
    toast.success(`${character.name} esqueceu tudo.`);
  };

  const handleInspectClue = () => {
    const clue = ROOM_CLUES[room];
    if (discoveredClues.includes(clue.id)) return;
    const nextClues = [...discoveredClues, clue.id];
    const clueMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: `*Você examina ${clue.label}.* ${clue.reveal}`, ts: Date.now() };
    setDiscoveredClues(nextClues);
    _setMessages((prev) => {
      const next = [...prev, clueMsg];
      writeSave({ character, portrait: null, messages: next, warningSeen: true, discoveredClues: nextClues });
      return next;
    });
  };

  const handleTryDoor = () => {
    const success = discoveredClues.length >= 4 && gameState.persuasion >= 75;
    const content = success
      ? `*${character.name} olha para a chave na sua mão por um tempo longo demais.* "...vai. Antes que eu mude de ideia." A porta destranca.`
      : `A fechadura resiste. Você precisa entender melhor a casa — e tocar alguma parte humana em ${character.name}.`;
    const doorMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content, ts: Date.now() };
    _setMessages((prev) => {
      const next = [...prev, doorMsg];
      writeSave({ character, portrait: null, messages: next, warningSeen: true, discoveredClues });
      return next;
    });
  };

  const handleUpdateCharacter = async (c: Character) => {
    setCharacter(c);
    _setMessages(() => {
      writeSave({ character: c, portrait: null, messages: [], warningSeen: true, discoveredClues });
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
          <div className="pointer-events-auto">
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

      {/* Cena 3D + retrato sobreposto */}
      <div className="relative flex-1 min-h-0">
        <Scene3D room={room} clueFound={clueHere} mood={gameState.mood} />
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
                className={`h-full w-auto select-none transition-all duration-700 animate-char-blink ${expressionStyles[gameState.mood]}`}
                style={{ filter: "drop-shadow(0 18px 32px hsl(var(--primary) / 0.45))" }}
              />
            </div>
          </div>
        </div>
        {!hudHidden && (
        <div className="absolute top-16 left-3 flex flex-col gap-2 z-20">
          <div className="bg-card-soft border border-border/60 rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            {room} · {MOOD_LABELS[gameState.mood]}
          </div>
          {!clueHere && (
            <div className="flex items-center gap-1.5 bg-accent/20 border border-accent/50 rounded-lg px-2 py-1 text-[10px] uppercase tracking-widest text-accent-foreground animate-pulse">
              <Sparkles className="w-3 h-3" /> pista neste cômodo
            </div>
          )}
          <Button onClick={handleInspectClue} disabled={clueHere} size="sm" variant="outline" className="justify-start bg-card-soft border-primary/40 text-xs">
            <Eye className="w-3.5 h-3.5 mr-2" /> {clueHere ? "pista encontrada" : `examinar ${ROOM_CLUES[room].label}`}
          </Button>
          <Button onClick={handleTryDoor} size="sm" variant="outline" className="justify-start bg-card-soft border-accent/40 text-xs">
            <KeyRound className="w-3.5 h-3.5 mr-2" /> tentar a porta ({discoveredClues.length}/4)
          </Button>
        </div>
        )}
      </div>

      {/* Chat (oculta com HUD) */}
      {!hudHidden && (
        <div className="h-[44%] sm:h-[40%] min-h-[260px] z-20">
          <ChatPanel character={character} messages={messages} setMessages={setMessages} mood={gameState.mood} persuasion={gameState.persuasion} suspicion={gameState.suspicion} />
        </div>
      )}

      {paused && (
        <PauseMenu
          character={character}
          messages={messages}
          onClose={() => setPaused(false)}
          onSaveExit={() => { writeSave({ character, portrait: null, messages, warningSeen: true, discoveredClues }); onExit(); }}
          onClearMemory={handleClearMemory}
          onUpdateCharacter={handleUpdateCharacter}
        />
      )}
    </div>
  );
}
