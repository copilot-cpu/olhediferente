import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { captureDefaults, type CaptureBlock } from "@/content/capture-defaults";

type Row = {
  block_key: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  media_url: string | null;
  data: unknown;
};

function merge(rows: Row[]): Record<string, CaptureBlock> {
  const merged: Record<string, CaptureBlock> = {};
  for (const [key, block] of Object.entries(captureDefaults)) {
    merged[key] = { ...block, data: { ...(block.data ?? {}) } };
  }
  for (const row of rows) {
    const base = merged[row.block_key] ?? {};
    const overrideData =
      row.data && typeof row.data === "object" && !Array.isArray(row.data)
        ? (row.data as Record<string, unknown>)
        : {};
    merged[row.block_key] = {
      ...base,
      ...(row.title ? { title: row.title } : {}),
      ...(row.subtitle ? { subtitle: row.subtitle } : {}),
      ...(row.body ? { body: row.body } : {}),
      ...(row.media_url ? { media_url: row.media_url } : {}),
      data: { ...(base.data ?? {}), ...overrideData },
    };
  }
  return merged;
}

/**
 * Copy da landing: defaults locais + overrides ativos de `capture_page_content`.
 * Renderiza imediatamente com os defaults e substitui quando o banco responde.
 */
export function useCaptureContent() {
  const { data } = useQuery({
    queryKey: ["capture-page-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capture_page_content")
        .select("block_key,title,subtitle,body,media_url,data")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const blocks = merge(data ?? []);

  function block(key: string): CaptureBlock {
    return blocks[key] ?? {};
  }

  function field<T>(key: string, path: string, fallback: T): T {
    const value = (block(key).data ?? {})[path];
    return (value === undefined || value === null ? fallback : value) as T;
  }

  return { block, field };
}
