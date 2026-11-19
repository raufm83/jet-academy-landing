export interface GlossaryLinkTerm {
  text: string;
  href: string;
}

const SKIP_TAGS = new Set([
  "a", "h1", "h2", "h3", "h4", "h5", "h6",
  "script", "style", "code", "pre", "button",
  "textarea", "select", "noscript", "svg",
]);

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

type Candidate = { part: number; index: number; length: number; key: string; offset: number };

/**
 * HTML mətnində glossary terminlərini <a> ilə əvəz edir (server tərəfdə).
 * - maksimum `max` link, hər termin yalnız ilk rastlaşmada
 * - başlıq, mövcud link, code/pre daxilində link yoxdur
 * - `excludeHref` (terminin öz səhifəsi) linklənmir
 * - namizədlər çox olanda linklər mətn boyu bərabər paylanır (yığılmır)
 */
export function linkGlossaryTerms(
  html: string,
  terms: GlossaryLinkTerm[],
  opts: { max?: number; excludeHref?: string; minLength?: number } = {}
): string {
  const { max = 10, excludeHref, minLength = 3 } = opts;
  if (!html || !terms?.length) return html;

  const map = new Map<string, GlossaryLinkTerm>();
  for (const t of terms) {
    const text = (t.text || "").trim();
    if (text.length < minLength || !t.href) continue;
    if (excludeHref && t.href === excludeHref) continue;
    const key = text.toLowerCase();
    if (!map.has(key)) map.set(key, { text, href: t.href });
  }
  if (map.size === 0) return html;

  const alternation = Array.from(map.values())
    .map((t) => t.text)
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join("|");
  const re = new RegExp(
    `(?<![\\p{L}\\p{N}_])(${alternation})(?![\\p{L}\\p{N}_])`,
    "giu"
  );

  const parts = html.split(/(<!--[\s\S]*?-->|<[^>]+>)/g);

  // 1-ci keçid: hər terminin ilk rastlaşması (başlıq/link/code xaric)
  const seen = new Set<string>();
  const candidates: Candidate[] = [];
  let skipDepth = 0;
  let textPos = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (part.startsWith("<")) {
      if (part.startsWith("<!--")) continue;
      const tag = /^<\s*(\/)?\s*([a-zA-Z][a-zA-Z0-9-]*)/.exec(part);
      if (!tag) continue;
      const closing = !!tag[1];
      const name = tag[2].toLowerCase();
      const selfClosing = /\/\s*>$/.test(part);
      if (SKIP_TAGS.has(name) && !selfClosing) {
        skipDepth = closing ? Math.max(0, skipDepth - 1) : skipDepth + 1;
      }
      continue;
    }

    const base = textPos;
    textPos += part.length;
    if (skipDepth > 0) continue;
    re.lastIndex = 0;
    let hit: RegExpExecArray | null;
    while ((hit = re.exec(part)) !== null) {
      const key = hit[0].toLowerCase();
      if (!map.has(key) || seen.has(key)) continue;
      seen.add(key);
      candidates.push({ part: i, index: hit.index, length: hit[0].length, key, offset: base + hit.index });
    }
  }
  if (candidates.length === 0) return html;

  // 2-ci addım: yığılmanın qarşısı, seçilən linklər arasında minimum məsafə
  const minGap = textPos / (max * 2);
  let chosen: Candidate[] = [];
  for (const c of candidates) {
    const last = chosen[chosen.length - 1];
    if (!last || c.offset - last.offset >= minGap) chosen.push(c);
  }
  if (chosen.length > max) {
    const picked = new Set<number>();
    for (let k = 0; k < max; k++) {
      picked.add(Math.round((k * (chosen.length - 1)) / Math.max(max - 1, 1)));
    }
    chosen = chosen.filter((_, idx) => picked.has(idx));
  }

  // 3-cü addım: hər mətn parçasında sondan başa doğru əvəz et
  const byPart = new Map<number, Candidate[]>();
  for (const c of chosen) {
    const arr = byPart.get(c.part) ?? [];
    arr.push(c);
    byPart.set(c.part, arr);
  }
  byPart.forEach((list, i) => {
    list.sort((a, b) => b.index - a.index);
    let text = parts[i];
    for (const c of list) {
      const term = map.get(c.key);
      if (!term) continue;
      const match = text.slice(c.index, c.index + c.length);
      text =
        text.slice(0, c.index) +
        `<a href="${escapeAttr(term.href)}">${match}</a>` +
        text.slice(c.index + c.length);
    }
    parts[i] = text;
  });
  return parts.join("");
}
