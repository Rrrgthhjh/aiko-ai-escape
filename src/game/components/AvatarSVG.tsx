import { useMemo } from "react";
import type { Character, HairStyle, OutfitStyle } from "../types";

/*
 * Realistic full-body SVG avatar.
 * Proportions: ~1:6.5 head-to-body, natural anatomy.
 * Smaller, realistic eyes; defined nose & lips; anatomical body curves.
 * Rich gradient shading for 3D depth.
 * ViewBox 300×750 for high detail.
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
  const s1 = shade(skin, -10);
  const s2 = shade(skin, -20);
  const sL = shade(skin, 10);
  const sHL = shade(skin, 18);
  const hair = character.hairColor;
  const hD = shade(hair, -25);
  const hL = shade(hair, 18);
  const eye = character.eyeColor;
  const eD = shade(eye, -35);
  const eL = shade(eye, 28);
  const outfit = character.outfitColor;
  const oD = shade(outfit, -20);
  const oL = shade(outfit, 22);
  const oM = shade(outfit, -8);

  // Stable unique ID per instance
  const uid = useMemo(() => "r" + Math.random().toString(36).slice(2, 7), []);

  const isSkirt = character.outfitStyle === "dress" || character.outfitStyle === "yukata" || character.outfitStyle === "uniform";

  return (
    <svg viewBox="0 0 300 750" xmlns="http://www.w3.org/2000/svg" className={className} style={style} preserveAspectRatio="xMidYMax meet">
      <defs>
        {/* Face radial */}
        <radialGradient id={`${uid}f`} cx="48%" cy="38%" r="52%">
          <stop offset="0%" stopColor={sHL} />
          <stop offset="55%" stopColor={skin} />
          <stop offset="100%" stopColor={s1} />
        </radialGradient>
        {/* Body skin gradient */}
        <linearGradient id={`${uid}bs`} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor={sL} />
          <stop offset="100%" stopColor={s1} />
        </linearGradient>
        {/* Iris */}
        <radialGradient id={`${uid}ir`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={eL} />
          <stop offset="55%" stopColor={eye} />
          <stop offset="100%" stopColor={eD} />
        </radialGradient>
        {/* Hair gradient */}
        <linearGradient id={`${uid}h`} x1="0.2" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={hL} stopOpacity="0.65" />
          <stop offset="35%" stopColor={hair} />
          <stop offset="100%" stopColor={hD} />
        </linearGradient>
        {/* Outfit gradient */}
        <linearGradient id={`${uid}o`} x1="0" y1="0" x2="0.1" y2="1">
          <stop offset="0%" stopColor={oL} stopOpacity="0.75" />
          <stop offset="45%" stopColor={outfit} />
          <stop offset="100%" stopColor={oD} />
        </linearGradient>
        {/* Lip gradient */}
        <linearGradient id={`${uid}lip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4606e" />
          <stop offset="100%" stopColor="#8a3545" />
        </linearGradient>
        {/* Soft shadow */}
        <filter id={`${uid}sh`} x="-15%" y="-8%" width="130%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dy="5" />
          <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`${uid}bl`}><feGaussianBlur stdDeviation="5" /></filter>
        {/* Ambient occlusion for neck */}
        <radialGradient id={`${uid}nk`} cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor={s2} stopOpacity="0.4" />
          <stop offset="100%" stopColor={s2} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ===== LEGS ===== */}
      <Legs skin={skin} s1={s1} sL={sL} outfit={outfit} oD={oD} isSkirt={isSkirt} outfitStyle={character.outfitStyle} />

      {/* ===== OUTFIT / TORSO ===== */}
      <OutfitBody style={character.outfitStyle} color={outfit} dark={oD} light={oL} mid={oM} uid={uid} skin={skin} s1={s1} />

      {/* ===== ARMS ===== */}
      <Arms skin={skin} s1={s1} sL={sL} s2={s2} outfit={outfit} oD={oD} uid={uid} />

      {/* ===== NECK ===== */}
      <g>
        <path d="M137,222 Q136,240 134,258 L166,258 Q164,240 163,222 Z" fill={`url(#${uid}bs)`} />
        <ellipse cx="150" cy="230" rx="16" ry="5" fill={`url(#${uid}nk)`} />
        {/* Subtle throat shadow */}
        <path d="M143,248 Q150,252 157,248" stroke={s2} strokeWidth="0.8" fill="none" opacity="0.25" />
      </g>

      {/* ===== HEAD ===== */}
      <g filter={`url(#${uid}sh)`}>
        <HairBack style={character.hairStyle} color={hair} dark={hD} light={hL} uid={uid} />

        {/* Face — more oval/tapered chin for realistic look */}
        <path d="M108,170 Q100,140 105,115 Q112,90 150,85 Q188,90 195,115 Q200,140 192,170 Q186,200 170,218 Q160,226 150,228 Q140,226 130,218 Q114,200 108,170 Z" fill={`url(#${uid}f)`} />

        {/* Jaw contour shadow */}
        <path d="M112,175 Q120,205 140,222 Q150,228 160,222 Q180,205 188,175" stroke={s2} strokeWidth="0.7" fill="none" opacity="0.18" />

        {/* Cheekbone highlights */}
        <ellipse cx="122" cy="165" rx="12" ry="6" fill={sHL} opacity="0.2" />
        <ellipse cx="178" cy="165" rx="12" ry="6" fill={sHL} opacity="0.2" />

        {/* Ears */}
        <path d="M108,148 Q100,138 100,150 Q100,162 108,158" fill={skin} />
        <path d="M103,146 Q102,150 103,154" stroke={s1} strokeWidth="0.8" fill="none" opacity="0.4" />
        <path d="M192,148 Q200,138 200,150 Q200,162 192,158" fill={skin} />
        <path d="M197,146 Q198,150 197,154" stroke={s1} strokeWidth="0.8" fill="none" opacity="0.4" />

        {/* ── EYES (realistic: smaller, almond-shaped) ── */}
        <g>
          {/* Socket shadow */}
          <ellipse cx="132" cy="155" rx="13" ry="6" fill={s1} opacity="0.08" />
          <ellipse cx="168" cy="155" rx="13" ry="6" fill={s1} opacity="0.08" />

          {/* White (sclera) — almond shape */}
          <path d="M120,155 Q126,146 132,144 Q138,146 144,155 Q138,161 132,162 Q126,161 120,155 Z" fill="#f8f8fa" />
          <path d="M156,155 Q162,146 168,144 Q174,146 180,155 Q174,161 168,162 Q162,161 156,155 Z" fill="#f8f8fa" />

          {/* Sclera shadow (upper) */}
          <path d="M122,154 Q132,148 142,154" fill={s1} opacity="0.06" />
          <path d="M158,154 Q168,148 178,154" fill={s1} opacity="0.06" />

          {/* Iris — circular, realistic size */}
          <circle cx="132" cy="154" r="6.5" fill={`url(#${uid}ir)`} />
          <circle cx="168" cy="154" r="6.5" fill={`url(#${uid}ir)`} />

          {/* Iris limbal ring */}
          <circle cx="132" cy="154" r="6.5" fill="none" stroke={eD} strokeWidth="0.7" opacity="0.5" />
          <circle cx="168" cy="154" r="6.5" fill="none" stroke={eD} strokeWidth="0.7" opacity="0.5" />

          {/* Iris texture — radial lines */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const rad = (a * Math.PI) / 180;
            const cx1 = 132, cy1 = 154;
            return (
              <line key={`il${a}`}
                x1={cx1 + Math.cos(rad) * 2} y1={cy1 + Math.sin(rad) * 2}
                x2={cx1 + Math.cos(rad) * 5.5} y2={cy1 + Math.sin(rad) * 5.5}
                stroke={eD} strokeWidth="0.3" opacity="0.25"
              />
            );
          })}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const rad = (a * Math.PI) / 180;
            const cx1 = 168, cy1 = 154;
            return (
              <line key={`ir${a}`}
                x1={cx1 + Math.cos(rad) * 2} y1={cy1 + Math.sin(rad) * 2}
                x2={cx1 + Math.cos(rad) * 5.5} y2={cy1 + Math.sin(rad) * 5.5}
                stroke={eD} strokeWidth="0.3" opacity="0.25"
              />
            );
          })}

          {/* Pupil */}
          <circle cx="132" cy="154" r="2.8" fill="#050208" />
          <circle cx="168" cy="154" r="2.8" fill="#050208" />

          {/* Light reflections */}
          <circle cx="134" cy="151" r="2" fill="#fff" opacity="0.9" />
          <circle cx="170" cy="151" r="2" fill="#fff" opacity="0.9" />
          <circle cx="130" cy="156" r="1" fill="#fff" opacity="0.45" />
          <circle cx="166" cy="156" r="1" fill="#fff" opacity="0.45" />

          {/* Upper eyelid line — natural thickness */}
          <path d="M120,155 Q126,146 132,144 Q138,146 144,155" stroke="#1a0e18" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M156,155 Q162,146 168,144 Q174,146 180,155" stroke="#1a0e18" strokeWidth="1.8" fill="none" strokeLinecap="round" />

          {/* Eyelid crease */}
          <path d="M121,151 Q132,141 143,151" stroke={s2} strokeWidth="0.6" fill="none" opacity="0.2" />
          <path d="M157,151 Q168,141 179,151" stroke={s2} strokeWidth="0.6" fill="none" opacity="0.2" />

          {/* Lower lash line — subtle */}
          <path d="M122,157 Q132,162 142,157" stroke="#2a1828" strokeWidth="0.7" fill="none" opacity="0.3" />
          <path d="M158,157 Q168,162 178,157" stroke="#2a1828" strokeWidth="0.7" fill="none" opacity="0.3" />

          {/* Lash accents (corners) */}
          <path d="M119,155 Q117,153 116,151" stroke="#1a0e18" strokeWidth="1.2" fill="none" opacity="0.6" strokeLinecap="round" />
          <path d="M144,155 Q146,153 147,152" stroke="#1a0e18" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round" />
          <path d="M156,155 Q154,153 153,152" stroke="#1a0e18" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round" />
          <path d="M181,155 Q183,153 184,151" stroke="#1a0e18" strokeWidth="1.2" fill="none" opacity="0.6" strokeLinecap="round" />
        </g>

        {/* Eyebrows — natural shape with taper */}
        <path d="M118,139 Q125,134 133,135 Q138,136 142,139" stroke={hD} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M158,139 Q162,136 167,135 Q175,134 182,139" stroke={hD} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {/* Brow body fill */}
        <path d="M120,139 Q126,134 134,135 Q140,137 143,140 Q134,138 126,137 Z" fill={hD} opacity="0.35" />
        <path d="M157,140 Q160,137 166,135 Q174,134 180,139 Q174,137 166,137 Z" fill={hD} opacity="0.35" />

        {/* NOSE — realistic bridge and tip */}
        <path d="M150,138 Q148,158 146,175 Q144,180 147,183 Q150,185 153,183 Q156,180 154,175 Q152,158 150,138" stroke={s2} strokeWidth="0.9" fill="none" opacity="0.35" strokeLinecap="round" />
        {/* Nose bridge highlight */}
        <path d="M150,140 Q150,155 150,170" stroke={sHL} strokeWidth="1.5" fill="none" opacity="0.2" />
        {/* Nostrils */}
        <ellipse cx="146" cy="182" rx="2.5" ry="1.5" fill={s2} opacity="0.2" />
        <ellipse cx="154" cy="182" rx="2.5" ry="1.5" fill={s2} opacity="0.2" />
        {/* Nose tip highlight */}
        <ellipse cx="150" cy="179" rx="3" ry="2.5" fill={sHL} opacity="0.15" />

        {/* MOUTH — realistic lips */}
        <g>
          {/* Upper lip — cupid's bow */}
          <path d="M138,196 Q143,192 147,193 Q150,191 153,193 Q157,192 162,196" stroke="#7a3040" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* Lower lip */}
          <path d="M138,196 Q150,205 162,196" stroke="#7a3040" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Lip fill */}
          <path d="M138,196 Q143,192 147,193 Q150,191 153,193 Q157,192 162,196 Q150,205 138,196 Z" fill={`url(#${uid}lip)`} opacity="0.45" />
          {/* Lower lip highlight */}
          <ellipse cx="150" cy="200" rx="6" ry="2.5" fill={sHL} opacity="0.15" />
          {/* Lip line (center) */}
          <path d="M140,196 Q150,198 160,196" stroke="#6a2838" strokeWidth="0.5" fill="none" opacity="0.3" />
        </g>

        {/* Chin dimple suggestion */}
        <ellipse cx="150" cy="216" rx="2" ry="1.5" fill={s2} opacity="0.1" />

        {/* Blush — very subtle and diffuse */}
        <ellipse cx="120" cy="175" rx="12" ry="7" fill="#e8909a" opacity="0.18" filter={`url(#${uid}bl)`} />
        <ellipse cx="180" cy="175" rx="12" ry="7" fill="#e8909a" opacity="0.18" filter={`url(#${uid}bl)`} />

        {/* Hair front */}
        <HairFront style={character.hairStyle} color={hair} dark={hD} light={hL} uid={uid} />
      </g>
    </svg>
  );
}

/* ═══ Legs ═══ */
function Legs({ skin, s1, sL, outfit, oD, isSkirt, outfitStyle }: { skin: string; s1: string; sL: string; outfit: string; oD: string; isSkirt: boolean; outfitStyle: OutfitStyle }) {
  const legSkinY = isSkirt ? 530 : 580;
  const legSkinH = isSkirt ? 100 : 50;
  const shoeY = isSkirt ? 640 : 640;
  return (
    <g>
      {/* Pants legs (if not skirt) */}
      {!isSkirt && (
        <>
          <path d="M120,490 Q118,520 116,575 Q116,582 122,584 L136,584 Q140,582 139,575 Q138,520 136,490 Z" fill={oD} />
          <path d="M164,490 Q166,520 168,575 Q168,582 162,584 L148,584 Q144,582 145,575 Q146,520 148,490 Z" fill={oD} />
          {/* Pant crease */}
          <path d="M128,495 Q128,540 128,578" stroke={outfit} strokeWidth="0.8" fill="none" opacity="0.2" />
          <path d="M156,495 Q156,540 156,578" stroke={outfit} strokeWidth="0.8" fill="none" opacity="0.2" />
        </>
      )}
      {/* Skin (calves or lower legs) */}
      {isSkirt && (
        <>
          <path d={`M124,${legSkinY} Q122,${legSkinY+50} 120,635 Q120,642 126,644 L138,644 Q142,642 141,635 Q140,${legSkinY+50} 138,${legSkinY} Z`}
            fill={skin} />
          <path d={`M162,${legSkinY} Q164,${legSkinY+50} 166,635 Q166,642 160,644 L148,644 Q144,642 145,635 Q146,${legSkinY+50} 148,${legSkinY} Z`}
            fill={skin} />
          {/* Knee highlight */}
          <ellipse cx="131" cy={legSkinY + 35} rx="5" ry="8" fill={sL} opacity="0.12" />
          <ellipse cx="155" cy={legSkinY + 35} rx="5" ry="8" fill={sL} opacity="0.12" />
          {/* Inner shadow */}
          <path d={`M136,${legSkinY + 5} Q137,${legSkinY + 40} 138,${legSkinY + 80}`} stroke={s1} strokeWidth="1" fill="none" opacity="0.2" />
          <path d={`M150,${legSkinY + 5} Q149,${legSkinY + 40} 148,${legSkinY + 80}`} stroke={s1} strokeWidth="1" fill="none" opacity="0.2" />
        </>
      )}
      {!isSkirt && (
        <>
          <path d="M120,580 Q119,608 118,632 Q118,638 124,640 L136,640 Q140,638 139,632 Q138,608 137,580 Z" fill={skin} />
          <path d="M164,580 Q165,610 164,632 Q164,638 158,640 L148,640 Q144,638 145,632 Q146,610 147,580 Z" fill={skin} />
        </>
      )}
      {/* Shoes */}
      <ellipse cx="132" cy={shoeY} rx="18" ry="8" fill="#151018" />
      <ellipse cx="132" cy={shoeY - 2} rx="13" ry="5" fill="#252030" opacity="0.4" />
      <ellipse cx="156" cy={shoeY} rx="18" ry="8" fill="#151018" />
      <ellipse cx="156" cy={shoeY - 2} rx="13" ry="5" fill="#252030" opacity="0.4" />
    </g>
  );
}

/* ═══ Arms ═══ */
function Arms({ skin, s1, sL, s2, outfit, oD, uid }: { skin: string; s1: string; sL: string; s2: string; outfit: string; oD: string; uid: string }) {
  return (
    <g>
      {/* Left arm — natural curve */}
      <path d="M90,278 Q82,305 76,350 Q70,395 78,440 Q82,450 88,442 Q92,410 94,370 Q96,330 100,295 Z" fill={outfit} />
      <path d="M88,285 Q82,315 78,350" stroke={oD} strokeWidth="1.5" fill="none" opacity="0.3" />
      {/* Left forearm skin */}
      <path d="M78,415 Q74,430 74,445 Q74,450 78,452 L88,452 Q92,450 92,445 Q92,430 88,415 Z" fill={skin} />
      {/* Left hand */}
      <g>
        <path d="M76,450 Q72,458 70,468 Q68,478 74,480 Q78,478 80,472 Q82,466 84,460 Q86,454 82,450 Z" fill={skin} />
        {/* Finger lines */}
        <path d="M72,468 Q70,474 72,478" stroke={s1} strokeWidth="0.6" fill="none" opacity="0.3" />
        <path d="M76,466 Q74,474 76,480" stroke={s1} strokeWidth="0.5" fill="none" opacity="0.2" />
        {/* Thumb */}
        <path d="M82,454 Q86,458 86,464 Q84,466 82,462" stroke={s1} strokeWidth="0.5" fill={skin} opacity="0.8" />
        {/* Knuckle highlights */}
        <ellipse cx="78" cy="454" rx="4" ry="2.5" fill={sL} opacity="0.12" />
      </g>

      {/* Right arm */}
      <path d="M210,278 Q218,305 224,350 Q230,395 222,440 Q218,450 212,442 Q208,410 206,370 Q204,330 200,295 Z" fill={outfit} />
      <path d="M212,285 Q218,315 222,350" stroke={oD} strokeWidth="1.5" fill="none" opacity="0.3" />
      {/* Right forearm skin */}
      <path d="M222,415 Q226,430 226,445 Q226,450 222,452 L212,452 Q208,450 208,445 Q208,430 212,415 Z" fill={skin} />
      {/* Right hand */}
      <g>
        <path d="M224,450 Q228,458 230,468 Q232,478 226,480 Q222,478 220,472 Q218,466 216,460 Q214,454 218,450 Z" fill={skin} />
        <path d="M228,468 Q230,474 228,478" stroke={s1} strokeWidth="0.6" fill="none" opacity="0.3" />
        <path d="M224,466 Q226,474 224,480" stroke={s1} strokeWidth="0.5" fill="none" opacity="0.2" />
        <path d="M218,454 Q214,458 214,464 Q216,466 218,462" stroke={s1} strokeWidth="0.5" fill={skin} opacity="0.8" />
        <ellipse cx="222" cy="454" rx="4" ry="2.5" fill={sL} opacity="0.12" />
      </g>
    </g>
  );
}

/* ═══ Outfit / Torso ═══ */
function OutfitBody({ style, color, dark, light, mid, uid, skin, s1 }: { style: OutfitStyle; color: string; dark: string; light: string; mid: string; uid: string; skin: string; s1: string }) {
  // Torso base shape — natural waist and shoulders
  const torsoTop = "M100,268 Q96,272 90,280";
  const torsoBottom = "Q150,500 210,280 Q204,272 200,268";

  switch (style) {
    case "dress":
      return (
        <g>
          {/* Bodice — fitted with darts */}
          <path d="M100,268 Q94,275 90,285 L86,340 Q110,350 150,350 Q190,350 214,340 L210,285 Q206,275 200,268 Q185,258 150,254 Q115,258 100,268 Z" fill={`url(#${uid}o)`} />
          {/* Bust shaping */}
          <path d="M112,295 Q130,310 148,295" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.18" />
          <path d="M152,295 Q170,310 188,295" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.18" />
          {/* Collar */}
          <path d="M115,260 Q150,250 185,260 L182,272 Q150,264 118,272 Z" fill={light} opacity="0.6" />
          {/* Bow */}
          <path d="M144,268 Q150,262 156,268 Q150,265 144,268 Z" fill={dark} opacity="0.4" />
          <circle cx="150" cy="265" r="2.5" fill={dark} opacity="0.5" />
          {/* Skirt — A-line with volume */}
          <path d="M86,340 Q74,400 58,530 Q100,548 150,548 Q200,548 242,530 Q226,400 214,340 Z" fill={color} />
          {/* Fabric folds */}
          <path d="M100,350 Q94,420 82,530" stroke={dark} strokeWidth="1.8" fill="none" opacity="0.18" />
          <path d="M130,348 Q124,420 115,535" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.12" />
          <path d="M170,348 Q176,420 185,535" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.12" />
          <path d="M200,350 Q206,420 218,530" stroke={dark} strokeWidth="1.8" fill="none" opacity="0.18" />
          {/* Hem highlight */}
          <path d="M62,528 Q100,548 150,548 Q200,548 238,528" stroke={light} strokeWidth="1.5" fill="none" opacity="0.2" />
        </g>
      );
    case "uniform":
      return (
        <g>
          {/* White shirt */}
          <path d="M100,268 Q94,275 90,285 L84,410 Q115,420 150,420 Q185,420 216,410 L210,285 Q206,275 200,268 Q185,258 150,254 Q115,258 100,268 Z" fill="#eeeef4" />
          {/* Collar shadow */}
          <path d="M110,275 Q150,265 190,275" stroke="#d0d0dc" strokeWidth="1.5" fill="none" opacity="0.4" />
          {/* Sailor collar */}
          <path d="M100,268 L88,300 Q150,282 212,300 L200,268 Q150,252 100,268 Z" fill={color} />
          <path d="M90,298 Q150,280 210,298" stroke={light} strokeWidth="1.5" fill="none" opacity="0.4" />
          {/* Tie */}
          <polygon points="142,272 158,272 156,310 150,328 144,310" fill={color} />
          <polygon points="144,310 150,328 156,310 154,305 146,305" fill={dark} opacity="0.4" />
          {/* Pleated skirt */}
          <path d="M84,410 Q74,450 62,530 Q100,548 150,548 Q200,548 238,530 Q226,450 216,410 Z" fill={color} />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <line key={i} x1={70 + i * 18} y1={415} x2={64 + i * 17} y2={535} stroke={dark} strokeWidth="1.2" opacity="0.3" />
          ))}
          {/* Waistband */}
          <rect x="84" y="406" width="132" height="10" rx="3" fill={dark} opacity="0.5" />
        </g>
      );
    case "hoodie":
      return (
        <g>
          <path d="M98,268 Q90,275 84,288 L74,495 Q110,508 150,508 Q190,508 226,495 L216,288 Q210,275 202,268 Q180,255 150,252 Q120,255 98,268 Z" fill={`url(#${uid}o)`} />
          {/* Hood */}
          <path d="M106,258 Q150,238 194,258 L198,280 Q150,265 102,280 Z" fill={dark} />
          <path d="M106,258 Q150,238 194,258" stroke={mid} strokeWidth="2" fill="none" opacity="0.4" />
          {/* Center seam */}
          <line x1="150" y1="270" x2="150" y2="490" stroke={dark} strokeWidth="1.5" opacity="0.2" />
          {/* Kangaroo pocket */}
          <path d="M108,380 Q112,368 150,365 Q188,368 192,380 L195,425 Q150,432 105,425 Z" fill={dark} opacity="0.35" />
          <path d="M108,380 Q112,368 150,365 Q188,368 192,380" stroke={dark} strokeWidth="1" fill="none" opacity="0.4" />
          {/* Drawstrings */}
          <path d="M138,270 Q136,290 134,315" stroke={light} strokeWidth="1.8" fill="none" opacity="0.5" />
          <path d="M162,270 Q164,290 166,315" stroke={light} strokeWidth="1.8" fill="none" opacity="0.5" />
          <rect x="132" y="313" width="4" height="7" rx="1" fill={light} opacity="0.4" />
          <rect x="164" y="313" width="4" height="7" rx="1" fill={light} opacity="0.4" />
        </g>
      );
    case "yukata":
      return (
        <g>
          <path d="M100,268 Q92,275 86,288 L74,545 Q110,558 150,558 Q190,558 226,545 L214,288 Q208,275 200,268 Q180,255 150,252 Q120,255 100,268 Z" fill={color} />
          {/* Cross overlap */}
          <path d="M150,268 L200,268 Q206,275 210,288 L196,380 L150,365 Z" fill={dark} opacity="0.35" />
          {/* Collar V */}
          <path d="M132,262 L150,310 L168,262" stroke={light} strokeWidth="2.5" fill="none" opacity="0.5" />
          {/* Obi */}
          <path d="M78,385 Q120,395 150,395 Q180,395 222,385 L224,420 Q180,430 150,430 Q120,430 76,420 Z" fill={light} />
          <ellipse cx="200" cy="405" rx="10" ry="14" fill={shade(light, -12)} opacity="0.5" />
          <path d="M80,388 Q150,398 220,388" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.25" />
          <path d="M78,418 Q150,428 222,418" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.25" />
          {/* Folds */}
          <path d="M104,430 Q98,480 88,540" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.15" />
          <path d="M196,430 Q202,480 212,540" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.15" />
        </g>
      );
  }
}

/* ═══ Hair Back ═══ */
function HairBack({ style, color, dark, light, uid }: { style: HairStyle; color: string; dark: string; light: string; uid: string }) {
  switch (style) {
    case "long":
      return (
        <g>
          <path d="M90,160 Q76,110 150,88 Q224,110 210,160 L228,420 Q150,438 72,420 Z" fill={`url(#${uid}h)`} />
          <path d="M92,165 Q86,260 78,390" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.2" />
          <path d="M110,130 Q100,240 90,370" stroke={dark} strokeWidth="1" fill="none" opacity="0.15" />
          <path d="M208,165 Q214,260 222,390" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.2" />
          <path d="M130,100 Q145,95 165,100" stroke={light} strokeWidth="2.5" fill="none" opacity="0.3" />
        </g>
      );
    case "short":
      return (
        <g>
          <path d="M95,158 Q84,108 150,88 Q216,108 205,158 L210,225 Q150,240 90,225 Z" fill={`url(#${uid}h)`} />
          <path d="M130,98 Q148,93 165,98" stroke={light} strokeWidth="2.5" fill="none" opacity="0.3" />
        </g>
      );
    case "twin":
      return (
        <g>
          <path d="M92,158 Q82,108 150,88 Q218,108 208,158 L210,225 Q150,240 90,225 Z" fill={`url(#${uid}h)`} />
          <path d="M74,240 Q58,340 78,440 Q88,440 96,428 Q104,350 94,250 Z" fill={color} />
          <path d="M78,260 Q66,340 80,420" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.2" />
          <path d="M226,240 Q242,340 222,440 Q212,440 204,428 Q196,350 206,250 Z" fill={color} />
          <path d="M222,260 Q234,340 220,420" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.2" />
          <ellipse cx="84" cy="242" rx="7" ry="5" fill={dark} opacity="0.6" />
          <ellipse cx="216" cy="242" rx="7" ry="5" fill={dark} opacity="0.6" />
          <path d="M130,98 Q148,93 165,98" stroke={light} strokeWidth="2.5" fill="none" opacity="0.3" />
        </g>
      );
    case "bob":
      return (
        <g>
          <path d="M92,160 Q82,108 150,88 Q218,108 208,160 L218,270 Q150,288 82,270 Z" fill={`url(#${uid}h)`} />
          <path d="M86,265 Q110,282 150,285 Q190,282 214,265" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.25" />
          <path d="M130,98 Q148,93 165,98" stroke={light} strokeWidth="2.5" fill="none" opacity="0.3" />
        </g>
      );
    case "ponytail":
      return (
        <g>
          <path d="M95,158 Q84,108 150,88 Q216,108 205,158 L210,225 Q150,240 90,225 Z" fill={`url(#${uid}h)`} />
          <path d="M205,170 Q245,260 230,400 Q222,412 214,400 Q210,300 190,210 Z" fill={color} />
          <path d="M208,190 Q238,280 226,390" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.2" />
          <ellipse cx="200" cy="178" rx="7" ry="5" fill={dark} opacity="0.6" />
          <path d="M130,98 Q148,93 165,98" stroke={light} strokeWidth="2.5" fill="none" opacity="0.3" />
        </g>
      );
  }
}

/* ═══ Hair Front / Bangs ═══ */
function HairFront({ style, color, dark, light, uid }: { style: HairStyle; color: string; dark: string; light: string; uid: string }) {
  const bangs = (
    <g>
      <path d="M95,148 Q102,102 150,92 Q198,102 205,148 Q190,134 150,140 Q110,134 95,148 Z" fill={color} />
      {/* Strand shadows */}
      <path d="M105,145 Q118,158 140,148 Q132,168 115,162 Z" fill={dark} opacity="0.3" />
      <path d="M195,145 Q182,158 160,148 Q168,168 185,162 Z" fill={dark} opacity="0.3" />
      {/* Highlights */}
      <path d="M132,110 Q142,105 155,110" stroke={light} strokeWidth="1.8" fill="none" opacity="0.28" />
      <path d="M118,120 Q130,115 145,120" stroke={light} strokeWidth="1" fill="none" opacity="0.18" />
    </g>
  );

  if (style === "twin" || style === "long") {
    return (
      <g>
        {bangs}
        <path d="M92,148 Q80,195 86,265 Q100,235 104,158 Z" fill={color} />
        <path d="M208,148 Q220,195 214,265 Q200,235 196,158 Z" fill={color} />
        <path d="M96,155 Q86,200 90,255" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.2" />
        <path d="M204,155 Q214,200 210,255" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.2" />
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
