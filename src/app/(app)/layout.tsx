import { redirect } from "next/navigation";
import { BottomNav } from "@/components/nav/BottomNav";
import { createSupabaseServer } from "@/lib/supabase/server";

// All authenticated pages depend on cookies; never statically render.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen pb-20">
      <main className="mx-auto max-w-2xl px-4 pb-10">{children}</main>
      <BottomNav />
    </div>
  );
}
