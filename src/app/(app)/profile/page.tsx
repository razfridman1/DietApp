"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/nav/TopBar";
import { Card, CardHeader, CardTitle, CardSubtle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/client-api";
import { ACTIVITY_LEVELS, T } from "@/lib/constants";
import type { ActivityLevel, Gender, Profile } from "@/types";

export default function ProfilePage() {
  const [welcome, setWelcome] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setWelcome(params.get("welcome") === "1");
    }
  }, []);
  const router = useRouter();
  const qc = useQueryClient();
  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get<Profile>("/api/profile"),
  });

  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [birth, setBirth] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("sedentary");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profileQ.data) return;
    const p = profileQ.data;
    setName(p.display_name || "");
    setHeight(p.height_cm ? String(p.height_cm) : "");
    setWeight(p.weight_kg ? String(p.weight_kg) : "");
    setGender(p.gender || "");
    setBirth(p.birth_year ? String(p.birth_year) : "");
    setActivity(p.activity_level);
  }, [profileQ.data?.id]); // eslint-disable-line

  const saveMut = useMutation({
    mutationFn: (body: any) => api.put<Profile>("/api/profile", body),
    onSuccess: async () => {
      setSaved(true);
      await qc.invalidateQueries({ queryKey: ["profile"] });
      await qc.invalidateQueries({ queryKey: ["today"] });
      // brief "נשמר" indicator, then back to dashboard
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 600);
    },
  });

  const weightMut = useMutation({
    mutationFn: (kg: number) => api.post("/api/weight", { weight_kg: kg }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["today"] });
      qc.invalidateQueries({ queryKey: ["monthly", 30] });
    },
  });

  function onSave() {
    saveMut.mutate({
      display_name: name || null,
      height_cm: height ? Number(height) : null,
      weight_kg: weight ? Number(weight) : null,
      gender: gender || null,
      birth_year: birth ? Number(birth) : null,
      activity_level: activity,
    });
    if (weight) weightMut.mutate(Number(weight));
  }

  return (
    <>
      <TopBar title={T.profile.title} />
      <div className="space-y-4 pt-4">
        {welcome ? (
          <Card className="border-brand-200 bg-brand-50/50 dark:bg-brand-900/30 dark:border-brand-900">
            <CardTitle>{T.auth.welcome}!</CardTitle>
            <CardSubtle className="mt-1">
              מלא/י את פרטי הפרופיל כדי שנוכל להתאים יעדים אישיים.
            </CardSubtle>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{T.profile.title}</CardTitle>
            <CardSubtle>
              נתונים אישיים — משמשים לחישוב TDEE ויעדי תזונה
            </CardSubtle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>{T.auth.name}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>{T.profile.height}</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div>
              <Label>{T.profile.weight}</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <Label>{T.profile.gender}</Label>
              <Select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
              >
                <option value="">—</option>
                <option value="male">{T.profile.male}</option>
                <option value="female">{T.profile.female}</option>
                <option value="other">{T.profile.other}</option>
              </Select>
            </div>
            <div>
              <Label>{T.profile.birthYear}</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                placeholder="1990"
              />
            </div>
            <div className="col-span-2">
              <Label>{T.profile.activityLevel}</Label>
              <Select
                value={activity}
                onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              >
                {ACTIVITY_LEVELS.map((a) => (
                  <option key={a} value={a}>
                    {T.profile[a]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button
            onClick={onSave}
            loading={saveMut.isPending}
            className="mt-4 w-full"
            size="lg"
          >
            {saved ? T.profile.saved : T.profile.save}
          </Button>
        </Card>
      </div>
    </>
  );
}
