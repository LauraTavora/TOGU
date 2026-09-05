type ClassValue = string | number | null | undefined | false | Record<string, boolean | undefined>;

/** Combinador de classes minimalista — evita depender de clsx/tailwind-merge. */
export function cn(...values: ClassValue[]): string {
  const parts: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (typeof value === "string" || typeof value === "number") {
      parts.push(String(value));
      continue;
    }
    for (const [key, enabled] of Object.entries(value)) {
      if (enabled) parts.push(key);
    }
  }
  return parts.join(" ");
}
