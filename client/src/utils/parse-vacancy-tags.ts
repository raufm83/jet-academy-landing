/** Sətir sonu, vergül və ya nöqtəli vergül ilə taqları ayırır */
export function parseVacancyTags(input: string): string[] {
  if (!input?.trim()) return [];
  return input
    .split(/[\n,;]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 30);
}
