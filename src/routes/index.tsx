import { createFileRoute, Link } from "@tanstack/react-router";

import { Container, GoldRule, Section } from "@/components/ds/container";
import { IrisGlow, IrisMark } from "@/components/ds/iris";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const title = "OLHE DIFERENTE — Aula com o Professor Marcos Dias";
const description =
  "Página de captação da aula OLHE DIFERENTE, do Professor Marcos Dias. Estrutura inicial do sistema.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CapturePage,
});

function CapturePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <IrisGlow />

      <Container width="wide" className="relative flex items-center justify-between py-6">
        <span className="font-display text-sm uppercase tracking-[0.3em] text-primary">
          Olhe Diferente
        </span>
        <Link to="/admin" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary">
          Admin
        </Link>
      </Container>

      <Section className="relative">
        <Container width="wide">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Badge variant="gold">Aula online</Badge>
              <h1 className="text-display mt-6 text-foreground">Olhe Diferente</h1>
              <p className="text-lede mt-5 max-w-xl">
                Fundação da página de captação. O conteúdo definitivo será gerenciado pelo painel
                administrativo.
              </p>
              <GoldRule className="my-8 max-w-md" />

              <Card className="max-w-md border-border/70 bg-card/70 backdrop-blur">
                <CardContent className="space-y-4 p-6">
                  <p className="text-overline">Inscrição</p>
                  <div className="space-y-2">
                    <Label htmlFor="lead-name">Nome</Label>
                    <Input id="lead-name" name="name" placeholder="Seu nome" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead-email">E-mail</Label>
                    <Input id="lead-email" name="email" type="email" placeholder="seu@email.com" disabled />
                  </div>
                  <Button variant="gold" size="lg" className="w-full" disabled>
                    Formulário será ativado na próxima etapa
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center lg:justify-end">
              <IrisMark size={320} className="max-w-full" />
            </div>
          </div>
        </Container>
      </Section>

      <Container width="wide" className="border-t border-border/60 py-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Professor Marcos Dias
        </p>
      </Container>
    </main>
  );
}
