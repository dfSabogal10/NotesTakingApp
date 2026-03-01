export function formatError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(message) as Record<string, unknown>;
    if (typeof parsed === "object" && parsed !== null) {
      const first = Object.values(parsed)[0];
      if (Array.isArray(first) && first[0]) return String(first[0]);
      if (typeof first === "string") return first;
    }
  } catch {
    // not JSON
  }
  return message;
}
