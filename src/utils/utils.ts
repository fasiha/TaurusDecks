export function textMatch(haystack: string[], needle: string): string {
  const cleanNeedle = needle.trim().toLowerCase();
  return (
    haystack.find(
      (candidate) => candidate.trim().toLowerCase() === cleanNeedle
    ) ?? needle
  );
}
