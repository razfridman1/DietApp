"use client";
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
} from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { Card, CardHeader, CardTitle, CardSubtle } from "@/components/ui/Card";
import { T } from "@/lib/constants";

interface Section {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tips: string[];
}

const SECTIONS: Section[] = [
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

export default function GuidePage() {
  return (
    <>
      <TopBar title={T.nav.guide} />
      <div dir="rtl" className="space-y-4 pt-4">
        <Card className="border-brand-200 bg-brand-50/50 dark:bg-brand-900/30 dark:border-brand-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-brand-600 dark:text-brand-400" />
              <CardTitle>איך להפיק מהאפליקציה את המקסימום</CardTitle>
            </div>
          </CardHeader>
          <CardSubtle>
            מדריך קצר לפי לשוניות — מה כדאי לעשות בכל מסך כדי להגיע ליעד מהר ובלי
            לוותר על איכות החיים.
          </CardSubtle>
        </Card>

        {SECTIONS.map((section) => {
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
