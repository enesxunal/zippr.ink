import type { PlanType } from "@/types/database";

export interface PlanConfig {
  name: PlanType;
  /** Tosla'ya giden tutar (TRY, tam lira) */
  price: number;
  currency: "TRY" | "EUR";
  storageLimit: number; // bytes
  expiryDays: number | null; // null = unlimited retention
  features: string[];
}

const GB = 1024 * 1024 * 1024;
const TB = 1024 * GB;

/** Fiyatlar TL — Tosla Sanal POS TRY (949) ile uyumlu */
export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    name: "free",
    price: 0,
    currency: "TRY",
    storageLimit: 5 * GB,
    expiryDays: 7,
    features: ["5 GB Speicher", "7 Tage Dateiablauf", "Basis-Komprimierung"],
  },
  lite: {
    name: "lite",
    price: 399,
    currency: "TRY",
    storageLimit: 50 * GB,
    expiryDays: null,
    features: ["50 GB Speicher", "Unbegrenzte Aufbewahrung", "Prioritäts-Komprimierung"],
  },
  standard: {
    name: "standard",
    price: 799,
    currency: "TRY",
    storageLimit: 250 * GB,
    expiryDays: null,
    features: ["250 GB Speicher", "Unbegrenzte Aufbewahrung", "Benutzerdefinierte Links"],
  },
  professional: {
    name: "professional",
    price: 1499,
    currency: "TRY",
    storageLimit: 1 * TB,
    expiryDays: null,
    features: ["1 TB Speicher", "Unbegrenzte Aufbewahrung", "Premium-Support"],
  },
  enterprise: {
    name: "enterprise",
    price: 0,
    currency: "TRY",
    storageLimit: 0,
    expiryDays: null,
    features: ["Individuelles Speichervolumen", "Mehrbenutzer-Zugang", "Dedizierter Support"],
  },
};

export function formatPlanPrice(config: PlanConfig): string {
  if (config.price === 0) return "₺0";
  if (config.currency === "TRY") {
    return `₺${config.price.toLocaleString("tr-TR")}`;
  }
  return `€${config.price}`;
}

export function getPlanConfig(plan: PlanType): PlanConfig {
  return PLANS[plan];
}

export function getStorageLimitForPlan(plan: PlanType): number {
  return PLANS[plan].storageLimit;
}

export function getExpiryDate(plan: PlanType, isGuest: boolean): Date | null {
  if (isGuest) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }
  const expiryDays = PLANS[plan].expiryDays;
  if (expiryDays === null) return null;
  const d = new Date();
  d.setDate(d.getDate() + expiryDays);
  return d;
}

export function canUpload(
  storageUsed: number,
  storageLimit: number,
  fileSize: number
): { allowed: boolean; reason?: string } {
  if (fileSize > storageLimit) {
    return { allowed: false, reason: "file_too_large_for_plan" };
  }
  if (storageUsed + fileSize > storageLimit) {
    return { allowed: false, reason: "storage_limit_exceeded" };
  }
  return { allowed: true };
}

export const PAID_PLANS: Exclude<PlanType, "free" | "enterprise">[] = [
  "lite",
  "standard",
  "professional",
];
