import { getAppQueue } from "../../../queues/appQueue.js";
import { JOB_PROCESS_PRODUCT_BULK_IMPORT } from "../../../queues/queueConstants.js";
import { processProductBulkImportJob } from "./processProductBulkImportJob.js";
import { formatLogError, logServerEvent } from "../../../utils/logServerEvent.js";

const BULK_IMPORT_JOB_ATTEMPTS = 1;

/**
 * @param {string} jobId
 * @returns {Promise<{ queued: boolean }>}
 */
export async function enqueueProductBulkImport(jobId) {
  const queue = getAppQueue();
  const normalizedJobId = String(jobId);

  if (queue) {
    await queue.add(
      JOB_PROCESS_PRODUCT_BULK_IMPORT,
      { jobId: normalizedJobId },
      {
        attempts: BULK_IMPORT_JOB_ATTEMPTS,
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );
    return { queued: true };
  }

  setImmediate(() => {
    processProductBulkImportJob(normalizedJobId).catch((error) => {
      logServerEvent("error", {
        event: "product_bulk_import_inline_failed",
        jobId: normalizedJobId,
        ...formatLogError(error),
      });
    });
  });

  return { queued: false };
}
