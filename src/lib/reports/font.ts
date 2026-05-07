// Hebrew font registration for @react-pdf/renderer.
//
// Strategy:
// 1. If the user has bundled local TTFs at public/fonts/heebo/, use them
//    (most reliable, zero network dependency at runtime).
// 2. Otherwise fall back to a public TTF URL (raw.githubusercontent.com).
//
// The font is registered exactly once per Node process; subsequent calls
// are no-ops.
import path from "path";
import fs from "fs";
import { Font } from "@react-pdf/renderer";

let registered = false;

const REMOTE_REGULAR =
  process.env.REPORT_FONT_REGULAR_URL ||
  "https://raw.githubusercontent.com/google/fonts/main/ofl/heebo/static/Heebo-Regular.ttf";
const REMOTE_BOLD =
  process.env.REPORT_FONT_BOLD_URL ||
  "https://raw.githubusercontent.com/google/fonts/main/ofl/heebo/static/Heebo-Bold.ttf";

export const HEBREW_FONT_FAMILY = "Heebo";

export function registerHebrewFont() {
  if (registered) return;

  const localDir = path.join(process.cwd(), "public", "fonts", "heebo");
  const regularPath = path.join(localDir, "Heebo-Regular.ttf");
  const boldPath = path.join(localDir, "Heebo-Bold.ttf");

  const haveLocalRegular = fs.existsSync(regularPath);
  const haveLocalBold = fs.existsSync(boldPath);

  Font.register({
    family: HEBREW_FONT_FAMILY,
    fonts: [
      {
        // Path strings are accepted by react-pdf for filesystem reads; URLs
        // are fetched at register time.
        src: haveLocalRegular ? regularPath : REMOTE_REGULAR,
        fontWeight: 400,
      },
      {
        src: haveLocalBold ? boldPath : REMOTE_BOLD,
        fontWeight: 700,
      },
    ],
  });

  // Disable the hyphenation callback - it can mangle Hebrew text.
  Font.registerHyphenationCallback((word: string) => [word]);

  registered = true;
}
