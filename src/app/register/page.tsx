"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { T } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password: pw, display_name: name || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || T.errors.generic);
      }
      // sign-in to set session cookies
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      router.replace("/profile?welcome=1");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || T.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <div className="absolute top-4 left-4">
        <ThemeToggle />
      </div>
      <Card className="space-y-5 p-6">
        <div>
          <h1 className="text-2xl font-bold">{T.auth.welcome}</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-300">{T.app}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{T.auth.name}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">{T.auth.email}</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              dir="ltr"
              className="text-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="pw">{T.auth.password}</Label>
            <Input
              id="pw"
              type="password"
              autoComplete="new-password"
              dir="ltr"
              className="text-left"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              minLength={6}
              required
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" loading={loading} size="lg">
            {T.auth.signUpCta}
          </Button>
        </form>

        <div className="text-center text-sm text-surface-500 dark:text-surface-300">
          {T.auth.haveAccount}{" "}
          <Link href="/login" className="font-medium text-brand-600">
            {T.auth.signIn}
          </Link>
        </div>
      </Card>
    </main>
  );
}
