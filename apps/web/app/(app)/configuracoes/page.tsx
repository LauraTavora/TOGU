"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Skeleton, cn } from "@fecho/design-system";
import { ApiError } from "@fecho/sdk";
import { useAuth } from "@/client/auth/auth-provider";
import { PRIORITY_LEVEL_LABEL, PRIORITY_TARGET_TYPE_LABEL } from "@/client/settings/format";
import { PriorityRuleFormDialog } from "@/client/settings/priority-rule-form-dialog";
import { AccountDeletionDialog } from "@/client/settings/account-deletion-dialog";
import type { NotificationPreferencesDto, PriorityLevel, PriorityRuleDto, PriorityTargetType } from "@/client/settings/types";

const ACCOUNT_DELETION_GRACE_PERIOD_DAYS = 14;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

interface AccountDeletionStatusDto {
  requestedAt: string | null;
  scheduledDeletionAt: string | null;
}

interface CircleOption {
  id: string;
  name: string;
}

const PREFERENCE_FIELDS: { key: keyof Omit<NotificationPreferencesDto, "userId">; label: string }[] = [
  { key: "inApp", label: "No app" },
  { key: "email", label: "Por e-mail" },
  { key: "push", label: "Push (celular)" },
  { key: "webPush", label: "Push no navegador" },
];

export default function ConfiguracoesPage() {
  const { http, userId, logout } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferencesDto | null>(null);
  const [rules, setRules] = useState<PriorityRuleDto[] | null>(null);
  const [circles, setCircles] = useState<CircleOption[]>([]);
  const [labelById, setLabelById] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [ruleFormOpen, setRuleFormOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<AccountDeletionStatusDto | null>(null);
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCancelingDeletion, setIsCancelingDeletion] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [
        { users },
        { preferences: fetchedPreferences },
        { rules: fetchedRules },
        { circles: fetchedCircles },
        fetchedDeletionStatus,
      ] = await Promise.all([
        http.request<{ users: { id: string; email: string }[] }>(`/api/v1/users?ids=${userId}`),
        http.request<{ preferences: NotificationPreferencesDto }>("/api/v1/notifications/preferences"),
        http.request<{ rules: PriorityRuleDto[] }>("/api/v1/priority/rules"),
        http.request<{ circles: CircleOption[] }>("/api/v1/circles"),
        http.request<AccountDeletionStatusDto>("/api/v1/account/deletion"),
      ]);

      setEmail(users[0]?.email ?? null);
      setPreferences(fetchedPreferences);
      setRules(fetchedRules);
      setCircles(fetchedCircles);
      setDeletionStatus(fetchedDeletionStatus);
      setError(null);

      const circleNameById = Object.fromEntries(fetchedCircles.map((circle) => [circle.id, circle.name]));
      const personIds = fetchedRules.filter((rule) => rule.targetType === "PERSON").map((rule) => rule.targetId);
      let personEmailById: Record<string, string> = {};
      if (personIds.length > 0) {
        const { users: personUsers } = await http.request<{ users: { id: string; email: string }[] }>(
          `/api/v1/users?ids=${personIds.join(",")}`,
        );
        personEmailById = Object.fromEntries(personUsers.map((user) => [user.id, user.email]));
      }
      setLabelById({ ...circleNameById, ...personEmailById });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar suas configurações.");
    }
  }, [http, userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleTogglePreference(key: keyof Omit<NotificationPreferencesDto, "userId">) {
    if (!preferences) return;
    const nextValue = !preferences[key];
    setPreferences({ ...preferences, [key]: nextValue });
    try {
      const { preferences: updated } = await http.request<{ preferences: NotificationPreferencesDto }>(
        "/api/v1/notifications/preferences",
        { method: "PATCH", body: JSON.stringify({ [key]: nextValue }) },
      );
      setPreferences(updated);
    } catch {
      await load();
    }
  }

  async function handleCreateRule(targetType: PriorityTargetType, rawTargetId: string, level: PriorityLevel) {
    let targetId = rawTargetId;
    if (targetType === "PERSON") {
      const { user } = await http.request<{ user: { id: string; email: string } | null }>(
        `/api/v1/users?email=${encodeURIComponent(rawTargetId)}`,
      );
      if (!user) {
        throw new Error("Não encontramos ninguém no Fechô com esse e-mail.");
      }
      targetId = user.id;
    }
    await http.request("/api/v1/priority/rules", {
      method: "POST",
      body: JSON.stringify({ targetType, targetId, level }),
    });
    setRuleFormOpen(false);
    await load();
  }

  async function handleRemoveRule(rule: PriorityRuleDto) {
    await http.request(`/api/v1/priority/rules/${rule.targetType}/${rule.targetId}`, { method: "DELETE" });
    await load();
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
  }

  async function handleExportData() {
    setPrivacyError(null);
    setIsExporting(true);
    try {
      await http.download("/api/v1/account/export", `fecho-dados-${userId}.json`);
    } catch (err) {
      setPrivacyError(err instanceof ApiError ? err.message : "Não foi possível exportar seus dados.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleRequestDeletion(password: string) {
    await http.request("/api/v1/account/deletion", { method: "POST", body: JSON.stringify({ password }) });
    setDeletionDialogOpen(false);
    await load();
  }

  async function handleCancelDeletion() {
    setPrivacyError(null);
    setIsCancelingDeletion(true);
    try {
      await http.request("/api/v1/account/deletion", { method: "DELETE" });
      await load();
    } catch (err) {
      setPrivacyError(err instanceof ApiError ? err.message : "Não foi possível cancelar a exclusão.");
    } finally {
      setIsCancelingDeletion(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">Configurações</h1>
      </header>

      {error && (
        <Card className="border-danger-conflict/40">
          <p className="text-sm text-danger-conflict">{error}</p>
        </Card>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Perfil</h2>
        <Card className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">{email ?? <Skeleton className="h-4 w-40" />}</p>
            <Link href="/esqueci-a-senha" className="text-xs text-primary hover:underline">
              Trocar senha
            </Link>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Saindo..." : "Sair"}
          </Button>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Notificações</h2>
        <Card className="flex flex-col gap-3">
          {preferences === null && !error ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            preferences &&
            PREFERENCE_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center justify-between gap-3">
                <span className="text-sm text-text-primary">{field.label}</span>
                <button
                  type="button"
                  onClick={() => handleTogglePreference(field.key)}
                  className={cn(
                    "rounded-pill px-3 py-1 text-xs font-medium transition-colors",
                    preferences[field.key]
                      ? "bg-primary text-white"
                      : "border border-border bg-surface text-text-secondary",
                  )}
                >
                  {preferences[field.key] ? "Ativado" : "Desativado"}
                </button>
              </div>
            ))
          )}
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Prioridades</h2>
          <Button size="sm" variant="ghost" onClick={() => setRuleFormOpen(true)}>
            Nova regra
          </Button>
        </div>

        {rules === null && !error && <Skeleton className="h-20 w-full" />}

        {rules !== null && rules.length === 0 && (
          <Card>
            <p className="text-sm text-text-secondary">
              Nenhuma regra ainda. Solicitações de quem você prioriza sobem na sua Central de Solicitações.
            </p>
          </Card>
        )}

        {rules !== null && rules.length > 0 && (
          <Card className="flex flex-col gap-3">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-text-primary">
                    {labelById[rule.targetId] ?? rule.targetId}
                  </p>
                  <p className="text-xs text-text-secondary">{PRIORITY_TARGET_TYPE_LABEL[rule.targetType]}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone="primary">{PRIORITY_LEVEL_LABEL[rule.level]}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveRule(rule)}>
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Privacidade</h2>

        {privacyError && (
          <p role="alert" className="text-sm text-danger-conflict">
            {privacyError}
          </p>
        )}

        {deletionStatus?.scheduledDeletionAt ? (
          <Card className="flex items-center justify-between gap-3 border-danger-conflict/40">
            <p className="text-sm text-text-primary">
              Sua conta será excluída em{" "}
              <strong>{dateFormatter.format(new Date(deletionStatus.scheduledDeletionAt))}</strong>.
            </p>
            <Button variant="secondary" size="sm" onClick={handleCancelDeletion} disabled={isCancelingDeletion}>
              {isCancelingDeletion ? "Cancelando..." : "Cancelar exclusão"}
            </Button>
          </Card>
        ) : (
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Exportar meus dados</p>
                <p className="text-xs text-text-secondary">Baixa um arquivo com tudo que sabemos sobre você.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleExportData} disabled={isExporting}>
                {isExporting ? "Exportando..." : "Exportar"}
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Apagar minha conta</p>
                <p className="text-xs text-text-secondary">
                  Agenda a exclusão com {ACCOUNT_DELETION_GRACE_PERIOD_DAYS} dias de carência.
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setDeletionDialogOpen(true)}>
                Apagar conta
              </Button>
            </div>
          </Card>
        )}
      </section>

      <PriorityRuleFormDialog
        open={ruleFormOpen}
        onClose={() => setRuleFormOpen(false)}
        circles={circles}
        onSubmit={handleCreateRule}
      />

      <AccountDeletionDialog
        open={deletionDialogOpen}
        onClose={() => setDeletionDialogOpen(false)}
        gracePeriodDays={ACCOUNT_DELETION_GRACE_PERIOD_DAYS}
        onConfirm={handleRequestDeletion}
      />
    </div>
  );
}
