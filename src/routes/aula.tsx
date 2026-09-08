import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Container } from "@/components/ds/container";
import { IrisGlow } from "@/components/ds/iris";
import { BroadcastActivity } from "@/components/webinar/broadcast-activity";
import { BroadcastStatus } from "@/components/webinar/broadcast-status";
import { OfferSection } from "@/components/offer/offer-section";
import { OfferRevealRegion } from "@/components/webinar/offer-reveal-region";
import { PurchaseToast } from "@/components/webinar/purchase-toast";
import { WebinarPlayer } from "@/components/webinar/webinar-player";
import { useSimulatedAudience } from "@/hooks/use-simulated-audience";
import { useWebinarEngine } from "@/hooks/use-webinar-engine";
import type { PandaPlayerAdapter } from "@/lib/panda-player";
import { useWebinarEvents } from "@/lib/webinar-events";
import { buildPlayerUrl, useWebinarSettings } from "@/lib/webinar-settings";

const title = "Transmissão — OLHE DIFERENTE";
const description =
  "Sala de transmissão da aula online OLHE DIFERENTE, com o Professor Marcos Dias.";

export const Route = createFileRoute("/aula")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WebinarPage,
});

function WebinarPage() {
  const { settings } = useWebinarSettings();
  const { events } = useWebinarEvents();
  const [adapter, setAdapter] = useState<PandaPlayerAdapter | null>(null);

  const playerUrl = useMemo(
    () =>
      buildPlayerUrl(settings.videoEmbedUrl, {
        disableForward: settings.disableForward,
        playbackSpeed: settings.playbackSpeed,
      }),
    [settings.videoEmbedUrl, settings.disableForward, settings.playbackSpeed],
  );

  const { offerUnlocked, visibleToast, currentTime } = useWebinarEngine({
    adapter,
    settings,
    events,
  });

  // Audiência simulada: derivada apenas do currentTime real do player.
  const viewerCount = useSimulatedAudience({
    enabled: settings.viewerCounterEnabled && settings.viewerSimulationEnabled,
    currentTime,
    curve: settings.viewerCurve,
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <IrisGlow />

      <header className="relative border-b border-border/50">
        <Container width="wide" className="flex items-center justify-between py-4">
          <span className="font-display text-xs uppercase tracking-[0.3em] text-primary sm:text-sm">
            Olhe Diferente
          </span>
          <span className="hidden font-sans text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground sm:inline">
            Aula online
          </span>
        </Container>
      </header>

      <Container width="wide" className="relative pb-16 pt-8 sm:pt-10">
        <div className="mx-auto max-w-[1160px]">
          <div className="text-center">
            <h1 className="font-display text-lg leading-snug text-foreground sm:text-xl">
              {settings.lessonTitle}
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
              com o Professor {settings.teacherName} · {settings.lessonSubtitle}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <BroadcastStatus label={settings.broadcastLabel} />
            <BroadcastActivity
              enabled={settings.viewerCounterEnabled}
              viewerCount={viewerCount}
              label={settings.viewerLabel}
              viewerSource="simulation"
            />
          </div>

          <WebinarPlayer
            className="mt-5"
            embedUrl={playerUrl}
            title={`${settings.lessonTitle} — aula online`}
            onAdapterReady={setAdapter}
          />

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Durante a apresentação, algumas informações poderão aparecer abaixo do vídeo.
          </p>

          <OfferRevealRegion offerUnlocked={offerUnlocked} />
        </div>
      </Container>

      {/* Continuação natural da aula: oferta completa, revelada pela mesma engine. */}
      <OfferRevealRegion offerUnlocked={offerUnlocked} className="relative">
        <OfferSection />
      </OfferRevealRegion>

      <PurchaseToast toast={visibleToast} />
    </main>
  );
}
