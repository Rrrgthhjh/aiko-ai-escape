import { useState } from "react";
import { Coins, ImageIcon, MessageSquare, Info, X } from "lucide-react";

/**
 * Indicador visual de consumo de créditos.
 * - Avatar/Imagens: 0 créditos (asset estático)
 * - Chat: consome créditos por mensagem (exceto respostas em cache)
 */
export default function CreditIndicator() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Ver consumo de créditos"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card-soft/90 border border-primary/40 backdrop-blur-md text-[10px] uppercase tracking-widest text-primary-glow hover:bg-primary/20 transition-all shadow-glow"
      >
        <Coins className="w-3 h-3" />
        <span className="hidden sm:inline">créditos</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-background/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-card-soft rounded-2xl border border-primary/40 shadow-aurora relative p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-lg hover:bg-muted/50"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-5 h-5 text-primary-glow" />
              <h3 className="text-xl font-display text-gradient">Consumo de créditos</h3>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Veja exatamente o que gasta — e o que <strong className="text-primary-glow">não gasta</strong> — créditos da IA.
            </p>

            <div className="space-y-2.5">
              {/* Imagens — não gastam */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10">
                <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-display text-emerald-300">Avatar da Aiko</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">0 créditos</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    Imagem fixa, salva no jogo. Carrega do disco — <strong>nunca</strong> gera de novo.
                  </p>
                </div>
              </div>

              {/* Cenários 3D — não gastam */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10">
                <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-display text-emerald-300">Cômodos & cenário 3D</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">0 créditos</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    Tudo renderizado localmente pelo seu navegador.
                  </p>
                </div>
              </div>

              {/* Cache — não gasta */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10">
                <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-display text-emerald-300">Mensagens em cache</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">0 créditos</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    Se você repete (ou quase repete) algo já dito, a resposta vem do cache local.
                  </p>
                </div>
              </div>

              {/* Chat — gasta */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/40 bg-amber-500/10">
                <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-display text-amber-300">Chat com a Aiko</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">consome</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    Cada resposta nova da IA usa créditos. Use o preset <strong>Econômico</strong> nas configurações para gastar bem menos.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary-glow" />
              <span>
                Dica: limpar a memória da Aiko também reduz o tamanho do contexto enviado, gastando menos por mensagem.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
