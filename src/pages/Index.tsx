import { useEffect, useState } from "react";
import MainMenu from "@/game/screens/MainMenu";
import WarningScreen from "@/game/screens/WarningScreen";
import Game from "@/game/screens/Game";
import CharacterCreator from "@/game/components/CharacterCreator";
import { loadSave, writeSave, clearSave } from "@/game/storage";
import type { SaveState, Character } from "@/game/types";

type Phase = "menu" | "creating" | "warning" | "playing";

const Index = () => {
  const [phase, setPhase] = useState<Phase>("menu");
  const [save, setSave] = useState<SaveState | null>(null);

  useEffect(() => {
    document.title = "KAGO — Escape Room Anime";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Jogo escape room anime onde você conversa com uma IA que diz ser sua amiga, mas te raptou.");
  }, []);

  const startNew = () => { clearSave(); setPhase("creating"); };

  const handleContinue = () => {
    const s = loadSave();
    if (!s) { setPhase("creating"); return; }
    setSave(s);
    setPhase(s.warningSeen ? "playing" : "warning");
  };

  const handleCreate = (c: Character) => {
    const fresh: SaveState = { character: c, portrait: null, messages: [], warningSeen: false, discoveredClues: [] };
    writeSave(fresh);
    setSave(fresh);
    setPhase("warning");
  };

  const finishWarning = () => {
    if (!save) return;
    const updated = { ...save, warningSeen: true };
    writeSave(updated);
    setSave(updated);
    setPhase("playing");
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <h1 className="sr-only">KAGO — jogo escape room anime com IA</h1>

      {phase === "menu" && (
        <MainMenu onStart={(mode) => (mode === "new" ? startNew() : handleContinue())} />
      )}

      {phase === "creating" && (
        <div className="h-full overflow-y-auto py-6 px-4">
          <div className="min-h-full flex items-start sm:items-center justify-center">
            <CharacterCreator onConfirm={handleCreate} ctaLabel="Entrar na casa" />
          </div>
        </div>
      )}

      {phase === "warning" && <WarningScreen onContinue={finishWarning} />}

      {phase === "playing" && save && <Game initial={save} onExit={() => setPhase("menu")} />}
    </main>
  );
};

export default Index;
