import portraitDress from "@/assets/aiko-portrait.png";
import hairBob from "@/assets/aiko-hair-bob.png";
import hairShort from "@/assets/aiko-hair-short.png";
import hairTwin from "@/assets/aiko-hair-twin.png";
import hairPonytail from "@/assets/aiko-hair-ponytail.png";
import outfitUniform from "@/assets/aiko-outfit-uniform.png";
import outfitHoodie from "@/assets/aiko-outfit-hoodie.png";
import outfitYukata from "@/assets/aiko-outfit-yukata.png";
import type { AppearanceVariant, Character } from "../types";

const VARIANT_SRC: Record<AppearanceVariant, string> = {
  "dress": portraitDress,
  "hair-bob": hairBob,
  "hair-short": hairShort,
  "hair-twin": hairTwin,
  "hair-ponytail": hairPonytail,
  "outfit-uniform": outfitUniform,
  "outfit-hoodie": outfitHoodie,
  "outfit-yukata": outfitYukata,
};

/**
 * Avatar da Aiko — 8 imagens foto-realistas geradas UMA VEZ (sem custo recorrente).
 * Cor da paleta é ajustada via CSS hue-rotate (0 créditos).
 */
export default function AvatarSVG({
  character,
  className,
  style,
}: {
  character?: Character;
  className?: string;
  style?: React.CSSProperties;
}) {
  const variant: AppearanceVariant = character?.appearance ?? "dress";
  const hue = character?.hueShift ?? 0;
  const src = VARIANT_SRC[variant] ?? portraitDress;
  return (
    <img
      src={src}
      alt="Aiko"
      loading="lazy"
      draggable={false}
      className={`object-contain object-bottom select-none pointer-events-none ${className ?? ""}`}
      style={{
        ...style,
        filter: hue ? `hue-rotate(${hue}deg)` : undefined,
      }}
    />
  );
}
