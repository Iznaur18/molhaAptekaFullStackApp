import { appIntroSettingsDataSchema } from "@molha/api-contract";
import type { z } from "zod";

export const appIntroSettingsQueryKeys = {
  public: () => ["app-intro", "public"] as const,
};

export type AppIntroPublicResponse = z.infer<typeof appIntroSettingsDataSchema>;
export type AppIntroSettings = AppIntroPublicResponse["settings"];

export { appIntroSettingsDataSchema };
