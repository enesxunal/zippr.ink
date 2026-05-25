import { redirect } from "next/navigation";

export default async function DocumentsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/tools/pdf`);
}
