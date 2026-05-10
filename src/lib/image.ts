"use client";
/**
 * Client-side image utilities for the meal-photo flow.
 *
 * Phones can produce 12 MP / 5 MB images that are pure overkill for an LLM
 * vision call. Before we send the bytes over the wire we:
 *   1) decode the file via createImageBitmap (or an <img> fallback),
 *   2) downscale so the largest edge is at most `maxEdge` pixels,
 *   3) re-encode as JPEG at the given quality.
 * The result is a base64 string and the media type, ready to ship to the
 * /api/ai/parse-meal-image endpoint.
 */

export interface CompressedImage {
  base64: string;
  mediaType: "image/jpeg";
  width: number;
  height: number;
  bytes: number;
  /** data URL — convenient for previewing in <img>. */
  dataUrl: string;
}

export interface CompressOptions {
  /** Max length of the longer edge in pixels. */
  maxEdge?: number;
  /** JPEG encoding quality 0..1. */
  quality?: number;
}

async function loadBitmap(file: File | Blob): Promise<{
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  cleanup: () => void;
}> {
  // Modern browsers — handles EXIF orientation when given { imageOrientation: 'from-image' }.
  if (typeof createImageBitmap === "function") {
    const bm = await createImageBitmap(file, { imageOrientation: "from-image" } as any).catch(
      () => createImageBitmap(file),
    );
    return {
      width: bm.width,
      height: bm.height,
      draw: (ctx, w, h) => ctx.drawImage(bm, 0, 0, w, h),
      cleanup: () => bm.close?.(),
    };
  }
  // Fallback: HTMLImageElement with object URL.
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = url;
  });
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
    cleanup: () => URL.revokeObjectURL(url),
  };
}

export async function compressImageFile(
  file: File,
  opts: CompressOptions = {},
): Promise<CompressedImage> {
  const { maxEdge = 1280, quality = 0.85 } = opts;
  const { width: srcW, height: srcH, draw, cleanup } = await loadBitmap(file);
  const longest = Math.max(srcW, srcH);
  const scale = longest > maxEdge ? maxEdge / longest : 1;
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    cleanup();
    throw new Error("Canvas 2D context unavailable");
  }
  // White background, in case the source has transparency (PNG → JPEG).
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  draw(ctx, w, h);
  cleanup();

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      quality,
    ),
  );
  const dataUrl = await blobToDataUrl(blob);
  const base64 = dataUrl.split(",", 2)[1] ?? "";
  return {
    base64,
    mediaType: "image/jpeg",
    width: w,
    height: h,
    bytes: blob.size,
    dataUrl,
  };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(r.error || new Error("FileReader error"));
    r.readAsDataURL(blob);
  });
}
