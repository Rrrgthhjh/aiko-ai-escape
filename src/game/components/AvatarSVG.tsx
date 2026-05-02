import portrait from "@/assets/aiko-portrait.png";
import type { Character } from "../types";

/**
 * Avatar fixo da Aiko — imagem foto-realista única (gerada uma vez, sem custo recorrente).
 * A personagem não é mais paramétrica; o jogador apenas define apelido e personalidade.
 */
export default function AvatarSVG({
  className,
  style,
}: {
  character?: Character; // mantido por compatibilidade
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={portrait}
      alt="Aiko"
      loading="lazy"
      width={1024}
      height={1536}
      draggable={false}
      className={`object-contain object-bottom select-none pointer-events-none ${className ?? ""}`}
      style={style}
    />
  );
}
