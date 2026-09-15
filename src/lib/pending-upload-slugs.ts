const SESSION_KEY = "zippr_pending_upload_claims";
const LOCAL_KEY = "zippr_pending_upload_claims_local";

export type PendingUploadClaim = { slug: string; uploadToken: string };

function read(store: Storage, key: string): PendingUploadClaim[] {
  try {
    const raw = store.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is PendingUploadClaim => {
      return Boolean(
        item &&
          typeof item === "object" &&
          typeof (item as PendingUploadClaim).slug === "string" &&
          typeof (item as PendingUploadClaim).uploadToken === "string"
      );
    });
  } catch {
    return [];
  }
}

export function rememberUploadSlug(slug: string, uploadToken?: string) {
  if (!slug?.trim() || !uploadToken?.trim()) return;
  const claim = { slug: slug.trim(), uploadToken: uploadToken.trim() };

  for (const [store, key, limit] of [
    [sessionStorage, SESSION_KEY, 10],
    [localStorage, LOCAL_KEY, 20],
  ] as const) {
    try {
      const list = read(store, key).filter((item) => item.slug !== claim.slug);
      list.unshift(claim);
      store.setItem(key, JSON.stringify(list.slice(0, limit)));
    } catch {
      // Storage can be disabled; claiming is a convenience feature only.
    }
  }
}

export function getPendingUploadClaims(): PendingUploadClaim[] {
  const merged = new Map<string, PendingUploadClaim>();
  for (const [store, key] of [
    [sessionStorage, SESSION_KEY],
    [localStorage, LOCAL_KEY],
  ] as const) {
    for (const claim of read(store, key)) {
      if (!merged.has(claim.slug)) merged.set(claim.slug, claim);
    }
  }
  return [...merged.values()].slice(0, 20);
}

export function clearPendingUploadSlugs() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    // ignore
  }
}
