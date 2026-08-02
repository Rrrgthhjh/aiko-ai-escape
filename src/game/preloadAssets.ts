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
import fuseCryingHappy from "@/assets/aiko-mood-crying-happy.png";
import fuseBlushFlirty from "@/assets/aiko-mood-blush-flirty.png";
import fuseHappyShy from "@/assets/aiko-mood-happy-shy.png";
import fuseScaredSad from "@/assets/aiko-mood-scared-sad.png";
import fuseSurprisedHappy from "@/assets/aiko-mood-surprised-happy.png";
import fuseAngryCrying from "@/assets/aiko-mood-angry-crying.png";
import fuseBlushShy from "@/assets/aiko-mood-blush-shy.png";
import fuseFlirtyHappy from "@/assets/aiko-mood-flirty-happy.png";
import fuseHappySleepy from "@/assets/aiko-mood-happy-sleepy.png";
import fuseCryingScared from "@/assets/aiko-mood-crying-scared.png";
import moodSmileSoft from "@/assets/aiko-mood-smile-soft.png";
import moodBlushLight from "@/assets/aiko-mood-blush-light.png";
import moodTearSingle from "@/assets/aiko-mood-tear-single.png";
import moodAnnoyed from "@/assets/aiko-mood-annoyed.png";
import fuseAngrySurprised from "@/assets/aiko-mood-angry-surprised.png";
import fuseSadSleepy from "@/assets/aiko-mood-sad-sleepy.png";
import fuseScaredSurprised from "@/assets/aiko-mood-scared-surprised.png";
import fuseFlirtyShy from "@/assets/aiko-mood-flirty-shy.png";
import fuseBlushHappy from "@/assets/aiko-mood-blush-happy.png";
import fuseSadShy from "@/assets/aiko-mood-sad-shy.png";
import fuseAngrySad from "@/assets/aiko-mood-angry-sad.png";
import fuseBlushSurprised from "@/assets/aiko-mood-blush-surprised.png";

export const AVATAR_ASSETS: string[] = [
  portraitDress,
  hairBob,
  hairShort,
  hairTwin,
  hairPonytail,
  outfitUniform,
  outfitHoodie,
  outfitYukata,
  moodShy,
  moodHappy,
  moodSad,
  moodSurprised,
  moodCrying,
  moodAngry,
  moodBlush,
  moodFlirty,
  moodScared,
  moodSleepy,
  fuseCryingHappy,
  fuseBlushFlirty,
  fuseHappyShy,
  fuseScaredSad,
  fuseSurprisedHappy,
  fuseAngryCrying,
  fuseBlushShy,
  fuseFlirtyHappy,
  fuseHappySleepy,
  fuseCryingScared,
  moodSmileSoft,
  moodBlushLight,
  moodTearSingle,
  moodAnnoyed,
  fuseAngrySurprised,
  fuseSadSleepy,
  fuseScaredSurprised,
  fuseFlirtyShy,
  fuseBlushHappy,
  fuseSadShy,
  fuseAngrySad,
  fuseBlushSurprised,
];

let started = false;
const cache: HTMLImageElement[] = [];

/**
 * Pré-carrega todas as imagens do avatar (variantes e emoções) para evitar
 * "flash" ou travamento quando o humor muda durante a conversa.
 * Idempotente: chamar múltiplas vezes é seguro.
 */
export function preloadAvatarAssets(): Promise<void[]> {
  if (started) return Promise.resolve([]);
  started = true;
  if (typeof window === "undefined" || typeof Image === "undefined") {
    return Promise.resolve([]);
  }
  return Promise.all(
    AVATAR_ASSETS.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
          cache.push(img); // mantém referência viva
        }),
    ),
  );
}