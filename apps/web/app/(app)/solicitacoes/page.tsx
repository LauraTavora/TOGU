"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, EmptyState, Skeleton, cn } from "@fecho/design-system";
import type { StatusKind } from "@fecho/design-system";
import { ApiError } from "@fecho/sdk";
import { useAuth } from "@/client/auth/auth-provider";
import { RequestCard } from "@/client/meeting-requests/request-card";
import {
  buildCounterpartyLabel,
  toAvailabilityStatusKind,
  type AvailabilityCheckStatus,
} from "@/client/meeting-requests/format";
import { isOpenStatus, resolveEffectiveTimeRange, resolveProposingPartyId } from "@/client/meeting-requests/negotiation";
import type { CounterProposeValues } from "@/client/meeting-requests/counter-propose-dialog";
import type { CounterProposalDto, MeetingRequestDto, MeetingRequestStatus } from "@/client/meeting-requests/types";

type Box = "received" | "sent";
type StatusFilter = MeetingRequestStatus | "ALL";
type SortMode = "priority" | "recent";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "PENDING", label: "Aguardando" },
  { value: "COUNTER_PROPOSED", label: "Propostas" },
  { value: "ACCEPTED", label: "Aceitas" },
  { value: "DECLINED", label: "Negadas" },
  { value: "CANCELLED", label: "Canceladas" },
  { value: "EXPIRED", label: "Expiradas" },
];

interface AvailabilityCheckResponse {
  status: AvailabilityCheckStatus;
}

export default function SolicitacoesPage() {
  const { http, userId } = useAuth();
  const [box, setBox] = useState<Box>("received");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [requests, setRequests] = useState<MeetingRequestDto[] | null>(null);
  const [emailById, setEmailById] = useState<Record<string, string>>({});
  const [counterProposalsById, setCounterProposalsById] = useState<Record<string, CounterProposalDto[]>>({});
  const [availabilityById, setAvailabilityById] = useState<Record<string, StatusKind>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const query = new URLSearchParams({ box });
      if (statusFilter !== "ALL") query.set("status", statusFilter);
      if (box === "received") query.set("sort", sortMode);

      const { meetingRequests } = await http.request<{ meetingRequests: MeetingRequestDto[] }>(
        `/api/v1/meeting-requests?${query.toString()}`,
      );
      setRequests(meetingRequests);
      setError(null);

      const otherIds = new Set<string>();
      for (const request of meetingRequests) {
        otherIds.add(request.requesterId);
        request.participantUserIds.forEach((id) => otherIds.add(id));
      }
      otherIds.delete(userId);
      if (otherIds.size > 0) {
        const { users } = await http.request<{ users: { id: string; email: string }[] }>(
          `/api/v1/users?ids=${Array.from(otherIds).join(",")}`,
        );
        setEmailById(Object.fromEntries(users.map((user) => [user.id, user.email])));
      } else {
        setEmailById({});
      }

      const counteredRequests = meetingRequests.filter((request) => request.status === "COUNTER_PROPOSED");
      const counterProposalEntries = await Promise.all(
        counteredRequests.map(async (request) => {
          const { counterProposals } = await http.request<{ counterProposals: CounterProposalDto[] }>(
            `/api/v1/meeting-requests/${request.id}/counter-proposals`,
          );
          return [request.id, counterProposals] as const;
        }),
      );
      const counterProposalsMap = Object.fromEntries(counterProposalEntries);
      setCounterProposalsById(counterProposalsMap);

      const actionableRequests = meetingRequests.filter((request) => {
        const proposingPartyId = resolveProposingPartyId(request, counterProposalsMap[request.id] ?? []);
        return isOpenStatus(request.status) && proposingPartyId !== userId;
      });
      const availabilityEntries = await Promise.all(
        actionableRequests.map(async (request) => {
          const { startAt, endAt } = resolveEffectiveTimeRange(request, counterProposalsMap[request.id] ?? []);
          const result = await http.request<AvailabilityCheckResponse>("/api/v1/availability/check", {
            method: "POST",
            body: JSON.stringify({ participantIds: [userId], start: startAt, end: endAt }),
          });
          return [request.id, toAvailabilityStatusKind(result.status)] as const;
        }),
      );
      setAvailabilityById(Object.fromEntries(availabilityEntries));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar as solicitações.");
    }
  }, [http, userId, box, statusFilter, sortMode]);

  useEffect(() => {
    setRequests(null);
    load();
  }, [load]);

  async function handleAccept(id: string) {
    await http.request(`/api/v1/meeting-requests/${id}/accept`, { method: "POST" });
    await load();
  }

  async function handleDecline(id: string, message?: string) {
    await http.request(`/api/v1/meeting-requests/${id}/decline`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    await load();
  }

  async function handleCounterPropose(id: string, values: CounterProposeValues) {
    await http.request(`/api/v1/meeting-requests/${id}/counter-proposal`, {
      method: "POST",
      body: JSON.stringify(values),
    });
    await load();
  }

  async function handleCancel(id: string) {
    await http.request(`/api/v1/meeting-requests/${id}/cancel`, { method: "POST" });
    await load();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">Solicitações</h1>
        <p className="text-sm text-text-secondary">Encontros que você recebeu ou enviou.</p>
      </header>

      <div className="flex items-center gap-1 rounded-pill border border-border bg-surface p-1">
        {(["received", "sent"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setBox(mode)}
            className={cn(
              "flex-1 rounded-pill px-3 py-1.5 text-sm font-medium transition-colors",
              box === mode ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {mode === "received" ? "Recebidas" : "Enviadas"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "rounded-pill px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === filter.value
                  ? "bg-primary text-white"
                  : "bg-surface-hover text-text-secondary hover:text-text-primary",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {box === "received" && (
          <div className="flex items-center gap-1 rounded-pill border border-border bg-surface p-1">
            {(["priority", "recent"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSortMode(mode)}
                className={cn(
                  "rounded-pill px-2.5 py-1 text-xs font-medium transition-colors",
                  sortMode === mode ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary",
                )}
              >
                {mode === "priority" ? "Prioridade" : "Recentes"}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <Card className="border-danger-conflict/40">
          <p className="text-sm text-danger-conflict">{error}</p>
        </Card>
      )}

      {requests === null && !error && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {requests !== null && requests.length === 0 && (
        <EmptyState
          title="Nada por aqui"
          description={
            box === "received"
              ? "Quando alguém quiser marcar um encontro com você, vai aparecer aqui."
              : "Solicitações que você enviar para outras pessoas aparecem aqui."
          }
        />
      )}

      {requests !== null && userId && (
        <div className="flex flex-col gap-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              box={box}
              currentUserId={userId}
              counterpartyLabel={buildCounterpartyLabel(request, box, userId, emailById)}
              counterProposals={counterProposalsById[request.id] ?? []}
              ownAvailability={availabilityById[request.id]}
              onAccept={() => handleAccept(request.id)}
              onDecline={(message) => handleDecline(request.id, message)}
              onCounterPropose={(values) => handleCounterPropose(request.id, values)}
              onCancel={() => handleCancel(request.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
