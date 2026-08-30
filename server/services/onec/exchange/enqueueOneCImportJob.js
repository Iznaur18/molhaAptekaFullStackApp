import { getAppQueue } from "../../../queues/appQueue.js";
import { JOB_PROCESS_ONEC_COMMERCEML_IMPORT } from "../../../queues/queueConstants.js";
import { formatLogError, logServerEvent } from "../../../utils/logServerEvent.js";
import { processOneCImportJob } from "./processOneCImportJob.js";

/**
 * 1С ждёт `success` на `mode=import` в пределах своего таймаута, а разбор
 * каталога на десятки тысяч позиций идёт минутами — поэтому только ставим
 * задачу и сразу отвечаем.
 *
 * Без Redis (локальная разработка) выполняем inline в следующем тике: ответ
 * 1С всё равно уходит первым, а брошенные задачи подхватит
 * `resumeStalledOneCImportJobs` из cron.
 *
 * @param {string} jobId
 * @returns {Promise<{ queued: boolean }>}
 */
export async function enqueueOneCImportJob(jobId) {
  const queue = getAppQueue();
  const normalizedJobId = String(jobId);

  if (queue) {
    await queue.add(
      JOB_PROCESS_ONEC_COMMERCEML_IMPORT,
      { jobId: normalizedJobId },
      { attempts: 1, removeOnComplete: 100, removeOnFail: 200 },
    );
    return { queued: true };
  }

  setImmediate(() => {
    processOneCImportJob(normalizedJobId).catch((error) => {
      logServerEvent("error", {
        event: "onec.commerceml_import_inline_failed",
        jobId: normalizedJobId,
        ...formatLogError(error),
      });
    });
  });

  return { queued: false };
}
