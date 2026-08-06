/**
 * Uso local da IA + status real do gateway.
 *
 * O saldo numérico exato de créditos da workspace NÃO é exposto por nenhuma API
 * acessível pelo app. O que dá para saber com precisão é:
 *  - se a IA está respondendo agora (função `ai-status`);
 *  - quando o ciclo de cobrança renova (dia 1 do próximo mês, UTC);
 *  - quantas respostas foram geradas neste ciclo (contagem local).
 */
const KEY = "aiko:ai-usage";

export type AiStatus = "ok" | "no_credits" | "rate_limited" | "error" | "unknown";

export type AiUsage = {
  /** Respostas novas da IA (consumiram créditos) no ciclo atual. */
  used: number;
  /** Respostas vindas do cache (0 créditos). */
  cached: number;
  /** Início do ciclo atual (ms). */
  cycleStart: number;
  /** Última vez que o chat recebeu 402. */
  lastOutOfCredits?: number;
};

/** Renovação do ciclo de cobrança: dia 1 do próximo mês, 00:00 UTC. */
export function nextCycleResetAt(now = Date.now()): number {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0, 0);
}

export function formatCycleResetDate(now = Date.now()): string {
  return new Date(nextCycleResetAt(now)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
  });
}

function emptyUsage(now = Date.now()): AiUsage {
  return { used: 0, cached: 0, cycleStart: now };
}

export function loadUsage(): AiUsage {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyUsage();
    const u = JSON.parse(raw) as AiUsage;
    // Zera quando o ciclo mensal vira.
    if (!u.cycleStart || Date.now() >= nextCycleResetAt(u.cycleStart)) return emptyUsage();
    return {
      used: u.used ?? 0,
      cached: u.cached ?? 0,
      cycleStart: u.cycleStart,
      lastOutOfCredits: u.lastOutOfCredits,
    };
  } catch {
    return emptyUsage();
  }
}

function save(u: AiUsage) {
  try { localStorage.setItem(KEY, JSON.stringify(u)); } catch { /* ignore */ }
}

export function recordAiReply() {
  const u = loadUsage();
  u.used += 1;
  u.lastOutOfCredits = undefined;
  save(u);
}

export function recordCachedReply() {
  const u = loadUsage();
  u.cached += 1;
  save(u);
}

export function recordOutOfCredits() {
  const u = loadUsage();
  u.lastOutOfCredits = Date.now();
  save(u);
  // Reflete imediatamente no indicador, sem esperar a próxima sondagem.
  setLocalStatus("no_credits");
}

/** Status conhecido mais recente (compartilhado entre chat e indicador). */
let localStatus: AiStatus = "unknown";
const listeners = new Set<(s: AiStatus) => void>();

export function getLocalStatus(): AiStatus {
  return localStatus;
}

export function setLocalStatus(s: AiStatus) {
  localStatus = s;
  listeners.forEach((l) => l(s));
}

export function onStatusChange(fn: (s: AiStatus) => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

const STATUS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-status`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export async function fetchAiStatus(): Promise<AiStatus> {
  try {
    const r = await fetch(STATUS_URL, {
      headers: { Authorization: `Bearer ${ANON}` },
    });
    const j = await r.json();
    const s = (j?.status as AiStatus) ?? "unknown";
    setLocalStatus(s);
    return s;
  } catch {
    return getLocalStatus();
  }
}

export const STATUS_LABELS: Record<AiStatus, string> = {
  ok: "IA disponível",
  no_credits: "Sem créditos",
  rate_limited: "Limite de velocidade",
  error: "Indisponível",
  unknown: "Verificando...",
};

/** Formata um intervalo em ms como "12d 3h" ou "3h 12min". */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "agora";
  const totalMin = Math.ceil(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}min`;
  return `${m}min`;
}
