import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, Eye, Minus } from "lucide-react";

import { Container, GoldRule, Section } from "@/components/ds/container";
import { IrisGlow } from "@/components/ds/iris";
import heroVideo from "@/assets/hero-eye.mp4.asset.json";
import heroPoster from "@/assets/hero-eye-poster.jpg.asset.json";
import manifestoVisual from "@/assets/manifesto-olhe-diferente.png.asset.json";
import signupIris from "@/assets/iris-inscricao.png.asset.json";
import aprenderWatermark from "@/assets/aprender-watermark.png.asset.json";
import { Reveal } from "@/components/ds/reveal";
import { LeadForm } from "@/components/capture/lead-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/lib/site-settings";
import { useCaptureContent } from "@/lib/capture-content";
import { useMediaUrl } from "@/lib/media";
import { SeoFromSettings } from "@/lib/seo";



const title = "OLHE DIFERENTE — Aula gratuita de Iridologia com o Prof. Marcos Dias";
const description =
  "Aula online e gratuita sobre Iridologia: aprenda a desenvolver um olhar clínico integrativo com o Professor Marcos Dias, com quase 30 anos de ensino e prática.";

export const Route = createFileRoute("/")({
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
  component: CapturePage,
});

function scrollToForm() {
  const target =
    document.getElementById("inscricao-final") ?? document.getElementById("inscricao");
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
  target?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
}

function Headline({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight || !text.includes(highlight)) {
    return <h1 className="text-hero text-foreground">{text}</h1>;
  }
  const [before, after] = text.split(highlight);
  return (
    <h1 className="text-hero text-foreground">
      {before}
      <em className="not-italic font-display italic text-primary">{highlight}</em>
      {after}
    </h1>
  );
}

function DateStamp({ date, time }: { date: string; time?: string }) {
  return (
    <div className="inline-flex flex-wrap items-center gap-x-5 gap-y-2 rounded-sm border border-primary/30 bg-card/50 px-5 py-3 backdrop-blur">
      <span className="inline-flex items-center gap-2 text-sm tracking-[0.14em] text-foreground">
        <CalendarDays className="size-4 text-primary" />
        {date}
      </span>
      {time ? (
        <span className="inline-flex items-center gap-2 text-sm tracking-[0.14em] text-muted-foreground">
          <Clock className="size-4 text-primary" />
          {time}
        </span>
      ) : null}
    </div>
  );
}

function HeroBackdrop({ fallbackImage }: { fallbackImage?: string | null }) {
  const poster = fallbackImage || heroPoster.url;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* O vídeo cobre toda a dobra, com o olho centralizado. */}
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover object-center opacity-95 motion-reduce:hidden"
          src={heroVideo.url}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          tabIndex={-1}
        />
        <img
          src={poster}
          alt=""
          className="absolute inset-0 hidden h-full w-full object-cover object-center opacity-95 motion-reduce:block"
        />
      </div>

      {/* Véus laterais: escurecem só o suficiente atrás do texto e do formulário. */}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,var(--background)_0%,color-mix(in_oklab,var(--background)_78%,transparent)_22%,color-mix(in_oklab,var(--background)_20%,transparent)_46%,color-mix(in_oklab,var(--background)_20%,transparent)_58%,color-mix(in_oklab,var(--background)_82%,transparent)_82%,var(--background)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_35%,color-mix(in_oklab,var(--background)_55%,transparent)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_bottom,transparent,var(--background))]" />
    </div>
  );
}





function CapturePage() {
  const { block, field } = useCaptureContent();
  const { settings: site } = useSiteSettings();

  const hero = block("hero");
  const form = block("form");
  const dateLabel = field("hero", "date_label", "[DATA DA AULA]");
  const timeLabel = field("hero", "time_label", "[HORÁRIO]");
  const microcopy = form.body ?? "";
  const heroFallback = useMediaUrl(hero.media_url);
  const teacherPhoto = useMediaUrl(block("teacher").media_url);


  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <SeoFromSettings />
      <IrisGlow />


      {/* Cabeçalho: apenas a marca. Nenhum acesso administrativo é exposto ao visitante. */}
      <Container width="wide" className="relative flex items-center justify-between py-6">
        <span className="font-display text-sm uppercase tracking-[0.3em] text-primary">
          {field("hero", "brand", "OLHE DIFERENTE.")}
        </span>
        <span className="hidden text-xs uppercase tracking-[0.24em] text-muted-foreground sm:inline">
          Professor Marcos Dias
        </span>
      </Container>

      {/* HERO */}
      <Section
        id="inscricao"
        className="relative isolate flex items-center overflow-hidden pt-4 pb-12 sm:pt-6 lg:min-h-[calc(100svh-5.5rem)] lg:pt-6 lg:pb-10"
      >
        <HeroBackdrop fallbackImage={heroFallback} />
        <Container width="wide" className="w-full">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
            <Reveal className="min-w-0 max-w-xl">
              <p className="text-overline">{hero.subtitle}</p>
              <div className="mt-3">
                <Headline
                  text={hero.title ?? ""}
                  highlight={field("hero", "highlight", "NOVA FONTE DE RECEITA")}
                />
              </div>
              <p className="whitespace-pre-line text-lede mt-4 lg:text-[1rem] lg:leading-[1.5]">{hero.body}</p>

              <div className="mt-5">
                <DateStamp date={dateLabel} time={timeLabel} />
              </div>

              <GoldRule className="mt-6 max-w-xs" />
            </Reveal>

            <Reveal
              delay={80}
              className="min-w-0 rounded-sm border border-gold/25 bg-surface-raised/90 p-5 backdrop-blur-md shadow-[var(--shadow-elevated)] sm:p-6"
            >
              <h2 className="text-heading text-foreground">{form.title}</h2>
              <div className="mt-4">
                <LeadForm
                  idPrefix="hero"
                  source="capture_hero"
                  ctaLabel={form.subtitle ?? "QUERO MINHA VAGA GRATUITA"}
                  microcopy={microcopy}
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>


      {/* A GRANDE PERGUNTA */}
      <Section className="relative border-t border-primary/20 bg-surface-raised">
        <Container width="default">
          <Reveal>
            <h2 className="text-title max-w-3xl text-foreground">{block("question").title}</h2>
            <GoldRule className="my-10 max-w-xs" />
            <div className="max-w-2xl space-y-6">
              {field<string[]>("question", "paragraphs", []).map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={
                    index >= 4
                      ? "whitespace-pre-line font-display text-xl leading-relaxed text-foreground sm:text-2xl"
                      : "whitespace-pre-line text-lede"
                  }

                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* O QUE VOCÊ VAI DESCOBRIR */}
      <Section className="relative overflow-hidden border-t border-border/50 bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <img
            src={aprenderWatermark.url}
            alt=""
            className="absolute top-1/2 left-1/2 h-[125%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.10] sm:opacity-[0.16] mix-blend-lighten"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_70%)]" />
          <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent" />
        </div>

        <Container width="default" className="relative">
          <Reveal>
            <p className="text-overline">O que você vai descobrir</p>
            <h2 className="text-title mt-3 text-foreground">{block("discover").title}</h2>
          </Reveal>

          <ol className="mt-14 space-y-14">
            {field<
              Array<{ number: string; title: string; body: string; steps?: string[] }>
            >("discover", "items", []).map((item, index) => (
              <Reveal as="li" key={item.number} delay={index * 60}>
                <div className="grid gap-4 border-t border-border/50 pt-8 sm:grid-cols-[6rem_1fr] sm:gap-8">
                  <span className="font-display text-4xl leading-none text-primary/70 sm:text-5xl">
                    {item.number}
                  </span>
                  <div>
                    <h3 className="text-heading text-foreground">{item.title}</h3>
                    <p className="whitespace-pre-line text-lede mt-3 max-w-2xl">{item.body}</p>

                    {item.steps ? (
                      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                        {item.steps.map((step, stepIndex) => (
                          <div key={step} className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-sm border border-primary/30 bg-primary/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground">
                              <span className="text-primary">{stepIndex + 1}</span>
                              {step}
                            </span>
                            {stepIndex < item.steps!.length - 1 ? (
                              <Minus className="hidden size-4 shrink-0 text-primary/40 sm:block" />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* PARA QUEM É */}
      <Section className="relative border-t border-primary/20 bg-surface-raised">
        <Container width="default">
          <Reveal>
            <h2 className="text-title max-w-2xl text-foreground">{block("audience").title}</h2>
          </Reveal>
          <ul className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {field<string[]>("audience", "items", []).map((item, index) => (
              <Reveal as="li" key={item} delay={index * 40} className="flex gap-4">
                <Eye className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                <span className="whitespace-pre-line text-base leading-relaxed text-foreground/90">{item}</span>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {/* PARA QUEM NÃO É */}
      <Section className="relative border-t border-border/50 bg-surface-deep">
        <Container width="default">
          <Reveal className="rounded-sm border border-border/60 bg-surface-deep px-6 py-12 sm:px-12">
            <h2 className="text-heading text-muted-foreground">{block("not_audience").title}</h2>
            <ul className="mt-6 space-y-3">
              {field<string[]>("not_audience", "items", []).map((item) => (
                <li key={item} className="flex gap-4 whitespace-pre-line text-base text-muted-foreground">
                  <Minus className="mt-2 size-3 shrink-0 text-muted-foreground/60" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <GoldRule className="my-9 max-w-xs" />
            <p className="font-display text-2xl leading-snug text-foreground sm:text-3xl">
              {(block("not_audience").body ?? "").split("\n").map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* PROFESSOR */}
      <Section className="relative border-t border-primary/20 bg-surface-raised">
        <Container width="default">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <p className="text-overline">{block("teacher").title}</p>
              <h2 className="text-title mt-3 text-foreground">{block("teacher").subtitle}</h2>

              <div className="mt-8 overflow-hidden rounded-sm border border-border/60 bg-card/40">
                {teacherPhoto ? (
                  <img
                    src={teacherPhoto}

                    alt="Professor Marcos Dias"
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center px-6 text-center">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Espaço reservado para a fotografia do professor
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 border-l-2 border-primary/50 pl-5">
                <p className="font-display text-3xl text-primary">
                  {field("teacher", "badge_title", "")}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {field("teacher", "badge_subtitle", "")}
                </p>
              </div>
            </Reveal>

            <Reveal delay={100} className="space-y-6">
              {field<string[]>("teacher", "paragraphs", []).map((paragraph) => (
                <p key={paragraph} className="whitespace-pre-line text-lede">
                  {paragraph}
                </p>
              ))}
              <ul className="grid gap-3 sm:grid-cols-2">
                {field<string[]>("teacher", "pillars", []).map((pillar) => (
                  <li
                    key={pillar}
                    className="border-t border-border/60 pt-3 text-sm uppercase tracking-[0.14em] text-foreground/90"
                  >
                    {pillar}
                  </li>
                ))}
              </ul>
              <p className="whitespace-pre-line font-display text-xl leading-relaxed text-foreground sm:text-2xl">
                {field("teacher", "closing", "")}
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* MANIFESTO */}
      <Section className="relative overflow-hidden border-t border-primary/20 bg-surface-deep">
        <Container width="default" className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-8">
            <Reveal className="relative z-10">
              <h2 className="text-display text-primary">{block("manifesto").title}</h2>
              <GoldRule className="my-10 max-w-sm" />
              <div className="max-w-2xl space-y-6">
                {field<string[]>("manifesto", "paragraphs", []).map((paragraph) => (
                  <p key={paragraph} className="whitespace-pre-line text-lede">
                    {paragraph}
                  </p>
                ))}
              </div>
              <p className="whitespace-pre-line mt-14 max-w-3xl font-display text-3xl leading-tight text-foreground sm:text-5xl">
                {block("manifesto").body}
              </p>
            </Reveal>

            <Reveal delay={100} className="manifesto-visual-mask relative hidden lg:block">
              <img
                src={manifestoVisual.url}
                alt="Íris integrada ao perfil humano, representando uma visão ampla e integrativa"
                className="aspect-square h-auto w-full object-contain opacity-80 mix-blend-lighten"
                loading="lazy"
                decoding="async"
              />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* SEGUNDA CAPTURA */}
      <Section id="inscricao-final" className="relative overflow-hidden border-t border-border/50 bg-background">
        <div aria-hidden className="absolute inset-0">
          <img
            src={signupIris.url}
            alt=""
            className="h-full w-full object-cover object-center opacity-35"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-background/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/85" />
        </div>
        <Container width="default" className="relative">
          <div className="grid min-w-0 items-start gap-12 lg:grid-cols-2">
            <Reveal>
              <h2 className="text-title text-foreground">{block("second_capture").title}</h2>
              <p className="whitespace-pre-line text-lede mt-5 max-w-lg">{block("second_capture").body}</p>
              <div className="mt-8">
                <DateStamp date={dateLabel} time={timeLabel} />
              </div>
            </Reveal>

            <Reveal delay={100} className="min-w-0 rounded-sm border border-border/70 bg-card/70 p-5 backdrop-blur shadow-[var(--shadow-elevated)] sm:p-6">
              <h3 className="text-heading text-foreground">{form.title}</h3>
              <div className="mt-5">
                <LeadForm
                  idPrefix="final"
                  source="capture_secondary"
                  ctaLabel={field("second_capture", "cta", "QUERO PARTICIPAR DA AULA GRATUITA")}
                  microcopy={microcopy}
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section className="relative border-t border-primary/20 bg-surface-raised">
        <Container width="narrow">
          <Reveal>
            <h2 className="text-title text-foreground">{block("faq").title}</h2>
            <Accordion type="single" collapsible className="mt-8">
              {field<Array<{ q: string; a: string }>>("faq", "items", []).map((item) => (
                <AccordionItem key={item.q} value={item.q} className="border-border/60">
                  <AccordionTrigger className="font-display text-base text-foreground hover:no-underline sm:text-lg">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </Container>
      </Section>

      {/* CTA FINAL */}
      <Section className="relative border-t border-border/50 bg-surface-deep">
        <Container width="default">
          <Reveal className="text-center">
            <h2 className="text-title mx-auto max-w-3xl text-foreground">
              {block("final_cta").title}
            </h2>
            <p className="whitespace-pre-line text-lede mx-auto mt-4 max-w-2xl">{block("final_cta").subtitle}</p>
            <GoldRule className="mx-auto my-10 max-w-xs" />
            <p className="whitespace-pre-line mx-auto max-w-xl text-base text-foreground/90">
              {block("final_cta").body}
            </p>
            <p className="mx-auto mt-8 max-w-2xl font-display text-2xl leading-snug text-primary sm:text-3xl">
              {field("final_cta", "quote", "")}
            </p>
            <Button
              variant="gold"
              size="xl"
              onClick={scrollToForm}
              className="mt-10 h-auto min-h-14 max-w-full whitespace-normal py-3 text-balance transition-transform duration-300 hover:-translate-y-0.5"
            >
              {field("final_cta", "cta", "QUERO MINHA VAGA")}
            </Button>
          </Reveal>
        </Container>
      </Section>

      <footer className="border-t border-border/60 py-10">
        <Container width="wide" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-sm uppercase tracking-[0.3em] text-primary">
            {site.projectName}

          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {site.footerText || `Professor ${site.teacherName}`}
          </span>
        </Container>
      </footer>
    </main>
  );
}
