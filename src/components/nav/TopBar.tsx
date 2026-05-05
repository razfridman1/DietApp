"use client";
import { LogOut, User2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import { ThemeToggle } from "@/components/ThemeToggle";

export function TopBar({ title, right }: { title: string; right?: React.ReactNode }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }
  return (
    <header
      dir="rtl"
      className="sticky top-0 z-30 border-b border-surface-200 bg-white/80 backdrop-blur dark:bg-surface-900/80 dark:border-surface-800"
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex items-center gap-1">
          {right}
          <ThemeToggle />
          <Link
            href="/profile"
            className="rounded-full p-2 hover:bg-surface-100 dark:hover:bg-surface-800"
            aria-label={T.nav.profile}
          >
            <User2 className="size-5" />
          </Link>
          <button
            onClick={logout}
            className="rounded-full p-2 hover:bg-surface-100 dark:hover:bg-surface-800"
            aria-label={T.nav.logout}
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
