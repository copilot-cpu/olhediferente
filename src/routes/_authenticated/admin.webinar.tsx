import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AdminShell } from "@/components/admin/admin-shell";
import { LoadingState } from "@/components/ds/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import {
  WEBINAR_SETTINGS_KEY,
  hmsToSeconds,
  mapRow,
  normalizeEmbedUrl,
  secondsToHms,
  webinarDefaults,
} from "@/lib/webinar-settings";

export const Route = createFileRoute("/_authenticated/admin/webinar")({
  head: () => ({
    meta: [{ title: "Webinar — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminWebinarPage,
});

function AdminWebinarPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(webinarDefaults);
  const [revealInput, setRevealInput] = useState(secondsToHms(webinarDefaults.offerRevealSeconds));
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; message: string } | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["admin-webinar-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webinar_settings")
        .select("key,title,video_url,config")
        .eq("key", WEBINAR_SETTINGS_KEY)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

  useEffect(() => {
    if (settingsQuery.data !== undefined) {
      const mapped = mapRow(settingsQuery.data);
      setForm(mapped);
      setRevealInput(secondsToHms(mapped.offerRevealSeconds));
    }
  }, [settingsQuery.data]);

  const save = useMutation({
    mutationFn: async () => {
      const url = normalizeEmbedUrl(form.videoEmbedUrl);
      if (!url) throw new Error("Informe uma URL de vídeo válida (começando com https://).");

      const revealSeconds = hmsToSeconds(revealInput);
      if (revealSeconds === null) throw new Error("Informe o tempo da oferta no formato HH:MM:SS.");

      const existingConfig =
        settingsQuery.data?.config && typeof settingsQuery.data.config === "object"
          ? (settingsQuery.data.config as Record<string, unknown>)
          : {};

      const { error } = await supabase.from("webinar_settings").upsert(
        {
          key: WEBINAR_SETTINGS_KEY,
          title: form.lessonTitle.trim() || webinarDefaults.lessonTitle,
          video_url: url,
          is_active: true,
          config: {
            ...existingConfig,
            broadcast_label: form.broadcastLabel.trim() || webinarDefaults.broadcastLabel,
            teacher_name: form.teacherName.trim() || webinarDefaults.teacherName,
            lesson_subtitle: form.lessonSubtitle.trim() || webinarDefaults.lessonSubtitle,
            offer_reveal_seconds: revealSeconds,
            disable_forward: form.disableForward,
            simulation_mode: form.simulationMode,
            playback_speed: 1,
          },
        },
        { onConflict: "key" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      setFeedback({ type: "ok", message: "Alterações salvas." });
      void queryClient.invalidateQueries({ queryKey: ["admin-webinar-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["webinar-settings"] });
    },
    onError: (error: unknown) => {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível salvar.",
      });
    },
  });

  return (
    <AdminShell title="Webinar" description="Configurações da transmissão">
      {settingsQuery.isLoading ? (
        <LoadingState label="Carregando configurações" />
      ) : (
        <form
          className="max-w-xl space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            setFeedback(null);
            save.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="video">URL do vídeo Panda</Label>
            <Input
              id="video"
              value={form.videoEmbedUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoEmbedUrl: e.target.value }))}
              placeholder="https://player-vz-....tv.pandavideo.com.br/embed/?v=..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson">Título da aula</Label>
            <Input
              id="lesson"
              value={form.lessonTitle}
              onChange={(e) => setForm((f) => ({ ...f, lessonTitle: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Nome do professor</Label>
            <Input
              id="teacher"
              value={form.teacherName}
              onChange={(e) => setForm((f) => ({ ...f, teacherName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Texto de status da transmissão</Label>
            <Input
              id="status"
              value={form.broadcastLabel}
              onChange={(e) => setForm((f) => ({ ...f, broadcastLabel: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reveal">Tempo de liberação da oferta (HH:MM:SS)</Label>
            <Input
              id="reveal"
              value={revealInput}
              onChange={(e) => setRevealInput(e.target.value)}
              placeholder="01:04:00"
              inputMode="numeric"
            />
            <p className="text-xs text-muted-foreground">
              A oferta só aparece quando o tempo real assistido no player atinge este momento.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
            <div className="pr-4">
              <Label htmlFor="forward">Bloquear avanço do vídeo</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Usa o parâmetro oficial <code>disableForward</code> do Panda e remove a barra de
                progresso, mantendo play/pause, volume e tela cheia.
              </p>
            </div>
            <Switch
              id="forward"
              checked={form.disableForward}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, disableForward: checked }))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
            <div className="pr-4">
              <Label htmlFor="simulation">Modo de simulação</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Quando desligado, nenhum evento simulado é exibido na aula.
              </p>
            </div>
            <Switch
              id="simulation"
              checked={form.simulationMode}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, simulationMode: checked }))}
            />
          </div>

          <div className="rounded-lg border border-border/60 px-4 py-3">
            <Label>Velocidade de reprodução</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Fixada em 1x nesta versão (<code>defaultSpeed=1</code>, sem menu de velocidade).
            </p>
          </div>

          {feedback ? (
            <p
              className={
                feedback.type === "ok"
                  ? "text-sm text-primary"
                  : "text-sm text-destructive"
              }
            >
              {feedback.message}
            </p>
          ) : null}

          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Salvando…" : "SALVAR ALTERAÇÕES"}
          </Button>
        </form>
      )}
    </AdminShell>
  );
}
