// Hebrew font registration for @react-pdf/renderer.
//
// Strategy:
// 1. If the user has bundled local TTFs at public/fonts/heebo/, use them
//    (most reliable, zero network dependency at runtime).
// 2. Otherwise fall back to a public TTF URL (raw.githubusercontent.com).
//
// The font is registered exactly once per Node process; subsequent calls
// are no-ops. We register the same TTFs for both fontStyle "normal" and
// "italic" so that a request for italic Heebo (which has no true italic
// cut) resolves to the regular face instead of throwing.
import path from "path";
import fs from "fs";
import { Font } from "@react-pdf/renderer";

let registered = false;

const REMOTE_REGULAR =
  process.env.REPORT_FONT_REGULAR_URL ||
  "https://github.com/floriankarsten/heebo/raw/master/fonts/ttf/Heebo-Regular.ttf";
const REMOTE_BOLD =
  process.env.REPORT_FONT_BOLD_URL ||
  "https://github.com/floriankarsten/heebo/raw/master/fonts/ttf/Heebo-Bold.ttf";

export const HEBREW_FONT_FAMILY = "Heebo";

export function registerHebrewFont() {
  if (registered) return;

  const localDir = path.join(process.cwd(), "public", "fonts", "heebo");
  const regularPath = path.join(localDir, "Heebo-Regular.ttf");
  const boldPath = path.join(localDir, "Heebo-Bold.ttf");

  const haveLocalRegular = fs.existsSync(regularPath);
  const haveLocalBold = fs.existsSync(boldPath);

  const regularSrc = haveLocalRegular ? regularPath : REMOTE_REGULAR;
  const boldSrc = haveLocalBold ? boldPath : REMOTE_BOLD;

  Font.register({
    family: HEBREW_FONT_FAMILY,
    fonts: [
      // Regular, normal
      { src: regularSrc, fontWeight: 400, fontStyle: "normal" },
      // Regular, "italic" — fall back to the same regular TTF since
      // Heebo has no true italic cut. This prevents @react-pdf/renderer
      // from throwing "could not resolve font" when italics are requested.
      { src: regularSrc, fontWeight: 400, fontStyle: "italic" },
      // Bold, normal
      { src: boldSrc, fontWeight: 700, fontStyle: "normal" },
      // Bold, "italic" — same fallback strategy as above.
      { src: boldSrc, fontWeight: 700, fontStyle: "italic" },
    ],
  });

  // Disable the hyphenation callback - it can mangle Hebrew text.
  Font.registerHyphenationCallback((word: string) => [word]);

  registered = true;
}
