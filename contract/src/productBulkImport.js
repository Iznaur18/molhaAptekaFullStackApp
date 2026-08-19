import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

export const PRODUCT_BULK_IMPORT_JOB_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
];

export const productBulkImportValidationErrorSchema = z.object({
  row: z.number().int().positive(),
  field: z.string().trim().min(1),
  message: z.string().trim().min(1),
});

export const productBulkImportValidationFailedDataSchema = z.object({
  message: z.string().trim().min(1),
  errors: z.array(productBulkImportValidationErrorSchema).min(1),
});

export const productBulkImportSubmitDataSchema = z.object({
  jobId: mongoIdSchema,
  totalRows: z.number().int().positive(),
});

export const productBulkImportJobStatusDataSchema = z.object({
  jobId: mongoIdSchema,
  status: z.enum(PRODUCT_BULK_IMPORT_JOB_STATUSES),
  totalRows: z.number().int().nonnegative(),
  processedRows: z.number().int().nonnegative(),
  createdCount: z.number().int().nonnegative(),
  errorMessage: z.string().optional().default(""),
});

export const productBulkImportJobIdParamsSchema = z.object({
  jobId: mongoIdSchema,
});
