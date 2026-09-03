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
import { normalizeViewerCurve, type ViewerCheckpoint } from "@/lib/viewer-curve";

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
  const [curve, setCurve] = useState<ViewerCheckpoint[]>(webinarDefaults.viewerCurve);
  const [pointTime, setPointTime] = useState("00:00:00");
  const [pointViewers, setPointViewers] = useState("100");
  const [curveError, setCurveError] = useState<string | null>(null);

  const addPoint = () => {
    setCurveError(null);
    const seconds = hmsToSeconds(pointTime);
    if (seconds === null) {
      setCurveError("Informe o horário no formato HH:MM:SS.");
      return;
    }
    const viewers = Number(pointViewers);
    if (!Number.isInteger(viewers) || viewers < 0) {
      setCurveError("A quantidade deve ser um número inteiro maior ou igual a zero.");
      return;
    }
    if (curve.some((point) => point.time === seconds)) {
      setCurveError("Já existe um ponto neste segundo.");
      return;
    }
    setCurve((points) =>
      [...points, { time: seconds, viewers }].sort((a, b) => a.time - b.time),
    );
  };

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
      setCurve(mapped.viewerCurve);
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
            viewer_counter_enabled: form.viewerCounterEnabled,
            viewer_simulation_enabled: form.viewerSimulationEnabled,
            viewer_label: form.viewerLabel.trim() || webinarDefaults.viewerLabel,
            viewer_curve: normalizeViewerCurve(curve),
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

          <section className="space-y-4 rounded-lg border border-border/60 px-4 py-4">
            <div>
              <h2 className="text-overline">Atividade da transmissão</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Camada visual de audiência. Hoje apenas dados simulados — independente da
                simulação de compras.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="viewer-on">Exibir contador de audiência</Label>
              <Switch
                id="viewer-on"
                checked={form.viewerCounterEnabled}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, viewerCounterEnabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="viewer-sim">Usar audiência simulada</Label>
              <Switch
                id="viewer-sim"
                checked={form.viewerSimulationEnabled}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, viewerSimulationEnabled: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="viewer-label">Texto do contador</Label>
              <Input
                id="viewer-label"
                value={form.viewerLabel}
                onChange={(e) => setForm((f) => ({ ...f, viewerLabel: e.target.value }))}
                placeholder="pessoas acompanhando"
              />
            </div>

            <div className="space-y-3">
              <Label>Curva de audiência</Label>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-sm">
                  <thead>
                    <tr className="text-overline text-muted-foreground">
                      <th className="py-1 text-left">Horário</th>
                      <th className="py-1 text-left">Pessoas</th>
                      <th className="py-1 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curve.map((point) => (
                      <tr key={point.time} className="border-t border-border/40">
                        <td className="py-1.5 tabular-nums">{secondsToHms(point.time)}</td>
                        <td className="py-1.5">
                          <Input
                            className="h-8 w-24"
                            value={String(point.viewers)}
                            inputMode="numeric"
                            onChange={(e) => {
                              const viewers = Number(e.target.value);
                              setCurve((points) =>
                                points.map((p) =>
                                  p.time === point.time
                                    ? {
                                        ...p,
                                        viewers:
                                          Number.isFinite(viewers) && viewers >= 0
                                            ? Math.floor(viewers)
                                            : 0,
                                      }
                                    : p,
                                ),
                              );
                            }}
                          />
                        </td>
                        <td className="py-1.5 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setCurve((points) => points.filter((p) => p.time !== point.time))
                            }
                          >
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <Label htmlFor="point-time" className="text-xs">
                    Horário
                  </Label>
                  <Input
                    id="point-time"
                    className="h-9 w-32"
                    value={pointTime}
                    onChange={(e) => setPointTime(e.target.value)}
                    placeholder="00:05:00"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="point-viewers" className="text-xs">
                    Pessoas
                  </Label>
                  <Input
                    id="point-viewers"
                    className="h-9 w-28"
                    value={pointViewers}
                    inputMode="numeric"
                    onChange={(e) => setPointViewers(e.target.value)}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={addPoint}>
                  + ADICIONAR PONTO
                </Button>
              </div>
              {curveError ? <p className="text-sm text-destructive">{curveError}</p> : null}
            </div>
          </section>

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
