import { Sofa, UtensilsCrossed, Bath, Bed } from "lucide-react";

type Room = "sala" | "cozinha" | "banheiro" | "quarto";

const ROOMS: { id: Room; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "sala", label: "Sala", icon: Sofa },
  { id: "cozinha", label: "Cozinha", icon: UtensilsCrossed },
  { id: "banheiro", label: "Banheiro", icon: Bath },
  { id: "quarto", label: "Quarto", icon: Bed },
];

export default function RoomPicker({ current, onPick }: { current: Room; onPick: (r: Room) => void }) {
  return (
    <div className="flex gap-1.5 bg-card-soft rounded-full px-2 py-1.5 border border-border/60 shadow-soft">
      {ROOMS.map((r) => {
        const Icon = r.icon;
        const active = r.id === current;
        return (
          <button
            key={r.id}
            onClick={() => onPick(r.id)}
            title={r.label}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all ${
              active ? "bg-aurora text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
