"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, EmptyState, Skeleton } from "@togu/design-system";
import { ApiError } from "@togu/sdk";
import { useAuth } from "@/client/auth/auth-provider";
import { formatNotificationMessage } from "@/client/notifications/format";
import { formatRelativeTime } from "@/client/notifications/format-relative-time";
import type { NotificationDto } from "@/client/notifications/types";

export default function NotificacoesPage() {
  const { http } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await http.request<{ notifications: NotificationDto[] }>("/api/v1/notifications");
      setNotifications(result.notifications);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar as notificações.");
    }
  }, [http]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarkRead(id: string) {
    setNotifications((current) =>
      current
        ? current.map((n) => (n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n))
        : current,
    );
    await http.request(`/api/v1/notifications/${id}/read`, { method: "POST" }).catch(() => {
      // Reverte silenciosamente na próxima recarga se a chamada falhar.
    });
  }

  async function handleMarkAllRead() {
    setIsMarkingAll(true);
    try {
      await http.request("/api/v1/notifications/read-all", { method: "POST" });
      await load();
    } finally {
      setIsMarkingAll(false);
    }
  }

  const hasUnread = notifications?.some((n) => !n.readAt) ?? false;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Notificações</h1>
        {hasUnread && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={isMarkingAll}>
            Marcar todas como lidas
          </Button>
        )}
      </header>

      {error && (
        <Card className="border-danger-conflict/40">
          <p className="text-sm text-danger-conflict">{error}</p>
        </Card>
      )}

      {notifications === null && !error && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {notifications !== null && notifications.length === 0 && (
        <EmptyState
          title="Nenhuma notificação por aqui"
          description="Quando algo importante acontecer nas suas solicitações e compromissos, vai aparecer aqui."
        />
      )}

      {notifications !== null &&
        notifications.map((notification) => {
          const isUnread = !notification.readAt;
          return (
            <button
              key={notification.id}
              type="button"
              onClick={() => isUnread && handleMarkRead(notification.id)}
              className="text-left"
            >
              <Card
                className={
                  isUnread
                    ? "border-primary/30 bg-primary/5 transition-colors hover:bg-primary/10"
                    : "transition-colors hover:bg-surface-hover"
                }
              >
                <div className="flex items-start gap-3">
                  {isUnread && <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">{formatNotificationMessage(notification)}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
    </div>
  );
}
