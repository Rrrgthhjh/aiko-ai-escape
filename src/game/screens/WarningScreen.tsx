import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WarningScreen({ onContinue }: { onContinue: () => void }) {
  const [count, setCount] = useState(5);
  useEffect(() => {
    const t = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background">
      <div className="absolute inset-0 bg-destructive/10 animate-flicker" />
      <div className="relative text-center max-w-2xl">
        <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-destructive animate-warning" />
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl leading-tight mb-6 animate-warning"
            style={{ color: "hsl(var(--destructive))", textShadow: "0 0 30px hsl(var(--destructive) / 0.8)" }}>
          ATENÇÃO
        </h1>
        <p className="text-2xl sm:text-3xl font-display text-foreground mb-8 leading-snug">
          NÃO DIGA DADOS PESSOAIS PARA A IA
        </p>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
          Nome verdadeiro, endereço, telefone, e-mail, documentos, senhas. Mantenha o jogo sendo um jogo.
          As mensagens são analisadas por um filtro automático.
        </p>
        <Button
          size="lg"
          disabled={count > 0}
          onClick={onContinue}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-display tracking-widest h-14 px-10"
        >
          {count > 0 ? `ENTENDI (${count})` : "ENTENDI"}
        </Button>
      </div>
    </div>
  );
}
