import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import type { Character } from "../types";
import { DEFAULT_CHARACTER } from "../types";

const SKINS = ["Clara", "Média", "Bronzeada", "Morena", "Negra retinta", "Pálida fantasmagórica"];
const HAIRS = ["Curto preto", "Longo loiro platinado", "Médio rosa pastel", "Longo preto azulado", "Branco prateado", "Vermelho cereja", "Castanho mel"];
const EYES = ["Violeta", "Vermelho rubi", "Azul gelo", "Verde esmeralda", "Dourado", "Heterocromia (azul/vermelho)", "Castanho profundo"];
const OUTFITS = ["Vestido escuro com detalhes brancos", "Suéter folgado", "Uniforme escolar japonês", "Camiseta e shorts confortáveis", "Yukata estampada", "Roupa de gótica lolita", "Camisa social branca"];

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

  const set = (k: keyof Character, v: string) => setC((p) => ({ ...p, [k]: v }));

  const Pill = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
        active
          ? "bg-aurora text-primary-foreground border-transparent shadow-glow"
          : "bg-muted/40 border-border hover:border-primary/60 text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );

  const valid = c.personality.trim().length > 5;
  const normalized = { ...c, name: c.name.trim() || "Aiko" };

  return (
    <div className="max-w-2xl w-full mx-auto bg-card-soft rounded-2xl p-6 shadow-soft border border-border/60">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-display text-gradient">Crie sua companhia</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Você está moldando a IA, não a si mesmo. Escolha com cuidado — ela vai lembrar de tudo.
      </p>

      <div className="space-y-5">
        <div>
          <Label>Nome</Label>
          <Input value={c.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Aiko, Yuki, Ren..." maxLength={30} />
          <p className="text-xs text-muted-foreground mt-1">Se deixar vazio, ela se chamará Aiko.</p>
        </div>

        <div>
          <Label>Tom de pele</Label>
          <div className="flex flex-wrap gap-2 mt-2">{SKINS.map((s) => <Pill key={s} active={c.skin === s} onClick={() => set("skin", s)}>{s}</Pill>)}</div>
        </div>

        <div>
          <Label>Cabelo</Label>
          <div className="flex flex-wrap gap-2 mt-2">{HAIRS.map((s) => <Pill key={s} active={c.hair === s} onClick={() => set("hair", s)}>{s}</Pill>)}</div>
        </div>

        <div>
          <Label>Olhos</Label>
          <div className="flex flex-wrap gap-2 mt-2">{EYES.map((s) => <Pill key={s} active={c.eyes === s} onClick={() => set("eyes", s)}>{s}</Pill>)}</div>
        </div>

        <div>
          <Label>Roupa</Label>
          <div className="flex flex-wrap gap-2 mt-2">{OUTFITS.map((s) => <Pill key={s} active={c.outfit === s} onClick={() => set("outfit", s)}>{s}</Pill>)}</div>
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
  );
}
