import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Brain, Settings, Save, X, Trash2, SlidersHorizontal, FlaskConical, ShieldOff, ShieldCheck } from "lucide-react";
import type { Character, ChatMessage, ChatSettings } from "../types";
import CharacterCreator from "./CharacterCreator";
import AdvancedSettings from "./AdvancedSettings";
import { Input } from "@/components/ui/input";
import { DEV_PASSWORD, isDevMode, setDevMode } from "../devMode";
import { toast } from "sonner";

type Tab = "menu" | "memory" | "settings" | "advanced" | "dev";

export default function PauseMenu({
  character, messages, onClose, onSaveExit, onClearMemory, onUpdateCharacter,
  chatSettings, onUpdateChatSettings,
}: {
  character: Character;
  messages: ChatMessage[];
  onClose: () => void;
  onSaveExit: () => void;
  onClearMemory: () => void;
  onUpdateCharacter: (c: Character) => Promise<void>;
  chatSettings: ChatSettings;
  onUpdateChatSettings: (s: ChatSettings) => void;
}) {
  const [tab, setTab] = useState<Tab>("menu");
  const [pendingChar, setPendingChar] = useState<Character | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [savingChar, setSavingChar] = useState(false);
  const [devActive, setDevActive] = useState<boolean>(isDevMode());
  const [devPwd, setDevPwd] = useState("");
  const [devError, setDevError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-card-soft rounded-2xl border border-border/60 shadow-aurora relative my-8">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-muted/50 z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="text-3xl font-display text-gradient mb-1">Pausa</h2>
          <p className="text-sm text-muted-foreground mb-5">A casa fica em silêncio.</p>

          {tab === "menu" && (
            <div className="grid gap-3">
              <Button onClick={() => setTab("memory")} variant="outline" className="justify-start h-14 border-primary/30 hover:bg-primary/10">
                <Brain className="w-5 h-5 mr-3 text-primary" /> Memória — ver e apagar a conversa
              </Button>
              <Button onClick={() => setTab("settings")} variant="outline" className="justify-start h-14 border-primary/30 hover:bg-primary/10">
                <Settings className="w-5 h-5 mr-3 text-primary" /> Configurações — repersonalizar a IA
              </Button>
              <Button onClick={() => setTab("advanced")} variant="outline" className="justify-start h-14 border-primary/30 hover:bg-primary/10">
                <SlidersHorizontal className="w-5 h-5 mr-3 text-primary" /> Avançado — tokens e economia
              </Button>
              <Button onClick={() => setTab("dev")} variant="outline" className={`justify-start h-14 ${devActive ? "border-destructive/60 hover:bg-destructive/10 text-destructive" : "border-primary/30 hover:bg-primary/10"}`}>
                <FlaskConical className={`w-5 h-5 mr-3 ${devActive ? "text-destructive" : "text-primary"}`} /> Modo de testes {devActive && "(ativo)"}
              </Button>
              <Button onClick={onSaveExit} className="justify-start h-14 bg-aurora text-primary-foreground shadow-glow">
                <Save className="w-5 h-5 mr-3" /> Salvar e sair
              </Button>
            </div>
          )}

          {tab === "dev" && (
            <div>
              <Button variant="ghost" size="sm" onClick={() => { setTab("menu"); setDevPwd(""); setDevError(null); }} className="mb-3">← Voltar</Button>
              <h3 className="font-display text-lg text-gradient mb-2 flex items-center gap-2">
                <FlaskConical className="w-5 h-5" /> Modo de testes
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Restrito ao dono do jogo. Quando ativo: <strong>sem filtro de chat</strong> e mensagens de até <strong>1000 caracteres</strong>.
              </p>

              {!devActive ? (
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Senha</label>
                  <Input
                    type="password"
                    autoFocus
                    value={devPwd}
                    onChange={(e) => { setDevPwd(e.target.value); setDevError(null); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (devPwd === DEV_PASSWORD) {
                          setDevMode(true);
                          setDevActive(true);
                          setDevPwd("");
                          toast.success("Modo de testes ativado.");
                        } else {
                          setDevError("Senha incorreta.");
                        }
                      }
                    }}
                    placeholder="Digite a senha de desenvolvedor"
                  />
                  {devError && <p className="text-xs text-destructive">{devError}</p>}
                  <Button
                    className="w-full bg-aurora text-primary-foreground shadow-glow"
                    onClick={() => {
                      if (devPwd === DEV_PASSWORD) {
                        setDevMode(true);
                        setDevActive(true);
                        setDevPwd("");
                        toast.success("Modo de testes ativado.");
                      } else {
                        setDevError("Senha incorreta.");
                      }
                    }}
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" /> Ativar
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-destructive/10 border border-destructive/40 rounded-xl p-3 text-xs text-destructive">
                    Modo de testes está ATIVO. Filtros desligados, limite de 1000 caracteres.
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      setDevMode(false);
                      setDevActive(false);
                      toast.success("Modo de testes desativado.");
                    }}
                  >
                    <ShieldOff className="w-4 h-4 mr-2" /> Desativar
                  </Button>
                </div>
              )}
            </div>
          )}

          {tab === "memory" && (
            <div>
              <Button variant="ghost" size="sm" onClick={() => setTab("menu")} className="mb-3">← Voltar</Button>
              <div className="bg-muted/30 rounded-xl border border-border/50 max-h-96 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-6">Nenhuma memória ainda.</p>}
                {messages.map((m) => (
                  <div key={m.id} className="text-xs">
                    <span className={`font-display tracking-wider ${m.role === "user" ? "text-accent" : "text-primary-glow"}`}>
                      {m.role === "user" ? "VOCÊ" : character.name.toUpperCase()}
                    </span>
                    <p className="text-foreground/90 whitespace-pre-wrap">{m.content}</p>
                  </div>
                ))}
              </div>
              <Button
                variant="destructive"
                className="w-full mt-4"
                onClick={() => setConfirmClear(true)}
                disabled={messages.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Apagar conversa e reiniciar a IA
              </Button>
            </div>
          )}

          {tab === "advanced" && (
            <AdvancedSettings
              settings={chatSettings}
              onChange={(s) => { onUpdateChatSettings(s); setTab("menu"); }}
              onBack={() => setTab("menu")}
            />
          )}

          {tab === "settings" && !pendingChar && (
            <div>
              <Button variant="ghost" size="sm" onClick={() => setTab("menu")} className="mb-3">← Voltar</Button>
              <CharacterCreator
                initial={character}
                ctaLabel="Aplicar mudanças"
                onConfirm={(c) => setPendingChar(c)}
              />
            </div>
          )}

          {tab === "settings" && pendingChar && (
            <AlertDialog open onOpenChange={(o) => !o && setPendingChar(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive font-display">Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação apagará a conversa!!!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPendingChar(null)}>Não</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={savingChar}
                    onClick={async () => {
                      setSavingChar(true);
                      try { await onUpdateCharacter(pendingChar!); }
                      finally { setSavingChar(false); setPendingChar(null); setTab("menu"); }
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {savingChar ? "Aplicando..." : "Sim"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-display">Apagar memória?</AlertDialogTitle>
            <AlertDialogDescription>
              {character.name} esquecerá tudo. A conversa começará do zero, como se vocês nunca tivessem se falado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onClearMemory(); setConfirmClear(false); setTab("menu"); }} className="bg-destructive hover:bg-destructive/90">
              Apagar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
