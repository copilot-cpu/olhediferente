import { cn } from "@/lib/utils";

export type BroadcastActivityData = {
  /** Número de pessoas assistindo. Só será exibido quando houver fonte real. */
  viewerCount?: number | null;
  /** Rótulo do estado da atividade (ex.: "sala aberta"). */
  activityState?: string | null;
};

/**
 * Área de atividade da transmissão.
 * Estrutura preparada para receber dados reais no futuro.
 * Sem fonte válida, não renderiza nada (nenhum número simulado).
 */
export function BroadcastActivity({
  data,
  className,
}: {
  data?: BroadcastActivityData;
  className?: string;
}) {
  const hasViewers = typeof data?.viewerCount === "number" && data.viewerCount > 0;
  const hasState = Boolean(data?.activityState);
  if (!hasViewers && !hasState) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-border/60 bg-card/40 px-4 py-2",
        "font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
    >
      {hasViewers ? <span>{data?.viewerCount} pessoas na sala</span> : null}
      {hasState ? <span className="text-primary/80">{data?.activityState}</span> : null}
    </div>
  );
}
