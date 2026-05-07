Place Hebrew Heebo TTF files here for fully offline PDF generation:

  public/fonts/heebo/Heebo-Regular.ttf
  public/fonts/heebo/Heebo-Bold.ttf

Source (Open Font License):
  https://github.com/google/fonts/tree/main/ofl/heebo/static

If the files are absent, the PDF generator falls back to fetching Heebo
from a public URL at runtime (configurable via REPORT_FONT_REGULAR_URL /
REPORT_FONT_BOLD_URL env vars).
