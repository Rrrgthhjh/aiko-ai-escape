import { Loader2 } from "lucide-react";
export default function Loading({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="font-display text-sm tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
