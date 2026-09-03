import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const WEBINAR_SETTINGS_KEY = "main";

export type WebinarSettings = {
  /** Título da aula (coluna `title`). */
  lessonTitle: string;
  /** URL de embed do player Panda (coluna `video_url`). */
  videoEmbedUrl: string;
  /** Texto do status da transmissão (`config.broadcast_label`). */
  broadcastLabel: string;
  /** Nome do professor (`config.teacher_name`). */
  teacherName: string;
  /** Linha de apoio da identificação (`config.lesson_subtitle`). */
  lessonSubtitle: string;
  /** Segundos até liberar a oferta (`config.offer_reveal_seconds`). Ainda não utilizado. */
  offerRevealSeconds: number;
  /** Modo de simulação (`config.simulation_mode`). Ainda não utilizado. */
  simulationMode: boolean;
};

export const webinarDefaults: WebinarSettings = {
  lessonTitle: "OLHE DIFERENTE",
  videoEmbedUrl:
    "https://player-vz-234cad63-6f8.tv.pandavideo.com.br/embed/?v=3c9224ad-dbf6-46ae-ad6d-ed09ff0db18a",
  broadcastLabel: "AULA EM ANDAMENTO",
  teacherName: "Marcos Dias",
  lessonSubtitle: "Aula online gratuita",
  offerRevealSeconds: 0,
  simulationMode: false,
};

/**
 * Remove aspas, %22 e espaços acidentais que possam ter sido salvos junto da URL,
 * e garante que só URLs http(s) sejam usadas no iframe.
 */
export function normalizeEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let value = String(raw).trim();
  value = value.replace(/%22/gi, "").replace(/["'`\s]/g, "");
  if (!/^https?:\/\//i.test(value)) return null;
  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

type Row = {
  key: string;
  title: string | null;
  video_url: string | null;
  config: unknown;
};

export function mapRow(row: Row | null | undefined): WebinarSettings {
  const config =
    row?.config && typeof row.config === "object" && !Array.isArray(row.config)
      ? (row.config as Record<string, unknown>)
      : {};

  const str = (key: string, fallback: string) =>
    typeof config[key] === "string" && (config[key] as string).trim()
      ? (config[key] as string).trim()
      : fallback;

  return {
    lessonTitle: row?.title?.trim() || webinarDefaults.lessonTitle,
    videoEmbedUrl: normalizeEmbedUrl(row?.video_url) ?? webinarDefaults.videoEmbedUrl,
    broadcastLabel: str("broadcast_label", webinarDefaults.broadcastLabel),
    teacherName: str("teacher_name", webinarDefaults.teacherName),
    lessonSubtitle: str("lesson_subtitle", webinarDefaults.lessonSubtitle),
    offerRevealSeconds:
      typeof config["offer_reveal_seconds"] === "number"
        ? (config["offer_reveal_seconds"] as number)
        : webinarDefaults.offerRevealSeconds,
    simulationMode: config["simulation_mode"] === true,
  };
}

/** Configuração pública da transmissão (leitura permitida pelo RLS para registros ativos). */
export function useWebinarSettings() {
  const query = useQuery({
    queryKey: ["webinar-settings", WEBINAR_SETTINGS_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webinar_settings")
        .select("key,title,video_url,config")
        .eq("key", WEBINAR_SETTINGS_KEY)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Row | null;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  return {
    settings: mapRow(query.data),
    isLoading: query.isLoading,
    hasRow: Boolean(query.data),
  };
}
