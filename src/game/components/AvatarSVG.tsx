import { useMemo } from "react";
import type { Character, HairStyle, OutfitStyle } from "../types";

/**
 * Hyper-realistic full-body SVG avatar.
 * ViewBox 400×1000 — very high resolution canvas.
 * Multi-layer shading: subsurface scattering simulation, ambient occlusion,
 * specular highlights, detailed iris/pupil rendering, pore-level skin texture,
 * realistic anatomy with proper proportions (~1:7 head-to-body).
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
  const s1 = shade(skin, -8);
  const s2 = shade(skin, -16);
  const s3 = shade(skin, -24);
  const sL = shade(skin, 8);
  const sHL = shade(skin, 16);
  const sSSS = shade(skin, 5); // subsurface scatter
  const sSSSWarm = blendHex(skin, "#ffb4a8", 0.15); // warm SSS
  const hair = character.hairColor;
  const hD = shade(hair, -20);
  const hD2 = shade(hair, -35);
  const hL = shade(hair, 15);
  const hL2 = shade(hair, 28);
  const eye = character.eyeColor;
  const eD = shade(eye, -30);
  const eD2 = shade(eye, -50);
  const eL = shade(eye, 22);
  const eL2 = shade(eye, 40);
  const outfit = character.outfitColor;
  const oD = shade(outfit, -18);
  const oD2 = shade(outfit, -30);
  const oL = shade(outfit, 18);
  const oL2 = shade(outfit, 30);
  const oM = shade(outfit, -6);

  const uid = useMemo(() => "u" + Math.random().toString(36).slice(2, 7), []);

  const isSkirt = character.outfitStyle === "dress" || character.outfitStyle === "yukata" || character.outfitStyle === "uniform";

  return (
    <svg viewBox="0 0 400 1000" xmlns="http://www.w3.org/2000/svg" className={className} style={style} preserveAspectRatio="xMidYMax meet">
      <defs>
        {/* ── Skin Gradients ── */}
        <radialGradient id={`${uid}face`} cx="48%" cy="36%" r="54%">
          <stop offset="0%" stopColor={sHL} />
          <stop offset="30%" stopColor={sSSS} />
          <stop offset="65%" stopColor={skin} />
          <stop offset="100%" stopColor={s1} />
        </radialGradient>
        <radialGradient id={`${uid}faceSSSR`} cx="35%" cy="55%" r="40%">
          <stop offset="0%" stopColor={sSSSWarm} stopOpacity="0.3" />
          <stop offset="100%" stopColor={sSSSWarm} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}faceSSSL`} cx="65%" cy="55%" r="40%">
          <stop offset="0%" stopColor={sSSSWarm} stopOpacity="0.3" />
          <stop offset="100%" stopColor={sSSSWarm} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}bodySkin`} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0%" stopColor={sL} />
          <stop offset="50%" stopColor={skin} />
          <stop offset="100%" stopColor={s1} />
        </linearGradient>
        <linearGradient id={`${uid}neckSkin`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={s2} />
          <stop offset="40%" stopColor={skin} />
          <stop offset="100%" stopColor={s1} />
        </linearGradient>
        {/* ── Iris ── */}
        <radialGradient id={`${uid}iris`} cx="50%" cy="38%" r="52%">
          <stop offset="0%" stopColor={eL2} />
          <stop offset="25%" stopColor={eL} />
          <stop offset="60%" stopColor={eye} />
          <stop offset="85%" stopColor={eD} />
          <stop offset="100%" stopColor={eD2} />
        </radialGradient>
        <radialGradient id={`${uid}irisInner`} cx="50%" cy="50%" r="35%">
          <stop offset="0%" stopColor={eL2} stopOpacity="0.4" />
          <stop offset="100%" stopColor={eye} stopOpacity="0" />
        </radialGradient>
        {/* ── Hair ── */}
        <linearGradient id={`${uid}hair`} x1="0.15" y1="0" x2="0.55" y2="1">
          <stop offset="0%" stopColor={hL2} stopOpacity="0.5" />
          <stop offset="20%" stopColor={hL} />
          <stop offset="50%" stopColor={hair} />
          <stop offset="100%" stopColor={hD2} />
        </linearGradient>
        <linearGradient id={`${uid}hairSheen`} x1="0.3" y1="0" x2="0.7" y2="0.5">
          <stop offset="0%" stopColor={hL2} stopOpacity="0" />
          <stop offset="40%" stopColor={hL2} stopOpacity="0.35" />
          <stop offset="60%" stopColor={hL2} stopOpacity="0.35" />
          <stop offset="100%" stopColor={hL2} stopOpacity="0" />
        </linearGradient>
        {/* ── Outfit ── */}
        <linearGradient id={`${uid}outfit`} x1="0" y1="0" x2="0.08" y2="1">
          <stop offset="0%" stopColor={oL} stopOpacity="0.8" />
          <stop offset="35%" stopColor={outfit} />
          <stop offset="70%" stopColor={oM} />
          <stop offset="100%" stopColor={oD2} />
        </linearGradient>
        <linearGradient id={`${uid}outfitHL`} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor={oL2} stopOpacity="0" />
          <stop offset="50%" stopColor={oL2} stopOpacity="0.2" />
          <stop offset="100%" stopColor={oL2} stopOpacity="0" />
        </linearGradient>
        {/* ── Lip ── */}
        <radialGradient id={`${uid}lip`} cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#d4707e" />
          <stop offset="50%" stopColor="#b84858" />
          <stop offset="100%" stopColor="#7a2838" />
        </radialGradient>
        <radialGradient id={`${uid}lipHL`} cx="50%" cy="70%" r="45%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {/* ── Filters ── */}
        <filter id={`${uid}softSh`} x="-20%" y="-10%" width="140%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
          <feOffset dy="6" />
          <feComponentTransfer><feFuncA type="linear" slope="0.15" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`${uid}blur3`}><feGaussianBlur stdDeviation="3" /></filter>
        <filter id={`${uid}blur6`}><feGaussianBlur stdDeviation="6" /></filter>
        <filter id={`${uid}blur10`}><feGaussianBlur stdDeviation="10" /></filter>
        <filter id={`${uid}skinTex`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="4" result="noise" seed={42} />
          <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
          <feBlend in="SourceGraphic" in2="gray" mode="overlay" result="blended" />
          <feComponentTransfer in="blended">
            <feFuncA type="linear" slope="0.04" intercept="0.96" />
          </feComponentTransfer>
        </filter>
        {/* Neck AO */}
        <radialGradient id={`${uid}neckAO`} cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor={s3} stopOpacity="0.5" />
          <stop offset="100%" stopColor={s3} stopOpacity="0" />
        </radialGradient>
        {/* Sclera gradient */}
        <radialGradient id={`${uid}sclera`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f5f2f0" />
          <stop offset="100%" stopColor="#e8e2dd" />
        </radialGradient>
        {/* Nose shadow */}
        <linearGradient id={`${uid}noseSh`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={s2} stopOpacity="0" />
          <stop offset="60%" stopColor={s2} stopOpacity="0.2" />
          <stop offset="100%" stopColor={s2} stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* ══════ LEGS ══════ */}
      <LegsRealistic skin={skin} s1={s1} s2={s2} sL={sL} sHL={sHL} outfit={outfit} oD={oD} oD2={oD2} oL={oL} isSkirt={isSkirt} outfitStyle={character.outfitStyle} uid={uid} />

      {/* ══════ OUTFIT / TORSO ══════ */}
      <OutfitBodyRealistic style={character.outfitStyle} color={outfit} dark={oD} dark2={oD2} light={oL} light2={oL2} mid={oM} uid={uid} skin={skin} s1={s1} s2={s2} sL={sL} />

      {/* ══════ ARMS ══════ */}
      <ArmsRealistic skin={skin} s1={s1} s2={s2} s3={s3} sL={sL} sHL={sHL} outfit={outfit} oD={oD} oD2={oD2} uid={uid} />

      {/* ══════ NECK ══════ */}
      <g>
        <path d="M180,296 Q178,316 175,344 L225,344 Q222,316 220,296 Z" fill={`url(#${uid}neckSkin)`} />
        {/* Sternocleidomastoid muscle lines */}
        <path d="M186,300 Q190,320 188,340" stroke={s2} strokeWidth="0.6" fill="none" opacity="0.12" />
        <path d="M214,300 Q210,320 212,340" stroke={s2} strokeWidth="0.6" fill="none" opacity="0.12" />
        {/* Throat notch */}
        <path d="M195,338 Q200,342 205,338" stroke={s2} strokeWidth="0.7" fill="none" opacity="0.2" />
        {/* Neck shadow under chin */}
        <ellipse cx="200" cy="305" rx="22" ry="8" fill={`url(#${uid}neckAO)`} />
        {/* Neck highlight */}
        <ellipse cx="200" cy="318" rx="8" ry="15" fill={sHL} opacity="0.08" />
      </g>

      {/* ══════ HEAD ══════ */}
      <g filter={`url(#${uid}softSh)`}>
        <HairBackRealistic style={character.hairStyle} color={hair} dark={hD} dark2={hD2} light={hL} light2={hL2} uid={uid} />

        {/* Face base — realistic oval with refined jaw */}
        <path d="M144,228 Q134,195 140,160 Q148,122 200,115 Q252,122 260,160 Q266,195 256,228 Q250,268 230,290 Q218,304 200,308 Q182,304 170,290 Q150,268 144,228 Z" fill={`url(#${uid}face)`} />

        {/* Skin texture overlay */}
        <path d="M144,228 Q134,195 140,160 Q148,122 200,115 Q252,122 260,160 Q266,195 256,228 Q250,268 230,290 Q218,304 200,308 Q182,304 170,290 Q150,268 144,228 Z" fill={skin} opacity="0.03" filter={`url(#${uid}skinTex)`} />

        {/* Subsurface scattering — warm glow on cheeks */}
        <path d="M144,228 Q134,195 140,160 Q148,122 200,115 Q252,122 260,160 Q266,195 256,228 Q250,268 230,290 Q218,304 200,308 Q182,304 170,290 Q150,268 144,228 Z" fill={`url(#${uid}faceSSSR)`} />
        <path d="M144,228 Q134,195 140,160 Q148,122 200,115 Q252,122 260,160 Q266,195 256,228 Q250,268 230,290 Q218,304 200,308 Q182,304 170,290 Q150,268 144,228 Z" fill={`url(#${uid}faceSSSL)`} />

        {/* Facial structure shadows */}
        {/* Temple hollow */}
        <ellipse cx="155" cy="170" rx="8" ry="14" fill={s2} opacity="0.06" />
        <ellipse cx="245" cy="170" rx="8" ry="14" fill={s2} opacity="0.06" />
        {/* Jawline contour */}
        <path d="M148,232 Q158,272 180,296 Q200,308 220,296 Q242,272 252,232" stroke={s2} strokeWidth="0.8" fill="none" opacity="0.15" />
        {/* Zygomatic (cheekbone) highlight */}
        <ellipse cx="162" cy="218" rx="16" ry="7" fill={sHL} opacity="0.18" />
        <ellipse cx="238" cy="218" rx="16" ry="7" fill={sHL} opacity="0.18" />
        {/* Cheekbone shadow underneath */}
        <ellipse cx="162" cy="228" rx="14" ry="5" fill={s2} opacity="0.06" />
        <ellipse cx="238" cy="228" rx="14" ry="5" fill={s2} opacity="0.06" />
        {/* Forehead highlight */}
        <ellipse cx="200" cy="148" rx="24" ry="16" fill={sHL} opacity="0.1" />

        {/* ── Ears ── */}
        <g>
          {/* Left ear */}
          <path d="M144,198 Q132,184 131,200 Q130,216 140,218 Q144,214 144,208 Z" fill={skin} />
          <path d="M136,194 Q133,200 134,210 Q136,214 138,212" stroke={s1} strokeWidth="0.8" fill="none" opacity="0.35" />
          <path d="M138,198 Q136,204 137,208" stroke={s2} strokeWidth="0.5" fill="none" opacity="0.25" />
          <ellipse cx="136" cy="210" rx="2" ry="2.5" fill={s1} opacity="0.15" />
          {/* Right ear */}
          <path d="M256,198 Q268,184 269,200 Q270,216 260,218 Q256,214 256,208 Z" fill={skin} />
          <path d="M264,194 Q267,200 266,210 Q264,214 262,212" stroke={s1} strokeWidth="0.8" fill="none" opacity="0.35" />
          <path d="M262,198 Q264,204 263,208" stroke={s2} strokeWidth="0.5" fill="none" opacity="0.25" />
          <ellipse cx="264" cy="210" rx="2" ry="2.5" fill={s1} opacity="0.15" />
        </g>

        {/* ══ EYES — hyper-detailed ══ */}
        <g>
          {/* Orbital socket depth */}
          <ellipse cx="176" cy="205" rx="18" ry="10" fill={s2} opacity="0.06" />
          <ellipse cx="224" cy="205" rx="18" ry="10" fill={s2} opacity="0.06" />

          {/* Sclera — anatomical almond with caruncle */}
          <path d="M158,207 Q165,195 176,192 Q187,195 196,207 Q187,216 176,217 Q165,216 158,207 Z" fill={`url(#${uid}sclera)`} />
          <path d="M204,207 Q211,195 224,192 Q235,195 244,207 Q235,216 224,217 Q211,216 204,207 Z" fill={`url(#${uid}sclera)`} />

          {/* Sclera veins — barely visible */}
          <path d="M161,205 Q164,203 167,206" stroke="#d4a8a8" strokeWidth="0.25" fill="none" opacity="0.2" />
          <path d="M240,204 Q237,202 235,205" stroke="#d4a8a8" strokeWidth="0.25" fill="none" opacity="0.2" />

          {/* Upper sclera shadow (from lid) */}
          <path d="M160,205 Q176,197 194,205" fill={s1} opacity="0.05" />
          <path d="M206,205 Q224,197 242,205" fill={s1} opacity="0.05" />

          {/* Caruncle (inner corner) */}
          <ellipse cx="160" cy="208" rx="2.5" ry="2" fill="#e8b4b0" opacity="0.6" />
          <ellipse cx="206" cy="208" rx="2.5" ry="2" fill="#e8b4b0" opacity="0.6" />

          {/* ── Iris — multi-layered ── */}
          <circle cx="176" cy="206" r="8.5" fill={`url(#${uid}iris)`} />
          <circle cx="224" cy="206" r="8.5" fill={`url(#${uid}iris)`} />

          {/* Iris inner glow */}
          <circle cx="176" cy="206" r="8.5" fill={`url(#${uid}irisInner)`} />
          <circle cx="224" cy="206" r="8.5" fill={`url(#${uid}irisInner)`} />

          {/* Limbal ring — thick and dark */}
          <circle cx="176" cy="206" r="8.5" fill="none" stroke={eD2} strokeWidth="1" opacity="0.55" />
          <circle cx="224" cy="206" r="8.5" fill="none" stroke={eD2} strokeWidth="1" opacity="0.55" />

          {/* Iris fibres — 16 radial */}
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i * 22.5 * Math.PI) / 180;
            return (
              <g key={`if${i}`}>
                <line x1={176 + Math.cos(a) * 3} y1={206 + Math.sin(a) * 3} x2={176 + Math.cos(a) * 7.5} y2={206 + Math.sin(a) * 7.5} stroke={i % 3 === 0 ? eL : eD} strokeWidth="0.35" opacity="0.2" />
                <line x1={224 + Math.cos(a) * 3} y1={206 + Math.sin(a) * 3} x2={224 + Math.cos(a) * 7.5} y2={206 + Math.sin(a) * 7.5} stroke={i % 3 === 0 ? eL : eD} strokeWidth="0.35" opacity="0.2" />
              </g>
            );
          })}

          {/* Collarette ring */}
          <circle cx="176" cy="206" r="5" fill="none" stroke={eD} strokeWidth="0.4" opacity="0.2" strokeDasharray="1 1.5" />
          <circle cx="224" cy="206" r="5" fill="none" stroke={eD} strokeWidth="0.4" opacity="0.2" strokeDasharray="1 1.5" />

          {/* Pupil */}
          <circle cx="176" cy="206" r="3.5" fill="#030108" />
          <circle cx="224" cy="206" r="3.5" fill="#030108" />
          {/* Pupil edge fade */}
          <circle cx="176" cy="206" r="3.5" fill="none" stroke="#0a0510" strokeWidth="0.6" opacity="0.4" />
          <circle cx="224" cy="206" r="3.5" fill="none" stroke="#0a0510" strokeWidth="0.6" opacity="0.4" />

          {/* Light reflections — complex catchlights */}
          <ellipse cx="179" cy="201" rx="2.8" ry="2.2" fill="#fff" opacity="0.92" />
          <ellipse cx="227" cy="201" rx="2.8" ry="2.2" fill="#fff" opacity="0.92" />
          <circle cx="173" cy="210" r="1.2" fill="#fff" opacity="0.4" />
          <circle cx="221" cy="210" r="1.2" fill="#fff" opacity="0.4" />
          {/* Window reflection */}
          <rect x="174" y="199" width="5" height="2" rx="0.8" fill="#fff" opacity="0.15" transform="rotate(-8 176 200)" />
          <rect x="222" y="199" width="5" height="2" rx="0.8" fill="#fff" opacity="0.15" transform="rotate(-8 224 200)" />

          {/* ── Upper eyelid — detailed with thickness ── */}
          <path d="M157,207 Q166,194 176,191 Q186,194 196,207" stroke="#120a14" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M203,207 Q212,194 224,191 Q234,194 244,207" stroke="#120a14" strokeWidth="2.2" fill="none" strokeLinecap="round" />

          {/* Eyelid skin fold / double lid crease */}
          <path d="M159,202 Q168,189 176,187 Q184,189 193,202" stroke={s2} strokeWidth="0.7" fill="none" opacity="0.18" />
          <path d="M205,202 Q214,189 224,187 Q232,189 241,202" stroke={s2} strokeWidth="0.7" fill="none" opacity="0.18" />

          {/* Eyelid shadow — gradient effect */}
          <path d="M159,205 Q176,194 194,205" fill={s2} opacity="0.04" />
          <path d="M205,205 Q224,194 242,205" fill={s2} opacity="0.04" />

          {/* Lower lid / waterline */}
          <path d="M160,210 Q176,217 192,210" stroke="#c4a898" strokeWidth="0.5" fill="none" opacity="0.3" />
          <path d="M208,210 Q224,217 240,210" stroke="#c4a898" strokeWidth="0.5" fill="none" opacity="0.3" />

          {/* Lower lash line */}
          <path d="M161,210 Q176,218 193,210" stroke="#2a1828" strokeWidth="0.8" fill="none" opacity="0.25" />
          <path d="M207,210 Q224,218 241,210" stroke="#2a1828" strokeWidth="0.8" fill="none" opacity="0.25" />

          {/* Individual upper lashes — fine detail */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const t = i / 7;
            const lx = 160 + t * 34;
            const rx = 206 + t * 36;
            const angle = -70 + t * 50;
            const len = 3 + Math.sin(t * Math.PI) * 3;
            const rad = (angle * Math.PI) / 180;
            return (
              <g key={`lash${i}`}>
                <line x1={lx} y1={207 - 8 + Math.abs(t - 0.5) * 12} x2={lx + Math.cos(rad) * len} y2={207 - 8 + Math.abs(t - 0.5) * 12 + Math.sin(rad) * len} stroke="#120a14" strokeWidth={0.8 + Math.sin(t * Math.PI) * 0.6} strokeLinecap="round" opacity={0.5 + Math.sin(t * Math.PI) * 0.3} />
                <line x1={rx} y1={207 - 8 + Math.abs(t - 0.5) * 12} x2={rx + Math.cos(rad) * len} y2={207 - 8 + Math.abs(t - 0.5) * 12 + Math.sin(rad) * len} stroke="#120a14" strokeWidth={0.8 + Math.sin(t * Math.PI) * 0.6} strokeLinecap="round" opacity={0.5 + Math.sin(t * Math.PI) * 0.3} />
              </g>
            );
          })}

          {/* Corner lash accents */}
          <path d="M156,207 Q153,204 151,201" stroke="#120a14" strokeWidth="1.3" fill="none" opacity="0.55" strokeLinecap="round" />
          <path d="M197,207 Q199,205 200,203" stroke="#120a14" strokeWidth="1" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M203,207 Q201,205 200,203" stroke="#120a14" strokeWidth="1" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M245,207 Q248,204 250,201" stroke="#120a14" strokeWidth="1.3" fill="none" opacity="0.55" strokeLinecap="round" />
        </g>

        {/* ── Eyebrows — hair-stroke detail ── */}
        <g>
          {/* Left brow body */}
          <path d="M155,183 Q165,176 178,177 Q185,179 190,183" stroke={hD} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M157,183 Q166,177 178,178 Q186,180 191,184 Q182,180 170,179 Q162,179 157,183 Z" fill={hD} opacity="0.3" />
          {/* Hair strokes left */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const x = 160 + i * 5;
            return <line key={`bl${i}`} x1={x} y1={183 - i * 0.3} x2={x + 2} y2={178 - i * 0.2} stroke={hD2} strokeWidth="0.5" opacity={0.2 + i * 0.03} />;
          })}
          {/* Right brow body */}
          <path d="M210,183 Q215,179 222,177 Q235,176 245,183" stroke={hD} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M209,184 Q214,180 222,178 Q234,177 243,183 Q234,179 224,179 Q216,180 209,184 Z" fill={hD} opacity="0.3" />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const x = 218 + i * 5;
            return <line key={`br${i}`} x1={x} y1={178 - (5 - i) * 0.2} x2={x + 2} y2={183 - (5 - i) * 0.3} stroke={hD2} strokeWidth="0.5" opacity={0.2 + i * 0.03} />;
          })}
        </g>

        {/* ── NOSE — anatomically detailed ── */}
        <g>
          {/* Bridge — subtle S-curve */}
          <path d="M200,185 Q198,210 196,232 Q194,240 196,248" stroke={s2} strokeWidth="0.8" fill="none" opacity="0.3" />
          <path d="M200,185 Q202,210 204,232 Q206,240 204,248" stroke={s2} strokeWidth="0.4" fill="none" opacity="0.15" />
          {/* Bridge highlight */}
          <path d="M200,188 Q200,215 200,240" stroke={sHL} strokeWidth="2" fill="none" opacity="0.15" />
          {/* Nose tip — ball shape */}
          <ellipse cx="200" cy="246" rx="8" ry="6" fill={skin} />
          <ellipse cx="200" cy="245" rx="5" ry="4" fill={sHL} opacity="0.12" />
          {/* Alar wings */}
          <path d="M192,248 Q186,252 188,256 Q192,258 196,254" fill={s1} opacity="0.25" />
          <path d="M208,248 Q214,252 212,256 Q208,258 204,254" fill={s1} opacity="0.25" />
          {/* Nostrils — dark ellipses */}
          <ellipse cx="193" cy="252" rx="3.5" ry="2" fill={s3} opacity="0.3" transform="rotate(-10 193 252)" />
          <ellipse cx="207" cy="252" rx="3.5" ry="2" fill={s3} opacity="0.3" transform="rotate(10 207 252)" />
          {/* Nasolabial folds — very subtle */}
          <path d="M186,240 Q182,255 180,268" stroke={s2} strokeWidth="0.5" fill="none" opacity="0.1" />
          <path d="M214,240 Q218,255 220,268" stroke={s2} strokeWidth="0.5" fill="none" opacity="0.1" />
          {/* Nose shadow underneath */}
          <ellipse cx="200" cy="256" rx="10" ry="3" fill={s2} opacity="0.08" filter={`url(#${uid}blur3)`} />
        </g>

        {/* ── MOUTH — hyper-realistic lips ── */}
        <g>
          {/* Philtrum columns */}
          <path d="M196,256 Q196,264 198,270" stroke={s2} strokeWidth="0.4" fill="none" opacity="0.12" />
          <path d="M204,256 Q204,264 202,270" stroke={s2} strokeWidth="0.4" fill="none" opacity="0.12" />
          {/* Philtrum highlight */}
          <path d="M200,258 Q200,264 200,270" stroke={sHL} strokeWidth="1.2" fill="none" opacity="0.08" />

          {/* Upper lip — realistic cupid's bow */}
          <path d="M182,272 Q190,266 196,268 Q200,264 204,268 Q210,266 218,272" fill={`url(#${uid}lip)`} opacity="0.55" />
          <path d="M182,272 Q190,266 196,268 Q200,264 204,268 Q210,266 218,272" stroke="#6a2535" strokeWidth="0.8" fill="none" opacity="0.3" />

          {/* Lower lip — fuller */}
          <path d="M182,272 Q200,284 218,272" fill={`url(#${uid}lip)`} opacity="0.5" />
          <path d="M182,272 Q200,284 218,272" stroke="#6a2535" strokeWidth="0.9" fill="none" opacity="0.25" />

          {/* Lower lip specular highlight */}
          <ellipse cx="200" cy="278" rx="9" ry="3.5" fill={`url(#${uid}lipHL)`} />

          {/* Upper lip highlight — vermillion border */}
          <path d="M190,268 Q196,265 200,264 Q204,265 210,268" stroke={sHL} strokeWidth="0.5" fill="none" opacity="0.15" />

          {/* Lip line */}
          <path d="M184,272 Q200,274 216,272" stroke="#5a1e2e" strokeWidth="0.6" fill="none" opacity="0.25" />

          {/* Lip corners — orbicularis shadow */}
          <ellipse cx="180" cy="272" rx="2.5" ry="1.5" fill={s2} opacity="0.12" />
          <ellipse cx="220" cy="272" rx="2.5" ry="1.5" fill={s2} opacity="0.12" />

          {/* Lower lip shadow (mentolabial) */}
          <path d="M186,284 Q200,287 214,284" stroke={s2} strokeWidth="0.6" fill="none" opacity="0.1" />
        </g>

        {/* Chin */}
        <ellipse cx="200" cy="296" rx="3" ry="2" fill={s2} opacity="0.07" />
        <ellipse cx="200" cy="292" rx="8" ry="4" fill={sHL} opacity="0.06" />

        {/* Blush — diffuse and natural */}
        <ellipse cx="160" cy="235" rx="16" ry="9" fill="#e8909a" opacity="0.12" filter={`url(#${uid}blur10)`} />
        <ellipse cx="240" cy="235" rx="16" ry="9" fill="#e8909a" opacity="0.12" filter={`url(#${uid}blur10)`} />

        {/* Hair front */}
        <HairFrontRealistic style={character.hairStyle} color={hair} dark={hD} dark2={hD2} light={hL} light2={hL2} uid={uid} />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
   LEGS — Realistic with muscle definition, skin shading
   ══════════════════════════════════════════════════════════ */
function LegsRealistic({ skin, s1, s2, sL, sHL, outfit, oD, oD2, oL, isSkirt, outfitStyle, uid }: {
  skin: string; s1: string; s2: string; sL: string; sHL: string; outfit: string; oD: string; oD2: string; oL: string; isSkirt: boolean; outfitStyle: OutfitStyle; uid: string;
}) {
  const shoeY = isSkirt ? 860 : 860;
  return (
    <g>
      {!isSkirt && (
        <g>
          {/* Pants — left */}
          <path d="M158,660 Q155,710 152,780 Q152,790 160,793 L180,793 Q186,790 185,780 Q183,710 180,660 Z" fill={oD} />
          {/* Pants — right */}
          <path d="M220,660 Q223,710 226,780 Q226,790 218,793 L198,793 Q192,790 193,780 Q195,710 198,660 Z" fill={oD} />
          {/* Crease */}
          <path d="M170,665 Q170,730 170,785" stroke={outfit} strokeWidth="0.8" fill="none" opacity="0.15" />
          <path d="M208,665 Q208,730 208,785" stroke={outfit} strokeWidth="0.8" fill="none" opacity="0.15" />
          {/* Knee bulge highlight */}
          <ellipse cx="170" cy="730" rx="7" ry="12" fill={oL} opacity="0.08" />
          <ellipse cx="208" cy="730" rx="7" ry="12" fill={oL} opacity="0.08" />
        </g>
      )}
      {isSkirt && (
        <g>
          {/* Left leg skin */}
          <path d="M162,710 Q159,750 156,840 Q156,850 164,853 L182,853 Q188,850 187,840 Q185,750 182,710 Z" fill={skin} />
          {/* Right leg skin */}
          <path d="M218,710 Q221,750 224,840 Q224,850 216,853 L198,853 Q192,850 193,840 Q195,750 198,710 Z" fill={skin} />
          {/* Knee highlight */}
          <ellipse cx="172" cy="760" rx="7" ry="12" fill={sHL} opacity="0.1" />
          <ellipse cx="210" cy="760" rx="7" ry="12" fill={sHL} opacity="0.1" />
          {/* Calf muscle shadow */}
          <path d="M165,775 Q168,800 170,835" stroke={s1} strokeWidth="1.2" fill="none" opacity="0.12" />
          <path d="M215,775 Q212,800 210,835" stroke={s1} strokeWidth="1.2" fill="none" opacity="0.12" />
          {/* Inner leg shadow */}
          <path d="M180,715 Q182,760 184,840" stroke={s2} strokeWidth="0.8" fill="none" opacity="0.1" />
          <path d="M200,715 Q198,760 196,840" stroke={s2} strokeWidth="0.8" fill="none" opacity="0.1" />
          {/* Shin highlight */}
          <path d="M170,730 Q170,780 170,830" stroke={sL} strokeWidth="2" fill="none" opacity="0.06" />
          <path d="M210,730 Q210,780 210,830" stroke={sL} strokeWidth="2" fill="none" opacity="0.06" />
          {/* Ankle narrowing shadow */}
          <ellipse cx="172" cy="842" rx="8" ry="3" fill={s1} opacity="0.1" />
          <ellipse cx="210" cy="842" rx="8" ry="3" fill={s1} opacity="0.1" />
        </g>
      )}
      {!isSkirt && (
        <g>
          {/* Below pants — ankle skin */}
          <path d="M156,785 Q155,815 154,845 Q154,852 162,855 L180,855 Q186,852 185,845 Q184,815 183,785 Z" fill={skin} />
          <path d="M224,785 Q225,815 224,845 Q224,852 216,855 L198,855 Q192,852 193,845 Q194,815 195,785 Z" fill={skin} />
          <ellipse cx="170" cy="840" rx="6" ry="3" fill={s1} opacity="0.08" />
          <ellipse cx="210" cy="840" rx="6" ry="3" fill={s1} opacity="0.08" />
        </g>
      )}
      {/* Shoes — detailed */}
      <g>
        <ellipse cx="174" cy={shoeY} rx="22" ry="10" fill="#0e0a12" />
        <ellipse cx="174" cy={shoeY - 3} rx="16" ry="6" fill="#1a1520" opacity="0.5" />
        <ellipse cx="174" cy={shoeY - 5} rx="10" ry="3" fill="#2a2230" opacity="0.2" />
        <ellipse cx="210" cy={shoeY} rx="22" ry="10" fill="#0e0a12" />
        <ellipse cx="210" cy={shoeY - 3} rx="16" ry="6" fill="#1a1520" opacity="0.5" />
        <ellipse cx="210" cy={shoeY - 5} rx="10" ry="3" fill="#2a2230" opacity="0.2" />
      </g>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════
   ARMS — Realistic anatomy, muscle/bone definition
   ══════════════════════════════════════════════════════════ */
function ArmsRealistic({ skin, s1, s2, s3, sL, sHL, outfit, oD, oD2, uid }: {
  skin: string; s1: string; s2: string; s3: string; sL: string; sHL: string; outfit: string; oD: string; oD2: string; uid: string;
}) {
  return (
    <g>
      {/* ── Left arm ── */}
      <g>
        {/* Upper arm (clothed) */}
        <path d="M118,370 Q108,400 100,460 Q92,520 102,590 Q108,602 116,592 Q122,550 124,495 Q126,440 132,390 Z" fill={`url(#${uid}outfit)`} />
        <path d="M116,380 Q108,420 102,470" stroke={oD2} strokeWidth="1.5" fill="none" opacity="0.2" />
        {/* Sleeve hem shadow */}
        <path d="M100,555 Q110,560 120,555" stroke={oD} strokeWidth="1" fill="none" opacity="0.2" />

        {/* Forearm skin */}
        <path d="M102,560 Q96,580 96,600 Q96,608 102,610 L118,610 Q124,608 124,600 Q124,580 118,560 Z" fill={skin} />
        {/* Forearm muscle definition */}
        <path d="M108,565 Q106,585 108,605" stroke={s1} strokeWidth="0.7" fill="none" opacity="0.12" />
        <ellipse cx="110" cy="580" rx="6" ry="10" fill={sHL} opacity="0.06" />
        {/* Wrist narrowing */}
        <path d="M104,605 Q110,608 118,605" stroke={s1} strokeWidth="0.5" fill="none" opacity="0.15" />

        {/* Hand — detailed */}
        <g>
          <path d="M100,608 Q94,618 92,632 Q90,646 98,648 Q104,646 108,638 Q112,630 114,622 Q116,614 110,608 Z" fill={skin} />
          {/* Finger separation lines */}
          <path d="M94,632 Q92,640 94,646" stroke={s1} strokeWidth="0.5" fill="none" opacity="0.25" />
          <path d="M98,630 Q96,640 98,648" stroke={s1} strokeWidth="0.4" fill="none" opacity="0.2" />
          <path d="M102,628 Q100,638 102,646" stroke={s1} strokeWidth="0.4" fill="none" opacity="0.18" />
          {/* Thumb */}
          <path d="M112,614 Q118,620 118,630 Q116,632 112,626" fill={skin} stroke={s1} strokeWidth="0.4" opacity="0.8" />
          {/* Knuckle highlights */}
          <ellipse cx="104" cy="614" rx="5" ry="3" fill={sHL} opacity="0.08" />
          {/* Nail hints */}
          <ellipse cx="94" cy="644" rx="2" ry="1.5" fill={sL} opacity="0.12" />
          <ellipse cx="98" cy="646" rx="2" ry="1.5" fill={sL} opacity="0.12" />
        </g>
      </g>

      {/* ── Right arm ── */}
      <g>
        <path d="M282,370 Q292,400 300,460 Q308,520 298,590 Q292,602 284,592 Q278,550 276,495 Q274,440 268,390 Z" fill={`url(#${uid}outfit)`} />
        <path d="M284,380 Q292,420 298,470" stroke={oD2} strokeWidth="1.5" fill="none" opacity="0.2" />
        <path d="M300,555 Q290,560 280,555" stroke={oD} strokeWidth="1" fill="none" opacity="0.2" />

        <path d="M298,560 Q304,580 304,600 Q304,608 298,610 L282,610 Q276,608 276,600 Q276,580 282,560 Z" fill={skin} />
        <path d="M292,565 Q294,585 292,605" stroke={s1} strokeWidth="0.7" fill="none" opacity="0.12" />
        <ellipse cx="290" cy="580" rx="6" ry="10" fill={sHL} opacity="0.06" />
        <path d="M296,605 Q290,608 282,605" stroke={s1} strokeWidth="0.5" fill="none" opacity="0.15" />

        <g>
          <path d="M300,608 Q306,618 308,632 Q310,646 302,648 Q296,646 292,638 Q288,630 286,622 Q284,614 290,608 Z" fill={skin} />
          <path d="M306,632 Q308,640 306,646" stroke={s1} strokeWidth="0.5" fill="none" opacity="0.25" />
          <path d="M302,630 Q304,640 302,648" stroke={s1} strokeWidth="0.4" fill="none" opacity="0.2" />
          <path d="M298,628 Q300,638 298,646" stroke={s1} strokeWidth="0.4" fill="none" opacity="0.18" />
          <path d="M288,614 Q282,620 282,630 Q284,632 288,626" fill={skin} stroke={s1} strokeWidth="0.4" opacity="0.8" />
          <ellipse cx="296" cy="614" rx="5" ry="3" fill={sHL} opacity="0.08" />
          <ellipse cx="306" cy="644" rx="2" ry="1.5" fill={sL} opacity="0.12" />
          <ellipse cx="302" cy="646" rx="2" ry="1.5" fill={sL} opacity="0.12" />
        </g>
      </g>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════
   OUTFIT / TORSO — Rich fabric rendering
   ══════════════════════════════════════════════════════════ */
function OutfitBodyRealistic({ style, color, dark, dark2, light, light2, mid, uid, skin, s1, s2, sL }: {
  style: OutfitStyle; color: string; dark: string; dark2: string; light: string; light2: string; mid: string; uid: string; skin: string; s1: string; s2: string; sL: string;
}) {
  switch (style) {
    case "dress":
      return (
        <g>
          {/* Bodice */}
          <path d="M132,356 Q124,365 118,380 L112,450 Q148,462 200,462 Q252,462 288,450 L282,380 Q276,365 268,356 Q248,344 200,338 Q152,344 132,356 Z" fill={`url(#${uid}outfit)`} />
          {/* Bust shading — anatomical */}
          <path d="M148,395 Q172,414 196,395" stroke={dark} strokeWidth="0.9" fill="none" opacity="0.15" />
          <path d="M204,395 Q228,414 252,395" stroke={dark} strokeWidth="0.9" fill="none" opacity="0.15" />
          <ellipse cx="172" cy="400" rx="14" ry="8" fill={light} opacity="0.05" />
          <ellipse cx="228" cy="400" rx="14" ry="8" fill={light} opacity="0.05" />
          {/* Collar / neckline */}
          <path d="M150,346 Q200,332 250,346 L246,362 Q200,350 154,362 Z" fill={light} opacity="0.5" />
          <path d="M152,348 Q200,335 248,348" stroke={light2} strokeWidth="1" fill="none" opacity="0.3" />
          {/* Clavicle skin */}
          <path d="M152,350 Q176,344 200,342 Q224,344 248,350" stroke={s1} strokeWidth="0.6" fill="none" opacity="0.15" />
          {/* Bow */}
          <path d="M192,358 Q200,350 208,358 Q200,354 192,358 Z" fill={dark} opacity="0.35" />
          <circle cx="200" cy="354" r="3" fill={dark} opacity="0.45" />
          {/* Skirt — A-line with volume and fabric physics */}
          <path d="M112,450 Q96,530 74,710 Q130,732 200,732 Q270,732 326,710 Q304,530 288,450 Z" fill={color} />
          {/* Fabric overlay highlight */}
          <path d="M112,450 Q96,530 74,710 Q130,732 200,732 Q270,732 326,710 Q304,530 288,450 Z" fill={`url(#${uid}outfitHL)`} />
          {/* Complex fold lines */}
          <path d="M135,458 Q125,550 106,710" stroke={dark} strokeWidth="2" fill="none" opacity="0.15" />
          <path d="M165,455 Q155,550 148,718" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.1" />
          <path d="M200,458 Q198,560 196,720" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.06" />
          <path d="M235,455 Q245,550 252,718" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.1" />
          <path d="M265,458 Q275,550 294,710" stroke={dark} strokeWidth="2" fill="none" opacity="0.15" />
          {/* Fold highlights */}
          <path d="M150,460 Q142,550 128,715" stroke={light} strokeWidth="1.2" fill="none" opacity="0.08" />
          <path d="M250,460 Q258,550 272,715" stroke={light} strokeWidth="1.2" fill="none" opacity="0.08" />
          {/* Hem */}
          <path d="M78,708 Q130,732 200,732 Q270,732 322,708" stroke={dark} strokeWidth="2" fill="none" opacity="0.12" />
          <path d="M80,710 Q130,730 200,730 Q270,730 320,710" stroke={light} strokeWidth="1.5" fill="none" opacity="0.1" />
        </g>
      );
    case "uniform":
      return (
        <g>
          {/* White blouse */}
          <path d="M132,356 Q124,365 118,380 L108,546 Q150,558 200,558 Q250,558 292,546 L282,380 Q276,365 268,356 Q248,344 200,338 Q152,344 132,356 Z" fill="#eeeef6" />
          <path d="M142,370 Q200,355 258,370" stroke="#d4d4e0" strokeWidth="1.5" fill="none" opacity="0.35" />
          {/* Button line */}
          {[390, 420, 450, 480, 510].map((y) => (
            <circle key={y} cx="200" cy={y} r="2" fill="#c8c8d8" opacity="0.4" />
          ))}
          {/* Sailor collar */}
          <path d="M132,356 L114,395 Q200,375 286,395 L268,356 Q200,336 132,356 Z" fill={color} />
          <path d="M116,393 Q200,373 284,393" stroke={light} strokeWidth="1.8" fill="none" opacity="0.35" />
          <path d="M118,390 Q200,372 282,390" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.15" />
          {/* Tie */}
          <polygon points="190,360 210,360 207,410 200,432 193,410" fill={color} />
          <polygon points="193,410 200,432 207,410 205,403 195,403" fill={dark} opacity="0.35" />
          <path d="M195,370 Q200,365 205,370" stroke={light} strokeWidth="0.8" fill="none" opacity="0.3" />
          {/* Pleated skirt */}
          <path d="M108,546 Q96,596 78,710 Q130,732 200,732 Q270,732 322,710 Q304,596 292,546 Z" fill={color} />
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={86 + i * 20} y1={552} x2={80 + i * 19.5} y2={718} stroke={dark} strokeWidth="1.3" opacity="0.22" />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`h${i}`} x1={96 + i * 20} y1={552} x2={90 + i * 19.5} y2={718} stroke={light} strokeWidth="0.8" opacity="0.08" />
          ))}
          {/* Waistband */}
          <rect x="108" y="540" width="184" height="14" rx="4" fill={dark} opacity="0.45" />
          <rect x="108" y="540" width="184" height="2" rx="1" fill={light} opacity="0.15" />
        </g>
      );
    case "hoodie":
      return (
        <g>
          <path d="M128,356 Q118,365 110,382 L96,660 Q144,678 200,678 Q256,678 304,660 L290,382 Q282,365 272,356 Q244,340 200,336 Q156,340 128,356 Z" fill={`url(#${uid}outfit)`} />
          {/* Fabric texture — subtle noise effect via folds */}
          <path d="M128,356 Q118,365 110,382 L96,660 Q144,678 200,678 Q256,678 304,660 L290,382 Q282,365 272,356 Q244,340 200,336 Q156,340 128,356 Z" fill={`url(#${uid}outfitHL)`} />
          {/* Hood */}
          <path d="M140,344 Q200,318 260,344 L266,372 Q200,352 134,372 Z" fill={dark} />
          <path d="M140,344 Q200,318 260,344" stroke={mid} strokeWidth="2.5" fill="none" opacity="0.35" />
          <path d="M142,348 Q200,325 258,348" stroke={dark2} strokeWidth="1" fill="none" opacity="0.2" />
          {/* Center seam */}
          <line x1="200" y1="362" x2="200" y2="655" stroke={dark} strokeWidth="1.8" opacity="0.15" />
          {/* Kangaroo pocket */}
          <path d="M142,508 Q148,492 200,488 Q252,492 258,508 L262,565 Q200,575 138,565 Z" fill={dark} opacity="0.3" />
          <path d="M142,508 Q148,492 200,488 Q252,492 258,508" stroke={dark2} strokeWidth="1.2" fill="none" opacity="0.3" />
          {/* Pocket center line */}
          <line x1="200" y1="492" x2="200" y2="565" stroke={dark} strokeWidth="0.8" opacity="0.15" />
          {/* Drawstrings */}
          <path d="M184,362 Q182,388 180,420" stroke={light} strokeWidth="2" fill="none" opacity="0.45" />
          <path d="M216,362 Q218,388 220,420" stroke={light} strokeWidth="2" fill="none" opacity="0.45" />
          <rect x="178" y="418" width="4" height="8" rx="1.5" fill={light} opacity="0.35" />
          <rect x="218" y="418" width="4" height="8" rx="1.5" fill={light} opacity="0.35" />
          {/* Ribbed hem */}
          <path d="M100,655 Q144,678 200,678 Q256,678 300,655" stroke={dark} strokeWidth="2" fill="none" opacity="0.2" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <line key={i} x1={110 + i * 22} y1={660} x2={108 + i * 22} y2={675} stroke={dark} strokeWidth="0.6" opacity="0.12" />
          ))}
        </g>
      );
    case "yukata":
      return (
        <g>
          <path d="M132,356 Q122,365 114,382 L96,730 Q144,745 200,745 Q256,745 304,730 L286,382 Q280,365 268,356 Q244,340 200,336 Q156,340 132,356 Z" fill={color} />
          <path d="M132,356 Q122,365 114,382 L96,730 Q144,745 200,745 Q256,745 304,730 L286,382 Q280,365 268,356 Q244,340 200,336 Q156,340 132,356 Z" fill={`url(#${uid}outfitHL)`} />
          {/* Cross overlap */}
          <path d="M200,356 L268,356 Q276,365 280,380 L262,505 L200,488 Z" fill={dark} opacity="0.3" />
          {/* Inner collar layer */}
          <path d="M176,348 L200,410 L224,348" stroke="#e8e0d8" strokeWidth="3" fill="none" opacity="0.45" />
          {/* Outer collar V */}
          <path d="M172,346 L200,415 L228,346" stroke={light} strokeWidth="2.5" fill="none" opacity="0.4" />
          {/* Obi — detailed */}
          <path d="M100,510 Q156,524 200,524 Q244,524 300,510 L302,558 Q244,572 200,572 Q156,572 98,558 Z" fill={light} />
          <path d="M102,514 Q200,528 298,514" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.2" />
          <path d="M100,555 Q200,570 300,555" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.2" />
          {/* Obi knot */}
          <ellipse cx="270" cy="538" rx="14" ry="18" fill={shade(light, -10)} opacity="0.45" />
          <ellipse cx="270" cy="538" rx="8" ry="12" fill={light} opacity="0.2" />
          {/* Fabric folds below obi */}
          <path d="M136,572 Q128,640 114,720" stroke={dark} strokeWidth="1.4" fill="none" opacity="0.12" />
          <path d="M264,572 Q272,640 286,720" stroke={dark} strokeWidth="1.4" fill="none" opacity="0.12" />
          <path d="M200,572 Q198,650 196,730" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.06" />
        </g>
      );
  }
}

/* ══════════════════════════════════════════════════════════
   HAIR BACK
   ══════════════════════════════════════════════════════════ */
function HairBackRealistic({ style, color, dark, dark2, light, light2, uid }: {
  style: HairStyle; color: string; dark: string; dark2: string; light: string; light2: string; uid: string;
}) {
  const sheenPath = (d: string) => <path d={d} stroke={light2} strokeWidth="2.5" fill="none" opacity="0.2" />;
  const strandShadow = (d: string) => <path d={d} stroke={dark} strokeWidth="1.5" fill="none" opacity="0.15" />;

  switch (style) {
    case "long":
      return (
        <g>
          <path d="M118,215 Q98,148 200,118 Q302,148 282,215 L306,565 Q200,588 94,565 Z" fill={`url(#${uid}hair)`} />
          <path d="M118,215 Q98,148 200,118 Q302,148 282,215 L306,565 Q200,588 94,565 Z" fill={`url(#${uid}hairSheen)`} />
          {strandShadow("M122,220 Q112,340 100,530")}
          {strandShadow("M148,170 Q132,320 118,510")}
          {strandShadow("M280,220 Q290,340 300,530")}
          {strandShadow("M260,170 Q270,320 282,510")}
          {sheenPath("M170,132 Q192,125 220,132")}
          {sheenPath("M155,155 Q180,148 210,155")}
          {/* Volume strands */}
          <path d="M100,350 Q95,400 94,500" stroke={dark2} strokeWidth="1" fill="none" opacity="0.08" />
          <path d="M300,350 Q305,400 306,500" stroke={dark2} strokeWidth="1" fill="none" opacity="0.08" />
        </g>
      );
    case "short":
      return (
        <g>
          <path d="M125,210 Q108,145 200,118 Q292,145 275,210 L282,300 Q200,320 118,300 Z" fill={`url(#${uid}hair)`} />
          <path d="M125,210 Q108,145 200,118 Q292,145 275,210 L282,300 Q200,320 118,300 Z" fill={`url(#${uid}hairSheen)`} />
          {sheenPath("M170,132 Q192,125 220,132")}
          {strandShadow("M135,180 Q128,230 122,280")}
          {strandShadow("M265,180 Q272,230 278,280")}
        </g>
      );
    case "twin":
      return (
        <g>
          <path d="M120,210 Q106,145 200,118 Q294,145 280,210 L282,300 Q200,320 118,300 Z" fill={`url(#${uid}hair)`} />
          <path d="M120,210 Q106,145 200,118 Q294,145 280,210 L282,300 Q200,320 118,300 Z" fill={`url(#${uid}hairSheen)`} />
          {/* Left pigtail */}
          <path d="M96,318 Q76,445 100,590 Q114,590 124,575 Q138,470 124,330 Z" fill={color} />
          <path d="M100,340 Q84,445 102,560" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.15" />
          <path d="M115,340 Q105,440 112,550" stroke={light} strokeWidth="1.2" fill="none" opacity="0.1" />
          {/* Right pigtail */}
          <path d="M304,318 Q324,445 300,590 Q286,590 276,575 Q262,470 276,330 Z" fill={color} />
          <path d="M300,340 Q316,445 298,560" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.15" />
          <path d="M285,340 Q295,440 288,550" stroke={light} strokeWidth="1.2" fill="none" opacity="0.1" />
          {/* Hair ties */}
          <ellipse cx="110" cy="322" rx="9" ry="6" fill={dark} opacity="0.55" />
          <ellipse cx="290" cy="322" rx="9" ry="6" fill={dark} opacity="0.55" />
          {sheenPath("M170,132 Q192,125 220,132")}
        </g>
      );
    case "bob":
      return (
        <g>
          <path d="M120,215 Q106,145 200,118 Q294,145 280,215 L292,360 Q200,385 108,360 Z" fill={`url(#${uid}hair)`} />
          <path d="M120,215 Q106,145 200,118 Q294,145 280,215 L292,360 Q200,385 108,360 Z" fill={`url(#${uid}hairSheen)`} />
          <path d="M112,355 Q148,378 200,382 Q252,378 288,355" stroke={dark} strokeWidth="2" fill="none" opacity="0.2" />
          {sheenPath("M170,132 Q192,125 220,132")}
          {strandShadow("M130,180 Q118,260 112,340")}
          {strandShadow("M270,180 Q282,260 288,340")}
        </g>
      );
    case "ponytail":
      return (
        <g>
          <path d="M125,210 Q108,145 200,118 Q292,145 275,210 L282,300 Q200,320 118,300 Z" fill={`url(#${uid}hair)`} />
          <path d="M125,210 Q108,145 200,118 Q292,145 275,210 L282,300 Q200,320 118,300 Z" fill={`url(#${uid}hairSheen)`} />
          {/* Ponytail */}
          <path d="M275,228 Q330,345 310,535 Q300,548 288,535 Q282,400 254,280 Z" fill={color} />
          <path d="M280,250 Q320,350 306,520" stroke={dark} strokeWidth="1.8" fill="none" opacity="0.15" />
          <path d="M270,260 Q300,360 290,510" stroke={light} strokeWidth="1.2" fill="none" opacity="0.1" />
          {/* Hair tie */}
          <ellipse cx="270" cy="238" rx="9" ry="6" fill={dark} opacity="0.55" />
          {sheenPath("M170,132 Q192,125 220,132")}
        </g>
      );
  }
}

/* ══════════════════════════════════════════════════════════
   HAIR FRONT / BANGS — Individual strand rendering
   ══════════════════════════════════════════════════════════ */
function HairFrontRealistic({ style, color, dark, dark2, light, light2, uid }: {
  style: HairStyle; color: string; dark: string; dark2: string; light: string; light2: string; uid: string;
}) {
  const bangs = (
    <g>
      {/* Main bang mass */}
      <path d="M124,200 Q136,136 200,122 Q264,136 276,200 Q256,180 200,188 Q144,180 124,200 Z" fill={color} />
      {/* Layered strand shadows */}
      <path d="M138,195 Q156,214 186,200 Q176,225 154,218 Z" fill={dark} opacity="0.25" />
      <path d="M262,195 Q244,214 214,200 Q224,225 246,218 Z" fill={dark} opacity="0.25" />
      {/* Individual strand highlights */}
      <path d="M170,145 Q188,138 208,145" stroke={light2} strokeWidth="2" fill="none" opacity="0.22" />
      <path d="M155,160 Q175,152 198,160" stroke={light} strokeWidth="1.2" fill="none" opacity="0.15" />
      <path d="M205,158 Q225,150 245,158" stroke={light} strokeWidth="1" fill="none" opacity="0.12" />
      {/* Strand separation lines */}
      <path d="M150,190 Q158,165 168,145" stroke={dark} strokeWidth="0.5" fill="none" opacity="0.12" />
      <path d="M175,195 Q180,170 185,140" stroke={dark} strokeWidth="0.4" fill="none" opacity="0.08" />
      <path d="M225,195 Q220,170 215,140" stroke={dark} strokeWidth="0.4" fill="none" opacity="0.08" />
      <path d="M250,190 Q242,165 232,145" stroke={dark} strokeWidth="0.5" fill="none" opacity="0.12" />
    </g>
  );

  if (style === "twin" || style === "long") {
    return (
      <g>
        {bangs}
        {/* Side curtains */}
        <path d="M120,200 Q104,260 112,350 Q132,312 140,210 Z" fill={color} />
        <path d="M280,200 Q296,260 288,350 Q268,312 260,210 Z" fill={color} />
        <path d="M126,210 Q112,265 116,340" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.15" />
        <path d="M274,210 Q288,265 284,340" stroke={dark} strokeWidth="0.8" fill="none" opacity="0.15" />
        <path d="M132,220 Q120,270 122,330" stroke={light} strokeWidth="0.6" fill="none" opacity="0.1" />
        <path d="M268,220 Q280,270 278,330" stroke={light} strokeWidth="0.6" fill="none" opacity="0.1" />
      </g>
    );
  }
  return bangs;
}

/* ══════════════════════════════════════════════════════════
   UTILITY — Color manipulation
   ══════════════════════════════════════════════════════════ */
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

function blendHex(a: string, b: string, t: number): string {
  const ca = a.replace("#", "");
  const cb = b.replace("#", "");
  const na = parseInt(ca.length === 3 ? ca.split("").map((x) => x + x).join("") : ca, 16);
  const nb = parseInt(cb.length === 3 ? cb.split("").map((x) => x + x).join("") : cb, 16);
  const r = Math.round((na >> 16) * (1 - t) + (nb >> 16) * t);
  const g = Math.round(((na >> 8) & 0xff) * (1 - t) + ((nb >> 8) & 0xff) * t);
  const bl = Math.round((na & 0xff) * (1 - t) + (nb & 0xff) * t);
  return `#${((Math.max(0, Math.min(255, r)) << 16) | (Math.max(0, Math.min(255, g)) << 8) | Math.max(0, Math.min(255, bl))).toString(16).padStart(6, "0")}`;
}
