"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { Card, EmptyState, Input, Skeleton, cn } from "@togu/design-system";
import { ApiError } from "@togu/sdk";
import { useAuth } from "@/client/auth/auth-provider";
import { EventCard } from "@/client/discovery/event-card";
import { CATEGORY_LABEL, EVENT_CATEGORIES } from "@/client/discovery/format";
import { FALLBACK_LOCATION, getBrowserLocation } from "@/client/discovery/geolocation";
import type { EventCategory, GeoPointDto, NearbyEventDto, NearbyEventWithDistanceDto } from "@/client/discovery/types";

type Tab = "buscar" | "salvos";
type CategoryFilter = EventCategory | "ALL";

const SEARCH_WINDOW_DAYS = 30;

export default function ExplorarPage() {
  const { http } = useAuth();
  const [tab, setTab] = useState<Tab>("buscar");
  const [location, setLocation] = useState<GeoPointDto | null>(null);
  const [usingFallbackLocation, setUsingFallbackLocation] = useState(false);

  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [onlyFree, setOnlyFree] = useState(false);
  const [radiusKm, setRadiusKm] = useState(25);
  const [radiusInput, setRadiusInput] = useState("25");

  const [events, setEvents] = useState<NearbyEventWithDistanceDto[] | null>(null);
  const [savedEvents, setSavedEvents] = useState<NearbyEventDto[] | null>(null);
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [circleInterestById, setCircleInterestById] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBrowserLocation().then((result) => {
      if (cancelled) return;
      if (result) {
        setLocation(result);
      } else {
        setLocation(FALLBACK_LOCATION);
        setUsingFallbackLocation(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadSaved = useCallback(async () => {
    const { events: fetched } = await http.request<{ events: NearbyEventDto[] }>("/api/v1/discovery/saved-events");
    setSavedEvents(fetched);
    setSavedEventIds(new Set(fetched.map((event) => event.id)));
  }, [http]);

  const loadCircleInterest = useCallback(
    async (eventIds: string[]) => {
      const entries = await Promise.all(
        eventIds.map(async (id) => {
          const { count } = await http.request<{ count: number }>(`/api/v1/discovery/events/${id}/circle-interest`);
          return [id, count] as const;
        }),
      );
      setCircleInterestById((current) => ({ ...current, ...Object.fromEntries(entries) }));
    },
    [http],
  );

  const loadSearch = useCallback(async () => {
    if (!location) return;
    try {
      const from = new Date();
      const to = new Date(from.getTime() + SEARCH_WINDOW_DAYS * 24 * 60 * 60 * 1000);
      const query = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        radiusKm: String(radiusKm),
        from: from.toISOString(),
        to: to.toISOString(),
      });
      if (category !== "ALL") query.set("category", category);
      if (onlyFree) query.set("onlyFree", "true");

      const { events: fetched } = await http.request<{ events: NearbyEventWithDistanceDto[] }>(
        `/api/v1/discovery/events?${query.toString()}`,
      );
      setEvents(fetched);
      setError(null);
      await loadCircleInterest(fetched.map((event) => event.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível buscar eventos.");
    }
  }, [http, location, category, onlyFree, radiusKm, loadCircleInterest]);

  useEffect(() => {
    setEvents(null);
    loadSearch();
  }, [loadSearch]);

  useEffect(() => {
    loadSaved().catch(() => {
      // Silencioso: a busca principal já reporta erro; "Salvos" só afeta o botão Salvar/Salvo.
    });
  }, [loadSaved]);

  function commitRadius() {
    const parsed = Number(radiusInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setRadiusInput(String(radiusKm));
      return;
    }
    const clamped = Math.min(500, Math.max(1, Math.round(parsed)));
    setRadiusInput(String(clamped));
    setRadiusKm(clamped);
  }

  function handleRadiusKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitRadius();
    }
  }

  async function handleToggleSave(eventId: string) {
    const isSaved = savedEventIds.has(eventId);
    if (isSaved) {
      await http.request(`/api/v1/discovery/events/${eventId}/save`, { method: "DELETE" });
    } else {
      await http.request(`/api/v1/discovery/events/${eventId}/save`, { method: "POST" });
    }
    await loadSaved();
  }

  async function handleAddToAgenda(eventId: string) {
    await http.request(`/api/v1/discovery/events/${eventId}/add-to-agenda`, { method: "POST" });
  }

  const visibleEvents = useMemo(() => (tab === "buscar" ? events : savedEvents), [tab, events, savedEvents]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">Explorar</h1>
        <p className="text-sm text-text-secondary">Eventos perto de você nos próximos 30 dias.</p>
      </header>

      {usingFallbackLocation && (
        <Card className="border-warning-soft-hold/40">
          <p className="text-sm text-text-secondary">
            Não conseguimos acessar sua localização — mostrando eventos perto de São Paulo.
          </p>
        </Card>
      )}

      <div className="flex items-center gap-1 rounded-pill border border-border bg-surface p-1">
        {(["buscar", "salvos"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setTab(mode)}
            className={cn(
              "flex-1 rounded-pill px-3 py-1.5 text-sm font-medium transition-colors",
              tab === mode ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {mode === "buscar" ? "Buscar" : "Salvos"}
          </button>
        ))}
      </div>

      {tab === "buscar" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCategory("ALL")}
              className={cn(
                "rounded-pill px-3 py-1 text-xs font-medium transition-colors",
                category === "ALL" ? "bg-primary text-white" : "bg-surface-hover text-text-secondary hover:text-text-primary",
              )}
            >
              Todas
            </button>
            {EVENT_CATEGORIES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={cn(
                  "rounded-pill px-3 py-1 text-xs font-medium transition-colors",
                  category === value
                    ? "bg-primary text-white"
                    : "bg-surface-hover text-text-secondary hover:text-text-primary",
                )}
              >
                {CATEGORY_LABEL[value]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="w-28">
              <Input
                label="Raio (km)"
                type="number"
                min={1}
                max={500}
                value={radiusInput}
                onChange={(e) => setRadiusInput(e.target.value)}
                onBlur={commitRadius}
                onKeyDown={handleRadiusKeyDown}
              />
            </div>
            <button
              type="button"
              onClick={() => setOnlyFree((current) => !current)}
              className={cn(
                "h-11 rounded-pill px-4 text-sm font-medium transition-colors",
                onlyFree ? "bg-primary text-white" : "border border-border bg-surface text-text-secondary hover:text-text-primary",
              )}
            >
              Somente gratuito
            </button>
          </div>
        </div>
      )}

      {error && (
        <Card className="border-danger-conflict/40">
          <p className="text-sm text-danger-conflict">{error}</p>
        </Card>
      )}

      {visibleEvents === null && !error && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {visibleEvents !== null && visibleEvents.length === 0 && (
        <EmptyState
          title={tab === "buscar" ? "Nenhum evento por perto" : "Nenhum evento salvo"}
          description={
            tab === "buscar"
              ? "Tente aumentar o raio de busca ou trocar os filtros."
              : "Eventos que você marcar como \"Quero ir\" aparecem aqui."
          }
        />
      )}

      {visibleEvents !== null && visibleEvents.length > 0 && (
        <div className="flex flex-col gap-3">
          {visibleEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSaved={savedEventIds.has(event.id)}
              circleInterestCount={circleInterestById[event.id]}
              onToggleSave={() => handleToggleSave(event.id)}
              onAddToAgenda={() => handleAddToAgenda(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
