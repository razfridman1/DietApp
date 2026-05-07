// GET /api/reports/preview?range=weekly|monthly|yearly|custom&from=&to=
//
// Lightweight preview: returns summary statistics, chart series, and the
// full daily history (meals + activities) for the selected range. The
// PDF route uses the same aggregator so the on-screen preview matches
// the exported file exactly.
import { requireUser } from "@/lib/supabase/server";
import { err, json } from "@/lib/api-helpers";
import { buildReport, resolveRange } from "@/lib/reports/aggregate";
import type { ReportRange } from "@/lib/reports/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: ReportRange[] = ["weekly", "monthly", "yearly", "custom"];

export async function GET(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;

  const url = new URL(req.url);
  const range = (url.searchParams.get("range") || "weekly") as ReportRange;
  if (!VALID.includes(range)) return err("invalid range", 422);
  const fromQ = url.searchParams.get("from") || undefined;
  const toQ = url.searchParams.get("to") || undefined;

  let resolved;
  try {
    resolved = resolveRange({ range, from: fromQ, to: toQ });
  } catch (e: any) {
    return err("invalid range: " + (e?.message || "invalid"), 422);
  }

  let aggregated;
  try {
    aggregated = await buildReport(supabase, user, resolved);
  } catch (e: any) {
    return err(e?.message || "unknown", 500);
  }

  return json({
    range,
    from: aggregated.from,
    to: aggregated.to,
    summary: aggregated.summary,
    charts: aggregated.charts,
    days: aggregated.days,
  });
}
