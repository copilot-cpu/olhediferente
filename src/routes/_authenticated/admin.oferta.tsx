import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminCard,
  FaqEditor,
  FieldGrid,
  ImageField,
  PreviewLink,
  Repeater,
  SaveBar,
  StringListEditor,
  TextField,
  type FaqItem,
  type Feedback,
} from "@/components/admin/ui";
import { OfferCta } from "@/components/offer/offer-cta";
import { ErrorState, LoadingState } from "@/components/ds/feedback";
import { supabase } from "@/integrations/supabase/client";
import { offerDefaults, OFFER_BLOCK_KEYS, type OfferBlock } from "@/content/offer-defaults";
import { mergeOfferRows, OFFER_SELECT, type OfferRow } from "@/lib/offer-content";

export const Route = createFileRoute("/_authenticated/admin/oferta")({
  head: () => ({
    meta: [{ title: "Oferta — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminOfferPage,
});

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
  faq: "14 · Perguntas frequentes",
  closing: "15 · Fechamento",
};

type Phase = {
  label?: string;
  title?: string;
  objective?: string;
  learns?: string[];
  result?: string;
  active?: boolean;
};

type Bonus = {
  number?: string;
  kind?: string;
  title?: string;
  body?: string;
  paragraphs?: string[];
  items?: string[];
  value?: string;
  note?: string;
  media_url?: string;
  featured?: boolean;
  active?: boolean;
};

type Blocks = Record<string, OfferBlock>;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function AdminOfferPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [blocks, setBlocks] = useState<Blocks | null>(null);

  const rowsQuery = useQuery({
    queryKey: ["admin-offer-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offer_content").select(OFFER_SELECT);
      if (error) throw error;
      return (data ?? []) as OfferRow[];
    },
  });

  const merged = useMemo(() => mergeOfferRows(rowsQuery.data ?? []), [rowsQuery.data]);

  useEffect(() => {
    if (rowsQuery.data) setBlocks(merged);
  }, [rowsQuery.data, merged]);

  const save = useMutation({
    mutationFn: async (value: Blocks) => {
      const checkout = (value["offer"]?.checkout_url ?? "").trim();
      if (checkout && !/^https?:\/\//i.test(checkout)) {
        throw new Error("A URL do checkout deve começar com http:// ou https://");
      }
      const payload = Object.entries(value).map(([block_key, block]) => ({
        block_key,
        title: block.title?.trim() || null,
        subtitle: block.subtitle?.trim() || null,
        body: block.body?.trim() || null,
        price_label: block.price_label?.trim() || null,
        guarantee: block.guarantee?.trim() || null,
        checkout_url: block.checkout_url?.trim() || null,
        bonuses: (block.data ?? {}) as unknown as never,
        is_active: true,
      }));
      const { error } = await supabase
        .from("offer_content")
        .upsert(payload, { onConflict: "block_key" });
      if (error) throw error;
    },
    onSuccess: () => {
      setFeedback({ type: "ok", message: "Alterações salvas." });
      void queryClient.invalidateQueries({ queryKey: ["admin-offer-content"] });
      void queryClient.invalidateQueries({ queryKey: ["offer-content"] });
    },
    onError: (error: unknown) =>
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível salvar.",
      }),
  });

  if (rowsQuery.isLoading || !blocks) {
    return (
      <AdminShell title="Oferta" description="Conteúdo da oferta revelada na aula">
        {rowsQuery.isError ? (
          <ErrorState description="Não foi possível carregar o conteúdo da oferta." />
        ) : (
          <LoadingState label="Carregando conteúdo da oferta" />
        )}
      </AdminShell>
    );
  }

  const b = (key: string): OfferBlock => blocks[key] ?? {};
  const d = (key: string): Record<string, unknown> =>
    (blocks[key]?.data ?? {}) as Record<string, unknown>;

  function setBlock(key: string, patch: Partial<OfferBlock>) {
    setFeedback(null);
    setBlocks((prev) => ({ ...(prev ?? {}), [key]: { ...(prev?.[key] ?? {}), ...patch } }));
  }
  function setData(key: string, patch: Record<string, unknown>) {
    setFeedback(null);
    setBlocks((prev) => ({
      ...(prev ?? {}),
      [key]: {
        ...(prev?.[key] ?? {}),
        data: { ...((prev?.[key]?.data ?? {}) as object), ...patch },
      },
    }));
  }
  const str = (key: string, path: string) => String(d(key)[path] ?? "");

  // ---- Bônus: uma única lista com marcação de destaque ----
  const bonusList: Bonus[] = [
    ...(((d("bonuses")["items"] as Bonus[]) ?? []).map((item) => ({ ...item, featured: false }))),
    ...(((d("bonuses")["featured"] as Bonus[]) ?? []).map((item) => ({ ...item, featured: true }))),
  ];

  function setBonusList(list: Bonus[]) {
    const simple = list
      .filter((item) => !item.featured)
      .map(({ featured: _f, ...rest }) => rest);
    const featured = list
      .filter((item) => item.featured)
      .map(({ featured: _f, body, paragraphs, ...rest }) => ({
        ...rest,
        paragraphs: paragraphs?.length ? paragraphs : body ? [body] : [],
      }));
    setData("bonuses", { items: simple, featured });
  }

  const checkoutUrl = (b("offer").checkout_url ?? "").trim();
  const ctaLabel = str("offer", "cta") || "QUERO COMEÇAR MINHA FORMAÇÃO";

  /** Blocos de texto simples: título, subtítulo, corpo e listas de texto do bloco. */
  function GenericBlock({ blockKey }: { blockKey: string }) {
    const data = d(blockKey);
    return (
      <AdminCard title={BLOCK_LABELS[blockKey] ?? blockKey}>
        <TextField
          label="Título"
          rows={2}
          value={b(blockKey).title ?? ""}
          onChange={(v) => setBlock(blockKey, { title: v })}
        />
        <TextField
          label="Subtítulo"
          rows={2}
          value={b(blockKey).subtitle ?? ""}
          onChange={(v) => setBlock(blockKey, { subtitle: v })}
        />
        <TextField
          label="Texto"
          rows={4}
          value={b(blockKey).body ?? ""}
          onChange={(v) => setBlock(blockKey, { body: v })}
        />
        {Object.entries(data).map(([key, value]) => {
          if (typeof value === "string") {
            return (
              <TextField
                key={key}
                label={fieldLabel(key)}
                rows={value.length > 90 ? 3 : undefined}
                value={value}
                onChange={(v) => setData(blockKey, { [key]: v })}
              />
            );
          }
          if (isStringArray(value)) {
            return (
              <StringListEditor
                key={key}
                label={fieldLabel(key)}
                items={value}
                onChange={(items) => setData(blockKey, { [key]: items })}
                multiline
              />
            );
          }
          if (Array.isArray(value)) {
            return (
              <ObjectListEditor
                key={key}
                label={fieldLabel(key)}
                items={value as Record<string, unknown>[]}
                onChange={(items) => setData(blockKey, { [key]: items })}
              />
            );
          }
          return null;
        })}
      </AdminCard>
    );
  }

  return (
    <AdminShell title="Oferta" description="Conteúdo da oferta revelada na aula">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          setFeedback(null);
          save.mutate(blocks);
        }}
      >
        <div className="flex flex-wrap gap-2">
          <PreviewLink to="/admin/preview" label="PRÉ-VISUALIZAR OFERTA" />
        </div>

        {/* Configuração da oferta */}
        <AdminCard
          title="Configuração da oferta"
          description="Dados usados por todos os botões de compra da página."
        >
          <FieldGrid>
            <TextField
              label="Nome da formação"
              value={b("offer").title ?? ""}
              onChange={(v) => setBlock("offer", { title: v })}
            />
            <TextField
              label="Duração"
              value={str("offer", "duration")}
              onChange={(v) => setData("offer", { duration: v })}
            />
          </FieldGrid>
          <TextField
            label="Promessa"
            rows={3}
            value={b("offer").subtitle ?? ""}
            onChange={(v) => setBlock("offer", { subtitle: v })}
          />
          <TextField
            label="Resumo do formato"
            rows={2}
            value={str("offer", "format_summary")}
            onChange={(v) => setData("offer", { format_summary: v })}
          />
          <FieldGrid>
            <TextField
              label="Preço"
              hint="Ex.: R$ 497,00"
              value={b("offer").price_label ?? ""}
              onChange={(v) => setBlock("offer", { price_label: v })}
            />
            <TextField
              label="Texto do parcelamento"
              value={b("offer").body ?? ""}
              onChange={(v) => setBlock("offer", { body: v })}
            />
          </FieldGrid>
          <FieldGrid>
            <TextField
              label="Texto do botão (CTA)"
              value={ctaLabel}
              onChange={(v) => setData("offer", { cta: v })}
            />
            <TextField
              label="URL do checkout"
              placeholder="https://..."
              hint={
                checkoutUrl
                  ? "Todos os botões da oferta abrem este endereço."
                  : "Adicione a URL do checkout para ativar os botões de compra."
              }
              value={b("offer").checkout_url ?? ""}
              onChange={(v) => setBlock("offer", { checkout_url: v })}
            />
          </FieldGrid>
          <TextField
            label="Microcopy abaixo do botão"
            rows={2}
            value={str("offer", "microcopy")}
            onChange={(v) => setData("offer", { microcopy: v })}
          />

          <div className="rounded-md border border-border/60 bg-background/50 p-5">
            <p className="text-overline mb-3">Pré-visualização do botão</p>
            <div className="max-w-sm">
              <OfferCta
                label={ctaLabel}
                checkoutUrl={/^https?:\/\//i.test(checkoutUrl) ? checkoutUrl : ""}
              />
              {str("offer", "microcopy") ? (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {str("offer", "microcopy")}
                </p>
              ) : null}
            </div>
          </div>

          <FieldGrid>
            <TextField
              label="Barra fixa (mobile) — título"
              value={str("offer", "sticky_title")}
              onChange={(v) => setData("offer", { sticky_title: v })}
            />
            <TextField
              label="Barra fixa (mobile) — preço"
              value={str("offer", "sticky_price")}
              onChange={(v) => setData("offer", { sticky_price: v })}
            />
          </FieldGrid>
          <TextField
            label="Barra fixa (mobile) — botão"
            value={str("offer", "sticky_cta")}
            onChange={(v) => setData("offer", { sticky_cta: v })}
          />
        </AdminCard>

        {/* Fases */}
        <AdminCard title="As 4 fases da formação">
          <TextField
            label="Título da seção"
            value={b("phases").title ?? ""}
            onChange={(v) => setBlock("phases", { title: v })}
          />
          <Repeater<Phase>
            items={((d("phases")["items"] as Phase[]) ?? []).slice()}
            onChange={(items) => setData("phases", { items })}
            makeItem={() => ({ label: "", title: "", objective: "", learns: [], result: "" })}
            addLabel="+ ADICIONAR FASE"
            emptyLabel="Nenhuma fase cadastrada."
            removeTitle="Excluir fase?"
            titleOf={(item, index) => item.title?.trim() || `Fase ${index + 1}`}
          >
            {(item, update) => (
              <>
                <FieldGrid>
                  <TextField
                    label="Número / etiqueta"
                    value={item.label ?? ""}
                    onChange={(v) => update({ label: v })}
                  />
                  <TextField
                    label="Título"
                    value={item.title ?? ""}
                    onChange={(v) => update({ title: v })}
                  />
                </FieldGrid>
                <TextField
                  label="Objetivo"
                  rows={2}
                  value={item.objective ?? ""}
                  onChange={(v) => update({ objective: v })}
                />
                <StringListEditor
                  label="O aluno aprende"
                  items={item.learns ?? []}
                  onChange={(learns) => update({ learns })}
                />
                <TextField
                  label="Resultado"
                  rows={3}
                  value={item.result ?? ""}
                  onChange={(v) => update({ result: v })}
                />
              </>
            )}
          </Repeater>
        </AdminCard>

        {/* Bônus */}
        <AdminCard title="Presentes especiais (bônus)">
          <FieldGrid>
            <TextField
              label="Título da seção"
              value={b("bonuses").title ?? ""}
              onChange={(v) => setBlock("bonuses", { title: v })}
            />
            <TextField
              label="Título da lista de destaques"
              value={str("bonuses", "featured_title")}
              onChange={(v) => setData("bonuses", { featured_title: v })}
            />
          </FieldGrid>
          <Repeater<Bonus>
            items={bonusList}
            onChange={setBonusList}
            makeItem={() => ({ number: "", title: "", body: "", featured: false })}
            addLabel="+ ADICIONAR BÔNUS"
            emptyLabel="Nenhum bônus cadastrado."
            removeTitle="Excluir bônus?"
            titleOf={(item, index) => item.title?.trim() || `Bônus ${index + 1}`}
          >
            {(item, update) => (
              <>
                <FieldGrid>
                  <TextField
                    label="Número"
                    value={item.number ?? ""}
                    onChange={(v) => update({ number: v })}
                  />
                  <TextField
                    label="Categoria"
                    hint="Ex.: LIVRO, CURSO, VOUCHER."
                    value={item.kind ?? ""}
                    onChange={(v) => update({ kind: v })}
                  />
                </FieldGrid>
                <TextField
                  label="Título"
                  value={item.title ?? ""}
                  onChange={(v) => update({ title: v })}
                />
                <TextField
                  label="Descrição"
                  rows={3}
                  value={item.body ?? (item.paragraphs ?? []).join("\n")}
                  onChange={(v) => update({ body: v, paragraphs: v ? v.split("\n") : [] })}
                />
                <StringListEditor
                  label="Lista opcional"
                  items={item.items ?? []}
                  onChange={(items) => update({ items })}
                />
                <ImageField
                  label="Imagem opcional"
                  folder="bonus"
                  value={item.media_url ?? ""}
                  onChange={(v) => update({ media_url: v })}
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--color-primary)]"
                    checked={Boolean(item.featured)}
                    onChange={(e) => update({ featured: e.target.checked })}
                  />
                  Exibir como bônus de maior destaque
                </label>
              </>
            )}
          </Repeater>
        </AdminCard>

        {/* FAQ */}
        <AdminCard title="Perguntas frequentes da formação">
          <TextField
            label="Título da seção"
            value={b("faq").title ?? ""}
            onChange={(v) => setBlock("faq", { title: v })}
          />
          <FaqEditor
            items={(d("faq")["items"] as FaqItem[]) ?? []}
            onChange={(items) => setData("faq", { items })}
          />
        </AdminCard>

        {/* Demais blocos */}
        {OFFER_BLOCK_KEYS.filter(
          (key) => !["offer", "phases", "bonuses", "faq"].includes(key),
        ).map((key) => (
          <GenericBlock key={key} blockKey={key} />
        ))}

        <SaveBar pending={save.isPending} feedback={feedback} />
      </form>
    </AdminShell>
  );
}

function fieldLabel(key: string): string {
  const labels: Record<string, string> = {
    eyebrow: "Linha de apoio",
    items: "Itens",
    paragraphs: "Parágrafos",
    highlight: "Destaque",
    closing: "Fechamento",
    note: "Observação",
    steps: "Etapas",
    pillars: "Pilares",
    brand: "Marca",
    brand_line: "Assinatura da marca",
    quote: "Frase",
  };
  return labels[key] ?? key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

/** Editor para listas de objetos simples (título/texto e listas internas). */
function ObjectListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
}) {
  const template = items[0] ?? { title: "", body: "" };
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <Repeater<Record<string, unknown>>
        items={items}
        onChange={onChange}
        makeItem={() =>
          Object.fromEntries(
            Object.entries(template).map(([key, value]) => [key, Array.isArray(value) ? [] : ""]),
          )
        }
        addLabel="+ ADICIONAR ITEM"
        removeTitle="Excluir item?"
        titleOf={(item, index) => String(item["title"] ?? item["label"] ?? `Item ${index + 1}`)}
      >
        {(item, update) => (
          <>
            {Object.entries(item).map(([key, value]) => {
              if (isStringArray(value)) {
                return (
                  <StringListEditor
                    key={key}
                    label={fieldLabel(key)}
                    items={value}
                    onChange={(next) => update({ [key]: next })}
                  />
                );
              }
              if (typeof value === "string") {
                return (
                  <TextField
                    key={key}
                    label={fieldLabel(key)}
                    rows={value.length > 90 ? 3 : undefined}
                    value={value}
                    onChange={(next) => update({ [key]: next })}
                  />
                );
              }
              return null;
            })}
          </>
        )}
      </Repeater>
    </div>
  );
}
