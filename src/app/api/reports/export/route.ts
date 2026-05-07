// POST /api/reports/export
//
// Authenticates the user, builds a report payload from their data,
// renders a Hebrew RTL PDF, and emails it as an attachment to the
// email address associated with their account.
//
// All Supabase queries are filtered by the authenticated user id —
// the request body MUST NOT contain a userId.
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { buildReport, resolveRange } from "@/lib/reports/aggregate";
import { renderReportPdf } from "@/lib/reports/pdf";
import { generateAISummary } from "@/lib/reports/aiSummary";
import { buildReportEmailBody, sendReportEmail } from "@/lib/reports/email";
import { fmtDate } from "@/lib/format";
import type { ReportPayload, ReportRange } from "@/lib/reports/types";

// PDF rendering needs Node primitives; ensure we never run on the Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  range: z.enum(["weekly", "monthly", "yearly", "custom"]),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "to must be YYYY-MM-DD")
    .optional(),
});

function rangeLabel(range: ReportRange, from: string, to: string): string {
  if (range === "weekly") return "השבוע האחרון";
  if (range === "monthly") return "החודש האחרון";
  if (range === "yearly") return "השנה האחרונה";
  return `${fmtDate(from, "d/M/yyyy")} – ${fmtDate(to, "d/M/yyyy")}`;
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;

  if (!user.email) return err("חשבון ללא כתובת אימייל מאומתת", 400);

  const parsed = await readBody(req, Body);
  if (parsed instanceof Response) return parsed;

  // 1. Resolve the date range.
  let range: { from: string; to: string };
  try {
    range = resolveRange({
      range: parsed.range,
      from: parsed.from,
      to: parsed.to,
    });
  } catch (e: any) {
    return err(`טווח לא תקין: ${e?.message || "invalid range"}`, 422);
  }

  // 2. Aggregate data scoped to this user only.
  let aggregated;
  try {
    aggregated = await buildReport(supabase, user, range);
  } catch (e: any) {
    return err(`שגיאה בקריאת הנתונים: ${e?.message || "unknown"}`, 500);
  }

  // 3. AI summary (best-effort, never fatal).
  const aiSummary = await generateAISummary({
    rangeLabel: rangeLabel(parsed.range, range.from, range.to),
    summary: aggregated.summary,
  });

  // 4. Build the full payload.
  const payload: ReportPayload = {
    range: parsed.range,
    from: aggregated.from,
    to: aggregated.to,
    generatedAt: new Date().toISOString(),
    profile: aggregated.profile,
    summary: aggregated.summary,
    charts: aggregated.charts,
    days: aggregated.days,
    aiSummary,
  };

  // 5. Render the PDF.
  let pdf: Buffer;
  try {
    pdf = await renderReportPdf(payload);
  } catch (e: any) {
    return err(`כשל ביצירת PDF: ${e?.message || "unknown"}`, 500);
  }

  // 6. Send the email to the authenticated user only.
  const filename = `report-${parsed.range}-${range.from}-to-${range.to}.pdf`;
  const subject = `דו״ח תזונה וכושר — ${rangeLabel(parsed.range, range.from, range.to)}`;
  const bodyHtml = buildReportEmailBody({
    displayName: aggregated.profile.display_name,
    rangeLabel: rangeLabel(parsed.range, range.from, range.to),
    trackedDays: aggregated.summary.trackedDays,
    totalWorkouts: aggregated.summary.totalWorkouts,
  });

  try {
    await sendReportEmail({
      to: user.email,
      subject,
      bodyHtml,
      pdfBuffer: pdf,
      pdfFilename: filename,
    });
  } catch (e: any) {
    return err(`שליחת המייל נכשלה: ${e?.message || "unknown"}`, 500);
  }

  return json({
    ok: true,
    sentTo: user.email,
    filename,
    range: parsed.range,
    from: range.from,
    to: range.to,
    summary: aggregated.summary,
  });
}
