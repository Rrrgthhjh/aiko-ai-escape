import portraitDress from "@/assets/aiko-portrait.png";
import hairBob from "@/assets/aiko-hair-bob.png";
import hairShort from "@/assets/aiko-hair-short.png";
import hairTwin from "@/assets/aiko-hair-twin.png";
import hairPonytail from "@/assets/aiko-hair-ponytail.png";
import outfitUniform from "@/assets/aiko-outfit-uniform.png";
import outfitHoodie from "@/assets/aiko-outfit-hoodie.png";
import outfitYukata from "@/assets/aiko-outfit-yukata.png";
import moodShy from "@/assets/aiko-mood-shy.png";
import moodHappy from "@/assets/aiko-mood-happy.png";
import moodSad from "@/assets/aiko-mood-sad.png";
import moodSurprised from "@/assets/aiko-mood-surprised.png";
import moodCrying from "@/assets/aiko-mood-crying.png";
import moodAngry from "@/assets/aiko-mood-angry.png";
import type { AppearanceVariant, Character, Mood } from "../types";

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
 * Retratos exclusivos de emoção — sobrepõem a variante visual quando ativos.
 * Só existem para o "look" padrão; outras variantes voltam para o próprio sprite.
 */
const MOOD_SRC: Partial<Record<Mood, string>> = {
  shy: moodShy,
  happy: moodHappy,
  sad: moodSad,
  surprised: moodSurprised,
  crying: moodCrying,
  angry: moodAngry,
};

/**
 * Avatar da Aiko — 8 imagens foto-realistas geradas UMA VEZ (sem custo recorrente).
 * Cor da paleta é ajustada via CSS hue-rotate (0 créditos).
 */
export default function AvatarSVG({
  character,
  mood,
  className,
  style,
}: {
  character?: Character;
  mood?: Mood;
  className?: string;
  style?: React.CSSProperties;
}) {
  const variant: AppearanceVariant = character?.appearance ?? "dress";
  const moodSrc = mood ? MOOD_SRC[mood] : undefined;
  // Retratos de emoção só sobrescrevem a variante padrão (mesma pose/roupa base).
  const src = moodSrc && variant === "dress" ? moodSrc : (VARIANT_SRC[variant] ?? portraitDress);
  return (
    <img
      src={src}
      alt="Aiko"
      key={src}
      loading="lazy"
      draggable={false}
      className={`object-contain object-bottom select-none pointer-events-none animate-fade-in ${className ?? ""}`}
      style={style}
    />
  );
}
