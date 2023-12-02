export function textMatch(haystack: string[], needle: string): string {
  const cleanNeedle = needle.trim().toLowerCase();
  return (
    haystack.find(
      (candidate) => candidate.trim().toLowerCase() === cleanNeedle
    ) ?? needle
  );
}

export function groupBy<X>(
  v: X[],
  mapper: (x: X) => string
): Record<string, X[]> {
  const ret: Record<string, X[]> = {};
  for (const x of v) {
    const y = mapper(x);
    if (!(y in ret)) ret[y] = [];
    ret[y].push(x);
  }
  return ret;
}
