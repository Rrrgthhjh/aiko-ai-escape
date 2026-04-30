import type { Character, HairStyle, OutfitStyle } from "../types";

/**
 * Avatar SVG de alta qualidade — estilo anime/visual novel.
 * Proporções mais realistas, sombreamento com gradientes, detalhes refinados.
 * ViewBox 240x600 para mais resolução e proporção corporal natural.
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
  const skinDark = shade(skin, -15);
  const skinLight = shade(skin, 12);
  const hair = character.hairColor;
  const hairDark = shade(hair, -22);
  const hairLight = shade(hair, 16);
  const eye = character.eyeColor;
  const eyeDark = shade(eye, -30);
  const eyeLight = shade(eye, 25);
  const outfit = character.outfitColor;
  const outfitDark = shade(outfit, -18);
  const outfitLight = shade(outfit, 20);
  const outfitMid = shade(outfit, -8);

  const uid = "av" + Math.random().toString(36).slice(2, 7);

  return (
    <svg
      viewBox="0 0 240 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        {/* Skin gradient for face depth */}
        <radialGradient id={`${uid}-face`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={skinLight} />
          <stop offset="70%" stopColor={skin} />
          <stop offset="100%" stopColor={skinDark} />
        </radialGradient>
        {/* Eye iris radial */}
        <radialGradient id={`${uid}-iris`} cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor={eyeLight} />
          <stop offset="50%" stopColor={eye} />
          <stop offset="100%" stopColor={eyeDark} />
        </radialGradient>
        {/* Hair sheen */}
        <linearGradient id={`${uid}-hair`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={hairLight} stopOpacity="0.7" />
          <stop offset="40%" stopColor={hair} />
          <stop offset="100%" stopColor={hairDark} />
        </linearGradient>
        {/* Outfit gradient */}
        <linearGradient id={`${uid}-outfit`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={outfitLight} stopOpacity="0.8" />
          <stop offset="50%" stopColor={outfit} />
          <stop offset="100%" stopColor={outfitDark} />
        </linearGradient>
        {/* Soft shadow filter */}
        <filter id={`${uid}-shadow`} x="-20%" y="-10%" width="140%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dy="4" />
          <feComponentTransfer><feFuncA type="linear" slope="0.25" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Blush filter */}
        <filter id={`${uid}-blush`}>
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* === LEGS === */}
      <g>
        {character.outfitStyle !== "dress" && character.outfitStyle !== "yukata" && (
          <>
            {/* Thighs in outfit color */}
            <path d="M91,395 Q88,420 86,470 Q86,478 92,480 L100,480 Q104,478 103,470 Q102,420 100,395 Z" fill={outfitDark} />
            <path d="M137,395 Q140,420 142,470 Q142,478 136,480 L128,480 Q124,478 125,470 Q126,420 128,395 Z" fill={outfitDark} />
          </>
        )}
        {/* Calves/skin visible below skirt or always for pants */}
        {(character.outfitStyle === "dress" || character.outfitStyle === "yukata") ? (
          <>
            <path d="M93,430 Q91,465 90,510 Q90,518 96,520 L104,520 Q108,518 107,510 Q106,465 105,430 Z" fill={skin} />
            <path d="M133,430 Q135,465 136,510 Q136,518 130,520 L122,520 Q118,518 119,510 Q120,465 123,430 Z" fill={skin} />
            {/* Inner leg shadow */}
            <path d="M100,435 Q102,465 104,510" stroke={skinDark} strokeWidth="1.5" fill="none" opacity="0.3" />
            <path d="M128,435 Q126,465 124,510" stroke={skinDark} strokeWidth="1.5" fill="none" opacity="0.3" />
          </>
        ) : (
          <>
            <path d="M90,475 Q89,500 88,530 Q88,536 94,538 L102,538 Q106,536 105,530 Q104,500 103,475 Z" fill={skin} />
            <path d="M125,475 Q126,500 127,530 Q127,536 121,538 L113,538 Q109,536 110,530 Q111,500 112,475 Z" fill={skin} />
          </>
        )}
        {/* Shoes with subtle highlight */}
        {(() => {
          const sy = character.outfitStyle === "dress" || character.outfitStyle === "yukata" ? 520 : 536;
          return (
            <>
              <ellipse cx="98" cy={sy} rx="16" ry="7" fill="#1a1320" />
              <ellipse cx="98" cy={sy - 1} rx="12" ry="4" fill="#2a2338" opacity="0.5" />
              <ellipse cx="128" cy={sy} rx="16" ry="7" fill="#1a1320" />
              <ellipse cx="128" cy={sy - 1} rx="12" ry="4" fill="#2a2338" opacity="0.5" />
            </>
          );
        })()}
      </g>

      {/* === OUTFIT / TORSO === */}
      <Outfit style={character.outfitStyle} color={outfit} dark={outfitDark} light={outfitLight} mid={outfitMid} gid={uid} />

      {/* === ARMS === */}
      <g filter={`url(#${uid}-shadow)`}>
        {/* Left arm */}
        <path d="M62,240 Q56,260 52,300 Q48,340 54,370 Q58,378 62,370 Q66,340 68,305 Q70,270 72,248 Z" fill={outfit} />
        <path d="M62,240 Q58,260 56,290" stroke={outfitDark} strokeWidth="1.5" fill="none" opacity="0.4" />
        {/* Left hand */}
        <g>
          <ellipse cx="58" cy="374" rx="11" ry="13" fill={skin} />
          <ellipse cx="58" cy="374" rx="8" ry="10" fill={skinLight} opacity="0.3" />
          {/* Fingers suggestion */}
          <path d="M50,370 Q47,378 50,383" stroke={skinDark} strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M54,368 Q52,380 54,386" stroke={skinDark} strokeWidth="0.8" fill="none" opacity="0.2" />
        </g>
        {/* Right arm */}
        <path d="M166,240 Q172,260 176,300 Q180,340 174,370 Q170,378 166,370 Q162,340 160,305 Q158,270 156,248 Z" fill={outfit} />
        <path d="M166,240 Q170,260 172,290" stroke={outfitDark} strokeWidth="1.5" fill="none" opacity="0.4" />
        {/* Right hand */}
        <g>
          <ellipse cx="170" cy="374" rx="11" ry="13" fill={skin} />
          <ellipse cx="170" cy="374" rx="8" ry="10" fill={skinLight} opacity="0.3" />
          <path d="M178,370 Q181,378 178,383" stroke={skinDark} strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M174,368 Q176,380 174,386" stroke={skinDark} strokeWidth="0.8" fill="none" opacity="0.2" />
        </g>
      </g>

      {/* === NECK === */}
      <g>
        <path d="M107,195 Q106,210 104,222 L124,222 Q122,210 121,195 Z" fill={skin} />
        <path d="M108,215 Q114,218 120,215" stroke={skinDark} strokeWidth="1.2" fill="none" opacity="0.35" />
        {/* Neck shadow from chin */}
        <ellipse cx="114" cy="198" rx="12" ry="4" fill={skinDark} opacity="0.25" />
      </g>

      {/* === HEAD === */}
      <g filter={`url(#${uid}-shadow)`}>
        {/* Hair back layer */}
        <HairBack style={character.hairStyle} color={hair} dark={hairDark} light={hairLight} gid={uid} />

        {/* Face - oval with gradient for depth */}
        <ellipse cx="114" cy="148" rx="42" ry="52" fill={`url(#${uid}-face)`} />

        {/* Jaw definition */}
        <path d="M78,162 Q90,192 114,198 Q138,192 150,162" stroke={skinDark} strokeWidth="0.8" fill="none" opacity="0.2" />

        {/* Ears with inner detail */}
        <ellipse cx="72" cy="150" rx="6" ry="10" fill={skin} />
        <ellipse cx="72" cy="150" rx="3.5" ry="6" fill={skinDark} opacity="0.3" />
        <ellipse cx="156" cy="150" rx="6" ry="10" fill={skin} />
        <ellipse cx="156" cy="150" rx="3.5" ry="6" fill={skinDark} opacity="0.3" />

        {/* === EYES === */}
        <g>
          {/* Eye sockets shadow */}
          <ellipse cx="96" cy="148" rx="14" ry="8" fill={skinDark} opacity="0.1" />
          <ellipse cx="132" cy="148" rx="14" ry="8" fill={skinDark} opacity="0.1" />

          {/* Whites with subtle gradient */}
          <ellipse cx="96" cy="148" rx="12" ry="13" fill="#fafafa" />
          <ellipse cx="132" cy="148" rx="12" ry="13" fill="#fafafa" />
          {/* Bottom shadow on white */}
          <ellipse cx="96" cy="155" rx="10" ry="5" fill="#e8e8f0" opacity="0.5" />
          <ellipse cx="132" cy="155" rx="10" ry="5" fill="#e8e8f0" opacity="0.5" />

          {/* Iris with radial gradient */}
          <ellipse cx="96" cy="150" rx="8" ry="10.5" fill={`url(#${uid}-iris)`} />
          <ellipse cx="132" cy="150" rx="8" ry="10.5" fill={`url(#${uid}-iris)`} />

          {/* Iris inner ring */}
          <ellipse cx="96" cy="150" rx="5.5" ry="7" fill="none" stroke={eyeLight} strokeWidth="0.6" opacity="0.5" />
          <ellipse cx="132" cy="150" rx="5.5" ry="7" fill="none" stroke={eyeLight} strokeWidth="0.6" opacity="0.5" />

          {/* Pupil */}
          <ellipse cx="96" cy="151" rx="2.8" ry="5" fill="#060210" />
          <ellipse cx="132" cy="151" rx="2.8" ry="5" fill="#060210" />

          {/* Multiple light reflections for realism */}
          <circle cx="99" cy="144" r="3" fill="#ffffff" opacity="0.95" />
          <circle cx="135" cy="144" r="3" fill="#ffffff" opacity="0.95" />
          <circle cx="93" cy="153" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="129" cy="153" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="98" cy="147" r="1" fill="#ffffff" opacity="0.4" />
          <circle cx="134" cy="147" r="1" fill="#ffffff" opacity="0.4" />

          {/* Upper eyelid with lashes — thicker, more expressive */}
          <path d="M84,139 Q90,132 96,131 Q102,132 108,139" stroke="#0a0510" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M120,139 Q126,132 132,131 Q138,132 144,139" stroke="#0a0510" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          {/* Lash accents */}
          <path d="M84,139 Q82,136 80,135" stroke="#0a0510" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M108,139 Q110,136 112,136" stroke="#0a0510" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M120,139 Q118,136 116,136" stroke="#0a0510" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M144,139 Q146,136 148,135" stroke="#0a0510" strokeWidth="1.8" fill="none" strokeLinecap="round" />

          {/* Lower lash line */}
          <path d="M86,158 Q96,162 106,158" stroke="#1a1020" strokeWidth="0.8" fill="none" opacity="0.4" />
          <path d="M122,158 Q132,162 142,158" stroke="#1a1020" strokeWidth="0.8" fill="none" opacity="0.4" />
        </g>

        {/* Eyebrows — more detailed with thickness variation */}
        <path d="M82,130 Q90,124 100,128" stroke={hairDark} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M128,128 Q138,124 146,130" stroke={hairDark} strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Brow highlight */}
        <path d="M84,129 Q90,125 98,128" stroke={hair} strokeWidth="1" fill="none" opacity="0.3" strokeLinecap="round" />
        <path d="M130,128 Q138,125 144,129" stroke={hair} strokeWidth="1" fill="none" opacity="0.3" strokeLinecap="round" />

        {/* Nose — more defined */}
        <path d="M114,160 Q111,168 112,172 Q114,175 116,172 Q117,168 114,160" stroke={skinDark} strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />
        {/* Nose highlight */}
        <ellipse cx="114" cy="164" rx="2" ry="3" fill={skinLight} opacity="0.25" />

        {/* Mouth — more expressive with lip shape */}
        <path d="M104,180 Q109,176 114,175 Q119,176 124,180" stroke="#8a3848" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M104,180 Q114,186 124,180" stroke="#7a3040" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Lip color fill */}
        <path d="M104,180 Q114,186 124,180 Q119,176 114,175 Q109,176 104,180 Z" fill="#b85568" opacity="0.35" />
        {/* Lower lip highlight */}
        <ellipse cx="114" cy="182" rx="5" ry="2" fill={skinLight} opacity="0.2" />

        {/* Blush — softer and larger */}
        <ellipse cx="84" cy="166" rx="10" ry="5" fill="#f0a0b0" opacity="0.35" filter={`url(#${uid}-blush)`} />
        <ellipse cx="144" cy="166" rx="10" ry="5" fill="#f0a0b0" opacity="0.35" filter={`url(#${uid}-blush)`} />

        {/* Hair front / bangs */}
        <HairFront style={character.hairStyle} color={hair} dark={hairDark} light={hairLight} gid={uid} />
      </g>
    </svg>
  );
}

/* ─── Outfit components ─── */
function Outfit({ style, color, dark, light, mid, gid }: { style: OutfitStyle; color: string; dark: string; light: string; mid: string; gid: string }) {
  switch (style) {
    case "dress":
      return (
        <g>
          {/* Bodice with curve */}
          <path d="M78,225 Q74,228 70,235 L68,280 Q90,290 114,290 Q138,290 160,280 L158,235 Q154,228 150,225 Q140,220 114,218 Q88,220 78,225 Z" fill={`url(#${gid}-outfit)`} />
          {/* Bust subtle shading */}
          <path d="M85,240 Q98,250 110,240" stroke={dark} strokeWidth="1" fill="none" opacity="0.25" />
          <path d="M118,240 Q130,250 143,240" stroke={dark} strokeWidth="1" fill="none" opacity="0.25" />
          {/* Collar detail */}
          <path d="M90,222 Q114,215 138,222 L136,232 Q114,226 92,232 Z" fill={light} opacity="0.7" />
          {/* Ribbon/bow at collar */}
          <path d="M108,228 Q114,222 120,228 Q114,226 108,228 Z" fill={dark} opacity="0.5" />
          <circle cx="114" cy="226" r="2" fill={dark} opacity="0.6" />
          {/* Skirt — flowing A-line with folds */}
          <path d="M68,280 Q60,330 48,430 Q80,445 114,445 Q148,445 180,430 Q168,330 160,280 Z" fill={color} />
          {/* Fold lines */}
          <path d="M80,290 Q76,340 65,425" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.25" />
          <path d="M100,288 Q96,340 90,430" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.2" />
          <path d="M128,288 Q132,340 138,430" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.2" />
          <path d="M148,290 Q152,340 163,425" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.25" />
          {/* Skirt hem highlight */}
          <path d="M50,428 Q80,445 114,445 Q148,445 178,428" stroke={light} strokeWidth="1.5" fill="none" opacity="0.3" />
        </g>
      );
    case "uniform":
      return (
        <g>
          {/* White blouse */}
          <path d="M78,225 Q74,228 70,235 L66,340 Q90,348 114,348 Q138,348 162,340 L158,235 Q154,228 150,225 Q140,220 114,218 Q88,220 78,225 Z" fill="#f0f0f6" />
          {/* Collar shadow */}
          <path d="M85,230 Q114,222 143,230" stroke="#d8d8e0" strokeWidth="1.5" fill="none" opacity="0.5" />
          {/* Sailor collar */}
          <path d="M78,225 L70,250 Q114,235 158,250 L150,225 Q114,215 78,225 Z" fill={color} />
          <path d="M72,248 Q114,233 156,248" stroke={light} strokeWidth="1.5" fill="none" opacity="0.5" />
          {/* Neckerchief/tie */}
          <polygon points="108,228 120,228 118,260 114,275 110,260" fill={color} />
          <polygon points="110,260 114,275 118,260 116,255 112,255" fill={dark} opacity="0.4" />
          {/* Pleated skirt */}
          <path d="M66,340 Q58,375 50,425 Q82,440 114,440 Q146,440 178,425 Q170,375 162,340 Z" fill={color} />
          {/* Pleat lines */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={i} x1={58 + i * 16} y1={345} x2={52 + i * 15} y2={430} stroke={dark} strokeWidth="1.2" opacity="0.4" />
          ))}
          {/* Waistband */}
          <rect x="66" y="336" width="96" height="8" rx="2" fill={dark} opacity="0.6" />
        </g>
      );
    case "hoodie":
      return (
        <g>
          {/* Main body */}
          <path d="M72,225 Q66,230 62,240 L56,400 Q84,410 114,410 Q144,410 172,400 L166,240 Q162,230 156,225 Q142,218 114,216 Q86,218 72,225 Z" fill={`url(#${gid}-outfit)`} />
          {/* Hood behind neck */}
          <path d="M80,218 Q114,200 148,218 L152,240 Q114,225 76,240 Z" fill={dark} />
          {/* Hood edge */}
          <path d="M80,218 Q114,200 148,218" stroke={mid} strokeWidth="2" fill="none" opacity="0.5" />
          {/* Center zipper/seam */}
          <line x1="114" y1="225" x2="114" y2="395" stroke={dark} strokeWidth="1.5" opacity="0.3" />
          {/* Kangaroo pocket */}
          <path d="M82,310 Q84,300 114,298 Q144,300 146,310 L148,350 Q114,355 80,350 Z" fill={dark} opacity="0.4" />
          <path d="M82,310 Q84,300 114,298 Q144,300 146,310" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.5" />
          {/* Drawstrings */}
          <path d="M104,225 Q102,240 100,260" stroke={light} strokeWidth="1.8" fill="none" opacity="0.6" />
          <path d="M124,225 Q126,240 128,260" stroke={light} strokeWidth="1.8" fill="none" opacity="0.6" />
          {/* String tips */}
          <rect x="98" y="258" width="4" height="6" rx="1" fill={light} opacity="0.5" />
          <rect x="126" y="258" width="4" height="6" rx="1" fill={light} opacity="0.5" />
        </g>
      );
    case "yukata":
      return (
        <g>
          {/* Main robe */}
          <path d="M74,225 Q68,230 64,240 L56,440 Q84,450 114,450 Q144,450 172,440 L164,240 Q160,230 154,225 Q142,218 114,216 Q86,218 74,225 Z" fill={color} />
          {/* Cross overlap (right over left) */}
          <path d="M114,225 L154,225 Q158,230 160,240 L150,310 L114,295 Z" fill={dark} opacity="0.4" />
          {/* Collar V-neckline */}
          <path d="M100,222 L114,260 L128,222" stroke={light} strokeWidth="2.5" fill="none" opacity="0.6" />
          {/* Obi (sash belt) */}
          <path d="M60,315 Q90,322 114,322 Q138,322 168,315 L170,345 Q138,352 114,352 Q90,352 58,345 Z" fill={light} />
          {/* Obi knot/bow at back (visible as bump) */}
          <ellipse cx="155" cy="332" rx="8" ry="12" fill={shade(light, -10)} opacity="0.6" />
          {/* Obi shadow lines */}
          <path d="M62,318 Q114,325 166,318" stroke={dark} strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M60,342 Q114,350 168,342" stroke={dark} strokeWidth="1" fill="none" opacity="0.3" />
          {/* Fabric folds */}
          <path d="M80,350 Q76,390 68,440" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.2" />
          <path d="M148,350 Q152,390 160,440" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.2" />
        </g>
      );
  }
}

/* ─── Hair back layer ─── */
function HairBack({ style, color, dark, light, gid }: { style: HairStyle; color: string; dark: string; light: string; gid: string }) {
  switch (style) {
    case "long":
      return (
        <g>
          <path d="M68,152 Q56,100 114,82 Q172,100 160,152 L175,350 Q114,365 53,350 Z" fill={`url(#${gid}-hair)`} />
          {/* Hair strands */}
          <path d="M70,150 Q65,220 58,330" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.3" />
          <path d="M85,120 Q78,200 68,310" stroke={dark} strokeWidth="1" fill="none" opacity="0.2" />
          <path d="M158,150 Q163,220 170,330" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.3" />
          {/* Sheen highlight */}
          <path d="M95,95 Q105,90 120,95" stroke={light} strokeWidth="2" fill="none" opacity="0.4" />
        </g>
      );
    case "short":
      return (
        <g>
          <path d="M72,148 Q64,96 114,80 Q164,96 156,148 L160,195 Q114,205 68,195 Z" fill={`url(#${gid}-hair)`} />
          <path d="M95,90 Q110,86 125,90" stroke={light} strokeWidth="2" fill="none" opacity="0.4" />
        </g>
      );
    case "twin":
      return (
        <g>
          <path d="M70,148 Q62,96 114,80 Q166,96 158,148 L160,195 Q114,205 68,195 Z" fill={`url(#${gid}-hair)`} />
          {/* Left pigtail */}
          <path d="M56,200 Q44,280 60,370 Q68,370 74,360 Q80,290 72,210 Z" fill={color} />
          <path d="M60,220 Q52,280 62,350" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.3" />
          {/* Right pigtail */}
          <path d="M172,200 Q184,280 168,370 Q160,370 154,360 Q148,290 156,210 Z" fill={color} />
          <path d="M168,220 Q176,280 166,350" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.3" />
          {/* Hair ties */}
          <ellipse cx="64" cy="202" rx="6" ry="4" fill={dark} opacity="0.7" />
          <ellipse cx="164" cy="202" rx="6" ry="4" fill={dark} opacity="0.7" />
          {/* Sheen */}
          <path d="M95,90 Q110,86 125,90" stroke={light} strokeWidth="2" fill="none" opacity="0.4" />
        </g>
      );
    case "bob":
      return (
        <g>
          <path d="M70,152 Q62,96 114,80 Q166,96 158,152 L168,230 Q114,244 60,230 Z" fill={`url(#${gid}-hair)`} />
          <path d="M95,90 Q110,86 125,90" stroke={light} strokeWidth="2" fill="none" opacity="0.4" />
          {/* Bob curve at ends */}
          <path d="M64,225 Q80,238 114,240 Q148,238 164,225" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.3" />
        </g>
      );
    case "ponytail":
      return (
        <g>
          <path d="M72,148 Q64,96 114,80 Q164,96 156,148 L160,195 Q114,205 68,195 Z" fill={`url(#${gid}-hair)`} />
          {/* Ponytail flowing back */}
          <path d="M155,155 Q190,220 178,340 Q172,350 165,340 Q160,250 145,180 Z" fill={color} />
          <path d="M158,170 Q182,240 174,330" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.3" />
          {/* Hair tie */}
          <ellipse cx="152" cy="160" rx="5" ry="4" fill={dark} opacity="0.7" />
          <path d="M95,90 Q110,86 125,90" stroke={light} strokeWidth="2" fill="none" opacity="0.4" />
        </g>
      );
  }
}

/* ─── Hair front / bangs ─── */
function HairFront({ style, color, dark, light, gid }: { style: HairStyle; color: string; dark: string; light: string; gid: string }) {
  const bangs = (
    <g>
      {/* Main bangs shape */}
      <path d="M72,132 Q78,92 114,84 Q150,92 156,132 Q144,120 114,126 Q84,120 72,132 Z" fill={color} />
      {/* Bangs depth/shadow strands */}
      <path d="M80,130 Q90,142 106,132 Q100,148 88,146 Z" fill={dark} opacity="0.4" />
      <path d="M148,130 Q138,142 122,132 Q128,148 140,146 Z" fill={dark} opacity="0.4" />
      {/* Highlight strand */}
      <path d="M100,100 Q108,95 116,100" stroke={light} strokeWidth="1.5" fill="none" opacity="0.35" />
      <path d="M88,108 Q96,104 108,108" stroke={light} strokeWidth="1" fill="none" opacity="0.25" />
    </g>
  );

  if (style === "twin") {
    return (
      <g>
        {bangs}
        {/* Side strands framing face */}
        <path d="M68,132 Q58,175 66,230 Q76,195 78,142 Z" fill={color} />
        <path d="M160,132 Q170,175 162,230 Q152,195 150,142 Z" fill={color} />
        {/* Strand shadows */}
        <path d="M72,140 Q64,180 68,220" stroke={dark} strokeWidth="1" fill="none" opacity="0.3" />
        <path d="M156,140 Q164,180 160,220" stroke={dark} strokeWidth="1" fill="none" opacity="0.3" />
      </g>
    );
  }
  if (style === "long") {
    return (
      <g>
        {bangs}
        {/* Side hair framing */}
        <path d="M70,132 Q62,170 60,210 Q72,200 76,145 Z" fill={color} />
        <path d="M158,132 Q166,170 168,210 Q156,200 152,145 Z" fill={color} />
      </g>
    );
  }
  return bangs;
}

/* Utility: lighten/darken hex */
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
