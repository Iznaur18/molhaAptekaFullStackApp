import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { processAppQueueJob } from "../jobs/processAppQueueJob.js";

describe("processAppQueueJob", () => {
  it("throws for unknown job name", async () => {
    await assert.rejects(
      () =>
        processAppQueueJob({
          name: "unknownJob",
          data: {},
        }),
      /Unknown BullMQ job/,
    );
  });
});
