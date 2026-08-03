import { useMemo } from "react";
import type { Mood, Room as RoomName } from "../types";
import { placeOfRoom } from "../types";
import bgSala from "@/assets/scene-sala-bg.jpg";
import bgCozinha from "@/assets/scene-cozinha-bg.jpg";
import bgBanheiro from "@/assets/scene-banheiro-bg.jpg";
import bgQuarto from "@/assets/scene-quarto-bg.jpg";
import bgLago from "@/assets/scene-lago-bg.jpg";
import bgQuadra from "@/assets/scene-quadra-bg.jpg";
import bgRoupas from "@/assets/scene-loja-de-roupas-bg.jpg";
import bgFastFood from "@/assets/scene-fast-food-bg.jpg";
import bgBrinquedos from "@/assets/scene-loja-de-brinquedos-bg.jpg";
import fgCasa from "@/assets/scene-fg-casa.png";
import fgParque from "@/assets/scene-fg-parque.png";
import fgShopping from "@/assets/scene-fg-shopping.png";

/** Camada de fundo (mais distante) de cada cômodo. */
export const ROOM_BACKGROUNDS: Record<RoomName, string> = {
  sala: bgSala,
  cozinha: bgCozinha,
  banheiro: bgBanheiro,
  quarto: bgQuarto,
  lago: bgLago,
  quadra: bgQuadra,
  "loja-de-roupas": bgRoupas,
  "fast-food": bgFastFood,
  "loja-de-brinquedos": bgBrinquedos,
};

/** Camada de objetos à frente do personagem, por local. */
const PLACE_FOREGROUNDS = {
  casa: fgCasa,
  parque: fgParque,
  shopping: fgShopping,
} as const;

/** Tonalidade da luz ambiente conforme a emoção atual. */
const MOOD_TINTS: Partial<Record<Mood, string>> = {
  angry: "hsl(0 70% 40% / 0.22)",
  angrySlight: "hsl(0 60% 40% / 0.12)",
  tense: "hsl(260 60% 30% / 0.25)",
  sad: "hsl(220 50% 30% / 0.22)",
  tearSingle: "hsl(220 50% 30% / 0.14)",
  crying: "hsl(220 60% 30% / 0.3)",
  scared: "hsl(280 60% 20% / 0.3)",
  blush: "hsl(330 80% 55% / 0.16)",
  blushLight: "hsl(330 80% 55% / 0.09)",
  flirty: "hsl(320 80% 50% / 0.16)",
  happy: "hsl(45 90% 60% / 0.12)",
  happySlight: "hsl(45 90% 60% / 0.07)",
  sleepy: "hsl(250 40% 25% / 0.24)",
};

/**
 * Cenário 2D em camadas (parallax leve):
 * 1. fundo (imagem do cômodo) → 2. luz/atmosfera → 3. personagem (renderizada por cima, no Game)
 * → 4. objetos em primeiro plano (planta, grama, sacolas) → 5. vinheta.
 */
export default function Scene2D({ room, mood = "calm" }: { room: RoomName; mood?: Mood }) {
  const place = placeOfRoom(room);
  const bg = ROOM_BACKGROUNDS[room];
  const fg = PLACE_FOREGROUNDS[place];
  const tint = useMemo(() => MOOD_TINTS[mood], [mood]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      {/* Camada 1 — fundo */}
      <img
        key={bg}
        src={bg}
        alt=""
        aria-hidden
        width={1536}
        height={864}
        className="absolute inset-0 w-full h-full object-cover scale-105 animate-fade-in transition-transform duration-[8000ms] ease-out"
      />
      {/* Camada 2 — atmosfera / emoção */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ backgroundColor: tint ?? "transparent" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/25" />
      {/* Camada 4 — primeiro plano (fica na frente da personagem) */}
      <img
        src={fg}
        alt=""
        aria-hidden
        width={1536}
        height={512}
        className="pointer-events-none absolute -bottom-2 left-0 w-full z-20 object-cover opacity-95 select-none"
      />
      {/* Camada 5 — vinheta */}
      <div className="pointer-events-none absolute inset-0 z-30 shadow-[inset_0_0_140px_rgba(0,0,0,0.55)]" />
    </div>
  );
}