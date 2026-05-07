// React-PDF document for the Hebrew nutrition + training report.
//
// Notes on RTL Hebrew:
//   * @react-pdf/renderer renders Hebrew correctly when given a font that
//     contains Hebrew glyphs (we register Heebo). Visual order is
//     handled by pdfkit's text layout once the font has the glyphs.
//   * We keep textAlign right on text and use right/left margins
//     symmetrically; numbers stay LTR as expected.
//
// The whole tree is plain JSX rendered server-side via renderToBuffer.
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Svg,
  Rect,
  Line,
  Polyline,
  Circle,
} from "@react-pdf/renderer";
import { fmtDate } from "@/lib/format";
import { HEBREW_FONT_FAMILY, registerHebrewFont } from "./font";
import type {
  ReportChartPoint,
  ReportDayDetail,
  ReportPayload,
} from "./types";
import { ACTIVITY_LABELS_HE } from "./types";

const COLORS = {
  brand: "#0ea5e9",
  brandDark: "#0369a1",
  ink: "#0f172a",
  inkSoft: "#475569",
  border: "#e2e8f0",
  protein: "#10b981",
  workout: "#f59e0b",
  net: "#8b5cf6",
  bgSoft: "#f1f5f9",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: HEBREW_FONT_FAMILY,
    fontSize: 10,
    color: COLORS.ink,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 36,
    lineHeight: 1.45,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.brand,
    borderBottomStyle: "solid",
  },
  brandBlock: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  brandLogo: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.brand,
    color: "#fff",
    borderRadius: 8,
    textAlign: "center",
    paddingTop: 9,
    fontWeight: 700,
    marginLeft: 10,
  },
  brandTitle: { fontSize: 16, fontWeight: 700 },
  brandSubtitle: { fontSize: 9, color: COLORS.inkSoft },
  metaBlock: { textAlign: "left", fontSize: 9, color: COLORS.inkSoft },
  metaRow: { textAlign: "left" },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    textAlign: "right",
    color: COLORS.brandDark,
  },
  card: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  statGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  statCard: {
    width: "31.5%",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 8,
    backgroundColor: COLORS.bgSoft,
  },
  statLabel: { fontSize: 8, color: COLORS.inkSoft, textAlign: "right" },
  statValue: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: "right",
    marginTop: 2,
  },
  statHint: { fontSize: 8, color: COLORS.inkSoft, textAlign: "right" },
  aiBox: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#bfdbfe",
    borderRadius: 8,
    padding: 10,
  },
  aiLabel: {
    fontSize: 9,
    color: COLORS.brandDark,
    fontWeight: 700,
    marginBottom: 4,
    textAlign: "right",
  },
  aiText: { fontSize: 10, textAlign: "right" },
  dayBlock: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  dayHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  dayTitle: { fontSize: 11, fontWeight: 700, textAlign: "right" },
  dayBadge: {
    fontSize: 8,
    color: "#fff",
    backgroundColor: COLORS.brand,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  subList: { marginTop: 4 },
  subListLabel: {
    fontSize: 9,
    color: COLORS.inkSoft,
    textAlign: "right",
    marginBottom: 2,
  },
  itemRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    fontSize: 9,
    paddingVertical: 1.5,
  },
  itemName: { flex: 1, textAlign: "right", paddingLeft: 8 },
  itemMeta: { textAlign: "left", color: COLORS.inkSoft, fontSize: 9 },
  totalsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: COLORS.border,
    fontSize: 9,
    fontWeight: 700,
  },
  emptyDay: {
    fontSize: 9,
    color: COLORS.inkSoft,
    textAlign: "right",
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    fontSize: 8,
    color: COLORS.inkSoft,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: COLORS.border,
  },
});

const fmtNumHe = (n: number, digits = 0) =>
  isNaN(n)
    ? "—"
    : new Intl.NumberFormat("he-IL", {
        maximumFractionDigits: digits,
        minimumFractionDigits: 0,
      }).format(n);

function formatRange(from: string, to: string): string {
  return fmtDate(from, "d/M/yyyy") + " – " + fmtDate(to, "d/M/yyyy");
}

interface ChartDims {
  width: number;
  height: number;
  padLeft: number;
  padRight: number;
  padTop: number;
  padBottom: number;
}

const DEFAULT_DIMS: ChartDims = {
  width: 520,
  height: 130,
  padLeft: 28,
  padRight: 12,
  padTop: 10,
  padBottom: 22,
};

function chartScale(dims: ChartDims, points: ReportChartPoint[]) {
  const innerW = dims.width - dims.padLeft - dims.padRight;
  const innerH = dims.height - dims.padTop - dims.padBottom;
  const max = Math.max(1, ...points.map((p) => p.value));
  const xStep = points.length > 1 ? innerW / (points.length - 1) : 0;
  const xAt = (i: number) => dims.padLeft + i * xStep;
  const yAt = (v: number) => dims.padTop + innerH - (v / max) * innerH;
  return { innerW, innerH, max, xAt, yAt };
}

function BarChart({
  data,
  color,
  unit,
}: {
  data: ReportChartPoint[];
  color: string;
  unit: string;
}) {
  const dims = DEFAULT_DIMS;
  const { innerW, innerH, max, xAt, yAt } = chartScale(dims, data);
  const barWidth =
    data.length > 0
      ? Math.max(2, Math.min(14, (innerW / data.length) * 0.7))
      : 4;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: dims.padTop + innerH - t * innerH,
    label: fmtNumHe(t * max),
  }));

  return (
    <Svg width={dims.width} height={dims.height}>
      {ticks.map((t, i) => (
        <Line
          key={"g" + i}
          x1={dims.padLeft}
          y1={t.y}
          x2={dims.width - dims.padRight}
          y2={t.y}
          stroke={COLORS.border}
          strokeWidth={0.5}
        />
      ))}
      {ticks.map((t, i) => (
        <Text
          key={"l" + i}
          x={dims.padLeft - 4}
          y={t.y + 3}
          style={{ fontSize: 7, fill: COLORS.inkSoft, textAlign: "right" }}
        >
          {t.label}
        </Text>
      ))}
      {data.map((p, i) => {
        const cx = xAt(i);
        const yTop = yAt(p.value);
        const h = dims.padTop + innerH - yTop;
        return (
          <Rect
            key={i}
            x={cx - barWidth / 2}
            y={yTop}
            width={barWidth}
            height={Math.max(0, h)}
            fill={color}
            rx={1.5}
          />
        );
      })}
      <Text
        x={dims.width - dims.padRight}
        y={dims.height - 4}
        style={{ fontSize: 7, fill: COLORS.inkSoft, textAlign: "left" }}
      >
        {unit}
      </Text>
    </Svg>
  );
}

function LineChart({
  data,
  color,
  unit,
}: {
  data: ReportChartPoint[];
  color: string;
  unit: string;
}) {
  const dims = DEFAULT_DIMS;
  const { innerH, max, xAt, yAt } = chartScale(dims, data);
  const points = data
    .map((p, i) => xAt(i).toFixed(2) + "," + yAt(p.value).toFixed(2))
    .join(" ");

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: dims.padTop + innerH - t * innerH,
    label: fmtNumHe(t * max),
  }));

  return (
    <Svg width={dims.width} height={dims.height}>
      {ticks.map((t, i) => (
        <Line
          key={"g" + i}
          x1={dims.padLeft}
          y1={t.y}
          x2={dims.width - dims.padRight}
          y2={t.y}
          stroke={COLORS.border}
          strokeWidth={0.5}
        />
      ))}
      {ticks.map((t, i) => (
        <Text
          key={"l" + i}
          x={dims.padLeft - 4}
          y={t.y + 3}
          style={{ fontSize: 7, fill: COLORS.inkSoft, textAlign: "right" }}
        >
          {t.label}
        </Text>
      ))}
      <Polyline points={points} fill="none" stroke={color} strokeWidth={1.4} />
      {data.map((p, i) => (
        <Circle key={i} cx={xAt(i)} cy={yAt(p.value)} r={1.5} fill={color} />
      ))}
      <Text
        x={dims.width - dims.padRight}
        y={dims.height - 4}
        style={{ fontSize: 7, fill: COLORS.inkSoft, textAlign: "left" }}
      >
        {unit}
      </Text>
    </Svg>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

function DayCard({ d }: { d: ReportDayDetail }) {
  const isEmpty =
    d.meals.length === 0 &&
    d.activities.length === 0 &&
    Number(d.log.calories_in) === 0 &&
    Number(d.log.calories_out) === 0;

  return (
    <View style={styles.dayBlock} wrap={false}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>{fmtDate(d.date, "EEEE, d/M/yyyy")}</Text>
        <Text style={styles.dayBadge}>
          {fmtNumHe(Number(d.log.calories_in))} קק״ל ·{" "}
          {fmtNumHe(Number(d.log.protein_total))} ג׳ חלבון
        </Text>
      </View>

      {isEmpty ? (
        <Text style={styles.emptyDay}>אין נתונים מתועדים ביום זה</Text>
      ) : (
        <>
          {d.meals.length > 0 ? (
            <View style={styles.subList}>
              <Text style={styles.subListLabel}>מזונות:</Text>
              {d.meals.map((m, idx) => (
                <View key={m.id || "m" + idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>• {m.name}</Text>
                  <Text style={styles.itemMeta}>
                    {fmtNumHe(Number(m.calories))} קק״ל ·{" "}
                    {fmtNumHe(Number(m.protein))} ג׳ חלבון
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {d.activities.length > 0 ? (
            <View style={styles.subList}>
              <Text style={styles.subListLabel}>אימונים:</Text>
              {d.activities.map((a, idx) => (
                <View key={a.id || "a" + idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    • {a.description || ACTIVITY_LABELS_HE[a.type]}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {fmtNumHe(Number(a.duration_min))} דק׳ ·{" "}
                    {fmtNumHe(Number(a.calories_burned))} קק״ל
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.totalsRow}>
            <Text>סיכום יומי</Text>
            <Text>
              {fmtNumHe(Number(d.log.calories_in))} קק״ל ·{" "}
              {fmtNumHe(Number(d.log.protein_total))} ג׳ חלבון ·{" "}
              {d.workoutCount} אימונים ({fmtNumHe(d.workoutMinutes)} דק׳)
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

function ReportDocument({ data }: { data: ReportPayload }) {
  const { profile, summary, charts, days, aiSummary, from, to, generatedAt } =
    data;

  return (
    <Document
      title="דו״ח תזונה וכושר"
      author={profile.display_name || profile.email}
      language="he"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <View style={styles.brandBlock}>
            <Text style={styles.brandLogo}>AI</Text>
            <View>
              <Text style={styles.brandTitle}>תזונה וכושר AI</Text>
              <Text style={styles.brandSubtitle}>דו״ח התקדמות אישי</Text>
            </View>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaRow}>
              {profile.display_name ? profile.display_name : "משתמש/ת"}
            </Text>
            <Text style={styles.metaRow}>{profile.email}</Text>
            <Text style={styles.metaRow}>טווח: {formatRange(from, to)}</Text>
            <Text style={styles.metaRow}>
              נוצר: {fmtDate(generatedAt.slice(0, 10), "d/M/yyyy")}
            </Text>
          </View>
        </View>

        {aiSummary ? (
          <View style={styles.section}>
            <View style={styles.aiBox}>
              <Text style={styles.aiLabel}>סיכום AI</Text>
              <Text style={styles.aiText}>{aiSummary}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>סיכום הטווח</Text>
          <View style={styles.statGrid}>
            <StatCard
              label="ממוצע קלוריות יומי"
              value={fmtNumHe(summary.avgCalories)}
              hint="קק״ל"
            />
            <StatCard
              label="ממוצע חלבון יומי"
              value={fmtNumHe(summary.avgProtein)}
              hint="גרם"
            />
            <StatCard
              label="סך הקלוריות"
              value={fmtNumHe(summary.totalCalories)}
              hint="קק״ל"
            />
            <StatCard
              label="סך החלבון"
              value={fmtNumHe(summary.totalProtein)}
              hint="גרם"
            />
            <StatCard
              label="סך אימונים"
              value={fmtNumHe(summary.totalWorkouts)}
              hint={fmtNumHe(summary.totalWorkoutMinutes) + " דק׳"}
            />
            <StatCard
              label="ימים מתועדים"
              value={summary.trackedDays + "/" + summary.totalDays}
              hint="ימים"
            />
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>קלוריות יומיות</Text>
          <View style={styles.card}>
            <BarChart data={charts.calories} color={COLORS.brand} unit="קק״ל" />
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>חלבון יומי</Text>
          <View style={styles.card}>
            <BarChart data={charts.protein} color={COLORS.protein} unit="גרם" />
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>תדירות אימונים</Text>
          <View style={styles.card}>
            <BarChart
              data={charts.workouts}
              color={COLORS.workout}
              unit="אימונים"
            />
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>מגמות לאורך זמן (מאזן קלורי)</Text>
          <View style={styles.card}>
            <LineChart data={charts.net} color={COLORS.net} unit="קק״ל" />
          </View>
        </View>

        <View style={{ ...styles.section, marginTop: 6 }}>
          <Text style={styles.sectionTitle}>היסטוריית ימים מלאה</Text>
          {days.map((d) => (
            <DayCard key={d.date} d={d} />
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text
            render={(p: { pageNumber: number; totalPages: number }) =>
              "עמוד " + p.pageNumber + " מתוך " + p.totalPages
            }
          />
          <Text>תזונה וכושר AI · דו״ח אישי</Text>
        </View>
      </Page>
    </Document>
  );
}

/** Render the report to a Node Buffer (PDF bytes). */
export async function renderReportPdf(data: ReportPayload): Promise<Buffer> {
  registerHebrewFont();
  const buf = await renderToBuffer(<ReportDocument data={data} />);
  return buf;
}
