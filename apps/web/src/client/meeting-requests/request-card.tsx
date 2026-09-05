"use client";

import { useState } from "react";
import { Badge, Button, Card, StatusIndicator } from "@togu/design-system";
import type { StatusKind } from "@togu/design-system";
import {
  OWN_AVAILABILITY_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  formatDateRange,
  formatMeetingKind,
} from "./format";
import { isOpenStatus, resolveEffectiveTimeRange, resolveProposingPartyId } from "./negotiation";
import type { CounterProposalDto, MeetingRequestDto } from "./types";
import { DeclineDialog } from "./decline-dialog";
import { CounterProposeDialog, type CounterProposeValues } from "./counter-propose-dialog";

export interface RequestCardProps {
  request: MeetingRequestDto;
  box: "received" | "sent";
  currentUserId: string;
  /** Ex.: "De: ana@example.com" ou "Para: bruno@example.com, carla@example.com". */
  counterpartyLabel: string;
  counterProposals: CounterProposalDto[];
  /** Status da própria agenda no horário efetivo — só carregado quando a solicitação é acionável. */
  ownAvailability?: StatusKind | undefined;
  onAccept: () => Promise<void>;
  onDecline: (message?: string) => Promise<void>;
  onCounterPropose: (values: CounterProposeValues) => Promise<void>;
  onCancel: () => Promise<void>;
}

export function RequestCard({
  request,
  box,
  currentUserId,
  counterpartyLabel,
  counterProposals,
  ownAvailability,
  onAccept,
  onDecline,
  onCounterPropose,
  onCancel,
}: RequestCardProps) {
  const [declineOpen, setDeclineOpen] = useState(false);
  const [counterProposeOpen, setCounterProposeOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"accept" | "cancel" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const proposingPartyId = resolveProposingPartyId(request, counterProposals);
  const canRespond = isOpenStatus(request.status) && currentUserId !== proposingPartyId;
  const canCancel = box === "sent" && isOpenStatus(request.status);
  const { startAt, endAt } = resolveEffectiveTimeRange(request, counterProposals);

  async function handleAccept() {
    setActionError(null);
    setPendingAction("accept");
    try {
      await onAccept();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível aceitar a solicitação.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleCancel() {
    setActionError(null);
    setPendingAction("cancel");
    try {
      await onCancel();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível cancelar a solicitação.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDeclineConfirm(message?: string) {
    await onDecline(message);
    setDeclineOpen(false);
  }

  async function handleCounterProposeSubmit(values: CounterProposeValues) {
    await onCounterPropose(values);
    setCounterProposeOpen(false);
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">{request.title}</p>
          <p className="text-xs text-text-secondary">{counterpartyLabel}</p>
        </div>
        <Badge tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status]}</Badge>
      </div>

      <p className="text-sm text-text-primary">
        {formatDateRange(startAt, endAt)} · {formatMeetingKind(request.meetingKind)}
      </p>

      {request.location && <p className="text-xs text-text-secondary">{request.location}</p>}
      {request.message && <p className="text-sm text-text-secondary">"{request.message}"</p>}
      {request.status === "DECLINED" && request.declineMessage && (
        <p className="text-sm text-text-secondary">Motivo: "{request.declineMessage}"</p>
      )}

      {canRespond && ownAvailability && (
        <StatusIndicator status={ownAvailability} label={OWN_AVAILABILITY_LABEL[ownAvailability]} />
      )}

      {actionError && (
        <p role="alert" className="text-sm text-danger-conflict">
          {actionError}
        </p>
      )}

      {(canRespond || canCancel) && (
        <div className="flex flex-wrap gap-2">
          {canRespond && (
            <>
              <Button size="sm" onClick={handleAccept} disabled={pendingAction !== null}>
                {pendingAction === "accept" ? "Aceitando..." : "Aceitar"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCounterProposeOpen(true)}
                disabled={pendingAction !== null}
              >
                Propor outro horário
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setDeclineOpen(true)}
                disabled={pendingAction !== null}
              >
                Negar
              </Button>
            </>
          )}
          {canCancel && (
            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={pendingAction !== null}>
              {pendingAction === "cancel" ? "Cancelando..." : "Cancelar solicitação"}
            </Button>
          )}
        </div>
      )}

      <DeclineDialog
        open={declineOpen}
        onClose={() => setDeclineOpen(false)}
        onConfirm={handleDeclineConfirm}
      />
      <CounterProposeDialog
        open={counterProposeOpen}
        onClose={() => setCounterProposeOpen(false)}
        currentStart={new Date(startAt)}
        currentEnd={new Date(endAt)}
        onSubmit={handleCounterProposeSubmit}
      />
    </Card>
  );
}
