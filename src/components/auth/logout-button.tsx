"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  redirectTo?: string;
  className?: string;
  showIcon?: boolean;
}

export function LogoutButton({
  variant = "outline",
  size = "sm",
  redirectTo = "/",
  className,
  showIcon = true,
}: LogoutButtonProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      onClick={handleLogout}
      disabled={loading}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {loading ? t("loading") : t("logout")}
    </Button>
  );
}
