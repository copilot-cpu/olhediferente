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
import { ErrorState, LoadingState } from "@/components/ds/feedback";
import { supabase } from "@/integrations/supabase/client";
import { captureDefaults, type CaptureBlock } from "@/content/capture-defaults";

export const Route = createFileRoute("/_authenticated/admin/captacao")({
  head: () => ({
    meta: [{ title: "Captação — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminCapturePage,
});

type Row = {
  block_key: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  media_url: string | null;
  data: unknown;
};

const SELECT = "block_key,title,subtitle,body,media_url,data";

type Blocks = Record<string, CaptureBlock>;

function mergeRows(rows: Row[]): Blocks {
  const merged: Blocks = {};
  for (const [key, block] of Object.entries(captureDefaults)) {
    merged[key] = { ...block, data: { ...(block.data ?? {}) } };
  }
  for (const row of rows) {
    const base = merged[row.block_key] ?? {};
    const data =
      row.data && typeof row.data === "object" && !Array.isArray(row.data)
        ? (row.data as Record<string, unknown>)
        : {};
    merged[row.block_key] = {
      ...base,
      ...(row.title ? { title: row.title } : {}),
      ...(row.subtitle ? { subtitle: row.subtitle } : {}),
      ...(row.body ? { body: row.body } : {}),
      ...(row.media_url ? { media_url: row.media_url } : {}),
      data: { ...(base.data ?? {}), ...data },
    };
  }
  return merged;
}

type DiscoverItem = { number?: string; title?: string; body?: string; steps?: string[] };

function AdminCapturePage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [blocks, setBlocks] = useState<Blocks | null>(null);

  const rowsQuery = useQuery({
    queryKey: ["admin-capture-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("capture_page_content").select(SELECT);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const merged = useMemo(() => mergeRows(rowsQuery.data ?? []), [rowsQuery.data]);

  useEffect(() => {
    if (rowsQuery.data) setBlocks(merged);
  }, [rowsQuery.data, merged]);

  const save = useMutation({
    mutationFn: async (value: Blocks) => {
      const payload = Object.entries(value).map(([block_key, block]) => ({
        block_key,
        title: block.title?.trim() || null,
        subtitle: block.subtitle?.trim() || null,
        body: block.body?.trim() || null,
        media_url: block.media_url?.trim() || null,
        data: (block.data ?? {}) as unknown as never,
        is_active: true,
      }));
      const { error } = await supabase
        .from("capture_page_content")
        .upsert(payload, { onConflict: "block_key" });
      if (error) throw error;
    },
    onSuccess: () => {
      setFeedback({ type: "ok", message: "Alterações salvas." });
      void queryClient.invalidateQueries({ queryKey: ["admin-capture-content"] });
      void queryClient.invalidateQueries({ queryKey: ["capture-page-content"] });
    },
    onError: (error: unknown) =>
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar. Tente novamente em instantes.",
      }),
  });

  if (rowsQuery.isLoading || !blocks) {
    return (
      <AdminShell title="Captação" description="Conteúdo da página pública de inscrição">
        {rowsQuery.isError ? (
          <ErrorState description="Não foi possível carregar o conteúdo da captação." />
        ) : (
          <LoadingState label="Carregando conteúdo da captação" />
        )}
      </AdminShell>
    );
  }

  const b = (key: string): CaptureBlock => blocks[key] ?? {};
  const d = (key: string): Record<string, unknown> => (blocks[key]?.data ?? {}) as Record<string, unknown>;

  function setBlock(key: string, patch: Partial<CaptureBlock>) {
    setFeedback(null);
    setBlocks((prev) => ({ ...(prev ?? {}), [key]: { ...(prev?.[key] ?? {}), ...patch } }));
  }
  function setData(key: string, patch: Record<string, unknown>) {
    setFeedback(null);
    setBlocks((prev) => ({
      ...(prev ?? {}),
      [key]: { ...(prev?.[key] ?? {}), data: { ...((prev?.[key]?.data ?? {}) as object), ...patch } },
    }));
  }
  const str = (key: string, path: string) => String(d(key)[path] ?? "");
  const list = (key: string, path: string): string[] =>
    Array.isArray(d(key)[path]) ? (d(key)[path] as string[]).map((v) => String(v)) : [];

  return (
    <AdminShell title="Captação" description="Conteúdo da página pública de inscrição">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          setFeedback(null);
          save.mutate(blocks);
        }}
      >
        <div className="flex flex-wrap gap-2">
          <PreviewLink to="/" label="VER PÁGINA DE CAPTAÇÃO" />
        </div>

        {/* HERO */}
        <AdminCard title="Hero" description="Primeira dobra da página.">
          <FieldGrid>
            <TextField
              label="Eyebrow (linha acima do título)"
              value={b("hero").subtitle ?? ""}
              onChange={(v) => setBlock("hero", { subtitle: v })}
            />
            <TextField
              label="Marca"
              value={str("hero", "brand")}
              onChange={(v) => setData("hero", { brand: v })}
            />
          </FieldGrid>
          <TextField
            label="Headline"
            rows={3}
            value={b("hero").title ?? ""}
            onChange={(v) => setBlock("hero", { title: v })}
          />
          <TextField
            label="Trecho destacado em dourado"
            hint="Deve ser um trecho exato da headline."
            value={str("hero", "highlight")}
            onChange={(v) => setData("hero", { highlight: v })}
          />
          <TextField
            label="Subheadline"
            rows={4}
            value={b("hero").body ?? ""}
            onChange={(v) => setBlock("hero", { body: v })}
          />
          <FieldGrid>
            <TextField
              label="Data da aula"
              value={str("hero", "date_label")}
              onChange={(v) => setData("hero", { date_label: v })}
            />
            <TextField
              label="Horário"
              value={str("hero", "time_label")}
              onChange={(v) => setData("hero", { time_label: v })}
            />
          </FieldGrid>
          <ImageField
            label="Imagem principal (íris)"
            hint="Imagem macro exibida ao lado da headline."
            folder="captacao"
            value={b("hero").media_url ?? ""}
            onChange={(v) => setBlock("hero", { media_url: v })}
          />
        </AdminCard>

        {/* FORMULÁRIO */}
        <AdminCard title="Formulário de inscrição" description="Textos ao redor do formulário.">
          <TextField
            label="Título do formulário"
            value={b("form").title ?? ""}
            onChange={(v) => setBlock("form", { title: v })}
          />
          <TextField
            label="Texto do botão (CTA)"
            value={b("form").subtitle ?? ""}
            onChange={(v) => setBlock("form", { subtitle: v })}
          />
          <TextField
            label="Microcopy abaixo do botão"
            rows={2}
            value={b("form").body ?? ""}
            onChange={(v) => setBlock("form", { body: v })}
          />
        </AdminCard>

        {/* GRANDE PERGUNTA */}
        <AdminCard title="A grande pergunta">
          <TextField
            label="Headline"
            rows={2}
            value={b("question").title ?? ""}
            onChange={(v) => setBlock("question", { title: v })}
          />
          <StringListEditor
            label="Corpo (um parágrafo por linha)"
            items={list("question", "paragraphs")}
            onChange={(items) => setData("question", { paragraphs: items })}
            multiline
            addLabel="+ ADICIONAR PARÁGRAFO"
          />
        </AdminCard>

        {/* DESCOBRIR */}
        <AdminCard title="O que você vai descobrir">
          <TextField
            label="Título da seção"
            value={b("discover").title ?? ""}
            onChange={(v) => setBlock("discover", { title: v })}
          />
          <Repeater<DiscoverItem>
            items={(d("discover")["items"] as DiscoverItem[]) ?? []}
            onChange={(items) => setData("discover", { items })}
            makeItem={() => ({ number: "", title: "", body: "" })}
            addLabel="+ ADICIONAR ITEM"
            removeTitle="Excluir item?"
            titleOf={(item, index) => item.title?.trim() || `Item ${index + 1}`}
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
                    label="Título"
                    value={item.title ?? ""}
                    onChange={(v) => update({ title: v })}
                  />
                </FieldGrid>
                <TextField
                  label="Descrição"
                  rows={3}
                  value={item.body ?? ""}
                  onChange={(v) => update({ body: v })}
                />
                <StringListEditor
                  label="Lista opcional"
                  hint="Etapas exibidas em destaque abaixo da descrição."
                  items={item.steps ?? []}
                  onChange={(steps) => update({ steps })}
                />
              </>
            )}
          </Repeater>
        </AdminCard>

        {/* PARA QUEM É */}
        <AdminCard title="Para quem é">
          <TextField
            label="Título da seção"
            rows={2}
            value={b("audience").title ?? ""}
            onChange={(v) => setBlock("audience", { title: v })}
          />
          <StringListEditor
            label="Itens"
            items={list("audience", "items")}
            onChange={(items) => setData("audience", { items })}
            multiline
          />
        </AdminCard>

        {/* PARA QUEM NÃO É */}
        <AdminCard title="Para quem não é">
          <TextField
            label="Título da seção"
            rows={2}
            value={b("not_audience").title ?? ""}
            onChange={(v) => setBlock("not_audience", { title: v })}
          />
          <StringListEditor
            label="Itens"
            items={list("not_audience", "items")}
            onChange={(items) => setData("not_audience", { items })}
          />
          <TextField
            label="Fechamento da seção"
            rows={2}
            value={b("not_audience").body ?? ""}
            onChange={(v) => setBlock("not_audience", { body: v })}
          />
        </AdminCard>

        {/* PROFESSOR */}
        <AdminCard title="Professor">
          <FieldGrid>
            <TextField
              label="Título da seção"
              value={b("teacher").title ?? ""}
              onChange={(v) => setBlock("teacher", { title: v })}
            />
            <TextField
              label="Nome do professor"
              value={b("teacher").subtitle ?? ""}
              onChange={(v) => setBlock("teacher", { subtitle: v })}
            />
          </FieldGrid>
          <StringListEditor
            label="Biografia (um parágrafo por linha)"
            items={list("teacher", "paragraphs")}
            onChange={(items) => setData("teacher", { paragraphs: items })}
            multiline
            addLabel="+ ADICIONAR PARÁGRAFO"
          />
          <StringListEditor
            label="Pilares"
            items={list("teacher", "pillars")}
            onChange={(items) => setData("teacher", { pillars: items })}
          />
          <TextField
            label="Frase de encerramento"
            rows={3}
            value={str("teacher", "closing")}
            onChange={(v) => setData("teacher", { closing: v })}
          />
          <FieldGrid>
            <TextField
              label="Destaque de experiência — título"
              value={str("teacher", "badge_title")}
              onChange={(v) => setData("teacher", { badge_title: v })}
            />
            <TextField
              label="Destaque de experiência — descrição"
              value={str("teacher", "badge_subtitle")}
              onChange={(v) => setData("teacher", { badge_subtitle: v })}
            />
          </FieldGrid>
          <ImageField
            label="Fotografia do professor"
            folder="professor"
            value={b("teacher").media_url ?? ""}
            onChange={(v) => setBlock("teacher", { media_url: v })}
          />
        </AdminCard>

        {/* MANIFESTO */}
        <AdminCard title="Manifesto">
          <TextField
            label="Título"
            value={b("manifesto").title ?? ""}
            onChange={(v) => setBlock("manifesto", { title: v })}
          />
          <StringListEditor
            label="Corpo (um parágrafo por linha)"
            items={list("manifesto", "paragraphs")}
            onChange={(items) => setData("manifesto", { paragraphs: items })}
            multiline
            addLabel="+ ADICIONAR PARÁGRAFO"
          />
          <TextField
            label="Frase final"
            rows={2}
            value={b("manifesto").body ?? ""}
            onChange={(v) => setBlock("manifesto", { body: v })}
          />
        </AdminCard>

        {/* SEGUNDA CAPTURA */}
        <AdminCard title="Segunda chamada de inscrição">
          <TextField
            label="Título"
            value={b("second_capture").title ?? ""}
            onChange={(v) => setBlock("second_capture", { title: v })}
          />
          <TextField
            label="Texto"
            rows={3}
            value={b("second_capture").body ?? ""}
            onChange={(v) => setBlock("second_capture", { body: v })}
          />
          <TextField
            label="Texto do botão"
            value={str("second_capture", "cta")}
            onChange={(v) => setData("second_capture", { cta: v })}
          />
        </AdminCard>

        {/* FAQ */}
        <AdminCard title="Perguntas frequentes">
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

        {/* CTA FINAL */}
        <AdminCard title="Chamada final">
          <TextField
            label="Título"
            rows={2}
            value={b("final_cta").title ?? ""}
            onChange={(v) => setBlock("final_cta", { title: v })}
          />
          <TextField
            label="Subtítulo"
            rows={2}
            value={b("final_cta").subtitle ?? ""}
            onChange={(v) => setBlock("final_cta", { subtitle: v })}
          />
          <TextField
            label="Texto de apoio"
            rows={2}
            value={b("final_cta").body ?? ""}
            onChange={(v) => setBlock("final_cta", { body: v })}
          />
          <FieldGrid>
            <TextField
              label="Frase de assinatura"
              value={str("final_cta", "quote")}
              onChange={(v) => setData("final_cta", { quote: v })}
            />
            <TextField
              label="Texto do botão"
              value={str("final_cta", "cta")}
              onChange={(v) => setData("final_cta", { cta: v })}
            />
          </FieldGrid>
        </AdminCard>

        <SaveBar pending={save.isPending} feedback={feedback} />
      </form>
    </AdminShell>
  );
}
