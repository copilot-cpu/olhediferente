import { Users } from "lucide-react";

import { cn } from "@/lib/utils";

/** Origem do número exibido. Hoje só existe "simulation"; "real" fica preparado. */
export type ViewerSource = "simulation" | "real";

export type BroadcastActivityProps = {
  /** Liga/desliga a camada de atividade. Falso → nada é renderizado. */
  enabled?: boolean;
  /** Número de pessoas acompanhando. Sem valor válido, nada é renderizado. */
  viewerCount?: number | null;
  /** Texto ao lado do número (ex.: "pessoas acompanhando"). */
  label?: string;
  /** Rótulo opcional de estado (ex.: "sala aberta"). */
  status?: string | null;
  /** Origem do dado. O componente não conhece a engine de simulação. */
  viewerSource?: ViewerSource;
  className?: string;
};

/**
 * Camada de atividade da transmissão: discreta, apenas para dar a sensação de
 * "tem outras pessoas aqui". Nunca inventa audiência: sem fonte válida ou com
 * `enabled=false`, não renderiza (e nunca exibe zero como se fosse real).
 */
export function BroadcastActivity({
  enabled = false,
  viewerCount,
  label = "pessoas acompanhando",
  status,
  viewerSource = "simulation",
  className,
}: BroadcastActivityProps) {
  const hasViewers = typeof viewerCount === "number" && Number.isFinite(viewerCount) && viewerCount > 0;
  if (!enabled || !hasViewers) return null;

  return (
    <span
      data-viewer-source={viewerSource}
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1",
        "font-sans text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-primary/70" aria-hidden />
        <Users className="size-3.5 text-primary/60" aria-hidden />
        <span className="text-sm normal-case tracking-normal text-foreground/90 tabular-nums">
          {viewerCount!.toLocaleString("pt-BR")}
        </span>
        <span className="text-muted-foreground/80">{label}</span>
      </span>
      {status ? <span className="text-muted-foreground/60">{status}</span> : null}
    </span>
  );
}
