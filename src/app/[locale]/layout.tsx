import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "de" | "en" | "tr")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  let headerUser: { email: string; role?: string } | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, role")
        .eq("id", user.id)
        .single();
      headerUser = {
        email: profile?.email || user.email || "",
        role: profile?.role,
      };
    }
  } catch {
    // Supabase not configured yet
  }

  return (
    <html lang={locale} className="dark">
      <body className="min-h-screen bg-black antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header user={headerUser} />
          <main>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
