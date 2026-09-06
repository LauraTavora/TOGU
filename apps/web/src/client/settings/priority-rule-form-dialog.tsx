"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Dialog, Input, cn } from "@fecho/design-system";
import { PRIORITY_LEVEL_LABEL, PRIORITY_TARGET_TYPE_LABEL } from "./format";
import type { PriorityLevel, PriorityTargetType } from "./types";

const TARGET_TYPES: PriorityTargetType[] = ["PERSON", "CIRCLE", "PLACE", "EVENT_TYPE"];
const LEVELS: PriorityLevel[] = ["LOW", "NORMAL", "HIGH", "MAXIMUM"];

export interface PriorityRuleFormDialogProps {
  open: boolean;
  onClose: () => void;
  circles: { id: string; name: string }[];
  /** Resolve o id real do alvo (para PERSON, busca o e-mail digitado) e cria a regra. */
  onSubmit: (targetType: PriorityTargetType, targetId: string, level: PriorityLevel) => Promise<void>;
}

export function PriorityRuleFormDialog({ open, onClose, circles, onSubmit }: PriorityRuleFormDialogProps) {
  const [targetType, setTargetType] = useState<PriorityTargetType>("PERSON");
  const [personEmail, setPersonEmail] = useState("");
  const [circleId, setCircleId] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [level, setLevel] = useState<PriorityLevel>("HIGH");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTargetType("PERSON");
    setPersonEmail("");
    setCircleId(circles[0]?.id ?? null);
    setFreeText("");
    setLevel("HIGH");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    let targetId: string;
    if (targetType === "PERSON") {
      targetId = personEmail.trim();
      if (!targetId) {
        setError("Digite um e-mail.");
        return;
      }
    } else if (targetType === "CIRCLE") {
      if (!circleId) {
        setError("Você precisa ter pelo menos um círculo para usar esta opção.");
        return;
      }
      targetId = circleId;
    } else {
      targetId = freeText.trim();
      if (!targetId) {
        setError(targetType === "PLACE" ? "Digite um local." : "Digite um tipo de evento.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(targetType, targetId, level);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a regra.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Nova regra de prioridade">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-primary">O que priorizar</span>
          <div className="flex flex-wrap gap-1.5">
            {TARGET_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTargetType(type)}
                className={cn(
                  "rounded-pill px-3 py-1 text-xs font-medium transition-colors",
                  targetType === type
                    ? "bg-primary text-white"
                    : "bg-surface-hover text-text-secondary hover:text-text-primary",
                )}
              >
                {PRIORITY_TARGET_TYPE_LABEL[type]}
              </button>
            ))}
          </div>
        </div>

        {targetType === "PERSON" && (
          <Input
            label="E-mail da pessoa"
            type="email"
            required
            hint="A pessoa precisa já ter uma conta no Fechô."
            value={personEmail}
            onChange={(e) => setPersonEmail(e.target.value)}
          />
        )}

        {targetType === "CIRCLE" && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">Círculo</span>
            {circles.length === 0 ? (
              <p className="text-sm text-text-secondary">Você ainda não tem nenhum círculo.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {circles.map((circle) => (
                  <button
                    key={circle.id}
                    type="button"
                    onClick={() => setCircleId(circle.id)}
                    className={cn(
                      "rounded-pill px-3 py-1 text-xs font-medium transition-colors",
                      circleId === circle.id
                        ? "bg-primary text-white"
                        : "bg-surface-hover text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {circle.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {(targetType === "PLACE" || targetType === "EVENT_TYPE") && (
          <Input
            label={targetType === "PLACE" ? "Local" : "Tipo de evento"}
            required
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-primary">Prioridade</span>
          <div className="flex flex-wrap gap-1.5">
            {LEVELS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setLevel(value)}
                className={cn(
                  "rounded-pill px-3 py-1 text-xs font-medium transition-colors",
                  level === value
                    ? "bg-primary text-white"
                    : "bg-surface-hover text-text-secondary hover:text-text-primary",
                )}
              >
                {PRIORITY_LEVEL_LABEL[value]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger-conflict">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar regra"}
        </Button>
      </form>
    </Dialog>
  );
}
