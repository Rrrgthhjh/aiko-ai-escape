/**
 * Contador LOCAL de uso de IA.
 * O saldo real de créditos da workspace não é acessível pelo jogo,
 * então acompanhamos quantas mensagens de IA foram geradas neste ciclo
 * e quanto falta para a recarga diária (00:00 UTC).
 */
const KEY = "aiko:ai-usage";

export type AiUsage = {
  /** Mensagens que geraram resposta nova (consumiram créditos) no ciclo atual. */
  used: number;
  /** Mensagens respondidas pelo cache (0 créditos). */
  cached: number;
  /** Início do ciclo diário atual (ms). */
  cycleStart: number;
  /** Última vez que a IA respondeu sem créditos. */
  lastOutOfCredits?: number;
};

/** Próxima recarga diária: meia-noite UTC. */
export function nextRefillAt(now = Date.now()): number {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0, 0);
}

function emptyUsage(now = Date.now()): AiUsage {
  return { used: 0, cached: 0, cycleStart: now };
}

export function loadUsage(): AiUsage {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyUsage();
    const u = JSON.parse(raw) as AiUsage;
    // Zera se o ciclo diário virou.
    if (!u.cycleStart || Date.now() >= nextRefillAt(u.cycleStart)) return emptyUsage();
    return { used: u.used ?? 0, cached: u.cached ?? 0, cycleStart: u.cycleStart, lastOutOfCredits: u.lastOutOfCredits };
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
}

/** Formata um intervalo em ms como "3h 12min" ou "45min". */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "agora";
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}min`;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}
