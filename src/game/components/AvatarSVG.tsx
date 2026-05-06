import portraitDress from "@/assets/aiko-portrait.png";
import hairBob from "@/assets/aiko-hair-bob.png";
import hairShort from "@/assets/aiko-hair-short.png";
import hairTwin from "@/assets/aiko-hair-twin.png";
import hairPonytail from "@/assets/aiko-hair-ponytail.png";
import outfitUniform from "@/assets/aiko-outfit-uniform.png";
import outfitHoodie from "@/assets/aiko-outfit-hoodie.png";
import outfitYukata from "@/assets/aiko-outfit-yukata.png";
import bobUniform from "@/assets/aiko-bob-uniform.png";
import bobHoodie from "@/assets/aiko-bob-hoodie.png";
import bobYukata from "@/assets/aiko-bob-yukata.png";
import shortUniform from "@/assets/aiko-short-uniform.png";
import shortHoodie from "@/assets/aiko-short-hoodie.png";
import shortYukata from "@/assets/aiko-short-yukata.png";
import twinUniform from "@/assets/aiko-twin-uniform.png";
import twinHoodie from "@/assets/aiko-twin-hoodie.png";
import twinYukata from "@/assets/aiko-twin-yukata.png";
import ponytailUniform from "@/assets/aiko-ponytail-uniform.png";
import ponytailHoodie from "@/assets/aiko-ponytail-hoodie.png";
import ponytailYukata from "@/assets/aiko-ponytail-yukata.png";
import type { AppearanceVariant, Character, HairStyle, OutfitStyle } from "../types";

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

const COMBO_SRC: Record<`${HairStyle}-${OutfitStyle}`, string> = {
  "long-dress": portraitDress,
  "long-uniform": outfitUniform,
  "long-hoodie": outfitHoodie,
  "long-yukata": outfitYukata,
  "bob-dress": hairBob,
  "bob-uniform": bobUniform,
  "bob-hoodie": bobHoodie,
  "bob-yukata": bobYukata,
  "short-dress": hairShort,
  "short-uniform": shortUniform,
  "short-hoodie": shortHoodie,
  "short-yukata": shortYukata,
  "twin-dress": hairTwin,
  "twin-uniform": twinUniform,
  "twin-hoodie": twinHoodie,
  "twin-yukata": twinYukata,
  "ponytail-dress": hairPonytail,
  "ponytail-uniform": ponytailUniform,
  "ponytail-hoodie": ponytailHoodie,
  "ponytail-yukata": ponytailYukata,
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
  const hairStyle = character?.hairStyle ?? "long";
  const outfitStyle = character?.outfitStyle ?? "dress";
  const comboKey = `${hairStyle}-${outfitStyle}` as const;
  const variant: AppearanceVariant = character?.appearance ?? "dress";
  const src = COMBO_SRC[comboKey] ?? VARIANT_SRC[variant] ?? portraitDress;
  return (
    <img
      src={src}
      alt="Aiko"
      loading="lazy"
      draggable={false}
      className={`object-contain object-bottom select-none pointer-events-none ${className ?? ""}`}
      style={style}
    />
  );
}
