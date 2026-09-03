import { createFileRoute } from "@tanstack/react-router";

import { Container, GoldRule } from "@/components/ds/container";
import { IrisGlow } from "@/components/ds/iris";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const title = "Transmissão — OLHE DIFERENTE";
const description =
  "Sala de transmissão da aula OLHE DIFERENTE, do Professor Marcos Dias. Estrutura inicial.";

export const Route = createFileRoute("/aula")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: WebinarPage,
});

function WebinarPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <IrisGlow />
      <Container width="wide" className="relative py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="font-display text-sm uppercase tracking-[0.3em] text-primary">
            Olhe Diferente
          </span>
          <Badge variant="outline">Transmissão</Badge>
        </div>
        <GoldRule className="my-8" />

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card className="overflow-hidden border-border/70 bg-card/70">
            <div className="flex aspect-video items-center justify-center border-b border-border/60 bg-background/60">
              <p className="text-sm text-muted-foreground">Área do player</p>
            </div>
            <CardContent className="p-6">
              <h1 className="text-heading text-foreground">Sala de transmissão</h1>
              <p className="text-lede mt-3 text-base">
                Estrutura reservada para o player, a linha do tempo de eventos e a oferta.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70">
            <CardContent className="p-6">
              <p className="text-overline">Painel lateral</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Espaço reservado para interações da aula.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </main>
  );
}
