import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, KeyRound, RefreshCw, Trash2, UserPlus } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, FeedbackLine, FieldGrid, TextField, type Feedback } from "@/components/admin/ui";
import { ErrorState, LoadingState } from "@/components/ds/feedback";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  createAdminUser,
  listAdminUsers,
  removeAdminUser,
  resetAdminPassword,
} from "@/lib/admin-users.functions";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários — Painel OLHE DIFERENTE" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUsersPage,
});

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => chars[n % chars.length]).join("");
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const list = useServerFn(listAdminUsers);
  const create = useServerFn(createAdminUser);
  const reset = useServerFn(resetAdminPassword);
  const remove = useServerFn(removeAdminUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(() => generatePassword());
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  const onError = (error: unknown) =>
    setFeedback({
      type: "error",
      message: error instanceof Error ? error.message : "Não foi possível concluir a ação.",
    });

  const createMutation = useMutation({
    mutationFn: (vars: { email: string; password: string }) => create({ data: vars }),
    onSuccess: (_data, vars) => {
      setCreated({ email: vars.email, password: vars.password });
      setFeedback({ type: "ok", message: "Acesso criado. Entregue os dados abaixo à pessoa." });
      setEmail("");
      setPassword(generatePassword());
      void invalidate();
    },
    onError,
  });

  const resetMutation = useMutation({
    mutationFn: (vars: { userId: string; password: string }) => reset({ data: vars }),
    onSuccess: () => setFeedback({ type: "ok", message: "Nova senha definida." }),
    onError,
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => remove({ data: { userId } }),
    onSuccess: () => {
      setFeedback({ type: "ok", message: "Acesso removido." });
      void invalidate();
    },
    onError,
  });

  return (
    <AdminShell
      title="Usuários"
      description="Cadastre e gerencie quem pode entrar no painel administrativo"
    >
      <div className="space-y-8">
        <AdminCard
          title="Novo acesso administrativo"
          description="A conta já nasce confirmada: a pessoa entra direto em /auth com o e-mail e a senha definidos aqui."
        >
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setFeedback(null);
              setCreated(null);
              createMutation.mutate();
            }}
          >
            <FieldGrid>
              <TextField
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="pessoa@exemplo.com"
              />
              <TextField
                label="Senha inicial"
                value={password}
                onChange={setPassword}
                hint="Mínimo de 8 caracteres."
              />
            </FieldGrid>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="gold" disabled={createMutation.isPending}>
                <UserPlus className="size-4" />
                {createMutation.isPending ? "Criando..." : "Criar acesso"}
              </Button>
              <Button
                type="button"
                variant="quiet"
                onClick={() => setPassword(generatePassword())}
              >
                <RefreshCw className="size-4" /> Gerar senha
              </Button>
            </div>

            <FeedbackLine feedback={feedback} />

            {created ? (
              <div className="rounded-md border border-primary/40 bg-primary/5 p-4 text-sm">
                <p className="mb-2 font-medium text-foreground">Dados de acesso</p>
                <p className="text-muted-foreground">E-mail: {created.email}</p>
                <p className="text-muted-foreground">Senha: {created.password}</p>
                <Button
                  type="button"
                  variant="quiet"
                  size="sm"
                  className="mt-3"
                  onClick={() =>
                    void navigator.clipboard.writeText(
                      `E-mail: ${created.email}\nSenha: ${created.password}`,
                    )
                  }
                >
                  <Copy className="size-4" /> Copiar
                </Button>
              </div>
            ) : null}
          </form>
        </AdminCard>

        <AdminCard title="Administradores">
          {usersQuery.isLoading ? (
            <LoadingState label="Carregando usuários" />
          ) : usersQuery.isError ? (
            <ErrorState
              description={
                usersQuery.error instanceof Error
                  ? usersQuery.error.message
                  : "Não foi possível carregar a lista."
              }
            />
          ) : (usersQuery.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum administrador cadastrado.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {(usersQuery.data ?? []).map((user) => (
                <li
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Criado em {formatDate(user.createdAt)} · Último acesso{" "}
                      {formatDate(user.lastSignInAt)}
                      {user.confirmed ? "" : " · e-mail não confirmado"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="quiet"
                      size="sm"
                      disabled={resetMutation.isPending}
                      onClick={() => {
                        const next = generatePassword();
                        setFeedback(null);
                        setCreated({ email: user.email, password: next });
                        resetMutation.mutate({ userId: user.id, password: next });
                      }}
                    >
                      <KeyRound className="size-4" /> Nova senha
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="ghost" size="sm">
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover acesso</AlertDialogTitle>
                          <AlertDialogDescription>
                            {user.email} deixará de existir e não poderá mais entrar no painel.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeMutation.mutate(user.id)}>
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </AdminShell>
  );
}
