import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { offerDefaults, type OfferBlock } from "@/content/offer-defaults";

export type OfferRow = {
  block_key: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  price_label: string | null;
  guarantee: string | null;
  checkout_url: string | null;
  bonuses: unknown;
};

export const OFFER_SELECT =
  "block_key,title,subtitle,body,price_label,guarantee,checkout_url,bonuses";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Defaults locais + overrides das linhas de `offer_content`. */
export function mergeOfferRows(rows: OfferRow[]): Record<string, OfferBlock> {
  const merged: Record<string, OfferBlock> = {};
  for (const [key, block] of Object.entries(offerDefaults)) {
    merged[key] = { ...block, data: { ...(block.data ?? {}) } };
  }
  for (const row of rows) {
    const base = merged[row.block_key] ?? {};
    merged[row.block_key] = {
      ...base,
      ...(row.title ? { title: row.title } : {}),
      ...(row.subtitle ? { subtitle: row.subtitle } : {}),
      ...(row.body ? { body: row.body } : {}),
      ...(row.price_label ? { price_label: row.price_label } : {}),
      ...(row.guarantee ? { guarantee: row.guarantee } : {}),
      ...(row.checkout_url ? { checkout_url: row.checkout_url } : {}),
      data: { ...(base.data ?? {}), ...asRecord(row.bonuses) },
    };
  }
  return merged;
}

export type OfferContent = {
  block: (key: string) => OfferBlock;
  field: <T>(key: string, path: string, fallback: T) => T;
  /** Valores essenciais, com fallback local e override do banco. */
  offer: {
    name: string;
    promise: string;
    price: string;
    installments: string;
    checkoutUrl: string;
    cta: string;
    stickyTitle: string;
    stickyPrice: string;
    stickyCta: string;
    microcopy: string;
  };
};

function safeUrl(raw: unknown): string {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!/^https?:\/\//i.test(value)) return "";
  try {
    return new URL(value).toString();
  } catch {
    return "";
  }
}

export function buildOfferContent(blocks: Record<string, OfferBlock>): OfferContent {
  const block = (key: string): OfferBlock => blocks[key] ?? {};
  function field<T>(key: string, path: string, fallback: T): T {
    const value = (block(key).data ?? {})[path];
    return (value === undefined || value === null ? fallback : value) as T;
  }

  const offerBlock = block("offer");

  return {
    block,
    field,
    offer: {
      name: offerBlock.title?.trim() || "",
      promise: offerBlock.subtitle?.trim() || "",
      price: offerBlock.price_label?.trim() || "",
      installments: offerBlock.body?.trim() || "",
      checkoutUrl: safeUrl(offerBlock.checkout_url),
      cta: field("offer", "cta", "QUERO COMEÇAR MINHA FORMAÇÃO"),
      stickyTitle: field("offer", "sticky_title", offerBlock.title?.trim() || ""),
      stickyPrice: field("offer", "sticky_price", offerBlock.price_label?.trim() || ""),
      stickyCta: field("offer", "sticky_cta", "QUERO COMEÇAR"),
      microcopy: field("offer", "microcopy", ""),
    },
  };
}

/** Conteúdo público da oferta (RLS permite leitura de linhas ativas). */
export function useOfferContent(): OfferContent {
  const { data } = useQuery({
    queryKey: ["offer-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offer_content")
        .select(OFFER_SELECT)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as OfferRow[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return buildOfferContent(mergeOfferRows(data ?? []));
}
