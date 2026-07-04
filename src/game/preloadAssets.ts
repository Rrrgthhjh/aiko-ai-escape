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