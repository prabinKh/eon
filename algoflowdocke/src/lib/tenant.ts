import type { User } from "@/context/AuthContext";

export function getTenantSlugFromHost(): string | null {
  return "eon-technology";
}

export function getActiveTenantSlug(): string | null {
  return "eon-technology";
}

export function setActiveTenantSlug(slug: string) {
  // No-op for single vendor
}

export function tenantStorageKey(key: string): string {
  return `single-vendor:${key}`;
}

export function getTenantHeaders(): Record<string, string> {
  return {};
}

export function userMatchesActiveTenant(user: User | null): boolean {
  return true;
}

export function clearTenantAuthStorage() {
  localStorage.removeItem(`single-vendor:access_token`);
  localStorage.removeItem(`single-vendor:refresh_token`);
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
