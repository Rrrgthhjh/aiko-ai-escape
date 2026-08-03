import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Languages, Search, Check } from "lucide-react";
import type { AppearanceVariant, Character } from "../types";
import { DEFAULT_CHARACTER } from "../types";
import { LANGUAGES, DEFAULT_LANGUAGE, findLanguage, normalizeSearch } from "../languages";
import AvatarSVG from "./AvatarSVG";

const APPEARANCE_OPTIONS: { value: AppearanceVariant; label: string }[] = [
  { value: "dress", label: "Cabelo longo + vestido" },
  { value: "hair-bob", label: "Cabelo bob" },
  { value: "hair-short", label: "Cabelo curto" },
  { value: "hair-twin", label: "Maria-chiquinhas" },
  { value: "hair-ponytail", label: "Rabo de cavalo" },
  { value: "outfit-uniform", label: "Uniforme escolar" },
  { value: "outfit-hoodie", label: "Moletom oversized" },
  { value: "outfit-yukata", label: "Yukata floral" },
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
  const [langOpen, setLangOpen] = useState(false);
  const [langQuery, setLangQuery] = useState("");
  const selectedLang = findLanguage(c.language ?? DEFAULT_LANGUAGE);
  const filteredLangs = useMemo(() => {
    const q = normalizeSearch(langQuery);
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (l) =>
        normalizeSearch(l.label).includes(q) ||
        normalizeSearch(l.native).includes(q) ||
        normalizeSearch(l.code).includes(q),
    );
  }, [langQuery]);

  const valid =
    c.personality.trim().length > 5 &&
    c.name.trim().length > 0 &&
    c.playerName.trim().length > 0 &&
    (c.playerPersonality ?? "").trim().length > 5;
  const normalized: Character = {
    ...c,
    name: c.name.trim() || "Aiko",
    playerName: c.playerName.trim() || "Você",
    playerPersonality: (c.playerPersonality ?? "").trim(),
    language: c.language ?? DEFAULT_LANGUAGE,
    appearance: c.appearance ?? "dress",
    hueShift: 0,
  };

  return (
    <div className="max-w-3xl w-full mx-auto bg-card-soft rounded-2xl p-6 shadow-soft border border-border/60">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-display text-gradient">Crie sua companhia</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Dê um nome a ela, escolha um visual, o idioma da conversa e defina <em>quem ela é</em> e <em>quem você é</em>.
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
            <Label>Visual</Label>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {APPEARANCE_OPTIONS.map((opt) => {
                const active = (c.appearance ?? "dress") === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("appearance", opt.value)}
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
            <Label>Nome dela</Label>
            <Input
              value={c.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Aiko"
              maxLength={30}
            />
          </div>

          <div>
            <Label>Idioma da IA</Label>
            <button
              type="button"
              onClick={() => { setLangQuery(""); setLangOpen(true); }}
              className="mt-1.5 w-full flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5 text-sm hover:border-primary/50 transition-all"
            >
              <span className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary" />
                {selectedLang.label}
              </span>
              <span className="text-xs text-muted-foreground">{selectedLang.native}</span>
            </button>
            <p className="text-xs text-muted-foreground mt-1">
              Ela sempre responderá nesse idioma, mesmo se você escrever em outro.
            </p>
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

      <Dialog open={langOpen} onOpenChange={setLangOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Idioma da IA</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              value={langQuery}
              onChange={(e) => setLangQuery(e.target.value)}
              placeholder="Pesquisar idioma..."
              className="pl-9"
            />
          </div>
          <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/40">
            {filteredLangs.map((l) => {
              const active = l.code === selectedLang.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => { set("language", l.code); setLangOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    active ? "bg-primary/15 text-primary-glow" : "hover:bg-primary/10"
                  }`}
                >
                  <span>{l.label}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {l.native}
                    {active && <Check className="w-4 h-4 text-primary" />}
                  </span>
                </button>
              );
            })}
            {filteredLangs.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhum idioma encontrado.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
