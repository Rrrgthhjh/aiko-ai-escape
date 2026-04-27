import { Button } from "@/components/ui/button";
import { Heart, PlayCircle, Trash2 } from "lucide-react";
import { loadSave, clearSave } from "../storage";
import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MainMenu({ onStart }: { onStart: (mode: "new" | "continue") => void }) {
  const save = loadSave();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 relative scanlines">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative text-center mb-10 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Heart className="w-8 h-8 text-primary anime-glow animate-flicker" />
        </div>
        <h1 className="font-display text-5xl sm:text-7xl text-gradient mb-2 leading-none">かご</h1>
        <h2 className="font-display text-2xl sm:text-3xl text-foreground tracking-[0.4em] mb-3">KAGO</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Você acordou em uma casa que não é sua. Alguém diz que é seu amigo. Você não se lembra dela.
        </p>
      </div>

      <div className="relative flex flex-col gap-3 w-full max-w-xs animate-fade-in" style={{ animationDelay: "0.2s" }}>
        {save && (
          <Button onClick={() => onStart("continue")} size="lg" className="bg-aurora text-primary-foreground shadow-glow font-display tracking-wider h-14">
            <PlayCircle className="w-5 h-5 mr-2" /> Continuar
          </Button>
        )}
        <Button onClick={() => onStart("new")} size="lg" variant={save ? "outline" : "default"} className={`h-14 font-display tracking-wider ${!save ? "bg-aurora text-primary-foreground shadow-glow" : "border-primary/40"}`}>
          {save ? "Novo jogo" : "Começar"}
        </Button>
        {save && (
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-3 h-3 mr-1" /> Apagar dados salvos
          </Button>
        )}
      </div>

      <p className="absolute bottom-4 text-[10px] text-muted-foreground/60 tracking-widest">かご · cage · gaiola</p>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar tudo?</AlertDialogTitle>
            <AlertDialogDescription>Personagem, retrato e todas as conversas serão deletados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { clearSave(); window.location.reload(); }} className="bg-destructive hover:bg-destructive/90">Apagar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
