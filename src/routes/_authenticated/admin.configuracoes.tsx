import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminCard,
  FieldGrid,
  ImageField,
  SaveBar,
  TextField,
  type Feedback,
} from "@/components/admin/ui";
import { ErrorState, LoadingState } from "@/components/ds/feedback";
import { supabase } from "@/integrations/supabase/client";
import {
  SITE_SETTINGS_KEY,
  mapSiteSettings,
  siteDefaults,
  type SiteSettings,
} from "@/lib/site-settings";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Painel OLHE DIFERENTE" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SiteSettings>(siteDefaults);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const settingsQuery = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key,value")
        .eq("key", SITE_SETTINGS_KEY)
        .maybeSingle();
      if (error) throw error;
      return data?.value ?? null;
    },
  });

  useEffect(() => {
    if (settingsQuery.data !== undefined) setForm(mapSiteSettings(settingsQuery.data));
  }, [settingsQuery.data]);

  const save = useMutation({
    mutationFn: async (value: SiteSettings) => {
      const base = value.baseUrl.trim();
      if (base && !/^https?:\/\//i.test(base)) {
        throw new Error("A URL base deve começar com http:// ou https://");
      }
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          {
            key: SITE_SETTINGS_KEY,
            value: value as unknown as never,
            is_public: true,
          },
          { onConflict: "key" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      setFeedback({ type: "ok", message: "Alterações salvas." });
      void queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (error: unknown) =>
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível salvar.",
      }),
  });

  if (settingsQuery.isLoading) {
    return (
      <AdminShell title="Configurações" description="Ajustes gerais do projeto">
        <LoadingState label="Carregando configurações" />
      </AdminShell>
    );
  }

  if (settingsQuery.isError) {
    return (
      <AdminShell title="Configurações" description="Ajustes gerais do projeto">
        <ErrorState description="Não foi possível carregar as configurações." />
      </AdminShell>
    );
  }

  const set = (patch: Partial<SiteSettings>) => {
    setFeedback(null);
    setForm((f) => ({ ...f, ...patch }));
  };

  return (
    <AdminShell title="Configurações" description="Ajustes gerais do projeto">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          setFeedback(null);
          save.mutate(form);
        }}
      >
        <AdminCard title="Identificação">
          <FieldGrid>
            <TextField
              label="Nome do projeto"
              value={form.projectName}
              onChange={(v) => set({ projectName: v })}
            />
            <TextField
              label="Nome do professor"
              value={form.teacherName}
              onChange={(v) => set({ teacherName: v })}
            />
          </FieldGrid>
          <FieldGrid>
            <TextField
              label="E-mail administrativo (opcional)"
              type="email"
              value={form.adminEmail}
              onChange={(v) => set({ adminEmail: v })}
            />
            <TextField
              label="URL base do site (opcional)"
              placeholder="https://"
              hint="Usada como endereço canônico das páginas públicas."
              value={form.baseUrl}
              onChange={(v) => set({ baseUrl: v })}
            />
          </FieldGrid>
        </AdminCard>

        <AdminCard
          title="Compartilhamento (Open Graph)"
          description="Como o link da página de captação aparece ao ser compartilhado."
        >
          <TextField
            label="OG title"
            hint="Ideal até 60 caracteres."
            value={form.ogTitle}
            onChange={(v) => set({ ogTitle: v })}
          />
          <TextField
            label="OG description"
            rows={3}
            hint="Ideal até 160 caracteres."
            value={form.ogDescription}
            onChange={(v) => set({ ogDescription: v })}
          />
          <ImageField
            label="OG image"
            hint="Imagem exibida ao compartilhar o link."
            folder="og"
            value={form.ogImage}
            onChange={(v) => set({ ogImage: v })}
          />
        </AdminCard>

        <AdminCard title="Rodapé">
          <TextField
            label="Texto do rodapé"
            rows={2}
            value={form.footerText}
            onChange={(v) => set({ footerText: v })}
          />
        </AdminCard>

        <SaveBar pending={save.isPending} feedback={feedback} />
      </form>
    </AdminShell>
  );
}
