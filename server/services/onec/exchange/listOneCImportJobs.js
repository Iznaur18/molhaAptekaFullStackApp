import { OneCImportJobModel } from "../../../models/index.js";

/**
 * Журнал разбора присланных 1С пакетов для кабинета продавца.
 *
 * `filePath` наружу не отдаём — это абсолютный путь на сервере.
 *
 * @param {string} sellerId
 * @param {{ limit?: number }} [opts]
 */
export async function listOneCImportJobs(sellerId, opts = {}) {
  const limit = Math.min(50, Math.max(1, Number(opts.limit) || 20));

  const rows = await OneCImportJobModel.find({ sellerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("-filePath")
    .lean();

  return rows.map((row) => ({
    id: String(row._id),
    filename: row.filename,
    kind: row.kind,
    status: row.status,
    stats: row.stats ?? null,
    issues: row.issues ?? [],
    errorMessage: row.errorMessage ?? "",
    createdAt: row.createdAt,
    startedAt: row.startedAt ?? null,
    finishedAt: row.finishedAt ?? null,
  }));
}
