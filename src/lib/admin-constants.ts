export const ADMIN_EMAIL = "admin@zippr.ink";

export function isAdminEmail(email?: string | null): boolean {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}
