import { Sofa, UtensilsCrossed, Bath, Bed, ChevronLeft, ChevronRight } from "lucide-react";

type Room = "sala" | "cozinha" | "banheiro" | "quarto";

const ROOMS: { id: Room; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "sala", label: "Sala", icon: Sofa },
  { id: "cozinha", label: "Cozinha", icon: UtensilsCrossed },
  { id: "banheiro", label: "Banheiro", icon: Bath },
  { id: "quarto", label: "Quarto", icon: Bed },
];

export default function RoomPicker({ current, onPick }: { current: Room; onPick: (r: Room) => void }) {
  const idx = ROOMS.findIndex((r) => r.id === current);
  const prev = ROOMS[(idx - 1 + ROOMS.length) % ROOMS.length];
  const next = ROOMS[(idx + 1) % ROOMS.length];
  const Curr = ROOMS[idx].icon;
  return (
    <div className="flex items-center gap-2 bg-card-soft rounded-full px-2 py-1.5 border border-border/60 shadow-soft pointer-events-auto">
      <button
        onClick={() => onPick(prev.id)}
        title={`Ir para ${prev.label}`}
        className="p-1.5 rounded-full hover:bg-primary/20 text-primary-glow transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-1.5 px-2 text-xs font-display tracking-widest uppercase text-foreground min-w-[90px] justify-center">
        <Curr className="w-3.5 h-3.5" /> {ROOMS[idx].label}
      </div>
      <button
        onClick={() => onPick(next.id)}
        title={`Ir para ${next.label}`}
        className="p-1.5 rounded-full hover:bg-primary/20 text-primary-glow transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
