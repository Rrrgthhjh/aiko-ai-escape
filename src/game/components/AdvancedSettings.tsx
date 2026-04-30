import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { ChatSettings, ChatPreset } from "../types";
import { CHAT_PRESETS } from "../types";
import { Zap, Gauge } from "lucide-react";

const PRESET_INFO: Record<ChatPreset, { label: string; desc: string; icon: React.ReactNode }> = {
  economic: { label: "Econômico", desc: "Respostas curtas, gasta menos", icon: <Zap className="w-4 h-4" /> },
  normal: { label: "Normal", desc: "Respostas equilibradas", icon: <Gauge className="w-4 h-4" /> },
};

export default function AdvancedSettings({
  settings,
  onChange,
  onBack,
}: {
  settings: ChatSettings;
  onChange: (s: ChatSettings) => void;
  onBack: () => void;
}) {
  const [s, setS] = useState<ChatSettings>({ ...settings });

  const applyPreset = (preset: ChatPreset) => {
    setS({ preset, ...CHAT_PRESETS[preset] });
  };

  const update = <K extends keyof ChatSettings>(k: K, v: ChatSettings[K]) => {
    setS((prev) => ({ ...prev, [k]: v, preset: "normal" as ChatPreset }));
  };

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-3">← Voltar</Button>
      <h3 className="font-display text-lg text-gradient mb-4">Configurações avançadas</h3>

      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Presets</Label>
      <div className="grid grid-cols-2 gap-2 mt-2 mb-5">
        {(Object.keys(PRESET_INFO) as ChatPreset[]).map((p) => (
          <button
            key={p}
            onClick={() => applyPreset(p)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-sm ${
              s.preset === p
                ? "bg-primary/20 border-primary shadow-glow text-primary-glow"
                : "bg-muted/30 border-border hover:border-primary/50 text-muted-foreground"
            }`}
          >
            {PRESET_INFO[p].icon}
            <span className="font-display">{PRESET_INFO[p].label}</span>
            <span className="text-[10px] text-muted-foreground">{PRESET_INFO[p].desc}</span>
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <div>
          <Label className="flex justify-between">
            <span>Tokens máximos (resposta)</span>
            <span className="text-primary-glow font-mono">{s.maxTokens}</span>
          </Label>
          <Slider min={30} max={250} step={10} value={[s.maxTokens]} onValueChange={([v]) => update("maxTokens", v)} className="mt-2" />
          <p className="text-[10px] text-muted-foreground mt-1">Menos = respostas mais curtas e baratas</p>
        </div>
        <div>
          <Label className="flex justify-between">
            <span>Tamanho máximo da mensagem</span>
            <span className="text-primary-glow font-mono">{s.maxMessageLength}</span>
          </Label>
          <Slider min={100} max={800} step={50} value={[s.maxMessageLength]} onValueChange={([v]) => update("maxMessageLength", v)} className="mt-2" />
        </div>
        <div>
          <Label className="flex justify-between">
            <span>Mensagens no contexto</span>
            <span className="text-primary-glow font-mono">{s.recentLimit}</span>
          </Label>
          <Slider min={2} max={16} step={2} value={[s.recentLimit]} onValueChange={([v]) => update("recentLimit", v)} className="mt-2" />
          <p className="text-[10px] text-muted-foreground mt-1">Menos = menor custo, IA esquece mais rápido</p>
        </div>
      </div>

      <Button className="w-full mt-6 bg-aurora text-primary-foreground shadow-glow" onClick={() => onChange(s)}>
        Aplicar configurações
      </Button>
    </div>
  );
}