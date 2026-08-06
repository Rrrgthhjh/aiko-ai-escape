import { useCallback, useEffect, useState } from "react";
import { Coins, ImageIcon, MessageSquare, Info, X, Timer, RefreshCw } from "lucide-react";
import {
  loadUsage,
  nextCycleResetAt,
  formatCycleResetDate,
  formatCountdown,
  fetchAiStatus,
  getLocalStatus,
  onStatusChange,
  STATUS_LABELS,
  type AiUsage,
  type AiStatus,
} from "../credits";

const STATUS_STYLES: Record<AiStatus, string> = {
  ok: "border-emerald-500/50 text-emerald-300 bg-emerald-500/10",
  no_credits: "border-destructive/60 text-destructive-foreground bg-destructive/15",
  rate_limited: "border-amber-500/50 text-amber-300 bg-amber-500/10",
  error: "border-border/60 text-muted-foreground bg-muted/30",
  unknown: "border-border/60 text-muted-foreground bg-muted/30",
};

/**
 * Indicador de status da IA e consumo de créditos.
 * - Avatar/cenários: 0 créditos (assets estáticos)
 * - Chat: consome créditos por resposta nova (cache é grátis)
 */
export default function CreditIndicator() {
  const [open, setOpen] = useState(false);
  const [usage, setUsage] = useState<AiUsage>(() => loadUsage());
  const [left, setLeft] = useState(() => nextCycleResetAt() - Date.now());
  const [status, setStatus] = useState<AiStatus>(() => getLocalStatus());
  const [checking, setChecking] = useState(false);

  const refresh = useCallback(async () => {
    setChecking(true);
    const s = await fetchAiStatus();
    setStatus(s);
    setChecking(false);
  }, []);

  useEffect(() => onStatusChange(setStatus), []);

  useEffect(() => {
    const tick = () => {
      setUsage(loadUsage());
      setLeft(nextCycleResetAt() - Date.now());
    };
    tick();
    void refresh();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (open) {
      setUsage(loadUsage());
      void refresh();
    }
  }, [open, refresh]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Status da IA, uso e renovação"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md border text-[10px] uppercase tracking-widest transition-all shadow-glow ${STATUS_STYLES[status]}`}
      >
        <Coins className="w-3 h-3" />
        <span>{usage.used}</span>
        <span className="opacity-50">·</span>
        <Timer className="w-3 h-3" />
        <span>{formatCountdown(left)}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-background/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-card-soft rounded-2xl border border-primary/40 shadow-aurora relative p-6 max-h-[90vh] overflow-y-auto"
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
              <h3 className="text-xl font-display text-gradient">Status da IA</h3>
            </div>

            {/* Status ao vivo */}
            <div className={`mb-4 rounded-xl border p-3 flex items-center justify-between gap-3 ${STATUS_STYLES[status]}`}>
              <div className="min-w-0">
                <div className="text-sm font-display">{STATUS_LABELS[status]}</div>
                <p className="text-[11px] opacity-80 leading-snug">
                  {status === "ok" && "A Aiko está respondendo normalmente."}
                  {status === "no_credits" && `Os créditos de IA acabaram. Voltam em ${formatCycleResetDate()}.`}
                  {status === "rate_limited" && "Muitas mensagens em pouco tempo. Espere um instante."}
                  {status === "error" && "Não consegui falar com o serviço de IA agora."}
                  {status === "unknown" && "Verificando o serviço de IA..."}
                </p>
              </div>
              <button
                onClick={() => void refresh()}
                className="shrink-0 p-2 rounded-lg hover:bg-background/30"
                aria-label="Verificar novamente"
              >
                <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              </button>
            </div>

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
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  renova {formatCycleResetDate()}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              O que gasta — e o que <strong className="text-primary-glow">não gasta</strong> — créditos:
            </p>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10">
                <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-display text-emerald-300">Avatar & cenários</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">0 créditos</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    Imagens fixas salvas no jogo — nunca são geradas de novo.
                  </p>
                </div>
              </div>

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
                    Cada resposta nova usa créditos da cota mensal de IA.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary-glow" />
              <span>
                A cota de IA é <strong>mensal</strong> (renova em {formatCycleResetDate()}), não diária. As contagens acima
                são deste aparelho; o saldo exato de créditos fica na workspace, em Settings → Plans &amp; credits.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
