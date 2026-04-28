import { useEffect, useMemo, useState } from "react";
import { Eye, KeyRound, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import Scene3D from "../components/Scene3D";
import ChatPanel from "../components/ChatPanel";
import PauseMenu from "../components/PauseMenu";
import RoomPicker from "../components/RoomPicker";
import Loading from "./Loading";
import type { SaveState, Character, ChatMessage, Mood, Room } from "../types";
import { writeSave } from "../storage";
import { generatePortrait } from "../chat";
import { toast } from "sonner";
import { analyzeGameState, MOOD_LABELS, ROOM_CLUES } from "../gameState";

export default function Game({
  initial, onExit,
}: { initial: SaveState; onExit: () => void }) {
  const [character, setCharacter] = useState<Character>(initial.character);
  const [portrait, setPortrait] = useState<string | null>(initial.portrait);
  const [messages, _setMessages] = useState<ChatMessage[]>(initial.messages);
  const [room, setRoom] = useState<Room>("sala");
  const [paused, setPaused] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [discoveredClues, setDiscoveredClues] = useState<string[]>(initial.discoveredClues ?? []);
  const gameState = useMemo(() => analyzeGameState(messages, discoveredClues.length), [messages, discoveredClues.length]);
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
      writeSave({ character, portrait, messages: next, warningSeen: true, discoveredClues });
      return next;
    });
  };

  // persiste personagem/retrato
  useEffect(() => {
    writeSave({ character, portrait, messages, warningSeen: true, discoveredClues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, portrait, discoveredClues]);

  const handleClearMemory = () => {
    _setMessages(() => {
      writeSave({ character, portrait, messages: [], warningSeen: true, discoveredClues });
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
      writeSave({ character, portrait, messages: next, warningSeen: true, discoveredClues: nextClues });
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
      writeSave({ character, portrait, messages: next, warningSeen: true, discoveredClues });
      return next;
    });
  };

  const handleUpdateCharacter = async (c: Character) => {
    setRegenLoading(true);
    try {
      const img = await generatePortrait(c);
      setCharacter(c);
      setPortrait(img);
      _setMessages(() => {
        writeSave({ character: c, portrait: img, messages: [], warningSeen: true });
        return [];
      });
      toast.success("A IA mudou. A memória foi apagada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao atualizar");
    } finally {
      setRegenLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        <RoomPicker current={room} onPick={setRoom} />
        <div className="pointer-events-auto">
          <Button onClick={() => setPaused(true)} size="icon" variant="outline" className="bg-card-soft border-primary/40">
            <Pause className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Cena 3D + retrato sobreposto */}
      <div className="relative flex-1 min-h-0">
        <Scene3D room={room} clueFound={discoveredClues.includes(ROOM_CLUES[room].id)} mood={gameState.mood} />
        {portrait && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center z-10">
            <img
              src={portrait}
              alt={character.name}
              className={`h-[78%] sm:h-[92%] max-h-[640px] w-auto object-contain select-none transition-all duration-700 ${expressionStyles[gameState.mood]}`}
              style={{ filter: "drop-shadow(0 18px 32px hsl(var(--primary) / 0.45))" }}
            />
          </div>
        )}
        <div className="absolute top-16 left-3 flex flex-col gap-2 z-20">
          <div className="bg-card-soft border border-border/60 rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            {room} · {MOOD_LABELS[gameState.mood]}
          </div>
          <Button onClick={handleInspectClue} disabled={discoveredClues.includes(ROOM_CLUES[room].id)} size="sm" variant="outline" className="justify-start bg-card-soft border-primary/40 text-xs">
            <Eye className="w-3.5 h-3.5 mr-2" /> {discoveredClues.includes(ROOM_CLUES[room].id) ? "pista encontrada" : `examinar ${ROOM_CLUES[room].label}`}
          </Button>
          <Button onClick={handleTryDoor} size="sm" variant="outline" className="justify-start bg-card-soft border-accent/40 text-xs">
            <KeyRound className="w-3.5 h-3.5 mr-2" /> tentar a porta ({discoveredClues.length}/4)
          </Button>
        </div>
      </div>

      {/* Chat */}
      <div className="h-[44%] sm:h-[40%] min-h-[260px] z-20">
        <ChatPanel character={character} messages={messages} setMessages={setMessages} mood={gameState.mood} persuasion={gameState.persuasion} suspicion={gameState.suspicion} />
      </div>

      {paused && (
        <PauseMenu
          character={character}
          messages={messages}
          onClose={() => setPaused(false)}
          onSaveExit={() => { writeSave({ character, portrait, messages, warningSeen: true, discoveredClues }); onExit(); }}
          onClearMemory={handleClearMemory}
          onUpdateCharacter={handleUpdateCharacter}
        />
      )}

      {regenLoading && <Loading label="Redesenhando ela..." />}
    </div>
  );
}
