import assert from "node:assert/strict";
import test from "node:test";

import {
  formatIsoDateTime,
  formatPriceRub,
  normalizeUploadUrlForStorage,
} from "@izibuy/shared-lib";

test("formatPriceRub: formats finite values and handles empty", () => {
  assert.match(formatPriceRub(12500), /12.*500.*₽/);
  assert.equal(formatPriceRub(null), "—");
  assert.equal(formatPriceRub(undefined), "—");
  assert.equal(formatPriceRub(Number.NaN), "—");
});

test("normalizeUploadUrlForStorage: keeps canonical /uploads path", () => {
  assert.equal(
    normalizeUploadUrlForStorage("http://127.0.0.1:5173/uploads/image.webp?x=1"),
    "/uploads/image.webp",
  );
  assert.equal(normalizeUploadUrlForStorage("/uploads/photo.png"), "/uploads/photo.png");
  assert.equal(
    normalizeUploadUrlForStorage("https://cdn.example.com/image.jpg"),
    "https://cdn.example.com/image.jpg",
  );
  assert.equal(normalizeUploadUrlForStorage(""), "");
});

test("formatIsoDateTime: stable fallback and date format", () => {
  assert.equal(formatIsoDateTime(null), "—");
  assert.equal(formatIsoDateTime("not-a-date"), "not-a-date");
  assert.match(formatIsoDateTime("2026-06-17T08:30:00.000Z"), /\d{2}\.\d{2}\.\d{4}/);
});
