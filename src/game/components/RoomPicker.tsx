import {
  Sofa, UtensilsCrossed, Bath, Bed, ChevronLeft, ChevronRight,
  Home, Trees, ShoppingBag, Waves, Dribbble, Shirt, Sandwich, ToyBrick,
} from "lucide-react";
import type { Place, Room } from "../types";
import { PLACE_LABELS, PLACE_ROOMS, ROOM_LABELS, placeOfRoom } from "../types";

const ROOM_ICON: Record<Room, React.ComponentType<{ className?: string }>> = {
  sala: Sofa,
  cozinha: UtensilsCrossed,
  banheiro: Bath,
  quarto: Bed,
  lago: Waves,
  quadra: Dribbble,
  "loja-de-roupas": Shirt,
  "fast-food": Sandwich,
  "loja-de-brinquedos": ToyBrick,
};

const PLACE_ICON: Record<Place, React.ComponentType<{ className?: string }>> = {
  casa: Home,
  parque: Trees,
  shopping: ShoppingBag,
};

const PLACES: Place[] = ["casa", "parque", "shopping"];

export default function RoomPicker({ current, onPick }: { current: Room; onPick: (r: Room) => void }) {
  const place = placeOfRoom(current);
  const rooms = PLACE_ROOMS[place];
  const idx = rooms.indexOf(current);
  const prev = rooms[(idx - 1 + rooms.length) % rooms.length];
  const next = rooms[(idx + 1) % rooms.length];
  const Curr = ROOM_ICON[current];

  return (
    <div className="flex flex-col gap-1.5 pointer-events-auto">
      {/* Seletor de LOCAL */}
      <div className="flex items-center gap-1 bg-card-soft rounded-full px-1.5 py-1 border border-border/60 shadow-soft">
        {PLACES.map((p) => {
          const Icon = PLACE_ICON[p];
          const active = p === place;
          return (
            <button
              key={p}
              onClick={() => onPick(PLACE_ROOMS[p][0])}
              title={`Ir para ${PLACE_LABELS[p]}`}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] uppercase tracking-widest transition-colors ${
                active ? "bg-primary/30 text-primary-glow" : "text-muted-foreground hover:bg-primary/15"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {PLACE_LABELS[p]}
            </button>
          );
        })}
      </div>

      {/* Seletor de sub-local */}
      <div className="flex items-center gap-2 bg-card-soft rounded-full px-2 py-1.5 border border-border/60 shadow-soft self-start">
        <button
          onClick={() => onPick(prev)}
          title={`Ir para ${ROOM_LABELS[prev]}`}
          className="p-1.5 rounded-full hover:bg-primary/20 text-primary-glow transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 px-2 text-xs font-display tracking-widest uppercase text-foreground min-w-[120px] justify-center">
          <Curr className="w-3.5 h-3.5" /> {ROOM_LABELS[current]}
        </div>
        <button
          onClick={() => onPick(next)}
          title={`Ir para ${ROOM_LABELS[next]}`}
          className="p-1.5 rounded-full hover:bg-primary/20 text-primary-glow transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
