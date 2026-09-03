import { useEffect, useId, useRef, useState } from "react";

import { PandaPlayerAdapter } from "@/lib/panda-player";
import { normalizeEmbedUrl } from "@/lib/webinar-settings";
import { cn } from "@/lib/utils";

/**
 * Container 16:9 do player Panda.
 * Recebe a URL já vinda de `webinar_settings` e normaliza aspas acidentais.
 */
export function WebinarPlayer({
  embedUrl,
  title,
  className,
  onAdapterReady,
}: {
  embedUrl: string | null | undefined;
  title: string;
  className?: string;
  onAdapterReady?: (adapter: PandaPlayerAdapter) => void;
}) {
  const reactId = useId().replace(/[:]/g, "");
  const iframeId = `panda-${reactId}`;
  const url = normalizeEmbedUrl(embedUrl);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const adapterRef = useRef<PandaPlayerAdapter | null>(null);

  useEffect(() => {
    if (!url) return;
    setStatus("loading");
    const adapter = new PandaPlayerAdapter(iframeId);
    adapterRef.current = adapter;
    const unsubscribe = adapter.subscribe((_state, event) => {
      if (event === "ready" || event === "play" || event === "timeupdate") setStatus("ready");
      if (event === "error") setStatus("error");
    });
    void adapter.attach().catch(() => setStatus("error"));
    onAdapterReady?.(adapter);
    return () => {
      unsubscribe();
      adapter.destroy();
      adapterRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, iframeId]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-primary/15 bg-[oklch(0.16_0.02_150)]",
        "shadow-[0_30px_80px_-40px_oklch(0.76_0.115_82_/_0.35)]",
        className,
      )}
    >
      <div className="relative aspect-video w-full">
        {url ? (
          <iframe
            id={iframeId}
            src={url}
            title={title}
            loading="eager"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setStatus((s) => (s === "error" ? s : "ready"))}
            onError={() => setStatus("error")}
            className="absolute inset-0 size-full border-0"
          />
        ) : null}

        {(!url || status === "error") && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/85 px-6 text-center">
            <p className="max-w-sm text-sm text-muted-foreground">
              Não foi possível carregar a aula. Atualize a página e tente novamente.
            </p>
          </div>
        )}

        {url && status === "loading" ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70">
            <div className="size-10 animate-spin rounded-full border border-primary/25 border-t-primary motion-reduce:animate-none" />
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              Preparando a aula
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
