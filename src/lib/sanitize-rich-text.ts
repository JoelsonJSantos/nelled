function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function plainTextToHtml(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`)
    .join("");
}

export function sanitizeRichTextHtml(value: string) {
  return value
    .replace(/<(script|style|iframe|object|embed|svg|math|meta|base|form|input|button|textarea|select)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|svg|math|meta|base|form|input|button|textarea|select)\b[^>]*\/?\s*>/gi, "")
    .replace(/\son\w+\s*=\s*(?:(["']).*?\1|[^\s>]+)/gi, "")
    .replace(/\sstyle\s*=\s*(?:(["']).*?\1|[^\s>]+)/gi, "")
    .replace(
      /\s(href|src)\s*=\s*(?:(["'])\s*(?:javascript|vbscript|data):[\s\S]*?\2|(?:javascript|vbscript|data):[^\s>]+)/gi,
      ' $1="#"',
    );
}

export function legacyTextOrHtmlToEditorHtml(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  return /<\/?[a-z][^>]*>/i.test(trimmed)
    ? sanitizeRichTextHtml(trimmed)
    : plainTextToHtml(trimmed);
}
