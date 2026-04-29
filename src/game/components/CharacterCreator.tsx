import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import type { Character, HairStyle, OutfitStyle } from "../types";
import { DEFAULT_CHARACTER } from "../types";
import AvatarSVG from "./AvatarSVG";

const SKIN_COLORS = ["#fbe0cd", "#f5d6c0", "#e8b894", "#c89373", "#9b6a4d", "#6e4632"];
const HAIR_COLORS = ["#1a1530", "#3a2418", "#7a4528", "#c98a2b", "#e8c66a", "#e7e7ef", "#c2185b", "#7c3aed", "#1e88a8", "#2d6e3a"];
const EYE_COLORS = ["#8b5cf6", "#dc2626", "#0ea5e9", "#16a34a", "#eab308", "#7c2d12", "#374151"];
const OUTFIT_COLORS = ["#2a1f3d", "#1f2937", "#7c1d3a", "#1e3a5f", "#3d2817", "#5b4636", "#86375a", "#0f5132"];

const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: "long", label: "Longo" },
  { id: "short", label: "Curto" },
  { id: "bob", label: "Chanel" },
  { id: "twin", label: "Maria-chiquinha" },
  { id: "ponytail", label: "Rabo de cavalo" },
];
const OUTFIT_STYLES: { id: OutfitStyle; label: string }[] = [
  { id: "dress", label: "Vestido" },
  { id: "uniform", label: "Uniforme escolar" },
  { id: "hoodie", label: "Moletom" },
  { id: "yukata", label: "Yukata" },
];

export default function CharacterCreator({
  initial,
  onConfirm,
  ctaLabel = "Continuar",
}: {
  initial?: Character;
  onConfirm: (c: Character) => void;
  ctaLabel?: string;
}) {
  const [c, setC] = useState<Character>(initial ?? DEFAULT_CHARACTER);
  const set = <K extends keyof Character>(k: K, v: Character[K]) => setC((p) => ({ ...p, [k]: v }));

  const Swatch = ({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={color}
      className={`w-8 h-8 rounded-full border-2 transition-all ${active ? "border-primary scale-110 shadow-glow" : "border-border hover:border-primary/60"}`}
      style={{ backgroundColor: color }}
    />
  );

  const Pill = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
        active ? "bg-aurora text-primary-foreground border-transparent shadow-glow" : "bg-muted/40 border-border hover:border-primary/60 text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );

  const valid = c.personality.trim().length > 5 && c.playerName.trim().length > 0;
  const normalized: Character = {
    ...c,
    name: c.name.trim() || "Aiko",
    playerName: c.playerName.trim() || "Você",
  };

  return (
    <div className="max-w-3xl w-full mx-auto bg-card-soft rounded-2xl p-6 shadow-soft border border-border/60">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-display text-gradient">Crie sua companhia</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Você está moldando a IA, não a si mesmo. Cada escolha é sua — ela vai parecer exatamente assim.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* PREVIEW AO VIVO */}
        <div className="bg-background/60 rounded-xl border border-border/60 p-3 flex items-end justify-center min-h-[320px] sticky top-2 self-start">
          <AvatarSVG character={c} className="w-full h-[320px]" />
        </div>

        {/* CONTROLES */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Seu nome (jogador)</Label>
              <Input value={c.playerName} onChange={(e) => set("playerName", e.target.value)} placeholder="Como ela vai te chamar" maxLength={30} />
              <p className="text-xs text-muted-foreground mt-1">Use um apelido — não use seu nome real.</p>
            </div>
            <div>
              <Label>Nome dela (IA)</Label>
              <Input value={c.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Aiko, Yuki, Ren..." maxLength={30} />
              <p className="text-xs text-muted-foreground mt-1">Se vazio, ela se chamará Aiko.</p>
            </div>
          </div>

          <div>
            <Label>Tom de pele</Label>
            <div className="flex flex-wrap gap-2 mt-2">{SKIN_COLORS.map((col) => <Swatch key={col} color={col} active={c.skinColor === col} onClick={() => set("skinColor", col)} />)}</div>
          </div>

          <div>
            <Label>Estilo de cabelo</Label>
            <div className="flex flex-wrap gap-2 mt-2">{HAIR_STYLES.map((s) => <Pill key={s.id} active={c.hairStyle === s.id} onClick={() => set("hairStyle", s.id)}>{s.label}</Pill>)}</div>
            <Label className="mt-3 block">Cor do cabelo</Label>
            <div className="flex flex-wrap gap-2 mt-2">{HAIR_COLORS.map((col) => <Swatch key={col} color={col} active={c.hairColor === col} onClick={() => set("hairColor", col)} />)}</div>
          </div>

          <div>
            <Label>Cor dos olhos</Label>
            <div className="flex flex-wrap gap-2 mt-2">{EYE_COLORS.map((col) => <Swatch key={col} color={col} active={c.eyeColor === col} onClick={() => set("eyeColor", col)} />)}</div>
          </div>

          <div>
            <Label>Estilo da roupa</Label>
            <div className="flex flex-wrap gap-2 mt-2">{OUTFIT_STYLES.map((s) => <Pill key={s.id} active={c.outfitStyle === s.id} onClick={() => set("outfitStyle", s.id)}>{s.label}</Pill>)}</div>
            <Label className="mt-3 block">Cor da roupa</Label>
            <div className="flex flex-wrap gap-2 mt-2">{OUTFIT_COLORS.map((col) => <Swatch key={col} color={col} active={c.outfitColor === col} onClick={() => set("outfitColor", col)} />)}</div>
          </div>

          <div>
            <Label>Personalidade</Label>
            <Textarea
              value={c.personality}
              onChange={(e) => set("personality", e.target.value)}
              placeholder="Ex: Distraída e engraçada, mas protetora demais. Ou: Séria e sentimental, com ciúmes silenciosos..."
              rows={3}
              maxLength={400}
            />
            <p className="text-xs text-muted-foreground mt-1">{c.personality.length}/400</p>
          </div>

          <Button
            className="w-full bg-aurora text-primary-foreground hover:opacity-90 shadow-glow font-display tracking-wider"
            size="lg"
            disabled={!valid}
            onClick={() => onConfirm(normalized)}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
