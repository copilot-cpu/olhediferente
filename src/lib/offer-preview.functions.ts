import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

/**
 * Link secreto de pré-visualização da oferta.
 * O código fica em `site_settings` (linha privada) e é conferido no servidor,
 * nunca exposto ao navegador de quem não é administrador.
 */

export const PREVIEW_SETTINGS_KEY = "offer_preview";

async function assertAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Não foi possível validar suas permissões.");
  if (!data) throw new Error("Apenas administradores podem gerenciar a pré-visualização.");
}

function readToken(value: unknown): string {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const token = (value as Record<string, unknown>)["token"];
    if (typeof token === "string") return token.trim();
  }
  return "";
}

function newToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

async function currentToken(): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", PREVIEW_SETTINGS_KEY)
    .maybeSingle();
  if (error) throw new Error(error.message);

  const token = readToken(data?.value);
  if (token) return token;

  const created = newToken();
  const { error: upsertError } = await supabaseAdmin
    .from("site_settings")
    .upsert(
      { key: PREVIEW_SETTINGS_KEY, value: { token: created }, is_public: false },
      { onConflict: "key" },
    );
  if (upsertError) throw new Error(upsertError.message);
  return created;
}

/** Público: confere o código do link secreto (não devolve o código). */
export const checkOfferPreviewToken = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string }) => ({
    token: typeof input?.token === "string" ? input.token.trim() : "",
  }))
  .handler(async ({ data }): Promise<{ valid: boolean }> => {
    if (!data.token || data.token.length < 8) return { valid: false };
    try {
      const token = await currentToken();
      return { valid: Boolean(token) && token === data.token };
    } catch {
      return { valid: false };
    }
  });

/** Admin: devolve o código atual para montar o link no painel. */
export const getOfferPreviewToken = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ token: string }> => {
    await assertAdmin(context);
    return { token: await currentToken() };
  });

/** Admin: gera um novo código (invalida o link anterior). */
export const rotateOfferPreviewToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ token: string }> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const token = newToken();
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert(
        { key: PREVIEW_SETTINGS_KEY, value: { token }, is_public: false },
        { onConflict: "key" },
      );
    if (error) throw new Error(error.message);
    return { token };
  });
