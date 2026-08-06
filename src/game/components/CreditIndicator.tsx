import { useEffect, useState } from "react";
import { Coins, ImageIcon, MessageSquare, Info, X, Timer } from "lucide-react";
import { loadUsage, nextRefillAt, formatCountdown, type AiUsage } from "../credits";

/**
 * Indicador visual de consumo de créditos.
 * - Avatar/Imagens: 0 créditos (asset estático)
 * - Chat: consome créditos por mensagem (exceto respostas em cache)
 */
export default function CreditIndicator() {
  const [open, setOpen] = useState(false);
  const [usage, setUsage] = useState<AiUsage>(() => loadUsage());
  const [left, setLeft] = useState(() => nextRefillAt() - Date.now());

  useEffect(() => {
    const tick = () => {
      setUsage(loadUsage());
      setLeft(nextRefillAt() - Date.now());
    };
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [open]);

  const outOfCredits = usage.lastOutOfCredits && Date.now() - usage.lastOutOfCredits < 6 * 60 * 60 * 1000;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Ver consumo de créditos e próxima recarga"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card-soft/90 border backdrop-blur-md text-[10px] uppercase tracking-widest transition-all shadow-glow ${
          outOfCredits
            ? "border-destructive/60 text-destructive-foreground hover:bg-destructive/20"
            : "border-primary/40 text-primary-glow hover:bg-primary/20"
        }`}
      >
        <Coins className="w-3 h-3" />
        <span>{usage.used}</span>
        <span className="opacity-60">·</span>
        <Timer className="w-3 h-3" />
        <span>{formatCountdown(left)}</span>
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

            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5">
                <div className="text-lg font-display text-amber-300">{usage.used}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">respostas pagas</div>
              </div>
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2.5">
                <div className="text-lg font-display text-emerald-300">{usage.cached}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">grátis (cache)</div>
              </div>
              <div className="rounded-xl border border-primary/40 bg-primary/10 p-2.5">
                <div className="text-lg font-display text-primary-glow">{formatCountdown(left)}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">próxima recarga</div>
              </div>
            </div>

            {outOfCredits && (
              <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/15 p-3 text-[11px] leading-snug">
                Os créditos de IA acabaram recentemente. Eles voltam na recarga diária (em {formatCountdown(left)}) ou
                assim que forem adicionados créditos à workspace.
              </div>
            )}

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
                A contagem acima é do seu aparelho: mostra quantas respostas de IA foram geradas desde a última recarga
                diária (00:00 UTC). O saldo exato de créditos fica na workspace, em Settings → Plans &amp; credits.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
