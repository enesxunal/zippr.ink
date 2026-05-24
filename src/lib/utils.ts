import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PlanType } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatDate(date: string | Date, locale = "de-DE"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function isImageMime(mime: string): boolean {
  return ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(mime);
}

export function getFileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function planLabel(plan: PlanType): string {
  const labels: Record<PlanType, string> = {
    free: "Free",
    lite: "Lite",
    standard: "Standard",
    professional: "Professional",
    enterprise: "Enterprise",
  };
  return labels[plan];
}

export function getPublicFileUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/${slug}`;
}

export const RESERVED_SLUGS = [
  "admin",
  "dashboard",
  "login",
  "register",
  "api",
  "auth",
  "pricing",
  "enterprise",
  "support",
  "settings",
  "de",
  "en",
  "tr",
];

export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 2 || slug.length > 64) return false;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  if (RESERVED_SLUGS.includes(slug)) return false;
  return true;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
