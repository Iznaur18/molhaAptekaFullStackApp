import { resolveUploadedMediaUrl } from "@/shared/lib";

export const resolveProductPreviewVideoUrl = (product: unknown): string | null => {
  if (!product || typeof product !== "object") {
    return null;
  }

  const raw = (product as { productPreviewVideoUrl?: unknown }).productPreviewVideoUrl;
  if (raw == null || String(raw).trim() === "") {
    return null;
  }

  const resolved = resolveUploadedMediaUrl(String(raw).trim());
  return resolved.trim() !== "" ? resolved : null;
};
