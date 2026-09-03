import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AdminShell } from "@/components/admin/admin-shell";
import { LoadingState } from "@/components/ds/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { offerDefaults, OFFER_BLOCK_KEYS } from "@/content/offer-defaults";
import { mergeOfferRows, OFFER_SELECT, type OfferRow } from "@/lib/offer-content";

export const Route = createFileRoute("/_authenticated/admin/oferta")({
  head: () => ({
    meta: [{ title: "Oferta — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminOfferPage,
});

/** Blocos com editor de texto simples (título/subtítulo/corpo) além do JSON. */
const BLOCK_LABELS: Record<string, string> = {
  transition: "01 · Transição",
  presentation: "02 · Apresentação",
  mechanism: "03 · Mecanismo",
  problem: "04 · O problema",
  audience: "05 · Para quem é",
  structure: "06 · Estrutura",
  phases: "07 · As 4 fases",
  live: "08 · Encontros ao vivo",
  progress: "09 · Como o aluno avança",
  bonuses: "10 · Presentes especiais",
  differentials: "11 · Diferenciais",
  teacher: "12 · Professor",
  offer: "13 · Oferta",
  faq: "14 · FAQ",
  closing: "15 · Fechamento",
};

type Feedback = { type: "ok" | "error"; message: string } | null;

function AdminOfferPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [blockKey, setBlockKey] = useState("offer");

  const rowsQuery = useQuery({
    queryKey: ["admin-offer-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offer_content").select(OFFER_SELECT);
      if (error) throw error;
      return (data ?? []) as OfferRow[];
    },
  });

  const merged = useMemo(() => mergeOfferRows(rowsQuery.data ?? []), [rowsQuery.data]);

  // ---- Formulário essencial (bloco `offer`) ----
  const [offerForm, setOfferForm] = useState({
    name: "",
    promise: "",
    price: "",
    installments: "",
    checkoutUrl: "",
    cta: "",
    duration: "",
    formatSummary: "",
    microcopy: "",
  });

  // ---- Editor por bloco (textos + JSON) ----
  const [blockForm, setBlockForm] = useState({ title: "", subtitle: "", body: "", json: "{}" });

  useEffect(() => {
    if (!rowsQuery.data) return;
    const offer = merged["offer"] ?? {};
    const data = offer.data ?? {};
    setOfferForm({
      name: offer.title ?? "",
      promise: offer.subtitle ?? "",
      price: offer.price_label ?? "",
      installments: offer.body ?? "",
      checkoutUrl: offer.checkout_url ?? "",
      cta: String(data["cta"] ?? ""),
      duration: String(data["duration"] ?? ""),
      formatSummary: String(data["format_summary"] ?? ""),
      microcopy: String(data["microcopy"] ?? ""),
    });
  }, [rowsQuery.data, merged]);

  useEffect(() => {
    const block = merged[blockKey] ?? {};
    setBlockForm({
      title: block.title ?? "",
      subtitle: block.subtitle ?? "",
      body: block.body ?? "",
      json: JSON.stringify(block.data ?? {}, null, 2),
    });
  }, [blockKey, merged]);

  async function upsertBlock(key: string, payload: Record<string, unknown>) {
    const { error } = await supabase
      .from("offer_content")
      .upsert({ block_key: key, is_active: true, ...payload }, { onConflict: "block_key" });
    if (error) throw error;
  }

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-offer-content"] });
    void queryClient.invalidateQueries({ queryKey: ["offer-content"] });
  };

  const saveOffer = useMutation({
    mutationFn: async () => {
      const url = offerForm.checkoutUrl.trim();
      if (url && !/^https?:\/\//i.test(url)) {
        throw new Error("A URL do checkout deve começar com https://");
      }
      const existing = (merged["offer"]?.data ?? {}) as Record<string, unknown>;
      await upsertBlock("offer", {
        title: offerForm.name.trim() || null,
        subtitle: offerForm.promise.trim() || null,
        price_label: offerForm.price.trim() || null,
        body: offerForm.installments.trim() || null,
        checkout_url: url || null,
        bonuses: {
          ...existing,
          cta: offerForm.cta.trim() || offerDefaults["offer"]?.data?.["cta"],
          duration: offerForm.duration.trim(),
          format_summary: offerForm.formatSummary.trim(),
          microcopy: offerForm.microcopy.trim(),
        },
      });
    },
    onSuccess: () => {
      setFeedback({ type: "ok", message: "Oferta atualizada." });
      invalidate();
    },
    onError: (error: unknown) =>
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível salvar.",
      }),
  });

  const saveBlock = useMutation({
    mutationFn: async () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(blockForm.json || "{}");
      } catch {
        throw new Error("O JSON do bloco está inválido.");
      }
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("O JSON do bloco precisa ser um objeto.");
      }
      await upsertBlock(blockKey, {
        title: blockForm.title.trim() || null,
        subtitle: blockForm.subtitle.trim() || null,
        body: blockForm.body.trim() || null,
        bonuses: parsed as Record<string, unknown>,
      });
    },
    onSuccess: () => {
      setFeedback({ type: "ok", message: `Bloco "${blockKey}" atualizado.` });
      invalidate();
    },
    onError: (error: unknown) =>
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível salvar o bloco.",
      }),
  });

  return (
    <AdminShell title="Oferta" description="Conteúdo da oferta revelada na aula">
      {rowsQuery.isLoading ? (
        <LoadingState label="Carregando conteúdo da oferta" />
      ) : (
        <div className="space-y-10">
          <form
            className="max-w-xl space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setFeedback(null);
              saveOffer.mutate();
            }}
          >
            <h2 className="text-heading text-foreground">Essencial</h2>

            <Field label="Nome da formação" id="name">
              <Input
                id="name"
                value={offerForm.name}
                onChange={(e) => setOfferForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>

            <Field label="Promessa principal (headline da oferta)" id="promise">
              <Textarea
                id="promise"
                rows={3}
                value={offerForm.promise}
                onChange={(e) => setOfferForm((f) => ({ ...f, promise: e.target.value }))}
              />
            </Field>

            <Field label="Preço" id="price" hint="Ex.: R$ 497,00">
              <Input
                id="price"
                value={offerForm.price}
                onChange={(e) => setOfferForm((f) => ({ ...f, price: e.target.value }))}
              />
            </Field>

            <Field
              label="Texto de parcelamento"
              id="installments"
              hint="Deixe vazio para não exibir nada."
            >
              <Input
                id="installments"
                value={offerForm.installments}
                onChange={(e) => setOfferForm((f) => ({ ...f, installments: e.target.value }))}
              />
            </Field>

            <Field label="Duração" id="duration">
              <Input
                id="duration"
                value={offerForm.duration}
                onChange={(e) => setOfferForm((f) => ({ ...f, duration: e.target.value }))}
              />
            </Field>

            <Field label="Formato / resumo" id="format">
              <Textarea
                id="format"
                rows={2}
                value={offerForm.formatSummary}
                onChange={(e) => setOfferForm((f) => ({ ...f, formatSummary: e.target.value }))}
              />
            </Field>

            <Field label="Texto do CTA" id="cta">
              <Input
                id="cta"
                value={offerForm.cta}
                onChange={(e) => setOfferForm((f) => ({ ...f, cta: e.target.value }))}
              />
            </Field>

            <Field
              label="URL do checkout"
              id="checkout"
              hint="Sem URL, o botão aparece desabilitado como CHECKOUT A CONFIGURAR."
            >
              <Input
                id="checkout"
                value={offerForm.checkoutUrl}
                onChange={(e) => setOfferForm((f) => ({ ...f, checkoutUrl: e.target.value }))}
                placeholder="https://..."
              />
            </Field>

            <Field label="Microcopy abaixo do CTA" id="microcopy">
              <Textarea
                id="microcopy"
                rows={2}
                value={offerForm.microcopy}
                onChange={(e) => setOfferForm((f) => ({ ...f, microcopy: e.target.value }))}
              />
            </Field>

            <Button type="submit" disabled={saveOffer.isPending}>
              {saveOffer.isPending ? "Salvando..." : "Salvar oferta"}
            </Button>
          </form>

          <form
            className="max-w-2xl space-y-5 border-t border-border/60 pt-8"
            onSubmit={(event) => {
              event.preventDefault();
              setFeedback(null);
              saveBlock.mutate();
            }}
          >
            <div>
              <h2 className="text-heading text-foreground">Blocos de conteúdo</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Textos principais e listas (fases, bônus, FAQ) de cada seção. Campos vazios voltam
                para o conteúdo padrão.
              </p>
            </div>

            <Field label="Bloco" id="block">
              <select
                id="block"
                value={blockKey}
                onChange={(e) => setBlockKey(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {OFFER_BLOCK_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {BLOCK_LABELS[key] ?? key}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Título" id="block-title">
              <Textarea
                id="block-title"
                rows={2}
                value={blockForm.title}
                onChange={(e) => setBlockForm((f) => ({ ...f, title: e.target.value }))}
              />
            </Field>

            <Field label="Subtítulo" id="block-subtitle">
              <Textarea
                id="block-subtitle"
                rows={2}
                value={blockForm.subtitle}
                onChange={(e) => setBlockForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </Field>

            <Field label="Texto" id="block-body">
              <Textarea
                id="block-body"
                rows={4}
                value={blockForm.body}
                onChange={(e) => setBlockForm((f) => ({ ...f, body: e.target.value }))}
              />
            </Field>

            <Field
              label="Listas do bloco (JSON)"
              id="block-json"
              hint="Estrutura em JSON: itens, fases, bônus, perguntas do FAQ."
            >
              <Textarea
                id="block-json"
                rows={14}
                spellCheck={false}
                className="font-mono text-xs"
                value={blockForm.json}
                onChange={(e) => setBlockForm((f) => ({ ...f, json: e.target.value }))}
              />
            </Field>

            <Button type="submit" disabled={saveBlock.isPending}>
              {saveBlock.isPending ? "Salvando..." : "Salvar bloco"}
            </Button>
          </form>

          {feedback ? (
            <p
              className={
                feedback.type === "ok"
                  ? "text-sm text-success"
                  : "text-sm text-destructive"
              }
            >
              {feedback.message}
            </p>
          ) : null}
        </div>
      )}
    </AdminShell>
  );
}

function Field({
  label,
  id,
  hint,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
