import { UserSession } from "@/types";

const SESSION_KEY = "tc_session_v1";

export function getClientSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function setClientSession(session: UserSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // Also set a lightweight auth-cookie for SSR route middleware detection
    document.cookie = `tc_role=${session.role}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `tc_auth=1; path=/; max-age=86400; SameSite=Lax`;
  } catch (err) {
    console.error("Failed to persist session", err);
  }
}

export function clearClientSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
    document.cookie = "tc_role=; path=/; max-age=0";
    document.cookie = "tc_auth=; path=/; max-age=0";
  } catch (err) {
    console.error("Failed to clear session", err);
  }
}

export function getAuthToken(): string | null {
  const session = getClientSession();
  return session ? session.token : null;
}

export function getRefreshToken(): string | null {
  const session = getClientSession();
  return session?.refreshToken || null;
}

export function updateClientSession(partial: Partial<UserSession>): UserSession | null {
  const current = getClientSession();
  if (!current) return null;
  const updated = { ...current, ...partial };
  setClientSession(updated);
  return updated;
}
