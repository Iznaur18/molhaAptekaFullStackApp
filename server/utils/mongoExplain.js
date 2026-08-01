/**
 * @param {unknown} plan
 * @param {{ stage: string; indexName?: string }[]} [out]
 */
export function collectExplainStages(plan, out = []) {
  if (!plan || typeof plan !== "object") {
    return out;
  }

  const record = /** @type {{ stage?: string; indexName?: string }} */ (plan);
  if (record.stage) {
    out.push({
      stage: record.stage,
      indexName: record.indexName,
    });
  }

  if ("inputStage" in record) {
    collectExplainStages(record.inputStage, out);
  }
  if ("outerStage" in record) {
    collectExplainStages(record.outerStage, out);
  }
  if ("shards" in record && Array.isArray(record.shards)) {
    for (const shard of record.shards) {
      collectExplainStages(shard, out);
    }
  }

  return out;
}

/**
 * @param {unknown} explainResult
 */
export function getWinningExecutionStages(explainResult) {
  if (!explainResult || typeof explainResult !== "object") {
    return null;
  }

  const root = /** @type {Record<string, unknown>} */ (explainResult);

  if (root.executionStats && typeof root.executionStats === "object") {
    const stats = /** @type {{ executionStages?: unknown }} */ (root.executionStats);
    if (stats.executionStages) {
      return stats.executionStages;
    }
  }

  if (Array.isArray(root.stages)) {
    for (const stage of root.stages) {
      if (!stage || typeof stage !== "object") {
        continue;
      }
      const cursor =
        /** @type {{ $cursor?: { executionStats?: { executionStages?: unknown } } }} */ (
          stage
        ).$cursor;
      const nested = cursor?.executionStats?.executionStages;
      if (nested) {
        return nested;
      }
    }
  }

  const planner = /** @type {{ winningPlan?: unknown }} | undefined */ (
    root.queryPlanner
  );
  return planner?.winningPlan ?? null;
}

/**
 * @param {unknown} explainResult
 * @param {string} [indexNameSubstring]
 */
export function explainUsesIndexScan(explainResult, indexNameSubstring = "") {
  const stages = collectExplainStages(getWinningExecutionStages(explainResult));
  return stages.some((stage) => {
    if (stage.stage !== "IXSCAN") {
      return false;
    }
    if (!indexNameSubstring) {
      return true;
    }
    return String(stage.indexName ?? "").includes(indexNameSubstring);
  });
}

/**
 * @param {unknown} explainResult
 */
export function explainUsesCollectionScan(explainResult) {
  const stages = collectExplainStages(getWinningExecutionStages(explainResult));
  return stages.some((stage) => stage.stage === "COLLSCAN");
}
