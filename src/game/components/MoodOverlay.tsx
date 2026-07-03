import type { Mood } from "../types";
import { MOOD_LABELS } from "../gameState";

export default function MoodOverlay({
  mood,
  confidence,
  triggers,
}: {
  mood: Mood;
  confidence: number;
  triggers: string[];
}) {
  return (
    <div className="pointer-events-none absolute bottom-3 right-3 z-20 max-w-[240px] rounded-lg border border-primary/40 bg-card-soft/85 backdrop-blur-md px-3 py-2 text-[10px] uppercase tracking-widest text-primary-glow shadow-glow animate-fade-in">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-semibold">{MOOD_LABELS[mood]}</span>
        <span className="text-muted-foreground normal-case tracking-normal">{confidence}%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-background/50 overflow-hidden mb-1.5">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${confidence}%` }}
        />
      </div>
      {triggers.length > 0 ? (
        <div className="flex flex-wrap gap-1 normal-case tracking-normal">
          {triggers.slice(-4).map((t) => (
            <span key={t} className="rounded bg-primary/20 border border-primary/40 px-1.5 py-0.5 text-[10px]">
              {t}
            </span>
          ))}
        </div>
      ) : (
        <span className="normal-case tracking-normal text-muted-foreground">sem gatilho recente</span>
      )}
    </div>
  );
}