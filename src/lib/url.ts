export function isSafeHttpUrl(url: string): boolean {
  try {
    const p = new URL(url);
    return p.protocol === 'http:' || p.protocol === 'https:';
  } catch {
    return false;
  }
}

export function safeHref(url: string | null | undefined): string {
  if (!url || !isSafeHttpUrl(url)) return '#';
  return url;
}
