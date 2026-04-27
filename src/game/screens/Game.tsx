import { useEffect, useState } from "react";
import { Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import Scene3D from "../components/Scene3D";
import ChatPanel from "../components/ChatPanel";
import PauseMenu from "../components/PauseMenu";
import RoomPicker from "../components/RoomPicker";
import Loading from "./Loading";
import type { SaveState, Character, ChatMessage } from "../types";
import { writeSave } from "../storage";
import { generatePortrait } from "../chat";
import { toast } from "sonner";

type Room = "sala" | "cozinha" | "banheiro" | "quarto";

export default function Game({
  initial, onExit,
}: { initial: SaveState; onExit: () => void }) {
  const [character, setCharacter] = useState<Character>(initial.character);
  const [portrait, setPortrait] = useState<string | null>(initial.portrait);
  const [messages, _setMessages] = useState<ChatMessage[]>(initial.messages);
  const [room, setRoom] = useState<Room>("sala");
  const [paused, setPaused] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);

  // wrapper que persiste sempre
  const setMessages = (updater: (m: ChatMessage[]) => ChatMessage[]) => {
    _setMessages((prev) => {
      const next = updater(prev);
      writeSave({ character, portrait, messages: next, warningSeen: true });
      return next;
    });
  };

  // persiste personagem/retrato
  useEffect(() => {
    writeSave({ character, portrait, messages, warningSeen: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, portrait]);

  const handleClearMemory = () => {
    _setMessages(() => {
      writeSave({ character, portrait, messages: [], warningSeen: true });
      return [];
    });
    toast.success(`${character.name} esqueceu tudo.`);
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
        <Scene3D room={room} />
        {portrait && (
          <div className="pointer-events-none absolute inset-y-0 right-0 sm:right-4 flex items-end sm:items-center justify-end z-10">
            <img
              src={portrait}
              alt={character.name}
              className="h-[60%] sm:h-[80%] max-h-[480px] w-auto object-contain anime-glow drop-shadow-2xl select-none"
              style={{ maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)" }}
            />
          </div>
        )}
        <div className="absolute top-16 left-3 bg-card-soft border border-border/60 rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          {room}
        </div>
      </div>

      {/* Chat */}
      <div className="h-[44%] sm:h-[40%] min-h-[260px] z-20">
        <ChatPanel character={character} messages={messages} setMessages={setMessages} />
      </div>

      {paused && (
        <PauseMenu
          character={character}
          messages={messages}
          onClose={() => setPaused(false)}
          onSaveExit={() => { writeSave({ character, portrait, messages, warningSeen: true }); onExit(); }}
          onClearMemory={handleClearMemory}
          onUpdateCharacter={handleUpdateCharacter}
        />
      )}

      {regenLoading && <Loading label="Redesenhando ela..." />}
    </div>
  );
}
