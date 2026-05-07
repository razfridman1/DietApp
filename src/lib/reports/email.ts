// Email delivery for the Reports feature.
//
// Primary provider: Resend (REST API). Fallback: SMTP via Nodemailer
// when configured. Both providers are wrapped behind a single
// `sendReportEmail` interface so the API route doesn't need to care.
//
// Required env (Resend):
//   RESEND_API_KEY=re_...
//   REPORT_FROM_EMAIL="תזונה וכושר AI <noreply@yourdomain.com>"
//
// Optional env (SMTP fallback):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
//
// If neither is configured, the function throws so the API route can
// return a 500 with a clear message.

interface SendReportEmailArgs {
  to: string;
  subject: string;
  bodyHtml: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}

const FROM_DEFAULT = "Nutrition AI <onboarding@resend.dev>";

export async function sendReportEmail(args: SendReportEmailArgs): Promise<void> {
  const { to, subject, bodyHtml, pdfBuffer, pdfFilename } = args;

  if (!isValidEmail(to)) {
    throw new Error("invalid recipient email");
  }

  // 1) Resend (preferred)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const from = process.env.REPORT_FROM_EMAIL || FROM_DEFAULT;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html: bodyHtml,
        attachments: [
          {
            filename: pdfFilename,
            content: pdfBuffer.toString("base64"),
          },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`resend failed: ${res.status} ${errText}`);
    }
    return;
  }

  // 2) Nodemailer SMTP fallback (optional). We dynamic-import so apps
  //    that don't install nodemailer don't pay any bundle cost.
  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost) {
    let nodemailerMod: any;
    try {
      // Use a runtime-evaluated import so TypeScript does not require
      // nodemailer to be installed at build time.
      nodemailerMod = await (Function("m", "return import(m)") as any)(
        "nodemailer",
      );
    } catch {
      throw new Error(
        "SMTP_HOST set but nodemailer is not installed. Run `npm i nodemailer`.",
      );
    }
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = port === 465;
    const factory = nodemailerMod.default ?? nodemailerMod;
    const transporter = factory.createTransport({
      host: smtpHost,
      port,
      secure,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || FROM_DEFAULT,
      to,
      subject,
      html: bodyHtml,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
        },
      ],
    });
    return;
  }

  throw new Error(
    "Email provider not configured. Set RESEND_API_KEY or SMTP_* env vars.",
  );
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function buildReportEmailBody(opts: {
  displayName: string | null;
  rangeLabel: string;
  trackedDays: number;
  totalWorkouts: number;
}): string {
  const greeting = opts.displayName
    ? "שלום " + opts.displayName + ","
    : "שלום,";
  // Inline CSS, RTL-friendly. Keep markup simple to maximise client compatibility.
  return [
    '<!doctype html>',
    '<html lang="he" dir="rtl">',
    '  <body style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#0f172a;">',
    '    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">',
    '      <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);color:#fff;padding:18px 22px;">',
    '        <div style="font-size:18px;font-weight:700;">תזונה וכושר AI</div>',
    '        <div style="font-size:12px;opacity:0.9;margin-top:2px;">דו״ח התקדמות אישי</div>',
    '      </div>',
    '      <div style="padding:22px;">',
    '        <p style="margin:0 0 8px 0;">' + escapeHtml(greeting) + '</p>',
    '        <p style="margin:0 0 14px 0;line-height:1.6;">',
    '          הדו״ח האישי שלך עבור <strong>' + escapeHtml(opts.rangeLabel) + '</strong>',
    '          מצורף כקובץ PDF.',
    '        </p>',
    '        <p style="margin:0 0 14px 0;line-height:1.6;color:#475569;">',
    '          הדו״ח כולל סיכום, גרפים, היסטוריית ימים מלאה והתקדמות לאורך זמן.',
    '        </p>',
    '        <ul style="margin:0 0 14px 0;padding:0 18px 0 0;color:#0f172a;">',
    '          <li>ימים מתועדים: <strong>' + opts.trackedDays + '</strong></li>',
    '          <li>סך אימונים: <strong>' + opts.totalWorkouts + '</strong></li>',
    '        </ul>',
    '        <p style="margin:14px 0 0 0;color:#94a3b8;font-size:12px;">',
    '          הודעה זו נשלחה אוטומטית. אם לא ביקשת אותה, ניתן להתעלם.',
    '        </p>',
    '      </div>',
    '    </div>',
    '  </body>',
    '</html>',
  ].join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
