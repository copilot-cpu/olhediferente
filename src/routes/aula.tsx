import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Container } from "@/components/ds/container";
import { IrisGlow } from "@/components/ds/iris";
import { BroadcastActivity } from "@/components/webinar/broadcast-activity";
import { BroadcastStatus } from "@/components/webinar/broadcast-status";
import { OfferRevealRegion } from "@/components/webinar/offer-reveal-region";
import { PurchaseToast } from "@/components/webinar/purchase-toast";
import { WebinarPlayer } from "@/components/webinar/webinar-player";
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

  const { offerUnlocked, visibleToast } = useWebinarEngine({ adapter, settings, events });

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
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-primary sm:text-[0.68rem]">
              Sua inscrição está confirmada
            </p>
            <h1 className="mt-3 font-display text-2xl leading-tight text-foreground sm:text-3xl">
              Sua vaga para a aula{" "}
              <span className="text-primary">{settings.lessonTitle}</span> está confirmada.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Agora é só dar o play e aproveitar.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
            <BroadcastStatus label={settings.broadcastLabel} />
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {settings.lessonTitle} · com o Professor {settings.teacherName} ·{" "}
              {settings.lessonSubtitle}
            </p>
          </div>

          <WebinarPlayer
            className="mt-6 sm:mt-8"
            embedUrl={playerUrl}
            title={`${settings.lessonTitle} — aula online`}
            onAdapterReady={(a) => { (window as unknown as Record<string, unknown>).__adapter = a; setAdapter(a); }}
          />

          <dl className="mt-4 grid gap-3 rounded-lg border border-border/60 bg-card/40 px-5 py-4 sm:grid-cols-3">
            <div>
              <dt className="text-overline">Status</dt>
              <dd className="mt-1 text-sm text-foreground">{settings.broadcastLabel}</dd>
            </div>
            <div>
              <dt className="text-overline">Professor</dt>
              <dd className="mt-1 text-sm text-foreground">{settings.teacherName}</dd>
            </div>
            <div>
              <dt className="text-overline">Formato</dt>
              <dd className="mt-1 text-sm text-foreground">{settings.lessonSubtitle}</dd>
            </div>
          </dl>

          <BroadcastActivity className="mt-3" />

          <div className="mt-5 space-y-1 text-center">
            <p className="text-sm text-foreground/90">
              Reserve este momento para acompanhar a aula com atenção.
            </p>
            <p className="text-xs text-muted-foreground">
              Durante a apresentação, algumas informações poderão aparecer abaixo do vídeo.
            </p>
          </div>

          <OfferRevealRegion offerUnlocked={offerUnlocked} />
        </div>
      </Container>

      <PurchaseToast toast={visibleToast} />
    </main>
  );
}
