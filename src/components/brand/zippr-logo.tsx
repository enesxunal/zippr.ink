import Image from "next/image";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export type ZipprLogoSize = "sm" | "md" | "lg" | "hero";
export type ZipprLogoVariant = "white" | "black";

const SIZE_MAP: Record<
  ZipprLogoSize,
  { width: number; height: number; imgClass: string }
> = {
  sm: { width: 110, height: 38, imgClass: "h-8 w-auto sm:h-9" },
  md: { width: 140, height: 48, imgClass: "h-10 w-auto" },
  lg: { width: 200, height: 70, imgClass: "h-12 w-auto sm:h-14" },
  hero: { width: 280, height: 96, imgClass: "h-16 w-auto sm:h-20 md:h-24" },
};

export interface ZipprLogoProps {
  className?: string;
  size?: ZipprLogoSize;
  variant?: ZipprLogoVariant;
  priority?: boolean;
  /** Wrap logo with link to homepage */
  linked?: boolean;
}

/** Official zippr.ink logo (SVG). Use everywhere instead of text or third-party marks. */
export function ZipprLogo({
  className = "",
  size = "md",
  variant = "white",
  priority = false,
  linked = false,
}: ZipprLogoProps) {
  const src =
    variant === "white" ? "/zippr-ink-logo-w.svg" : "/zippr-ink-logo-b.svg";
  const cfg = SIZE_MAP[size];

  const image = (
    <Image
      src={src}
      alt="zippr.ink"
      width={cfg.width}
      height={cfg.height}
      priority={priority}
      className={cn(cfg.imgClass, className)}
    />
  );

  if (linked) {
    return (
      <Link href="/" className="inline-block shrink-0">
        {image}
      </Link>
    );
  }

  return <span className="inline-block shrink-0">{image}</span>;
}

/** Compact mark (favicon) for inputs and tight UI */
export function ZipprMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/zippr-ink-fav.svg"
      alt="zippr.ink"
      width={22}
      height={22}
      className={cn("h-5 w-5 shrink-0", className)}
    />
  );
}
