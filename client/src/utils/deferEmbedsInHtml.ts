/**
 * Replace heavy embed iframes (youtube, vimeo, etc.) with lazy-loaded
 * versions so they don't block the initial paint of the description section.
 */
export function deferEmbedsInHtml(html: string): string {
  if (!html) return "";

  return html.replace(
    /<iframe([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/gi,
    '<iframe$1 loading="lazy" src="$2"$3>',
  );
}
