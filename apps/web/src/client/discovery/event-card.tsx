"use client";

import { useState } from "react";
import { Badge, Button, Card } from "@togu/design-system";
import { CATEGORY_LABEL, formatDistance, formatEventDateTime, formatPrice } from "./format";
import type { NearbyEventDto, NearbyEventWithDistanceDto } from "./types";

export interface EventCardProps {
  event: NearbyEventDto | NearbyEventWithDistanceDto;
  isSaved: boolean;
  circleInterestCount?: number | undefined;
  onToggleSave: () => Promise<void>;
  onAddToAgenda: () => Promise<void>;
}

function hasDistance(event: EventCardProps["event"]): event is NearbyEventWithDistanceDto {
  return "distanceKm" in event;
}

export function EventCard({ event, isSaved, circleInterestCount, onToggleSave, onAddToAgenda }: EventCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggleSave() {
    setError(null);
    setIsSaving(true);
    try {
      await onToggleSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o evento.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddToAgenda() {
    setError(null);
    setIsAdding(true);
    try {
      await onAddToAgenda();
      setAdded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível adicionar à agenda.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">{event.title}</p>
          <p className="text-xs text-text-secondary">
            {formatEventDateTime(event.startAt)}
            {event.locationName && <> · {event.locationName}</>}
            {hasDistance(event) && <> · {formatDistance(event.distanceKm)}</>}
          </p>
        </div>
        <Badge tone="neutral">{CATEGORY_LABEL[event.category]}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        <Badge tone={event.isFree ? "success" : "neutral"}>{formatPrice(event.isFree, event.priceInfo)}</Badge>
        {typeof circleInterestCount === "number" && circleInterestCount > 0 && (
          <span>
            {circleInterestCount} {circleInterestCount === 1 ? "pessoa do seu círculo quer ir" : "pessoas do seu círculo querem ir"}
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger-conflict">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={isSaved ? "secondary" : "primary"} onClick={handleToggleSave} disabled={isSaving}>
          {isSaving ? "..." : isSaved ? "Salvo" : "Quero ir"}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleAddToAgenda} disabled={isAdding || added}>
          {added ? "Na agenda" : isAdding ? "Adicionando..." : "Adicionar à agenda"}
        </Button>
      </div>
    </Card>
  );
}
