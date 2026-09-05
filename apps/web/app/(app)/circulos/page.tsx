"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar, Button, Card, EmptyState, Skeleton } from "@togu/design-system";
import { ApiError } from "@togu/sdk";
import { useAuth } from "@/client/auth/auth-provider";
import { CircleFormDialog } from "@/client/circles/circle-form-dialog";
import { AddMemberDialog } from "@/client/circles/add-member-dialog";
import type { CircleDto, CircleMemberDto } from "@/client/circles/types";

interface FormDialogState {
  open: boolean;
  circle: CircleDto | null;
}

export default function CirculosPage() {
  const { http } = useAuth();
  const [circles, setCircles] = useState<CircleDto[] | null>(null);
  const [membersByCircle, setMembersByCircle] = useState<Record<string, CircleMemberDto[]>>({});
  const [emailById, setEmailById] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedCircleId, setExpandedCircleId] = useState<string | null>(null);
  const [formDialog, setFormDialog] = useState<FormDialogState>({ open: false, circle: null });
  const [addMemberCircleId, setAddMemberCircleId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ circleId: string; message: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const { circles: fetchedCircles } = await http.request<{ circles: CircleDto[] }>("/api/v1/circles");
      setCircles(fetchedCircles);
      setError(null);

      const memberEntries = await Promise.all(
        fetchedCircles.map(async (circle) => {
          const { members } = await http.request<{ members: CircleMemberDto[] }>(
            `/api/v1/circles/${circle.id}/members`,
          );
          return [circle.id, members] as const;
        }),
      );
      const membersMap = Object.fromEntries(memberEntries);
      setMembersByCircle(membersMap);

      const allUserIds = new Set<string>();
      Object.values(membersMap).forEach((members) => members.forEach((member) => allUserIds.add(member.userId)));
      if (allUserIds.size > 0) {
        const { users } = await http.request<{ users: { id: string; email: string }[] }>(
          `/api/v1/users?ids=${Array.from(allUserIds).join(",")}`,
        );
        setEmailById(Object.fromEntries(users.map((user) => [user.id, user.email])));
      } else {
        setEmailById({});
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar seus círculos.");
    }
  }, [http]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreateDialog() {
    setFormDialog({ open: true, circle: null });
  }

  function openRenameDialog(circle: CircleDto) {
    setFormDialog({ open: true, circle });
  }

  function closeFormDialog() {
    setFormDialog({ open: false, circle: null });
  }

  async function handleFormSubmit(name: string) {
    if (formDialog.circle) {
      await http.request(`/api/v1/circles/${formDialog.circle.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
    } else {
      await http.request("/api/v1/circles", { method: "POST", body: JSON.stringify({ name }) });
    }
    closeFormDialog();
    await load();
  }

  async function handleDelete(circleId: string) {
    if (confirmDeleteId !== circleId) {
      setConfirmDeleteId(circleId);
      return;
    }
    setConfirmDeleteId(null);
    try {
      await http.request(`/api/v1/circles/${circleId}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setRowError({
        circleId,
        message: err instanceof ApiError ? err.message : "Não foi possível excluir o círculo.",
      });
    }
  }

  async function handleAddMember(circleId: string, email: string) {
    const { user } = await http.request<{ user: { id: string; email: string } | null }>(
      `/api/v1/users?email=${encodeURIComponent(email)}`,
    );
    if (!user) {
      throw new Error("Não encontramos ninguém no TOGU com esse e-mail.");
    }
    await http.request(`/api/v1/circles/${circleId}/members`, {
      method: "POST",
      body: JSON.stringify({ userId: user.id }),
    });
    setAddMemberCircleId(null);
    await load();
  }

  async function handleRemoveMember(circleId: string, userId: string) {
    try {
      await http.request(`/api/v1/circles/${circleId}/members/${userId}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setRowError({
        circleId,
        message: err instanceof ApiError ? err.message : "Não foi possível remover essa pessoa.",
      });
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Círculos</h1>
          <p className="text-sm text-text-secondary">Agrupe pessoas para organizar prioridade e convites.</p>
        </div>
        <Button onClick={openCreateDialog}>Novo</Button>
      </header>

      {error && (
        <Card className="border-danger-conflict/40">
          <p className="text-sm text-danger-conflict">{error}</p>
        </Card>
      )}

      {circles === null && !error && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {circles !== null && circles.length === 0 && (
        <EmptyState
          title="Nenhum círculo ainda"
          description="Crie círculos para agrupar amigos, família ou colegas de trabalho."
          action={
            <Button size="sm" onClick={openCreateDialog}>
              Criar círculo
            </Button>
          }
        />
      )}

      {circles !== null && (
        <div className="flex flex-col gap-3">
          {circles.map((circle) => {
            const members = membersByCircle[circle.id] ?? [];
            const isExpanded = expandedCircleId === circle.id;

            return (
              <Card key={circle.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setExpandedCircleId(isExpanded ? null : circle.id)}
                  >
                    <p className="truncate text-sm font-medium text-text-primary">{circle.name}</p>
                    <p className="text-xs text-text-secondary">
                      {members.length} {members.length === 1 ? "membro" : "membros"}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openRenameDialog(circle)}>
                      Renomear
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(circle.id)}>
                      {confirmDeleteId === circle.id ? "Confirmar" : "Excluir"}
                    </Button>
                  </div>
                </div>

                {rowError?.circleId === circle.id && (
                  <p role="alert" className="text-sm text-danger-conflict">
                    {rowError.message}
                  </p>
                )}

                {isExpanded && (
                  <div className="flex flex-col gap-2 border-t border-border pt-3">
                    {members.length === 0 && (
                      <p className="text-sm text-text-secondary">Nenhum membro ainda.</p>
                    )}
                    {members.map((member) => {
                      const email = emailById[member.userId] ?? member.userId;
                      return (
                        <div key={member.id} className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <Avatar name={email} size="sm" />
                            <span className="truncate text-sm text-text-primary">{email}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(circle.id, member.userId)}
                          >
                            Remover
                          </Button>
                        </div>
                      );
                    })}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="self-start"
                      onClick={() => setAddMemberCircleId(circle.id)}
                    >
                      Adicionar membro
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <CircleFormDialog
        open={formDialog.open}
        onClose={closeFormDialog}
        circle={formDialog.circle}
        onSubmit={handleFormSubmit}
      />

      <AddMemberDialog
        open={addMemberCircleId !== null}
        onClose={() => setAddMemberCircleId(null)}
        onAdd={(email) => handleAddMember(addMemberCircleId!, email)}
      />
    </div>
  );
}
