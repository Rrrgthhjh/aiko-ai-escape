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
import moodBlush from "@/assets/aiko-mood-blush.png";
import moodFlirty from "@/assets/aiko-mood-flirty.png";
import moodScared from "@/assets/aiko-mood-scared.png";
import moodSleepy from "@/assets/aiko-mood-sleepy.png";
// Retratos de FUSÃO — combinações compatíveis (mesma valência) com imagem
// única em vez de sobreposição. A chave é o par ordenado alfabeticamente.
import fuseCryingHappy from "@/assets/aiko-mood-crying-happy.png";
import fuseBlushFlirty from "@/assets/aiko-mood-blush-flirty.png";
import fuseHappyShy from "@/assets/aiko-mood-happy-shy.png";
import fuseScaredSad from "@/assets/aiko-mood-scared-sad.png";
import fuseSurprisedHappy from "@/assets/aiko-mood-surprised-happy.png";
import fuseAngryCrying from "@/assets/aiko-mood-angry-crying.png";
import type { AppearanceVariant, Character, Mood } from "../types";
import { useEffect, useRef, useState } from "react";

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
  blush: moodBlush,
  flirty: moodFlirty,
  scared: moodScared,
  sleepy: moodSleepy,
};

/** Mapeia um par de emoções (ordem-agnóstico) para uma imagem de fusão dedicada. */
const MOOD_FUSION_SRC: Record<string, string> = {
  "crying|happy": fuseCryingHappy,
  "blush|flirty": fuseBlushFlirty,
  "happy|shy": fuseHappyShy,
  "sad|scared": fuseScaredSad,
  "happy|surprised": fuseSurprisedHappy,
  "angry|crying": fuseAngryCrying,
};
function fusionKey(a: Mood, b: Mood): string {
  return [a, b].sort().join("|");
}

/** Animação de gesto por humor — aplicada em um wrapper por cima do breathe/sway. */
const GESTURE_CLASS: Record<Mood, string> = {
  calm: "",
  soft: "",
  hopeful: "",
  shy: "animate-gesture-shy-sway",
  happy: "animate-gesture-bounce",
  sad: "animate-gesture-lookaway",
  surprised: "animate-gesture-bounce",
  crying: "animate-gesture-tremble",
  angry: "animate-gesture-shake",
  tense: "animate-gesture-lookaway",
  blush: "animate-gesture-shy-sway",
  flirty: "animate-gesture-shy-sway",
  scared: "animate-gesture-tremble",
  sleepy: "animate-gesture-nod",
};

/**
 * Avatar da Aiko — 8 imagens foto-realistas geradas UMA VEZ (sem custo recorrente).
 * Cor da paleta é ajustada via CSS hue-rotate (0 créditos).
 */
export default function AvatarSVG({
  character,
  mood,
  secondaryMood,
  className,
  style,
}: {
  character?: Character;
  mood?: Mood;
  secondaryMood?: Mood;
  className?: string;
  style?: React.CSSProperties;
}) {
  const variant: AppearanceVariant = character?.appearance ?? "dress";
  const moodSrc = mood ? MOOD_SRC[mood] : undefined;
  // Se houver mood secundário compatível, tenta usar imagem de FUSÃO dedicada
  // (ex.: chorar+feliz = "chorar de emoção"). Só para variante padrão.
  const fusionSrc =
    mood && secondaryMood && variant === "dress"
      ? MOOD_FUSION_SRC[fusionKey(mood, secondaryMood)]
      : undefined;
  // Retratos de emoção só sobrescrevem a variante padrão (mesma pose/roupa base).
  const src =
    fusionSrc ??
    (moodSrc && variant === "dress" ? moodSrc : (VARIANT_SRC[variant] ?? portraitDress));

  // Crossfade: mantém a imagem anterior por baixo enquanto a nova entra.
  const [current, setCurrent] = useState(src);
  const [previous, setPrevious] = useState<string | null>(null);
  const prevRef = useRef(src);
  useEffect(() => {
    if (src === prevRef.current) return;
    setPrevious(prevRef.current);
    setCurrent(src);
    prevRef.current = src;
    const t = window.setTimeout(() => setPrevious(null), 600);
    return () => window.clearTimeout(t);
  }, [src]);

  const gesture = mood ? GESTURE_CLASS[mood] : "";

  return (
    <div key={gesture || "calm"} className={`relative h-full w-auto ${gesture}`}>
      {previous && (
        <img
          src={previous}
          alt=""
          aria-hidden
          draggable={false}
          className={`absolute inset-0 h-full w-auto object-contain object-bottom select-none pointer-events-none opacity-0 transition-opacity duration-500 ${className ?? ""}`}
          style={style}
        />
      )}
      <img
        src={current}
        alt="Aiko"
        key={current}
        loading="lazy"
        draggable={false}
        className={`relative h-full w-auto object-contain object-bottom select-none pointer-events-none animate-mood-fade ${className ?? ""}`}
        style={style}
      />
      {/* Fusões visuais agora usam UMA imagem dedicada (MOOD_FUSION_SRC).
          Pares incompatíveis nunca chegam aqui — o parser garante que apenas
          emoções da mesma valência sejam misturadas. */}
    </div>
  );
}
