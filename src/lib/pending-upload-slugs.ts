const SESSION_KEY = "zippr_pending_slugs";
const LOCAL_KEY = "zippr_pending_slugs_local";

export function rememberUploadSlug(slug: string) {
  if (!slug?.trim()) return;
  const value = slug.trim();

  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!list.includes(value)) list.unshift(value);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(list.slice(0, 10)));
  } catch {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([value]));
  }

  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!list.includes(value)) list.unshift(value);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([value]));
  }
}

export function getPendingUploadSlugs(): string[] {
  const merged = new Set<string>();

  for (const key of [SESSION_KEY, LOCAL_KEY]) {
    try {
      const store = key === SESSION_KEY ? sessionStorage : localStorage;
      const raw = store.getItem(key);
      if (!raw) continue;
      const list = JSON.parse(raw) as string[];
      list.forEach((s) => {
        if (s?.trim()) merged.add(s.trim());
      });
    } catch {
      // ignore
    }
  }

  return [...merged].slice(0, 20);
}

export function clearPendingUploadSlugs() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    // ignore
  }
}
