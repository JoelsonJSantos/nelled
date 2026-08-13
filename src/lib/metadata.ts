type SeoRecord = { title?: unknown; description?: unknown };

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function contentMetadata(
  seo: unknown,
  fallbackTitle: string,
  fallbackDescription: string,
) {
  const record = typeof seo === "object" && seo !== null && !Array.isArray(seo) ? seo as SeoRecord : {};
  return {
    title: text(record.title) ?? fallbackTitle,
    description: text(record.description) ?? fallbackDescription,
  };
}
