import type { Character, HairStyle, OutfitStyle } from "../types";

/**
 * Avatar 100% SVG — corpo inteiro, sem geração por IA.
 * Construído por camadas paramétricas (cor de pele, cabelo, olhos, roupa).
 * ViewBox vertical 200x520 para caber bem no fundo da cena.
 */
export default function AvatarSVG({
  character,
  className,
  style,
}: {
  character: Character;
  className?: string;
  style?: React.CSSProperties;
}) {
  const skin = character.skinColor;
  const skinShade = shade(skin, -12);
  const hair = character.hairColor;
  const hairShade = shade(hair, -18);
  const eye = character.eyeColor;
  const outfit = character.outfitColor;
  const outfitShade = shade(outfit, -15);
  const outfitLight = shade(outfit, 18);

  return (
    <svg
      viewBox="0 0 200 520"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      preserveAspectRatio="xMidYMax meet"
    >
      {/* PERNAS */}
      <g>
        {/* coxas/calça/saia conforme estilo */}
        {character.outfitStyle === "dress" || character.outfitStyle === "yukata" ? null : (
          <>
            <rect x="78" y="330" width="18" height="120" rx="8" fill={outfitShade} />
            <rect x="104" y="330" width="18" height="120" rx="8" fill={outfitShade} />
          </>
        )}
        {/* canelas/pele */}
        <rect x="80" y={character.outfitStyle === "dress" || character.outfitStyle === "yukata" ? 360 : 445} width="14" height={character.outfitStyle === "dress" || character.outfitStyle === "yukata" ? 95 : 25} rx="6" fill={skin} />
        <rect x="106" y={character.outfitStyle === "dress" || character.outfitStyle === "yukata" ? 360 : 445} width="14" height={character.outfitStyle === "dress" || character.outfitStyle === "yukata" ? 95 : 25} rx="6" fill={skin} />
        {/* sapatos */}
        <ellipse cx="87" cy="475" rx="13" ry="6" fill="#1a1320" />
        <ellipse cx="113" cy="475" rx="13" ry="6" fill="#1a1320" />
      </g>

      {/* TORSO + ROUPA */}
      <Outfit style={character.outfitStyle} color={outfit} shade={outfitShade} light={outfitLight} />

      {/* BRAÇOS */}
      <g>
        <rect x="50" y="208" width="16" height="105" rx="8" fill={outfit} />
        <rect x="134" y="208" width="16" height="105" rx="8" fill={outfit} />
        {/* mãos */}
        <circle cx="58" cy="320" r="10" fill={skin} />
        <circle cx="142" cy="320" r="10" fill={skin} />
      </g>

      {/* PESCOÇO */}
      <rect x="92" y="170" width="16" height="22" fill={skin} />
      <rect x="92" y="186" width="16" height="6" fill={skinShade} opacity="0.6" />

      {/* CABEÇA */}
      <g>
        {/* cabelo de trás */}
        <HairBack style={character.hairStyle} color={hair} shade={hairShade} />
        {/* rosto */}
        <ellipse cx="100" cy="130" rx="38" ry="46" fill={skin} />
        {/* sombras leves */}
        <ellipse cx="100" cy="160" rx="22" ry="6" fill={skinShade} opacity="0.4" />
        {/* orelhas */}
        <ellipse cx="62" cy="132" rx="5" ry="8" fill={skin} />
        <ellipse cx="138" cy="132" rx="5" ry="8" fill={skin} />

        {/* OLHOS */}
        <g>
          {/* branco */}
          <ellipse cx="84" cy="132" rx="9" ry="11" fill="#ffffff" />
          <ellipse cx="116" cy="132" rx="9" ry="11" fill="#ffffff" />
          {/* íris */}
          <ellipse cx="84" cy="134" rx="6.5" ry="9" fill={eye} />
          <ellipse cx="116" cy="134" rx="6.5" ry="9" fill={eye} />
          {/* gradiente íris */}
          <ellipse cx="84" cy="138" rx="5" ry="6" fill={shade(eye, -25)} opacity="0.55" />
          <ellipse cx="116" cy="138" rx="5" ry="6" fill={shade(eye, -25)} opacity="0.55" />
          {/* pupila */}
          <ellipse cx="84" cy="135" rx="2" ry="4" fill="#0a0510" />
          <ellipse cx="116" cy="135" rx="2" ry="4" fill="#0a0510" />
          {/* brilho */}
          <circle cx="86" cy="129" r="2.2" fill="#ffffff" />
          <circle cx="118" cy="129" r="2.2" fill="#ffffff" />
          <circle cx="82" cy="137" r="1.2" fill="#ffffff" opacity="0.7" />
          <circle cx="114" cy="137" r="1.2" fill="#ffffff" opacity="0.7" />
          {/* cílios superiores */}
          <path d="M75,124 Q84,118 93,124" stroke="#0a0510" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M107,124 Q116,118 125,124" stroke="#0a0510" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>

        {/* sobrancelhas */}
        <path d="M76,116 Q84,113 92,116" stroke={hairShade} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M108,116 Q116,113 124,116" stroke={hairShade} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* nariz */}
        <path d="M100,144 Q98,150 100,152" stroke={skinShade} strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* boca */}
        <path d="M93,160 Q100,164 107,160" stroke="#7a3a4a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="100" cy="161" rx="5" ry="1.5" fill="#a85565" opacity="0.5" />

        {/* blush */}
        <ellipse cx="78" cy="148" rx="6" ry="3" fill="#f0a0b0" opacity="0.45" />
        <ellipse cx="122" cy="148" rx="6" ry="3" fill="#f0a0b0" opacity="0.45" />

        {/* cabelo da frente / franja */}
        <HairFront style={character.hairStyle} color={hair} shade={hairShade} />
      </g>
    </svg>
  );
}

function Outfit({ style, color, shade: dark, light }: { style: OutfitStyle; color: string; shade: string; light: string }) {
  switch (style) {
    case "dress":
      return (
        <g>
          {/* corpete */}
          <path d="M68,200 L132,200 L138,260 L62,260 Z" fill={color} />
          {/* saia */}
          <path d="M62,260 L138,260 L160,365 L40,365 Z" fill={color} />
          <path d="M62,260 L138,260 L150,310 L50,310 Z" fill={dark} opacity="0.4" />
          {/* gola branca */}
          <path d="M82,200 L118,200 L114,212 L86,212 Z" fill={light} />
        </g>
      );
    case "uniform":
      return (
        <g>
          {/* blusa branca */}
          <path d="M68,200 L132,200 L138,300 L62,300 Z" fill="#f5f5fa" />
          {/* gravata */}
          <polygon points="96,210 104,210 106,240 100,255 94,240" fill={color} />
          {/* saia plissada */}
          <path d="M62,300 L138,300 L150,360 L50,360 Z" fill={color} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={55 + i * 18} y1={310} x2={50 + i * 18} y2={358} stroke={dark} strokeWidth="1.2" opacity="0.7" />
          ))}
        </g>
      );
    case "hoodie":
      return (
        <g>
          <path d="M62,200 L138,200 L146,330 L54,330 Z" fill={color} />
          {/* capuz */}
          <path d="M70,200 Q100,180 130,200 L132,215 Q100,200 68,215 Z" fill={dark} />
          {/* bolso central */}
          <path d="M75,260 L125,260 L130,295 L70,295 Z" fill={dark} opacity="0.6" />
          {/* cordões */}
          <line x1="92" y1="200" x2="90" y2="225" stroke={light} strokeWidth="2" />
          <line x1="108" y1="200" x2="110" y2="225" stroke={light} strokeWidth="2" />
        </g>
      );
    case "yukata":
      return (
        <g>
          <path d="M64,200 L136,200 L144,370 L56,370 Z" fill={color} />
          {/* sobreposição cruzada */}
          <path d="M100,200 L136,200 L130,260 L100,250 Z" fill={dark} opacity="0.55" />
          {/* obi (faixa) */}
          <rect x="56" y="270" width="88" height="22" fill={light} />
          <rect x="56" y="270" width="88" height="4" fill={dark} opacity="0.5" />
        </g>
      );
  }
}

function HairBack({ style, color, shade: dark }: { style: HairStyle; color: string; shade: string }) {
  switch (style) {
    case "long":
      return <path d="M58,140 Q50,90 100,72 Q150,90 142,140 L155,300 Q100,310 45,300 Z" fill={color} />;
    case "short":
      return <path d="M62,135 Q56,88 100,72 Q144,88 138,135 L140,165 Q100,170 60,165 Z" fill={color} />;
    case "twin":
      return (
        <g>
          <path d="M60,135 Q54,90 100,72 Q146,90 140,135 L140,165 Q100,170 60,165 Z" fill={color} />
          <path d="M48,180 Q40,260 56,310 Q64,260 60,180 Z" fill={color} />
          <path d="M152,180 Q160,260 144,310 Q136,260 140,180 Z" fill={color} />
        </g>
      );
    case "bob":
      return <path d="M60,138 Q54,90 100,72 Q146,90 140,138 L148,200 Q100,210 52,200 Z" fill={color} />;
    case "ponytail":
      return (
        <g>
          <path d="M62,135 Q56,88 100,72 Q144,88 138,135 L140,170 Q100,175 60,170 Z" fill={color} />
          <path d="M138,140 Q175,200 160,290 Q150,210 130,170 Z" fill={dark} />
        </g>
      );
  }
}

function HairFront({ style, color, shade: dark }: { style: HairStyle; color: string; shade: string }) {
  // franja comum + variações sutis
  const base = (
    <>
      <path d="M64,118 Q70,82 100,76 Q130,82 136,118 Q120,108 100,114 Q80,108 64,118 Z" fill={color} />
      <path d="M70,116 Q82,128 96,118 Q92,135 78,132 Z" fill={dark} opacity="0.55" />
      <path d="M130,116 Q118,128 104,118 Q108,135 122,132 Z" fill={dark} opacity="0.55" />
    </>
  );
  if (style === "twin") {
    return (
      <g>
        {base}
        {/* mechas laterais que descem perto do rosto */}
        <path d="M60,118 Q52,160 60,200 Q70,165 68,125 Z" fill={color} />
        <path d="M140,118 Q148,160 140,200 Q130,165 132,125 Z" fill={color} />
      </g>
    );
  }
  return base;
}

/* utilitário: clarear/escurecer hex */
function shade(hex: string, percent: number): string {
  const c = hex.replace("#", "");
  const num = parseInt(c.length === 3 ? c.split("").map((x) => x + x).join("") : c, 16);
  let r = (num >> 16) + Math.round((percent / 100) * 255);
  let g = ((num >> 8) & 0xff) + Math.round((percent / 100) * 255);
  let b = (num & 0xff) + Math.round((percent / 100) * 255);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
