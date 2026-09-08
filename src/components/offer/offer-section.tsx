import { useEffect, useRef, useState } from "react";

import { Container, GoldRule } from "@/components/ds/container";
import { Reveal } from "@/components/ds/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { OfferCta } from "@/components/offer/offer-cta";
import { OfferStickyCta } from "@/components/offer/offer-sticky-cta";
import { useOfferContent } from "@/lib/offer-content";
import { cn } from "@/lib/utils";

type Band = "deep" | "cream" | "olive";

function Band({
  tone,
  children,
  className,
  id,
}: {
  tone: Band;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const tones: Record<Band, string> = {
    deep: "bg-forest-deep text-cream",
    cream: "bg-cream text-forest-deep",
    olive: "bg-olive text-cream",
  };
  return (
    <section id={id} className={cn("py-14 sm:py-20", tones[tone], className)}>
      {children}
    </section>
  );
}

function Editorial({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-[68ch]", className)}>{children}</div>;
}

export function OfferSection() {
  const { block, field, offer } = useOfferContent();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(Boolean(entry && entry.boundingClientRect.top < 0)),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const transition = block("transition");
  const presentation = block("presentation");
  const mechanism = block("mechanism");
  const problem = block("problem");
  const audience = block("audience");
  const structure = block("structure");
  const phases = block("phases");
  const live = block("live");
  const progress = block("progress");
  const bonuses = block("bonuses");
  const differentials = block("differentials");
  const teacher = block("teacher");
  const offerBlock = block("offer");
  const faq = block("faq");
  const closing = block("closing");

  return (
    <div id="oferta" className="text-left">
      {/* 01 — Transição, continuação natural da aula */}
      <Band tone="deep" className="relative overflow-hidden pt-10 sm:pt-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-px h-24 bg-gradient-to-b from-background to-transparent"
        />
        <Container width="default" className="relative">
          <Reveal>
            <Editorial>
              <p className="text-overline">{field("transition", "eyebrow", "")}</p>
              <h2 className="text-title mt-4 text-cream">{transition.title}</h2>
              <p className="text-lede mt-4">{transition.subtitle}</p>
              <GoldRule className="my-8" />
              <p className="whitespace-pre-line text-base leading-relaxed text-cream/85">{transition.body}</p>
            </Editorial>
          </Reveal>
        </Container>
        <div ref={sentinelRef} aria-hidden className="h-px w-full" />
      </Band>

      {/* 02 — Apresentação */}
      <Band tone="cream">
        <Container width="default">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="font-sans text-[0.7rem] uppercase tracking-[0.24em] text-forest-deep/60">
                {presentation.title}
              </p>
              <h2 className="text-display mt-3 text-forest-deep">{presentation.subtitle}</h2>
              <GoldRule className="mx-auto my-8 max-w-xs" />
              <p className="whitespace-pre-line mx-auto max-w-[62ch] text-base leading-relaxed text-forest-deep/80 sm:text-lg">
                {presentation.body}
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {field<{ value: string; label: string }[]>("presentation", "marks", []).map(
              (mark, index) => (
                <Reveal key={mark.value} delay={index * 80}>
                  <div className="h-full border-t border-forest-deep/20 pt-4">
                    <p className="font-display text-lg leading-tight text-forest-deep">
                      {mark.value}
                    </p>
                    <p className="mt-1 font-sans text-[0.68rem] uppercase tracking-[0.2em] text-forest-deep/55">
                      {mark.label}
                    </p>
                  </div>
                </Reveal>
              ),
            )}
          </div>
        </Container>
      </Band>

      {/* 03 — Mecanismo, progressão em eixo */}
      <Band tone="deep">
        <Container width="default">
          <Reveal>
            <Editorial>
              <p className="text-overline">{field("mechanism", "eyebrow", "")}</p>
              <h2 className="text-title mt-4 text-cream">{mechanism.title}</h2>
              <p className="whitespace-pre-line mt-4 text-base leading-relaxed text-cream/80">{mechanism.body}</p>
            </Editorial>
          </Reveal>

          <ol className="relative mx-auto mt-12 max-w-3xl border-l border-primary/25 pl-6 sm:pl-10">
            {field<{ number: string; title: string; body: string }[]>(
              "mechanism",
              "steps",
              [],
            ).map((step, index) => (
              <Reveal as="li" key={step.number} delay={index * 90} className="relative pb-10 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[1.65rem] top-1 flex size-6 items-center justify-center rounded-full border border-primary/40 bg-forest-deep text-[0.6rem] text-primary sm:-left-[2.9rem] sm:size-8 sm:text-[0.7rem]"
                >
                  {step.number}
                </span>
                <h3 className="font-display text-xl text-cream sm:text-2xl">{step.title}</h3>
                <p className="whitespace-pre-line mt-1 font-sans text-sm text-primary/80">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Band>

      {/* 04 — O problema */}
      <Band tone="olive">
        <Container width="default">
          <Reveal>
            <Editorial>
              <h2 className="text-title text-cream">{problem.title}</h2>
              <p className="whitespace-pre-line mt-6 text-base text-cream/85">{problem.body}</p>
              <ul className="mt-4 space-y-2">
                {field<string[]>("problem", "items", []).map((item) => (
                  <li key={item} className="flex gap-3 text-base text-cream/80">
                    <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-primary/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-2">
                {field<string[]>("problem", "paragraphs", []).map((p) => (
                  <p key={p} className="text-base leading-relaxed text-cream/85">
                    {p}
                  </p>
                ))}
              </div>
            </Editorial>
          </Reveal>

          <Reveal delay={100}>
            <div className="mx-auto mt-10 max-w-2xl border-l-2 border-primary/60 pl-5">
              {field<string[]>("problem", "highlights", []).map((line) => (
                <p key={line} className="font-display text-lg leading-snug text-cream sm:text-xl">
                  {line}
                </p>
              ))}
            </div>
          </Reveal>
        </Container>
      </Band>

      {/* 05 — Para quem é */}
      <Band tone="cream">
        <Container width="default">
          <Reveal>
            <h2 className="text-title mx-auto max-w-3xl text-forest-deep">{audience.title}</h2>
          </Reveal>
          <ul className="mx-auto mt-8 max-w-3xl divide-y divide-forest-deep/15 border-y border-forest-deep/15">
            {field<string[]>("audience", "items", []).map((item, index) => (
              <Reveal as="li" key={item} delay={index * 60} className="flex gap-4 py-4">
                <span className="font-display text-sm text-forest-deep/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-base leading-relaxed text-forest-deep/85">{item}</span>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Band>

      {/* 06 — Estrutura */}
      <Band tone="deep">
        <Container width="default">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <Reveal>
              <div>
                <p className="font-display text-5xl leading-none text-primary sm:text-6xl">
                  {structure.subtitle}
                </p>
                <h2 className="text-title mt-4 text-cream">{structure.title}</h2>
              </div>
            </Reveal>
            <Reveal delay={90}>
              <div>
                <p className="font-sans text-sm uppercase tracking-[0.18em] text-cream/60">
                  {field("structure", "format_intro", "")}
                </p>
                <ul className="mt-4 space-y-2">
                  {field<string[]>("structure", "format", []).map((item) => (
                    <li key={item} className="flex gap-3 text-base text-cream/85">
                      <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-primary/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="whitespace-pre-line mt-6 text-base leading-relaxed text-cream/80">{structure.body}</p>
                <p className="mt-6 inline-block border border-primary/35 px-4 py-2 font-sans text-xs uppercase tracking-[0.18em] text-primary">
                  {field("structure", "highlight", "")}
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Band>

      {/* 07 — As 4 fases */}
      <Band tone="cream">
        <Container width="default">
          <Reveal>
            <h2 className="text-title max-w-2xl text-forest-deep">{phases.title}</h2>
          </Reveal>
          <div className="mt-10 space-y-10">
            {field<
              {
                label: string;
                title: string;
                objective: string;
                learns: string[];
                result: string;
              }[]
            >("phases", "items", []).map((phase, index) => (
              <Reveal key={phase.label} delay={index * 70}>
                <article className="grid gap-6 border-t border-forest-deep/20 pt-6 lg:grid-cols-[0.55fr_1.45fr]">
                  <div>
                    <p className="font-sans text-[0.68rem] uppercase tracking-[0.24em] text-forest-deep/50">
                      {phase.label}
                    </p>
                    <h3 className="font-display text-2xl leading-tight text-forest-deep sm:text-3xl">
                      {phase.title}
                    </h3>
                  </div>
                  <div className="min-w-0">
                    <p className="text-base leading-relaxed text-forest-deep/85">
                      <span className="font-medium">Objetivo: </span>
                      {phase.objective}
                    </p>
                    <p className="mt-5 font-sans text-[0.68rem] uppercase tracking-[0.2em] text-forest-deep/50">
                      O aluno aprende
                    </p>
                    <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                      {(phase.learns ?? []).map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-forest-deep/80">
                          <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-forest-deep/40" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 border-l-2 border-primary pl-4 text-sm leading-relaxed text-forest-deep/85">
                      <span className="font-medium">Resultado: </span>
                      {phase.result}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mx-auto mt-12 max-w-md">
            <OfferCta label={offer.cta} checkoutUrl={offer.checkoutUrl} />
          </Reveal>
        </Container>
      </Band>

      {/* 08 — Encontros ao vivo */}
      <Band tone="deep">
        <Container width="default">
          <Reveal>
            <Editorial>
              <h2 className="text-title text-cream">{live.title}</h2>
              <p className="text-title text-primary">{live.subtitle}</p>
              <p className="whitespace-pre-line mt-6 text-base text-cream/85">{live.body}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {field<string[]>("live", "items", []).map((item) => (
                  <li key={item} className="flex gap-3 text-base text-cream/80">
                    <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-primary/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-l-2 border-primary/60 pl-5 font-display text-lg leading-snug text-cream">
                {field("live", "highlight", "")}
              </p>
            </Editorial>
          </Reveal>
        </Container>
      </Band>

      {/* 09 — Como o aluno avança */}
      <Band tone="olive">
        <Container width="default">
          <Reveal>
            <Editorial>
              <h2 className="text-title text-cream">{progress.title}</h2>
              <p className="whitespace-pre-line mt-5 text-base text-cream/85">{progress.body}</p>
            </Editorial>
          </Reveal>
          <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
            {field<string[]>("progress", "items", []).map((item, index) => (
              <Reveal as="li" key={item} delay={index * 50}>
                <span className="inline-block rounded-full border border-cream/25 px-4 py-2 font-sans text-xs uppercase tracking-[0.14em] text-cream/85">
                  {item}
                </span>
              </Reveal>
            ))}
          </ul>
          <Reveal>
            <p className="mx-auto mt-10 max-w-2xl text-center font-display text-xl leading-snug text-cream sm:text-2xl">
              {field("progress", "closing", "")}
            </p>
          </Reveal>
        </Container>
      </Band>

      {/* 10 — Presentes especiais */}
      <Band tone="cream">
        <Container width="default">
          <Reveal>
            <h2 className="text-title max-w-2xl text-forest-deep">{bonuses.title}</h2>
          </Reveal>

          <div className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {field<{ number: string; title: string; body: string }[]>("bonuses", "items", []).map(
              (item, index) => (
                <Reveal key={item.number} delay={index * 50}>
                  <div className="flex gap-4 border-t border-forest-deep/15 pt-4">
                    <span className="font-display text-sm text-primary">{item.number}</span>
                    <div className="min-w-0">
                      <h3 className="font-sans text-sm font-medium uppercase tracking-[0.08em] text-forest-deep">
                        {item.title}
                      </h3>
                      <p className="whitespace-pre-line mt-1 text-sm leading-relaxed text-forest-deep/75">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ),
            )}
          </div>

          <Reveal>
            <p className="text-overline mt-14">{field("bonuses", "featured_title", "")}</p>
          </Reveal>

          <div className="mt-6 space-y-6">
            {field<
              {
                number: string;
                kind?: string;
                title: string;
                value?: string;
                paragraphs?: string[];
                items?: string[];
                note?: string;
              }[]
            >("bonuses", "featured", []).map((item, index) => (
              <Reveal key={item.number} delay={index * 70}>
                <article className="grid gap-5 rounded-lg border border-forest-deep/15 bg-forest-deep/[0.03] p-6 sm:grid-cols-[auto_1fr] sm:p-8">
                  <div className="flex items-start gap-3 sm:flex-col sm:gap-1">
                    <span className="font-display text-3xl leading-none text-primary sm:text-4xl">
                      {item.number}
                    </span>
                    {item.kind ? (
                      <span className="font-sans text-[0.62rem] uppercase tracking-[0.22em] text-forest-deep/50">
                        {item.kind}
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl leading-tight text-forest-deep sm:text-2xl">
                      {item.title}
                    </h3>
                    {item.value ? (
                      <p className="mt-2 font-display text-3xl text-primary">{item.value}</p>
                    ) : null}
                    {(item.paragraphs ?? []).map((p) => (
                      <p key={p} className="mt-2 text-sm leading-relaxed text-forest-deep/80">
                        {p}
                      </p>
                    ))}
                    {item.items?.length ? (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {item.items.map((sub) => (
                          <li
                            key={sub}
                            className="rounded-full border border-forest-deep/20 px-3 py-1 text-xs text-forest-deep/75"
                          >
                            {sub}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {item.note ? (
                      <p className="mt-3 text-sm text-forest-deep/70">{item.note}</p>
                    ) : null}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mx-auto mt-12 max-w-md">
            <OfferCta label={offer.cta} checkoutUrl={offer.checkoutUrl} />
          </Reveal>
        </Container>
      </Band>

      {/* 11 — Diferenciais */}
      <Band tone="deep">
        <Container width="default">
          <Reveal>
            <h2 className="text-title max-w-2xl text-cream">{differentials.title}</h2>
          </Reveal>
          <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {field<string[]>("differentials", "items", []).map((item, index) => (
              <Reveal as="li" key={item} delay={index * 50} className="border-t border-cream/15 pt-4">
                <p className="font-display text-lg leading-snug text-cream">{item}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Band>

      {/* 12 — Professor */}
      <Band tone="olive">
        <Container width="default">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <Reveal>
              <div className="mx-auto w-full max-w-xs overflow-hidden rounded-lg border border-cream/15 bg-forest-deep/40">
                {field("teacher", "media_url", "") ? (
                  <img
                    src={field("teacher", "media_url", "")}
                    alt={`Retrato do ${teacher.subtitle}`}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center px-6 text-center text-xs text-cream/50">
                    Espaço reservado para a fotografia do professor
                  </div>
                )}
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div>
                <h2 className="text-title text-cream">{teacher.title}</h2>
                <p className="mt-6 font-display text-2xl text-primary">{teacher.subtitle}</p>
                <p className="whitespace-pre-line font-sans text-sm uppercase tracking-[0.16em] text-cream/65">
                  {teacher.body}
                </p>
                <div className="mt-5 space-y-3">
                  {field<string[]>("teacher", "paragraphs", []).map((p) => (
                    <p key={p} className="text-base leading-relaxed text-cream/85">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Band>

      {/* 13 — Oferta */}
      <Band tone="cream" id="oferta-condicao">
        <Container width="default">
          <Reveal>
            <div className="mx-auto max-w-2xl rounded-lg border border-forest-deep/15 bg-forest-deep p-7 text-center text-cream sm:p-10">
              <p className="text-overline">{field("offer", "eyebrow", "")}</p>
              <h2 className="text-title mt-4 text-cream">{offer.promise}</h2>

              <ul className="mx-auto mt-7 grid max-w-md gap-2 text-left">
                {field<string[]>("offer", "includes", []).map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-cream/85">
                    <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-primary/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <GoldRule className="my-8" />

              {offer.price ? (
                <p className="font-display text-4xl leading-none text-primary sm:text-5xl">
                  {offer.price}
                </p>
              ) : null}
              {offer.installments ? (
                <p className="mt-2 text-sm text-cream/80">{offer.installments}</p>
              ) : null}
              {offerBlock.guarantee ? (
                <p className="whitespace-pre-line mt-2 text-sm text-cream/80">{offerBlock.guarantee}</p>
              ) : null}

              <div className="mx-auto mt-7 max-w-sm">
                <OfferCta label={offer.cta} checkoutUrl={offer.checkoutUrl} />
              </div>

              {offer.microcopy ? (
                <p className="mx-auto mt-4 max-w-sm text-xs leading-relaxed text-cream/65">
                  {offer.microcopy}
                </p>
              ) : null}
            </div>
          </Reveal>
        </Container>
      </Band>

      {/* 14 — FAQ */}
      <Band tone="deep">
        <Container width="default">
          <Reveal>
            <h2 className="text-title max-w-2xl text-cream">{faq.title}</h2>
          </Reveal>
          <Accordion type="single" collapsible className="mx-auto mt-8 max-w-3xl">
            {field<{ q: string; a: string; active?: boolean }[]>("faq", "items", [])
              .filter((item) => item.active !== false && item.q)
              .map((item, index) => (

              <AccordionItem key={item.q} value={`faq-${index}`} className="border-cream/15">
                <AccordionTrigger className="text-left font-display text-base text-cream sm:text-lg">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-cream/75">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}

          </Accordion>
        </Container>
      </Band>

      {/* 15 — Fechamento */}
      <Band tone="cream">
        <Container width="default">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-title text-forest-deep">{closing.title}</h2>
              <p className="mt-3 font-display text-xl text-forest-deep/70 sm:text-2xl">
                {closing.subtitle}
              </p>
              <p className="whitespace-pre-line mx-auto mt-6 max-w-[60ch] text-base leading-relaxed text-forest-deep/80">
                {closing.body}
              </p>
              <div className="mx-auto mt-8 max-w-sm">
                <OfferCta label={offer.cta} checkoutUrl={offer.checkoutUrl} />
              </div>
              <GoldRule className="mx-auto my-10 max-w-xs" />
              <p className="font-display text-2xl tracking-tight text-forest-deep sm:text-3xl">
                {field("closing", "brand", "")}
              </p>
              <p className="mt-2 text-sm text-forest-deep/70">
                {field("closing", "brand_line", "")}
              </p>
            </div>
          </Reveal>
        </Container>
      </Band>

      <OfferStickyCta
        visible={stickyVisible}
        title={offer.stickyTitle}
        price={offer.stickyPrice}
        cta={offer.stickyCta}
        checkoutUrl={offer.checkoutUrl}
      />
    </div>
  );
}
