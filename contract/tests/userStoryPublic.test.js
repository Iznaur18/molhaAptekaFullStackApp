import assert from "node:assert/strict";
import { test } from "node:test";

import { userStoriesByAuthorDataSchema } from "../src/index.js";

const baseStory = {
  _id: "s1",
  authorUserId: "u1",
  mediaType: "image",
  mediaUrl: "/uploads/a.webp",
  captionText: "",
  publishedAt: "2026-10-26T10:00:00.000Z",
  expiresAt: "2026-10-27T10:00:00.000Z",
};

test("userStoriesByAuthorDataSchema: viewsCount автора не срезается", () => {
  const parsed = userStoriesByAuthorDataSchema.parse({
    stories: [{ ...baseStory, viewsCount: 12 }],
  });
  assert.equal(parsed.stories[0].viewsCount, 12);
});

test("userStoriesByAuthorDataSchema: без viewsCount у зрителя — поле отсутствует", () => {
  const parsed = userStoriesByAuthorDataSchema.parse({ stories: [baseStory] });
  assert.equal(parsed.stories[0].viewsCount, undefined);
});
