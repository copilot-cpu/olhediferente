import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Container } from "@/components/ds/container";
import { IrisGlow } from "@/components/ds/iris";
import { BroadcastStatus } from "@/components/webinar/broadcast-status";
import { OfferSection } from "@/components/offer/offer-section";
import { WebinarPlayer } from "@/components/webinar/webinar-player";
import { checkOfferPreviewToken } from "@/lib/offer-preview.functions";
import { buildPlayerUrl, useWebinarSettings } from "@/lib/webinar-settings";

const title = "Pré-visualização — OLHE DIFERENTE";

export const Route = createFileRoute("/previa/$token")({
  loader: ({ params }) => checkOfferPreviewToken({ data: { token: params.token } }),
  head: () => ({
    meta: [
      { title },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Pré-visualização interna da aula com a oferta liberada." },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const { valid } = Route.useLoaderData();
  const { settings } = useWebinarSettings();

  const playerUrl = useMemo(
    () =>
      buildPlayerUrl(settings.videoEmbedUrl, {
        disableForward: false,
        playbackSpeed: settings.playbackSpeed,
      }),
    [settings.videoEmbedUrl, settings.playbackSpeed],
  );

  if (!valid) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <p className="font-display text-2xl text-foreground">Link inválido ou expirado.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Peça um novo link de pré-visualização ao administrador.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <IrisGlow />

      <header className="relative border-b border-border/50">
        <Container width="wide" className="flex items-center justify-between py-4">
          <span className="font-display text-xs uppercase tracking-[0.3em] text-primary sm:text-sm">
            Olhe Diferente
          </span>
          <span className="font-sans text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
            Pré-visualização
          </span>
        </Container>
      </header>

      <Container width="wide" className="relative pb-12 pt-8 sm:pt-10">
        <div className="mx-auto max-w-[1160px]">
          <div className="text-center">
            <h1 className="font-display text-lg leading-snug text-foreground sm:text-xl">
              {settings.lessonTitle}
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
              com o Professor {settings.teacherName} · {settings.lessonSubtitle}
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <BroadcastStatus label={settings.broadcastLabel} />
          </div>

          <WebinarPlayer
            className="mt-5"
            embedUrl={playerUrl}
            title={`${settings.lessonTitle} — pré-visualização`}
            onAdapterReady={() => {}}
          />

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Esta página mostra a experiência completa: aula e oferta já liberada.
          </p>
        </div>
      </Container>

      <OfferSection />
    </main>
  );
}
