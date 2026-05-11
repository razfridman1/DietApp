"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Home,
  HeartPulse,
  TrendingUp,
  Target,
  ChefHat,
  FileText,
  User2,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { Card, CardHeader, CardTitle, CardSubtle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/client-api";
import { ACTIVITY_LEVELS, T } from "@/lib/constants";
import type { ActivityLevel, Gender, Profile } from "@/types";

interface GuideSection {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tips: string[];
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    icon: Home,
    title: "מסך ראשי — היום",
    tips: [
      "הוסף/י כל ארוחה ושתייה מיד אחרי שאכלת — זיכרון רגעי הוא הכי מדויק.",
      "אפשר לכתוב בשפה חופשית (״לחמנייה עם חביתה״) או להשתמש בהזנה קולית או בצילום של הצלחת.",
      "תיעוד פעילות גם של הליכה רגילה — זה משפיע על המאזן היומי.",
    ],
  },
  {
    icon: HeartPulse,
    title: "בריאות — ניתוח מאכלים ו־AI",
    tips: [
      "לפני שאת/ה מזמין/ה אוכל בחוץ — בדוק/י את המנה בלשונית ״דירוג מאכלים״.",
      "בלשונית ״מה הגוף צריך״ אפשר לראות אילו ויטמינים ומינרלים חסרים ומאיפה להשלים.",
      "בנו רשימות שבועיות (קניות / Meal Prep) עם AI — חוסך זמן ושומר עקביות.",
      "השתמש/י ב־״עוזר AI״ לשאלות חופשיות במקום לחפש בגוגל.",
    ],
  },
  {
    icon: TrendingUp,
    title: "ניתוח — מגמות ותובנות",
    tips: [
      "פעם בשבוע פתח/י את הסקירה השבועית — מחפשים מגמה, לא יום בודד.",
      "שים/י לב לימים החריגים — שם נמצאות התובנות הכי שימושיות.",
      "השוו ממוצע קלוריות וחלבון מול היעד שלכם.",
    ],
  },
  {
    icon: Target,
    title: "יעד — הגדרה אישית",
    tips: [
      "בחר/י יעד אחד בכל פעם: ירידה, עלייה או שמירה.",
      "התחילו ב״קצב ממוצע״ — קל לשמירה לטווח הארוך וההצלחות בו גבוהות יותר.",
      "עדכן/י משקל פעם בשבוע באותה שעה, רצוי בבוקר אחרי שירותים.",
    ],
  },
  {
    icon: ChefHat,
    title: "רעיונות לארוחות",
    tips: [
      "הזן/י מגבלת קלוריות אחרונה ביום — כדי לסיים את היום בלי לחרוג.",
      "הצעות עם זמן הכנה קצר טובות במיוחד לימים עמוסים.",
      "ההיסטוריה נשמרת — חזרו לרעיון אהוב במקום לחולל מחדש.",
    ],
  },
  {
    icon: FileText,
    title: "דו״חות — ייצוא PDF",
    tips: [
      "ייצאו דו״ח חודשי בסוף כל חודש לארכיון אישי.",
      "טווח מותאם נוח לפני פגישה עם תזונאי/ת או מאמן/ת.",
      "הדו״ח נשלח ישירות לאימייל שאיתו נרשמתם.",
    ],
  },
  {
    icon: User2,
    title: "פרופיל — לעדכן ולא לשכוח",
    tips: [
      "וודאו שגובה, משקל ורמת פעילות מעודכנים — מהם מחושב ה־TDEE והיעדים.",
      "ככל שהפרופיל מדויק, היעדים והתחזיות מדויקים יותר.",
    ],
  },
];

const GENERAL_TIPS = [
  "תיעדו בזמן אמת — לא בסוף היום מהזיכרון.",
  "עקביות חשובה יותר משלמות — עדיף 80% כל יום מאשר 100% פעם בשבוע.",
  "השתמשו ב־AI כעוזר, לא כתחליף לשיקול דעת אישי.",
  "התחילו ביעד אחד, בקצב ממוצע — וצמחו משם.",
];

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

        <Card className="border-brand-200 bg-brand-50/50 dark:bg-brand-900/30 dark:border-brand-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-brand-600 dark:text-brand-400" />
              <CardTitle>הוראות שימוש באפליקציה</CardTitle>
            </div>
          </CardHeader>
          <CardSubtle>
            מדריך קצר לפי לשוניות — מה כדאי לעשות בכל מסך כדי להגיע ליעד מהר ובלי
            לוותר על איכות החיים.
          </CardSubtle>
        </Card>

        {GUIDE_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="size-5 text-brand-600 dark:text-brand-400" />
                  <CardTitle>{section.title}</CardTitle>
                </div>
              </CardHeader>
              <ul className="space-y-2">
                {section.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    <span className="text-surface-700 dark:text-surface-200">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-brand-600 dark:text-brand-400" />
              <CardTitle>טיפים כלליים</CardTitle>
            </div>
          </CardHeader>
          <ul className="space-y-2">
            {GENERAL_TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <span className="text-surface-700 dark:text-surface-200">{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
