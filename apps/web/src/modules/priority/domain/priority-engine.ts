import { LEVEL_WEIGHT, type PriorityLevel } from "./priority-level";
import type { PriorityRule } from "./priority-rule";

export interface PriorityContext {
  personId: string;
  circleIds: string[];
  eventType?: string | undefined;
  place?: string | undefined;
  createdAt: Date;
}

/**
 * PriorityEngine — núcleo puro de domínio, sem I/O. Nunca expõe a quais
 * regras específicas do usuário levaram ao score (docs/PRODUCT.md §17 —
 * prioridades são privadas; nem o solicitante pode saber sua posição).
 */
export class PriorityEngine {
  /**
   * Maior nível entre as regras que combinam com o contexto (pessoa, círculos
   * em comum, local, tipo de evento). Sem nenhuma regra correspondente,
   * o nível padrão é NORMAL.
   */
  resolveLevel(rules: PriorityRule[], context: PriorityContext): PriorityLevel {
    const candidates: PriorityLevel[] = [];

    const personRule = rules.find((r) => r.targetType === "PERSON" && r.targetId === context.personId);
    if (personRule) candidates.push(personRule.level);

    for (const rule of rules) {
      if (rule.targetType === "CIRCLE" && context.circleIds.includes(rule.targetId)) {
        candidates.push(rule.level);
      }
    }

    if (context.place) {
      const placeRule = rules.find((r) => r.targetType === "PLACE" && r.targetId === context.place);
      if (placeRule) candidates.push(placeRule.level);
    }

    if (context.eventType) {
      const eventTypeRule = rules.find(
        (r) => r.targetType === "EVENT_TYPE" && r.targetId === context.eventType,
      );
      if (eventTypeRule) candidates.push(eventTypeRule.level);
    }

    if (candidates.length === 0) return "NORMAL";
    return candidates.reduce((max, level) => (LEVEL_WEIGHT[level] > LEVEL_WEIGHT[max] ? level : max));
  }

  /**
   * Score numérico: a parte inteira reflete o nível de prioridade (nunca
   * ultrapassada pelo componente de urgência), e a fração cresce com o
   * tempo desde o recebimento — desempata a favor de quem chegou primeiro
   * dentro do mesmo nível (docs/PRODUCT.md §20).
   */
  computeScore(rules: PriorityRule[], context: PriorityContext, now: Date = new Date()): number {
    const level = this.resolveLevel(rules, context);
    const hoursSinceCreated = Math.max(0, (now.getTime() - context.createdAt.getTime()) / 3_600_000);
    const urgencyBonus = 1 - 1 / (1 + hoursSinceCreated / 24);
    return LEVEL_WEIGHT[level] + urgencyBonus;
  }
}
