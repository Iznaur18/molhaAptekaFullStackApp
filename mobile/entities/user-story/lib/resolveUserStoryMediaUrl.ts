import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";

export const resolveUserStoryMediaUrl = (mediaUrl: string | null | undefined): string =>
  resolveUploadedMediaUrl(String(mediaUrl ?? "").trim());
