import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminUser = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  confirmed: boolean;
};

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Não foi possível validar suas permissões.");
  if (!data) throw new Error("Apenas administradores podem gerenciar acessos.");
}

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUser[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("admin_roles")
      .select("user_id")
      .eq("role", "admin");
    if (rolesError) throw new Error(rolesError.message);
    const ids = new Set((roles ?? []).map((r) => r.user_id));

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (error) throw new Error(error.message);

    return data.users
      .filter((u) => ids.has(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email ?? "(sem e-mail)",
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        confirmed: Boolean(u.email_confirmed_at),
      }))
      .sort((a, b) => a.email.localeCompare(b.email));
  });

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; password: string }) => {
    const email = String(input.email ?? "").trim().toLowerCase();
    const password = String(input.password ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Informe um e-mail válido.");
    if (password.length < 8) throw new Error("A senha deve ter pelo menos 8 caracteres.");
    return { email, password };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) {
      throw new Error(
        error?.message?.toLowerCase().includes("already")
          ? "Já existe uma conta com esse e-mail."
          : (error?.message ?? "Não foi possível criar o acesso."),
      );
    }

    const { error: roleError } = await supabaseAdmin
      .from("admin_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleError && !roleError.message.includes("duplicate")) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error("Conta criada, mas a permissão falhou. Tente novamente.");
    }

    return { id: created.user.id, email: data.email };
  });

export const resetAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; password: string }) => {
    const userId = String(input.userId ?? "");
    const password = String(input.password ?? "");
    if (!userId) throw new Error("Usuário inválido.");
    if (password.length < 8) throw new Error("A senha deve ter pelo menos 8 caracteres.");
    return { userId, password };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => {
    const userId = String(input.userId ?? "");
    if (!userId) throw new Error("Usuário inválido.");
    return { userId };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) {
      throw new Error("Você não pode remover o seu próprio acesso.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("admin_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
