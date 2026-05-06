import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import type { Character, HairStyle, OutfitStyle } from "../types";
import { DEFAULT_CHARACTER } from "../types";
import AvatarSVG from "./AvatarSVG";

const HAIR_OPTIONS: { value: HairStyle; label: string }[] = [
  { value: "long", label: "Longo" },
  { value: "bob", label: "Bob" },
  { value: "short", label: "Curto" },
  { value: "twin", label: "Maria-chiquinhas" },
  { value: "ponytail", label: "Rabo de cavalo" },
];

const OUTFIT_OPTIONS: { value: OutfitStyle; label: string }[] = [
  { value: "dress", label: "Vestido" },
  { value: "uniform", label: "Uniforme escolar" },
  { value: "hoodie", label: "Moletom oversized" },
  { value: "yukata", label: "Yukata floral" },
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

  const valid =
    c.personality.trim().length > 5 &&
    c.playerName.trim().length > 0 &&
    (c.playerPersonality ?? "").trim().length > 5;
  const normalized: Character = {
    ...c,
    name: "Aiko",
    playerName: c.playerName.trim() || "Você",
    playerPersonality: (c.playerPersonality ?? "").trim(),
    appearance: c.appearance ?? "dress",
    hueShift: 0,
    hairStyle: c.hairStyle ?? "long",
    outfitStyle: c.outfitStyle ?? "dress",
  };

  return (
    <div className="max-w-3xl w-full mx-auto bg-card-soft rounded-2xl p-6 shadow-soft border border-border/60">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-display text-gradient">Conheça Aiko</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Ela já existe — esperando você. Escolha um visual, defina <em>quem ela é</em> e <em>quem você é pra ela</em>.
        <span className="block mt-1 text-[11px] text-emerald-400/80">
          Visual: 0 créditos (imagens locais).
        </span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <div className="bg-background/60 rounded-xl border border-border/60 p-3 flex items-end justify-center min-h-[360px] sticky top-2 self-start">
          <AvatarSVG character={c} className="w-full h-[360px]" />
        </div>

        <div className="space-y-5">
          <div>
            <Label>Cabelo</Label>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {HAIR_OPTIONS.map((opt) => {
                const active = (c.hairStyle ?? "long") === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("hairStyle", opt.value)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all text-left ${
                      active
                        ? "border-primary bg-primary/15 text-primary-glow shadow-glow"
                        : "border-border/60 bg-background/40 hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Roupa</Label>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {OUTFIT_OPTIONS.map((opt) => {
                const active = (c.outfitStyle ?? "dress") === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("outfitStyle", opt.value)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all text-left ${
                      active
                        ? "border-primary bg-primary/15 text-primary-glow shadow-glow"
                        : "border-border/60 bg-background/40 hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Seu apelido</Label>
            <Input
              value={c.playerName}
              onChange={(e) => set("playerName", e.target.value)}
              placeholder="Como ela vai te chamar"
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use um apelido — não use seu nome real.
            </p>
          </div>

          <div>
            <Label>Personalidade dela</Label>
            <Textarea
              value={c.personality}
              onChange={(e) => set("personality", e.target.value)}
              placeholder="Ex: Distraída e engraçada, mas protetora demais. Ou: Séria e sentimental, com ciúmes silenciosos..."
              rows={5}
              maxLength={400}
            />
            <p className="text-xs text-muted-foreground mt-1">{c.personality.length}/400</p>
          </div>

          <div>
            <Label>Sua personalidade (como o jogador)</Label>
            <Textarea
              value={c.playerPersonality ?? ""}
              onChange={(e) => set("playerPersonality", e.target.value)}
              placeholder="Ex: Tímido e analítico, fala pouco mas observa tudo. Ou: Impulsivo, sarcástico e desconfiado..."
              rows={4}
              maxLength={400}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(c.playerPersonality ?? "").length}/400 — a Aiko vai reagir levando isso em conta.
            </p>
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
