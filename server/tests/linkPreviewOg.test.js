import assert from "node:assert/strict";
import test from "node:test";

import { isLinkPreviewBotUserAgent } from "@izibuy/shared-lib";

import { buildLinkPreviewHtml, escapeHtmlAttr } from "../services/link-preview/buildLinkPreviewHtml.js";
import {
  appendMediaCacheBust,
  resolveAbsolutePublicMediaUrl,
  resolveSiteOgImageUrl,
} from "../services/link-preview/resolveAbsolutePublicMediaUrl.js";

test("isLinkPreviewBotUserAgent: WhatsApp / Telegram / browser", () => {
  assert.equal(
    isLinkPreviewBotUserAgent("WhatsApp/2.0"),
    true,
  );
  assert.equal(
    isLinkPreviewBotUserAgent("TelegramBot (like TwitterBot)"),
    true,
  );
  assert.equal(
    isLinkPreviewBotUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    ),
    false,
  );
});

test("escapeHtmlAttr escapes markup", () => {
  assert.equal(escapeHtmlAttr(`a<"b">&`), "a&lt;&quot;b&quot;&gt;&amp;");
});

test("buildLinkPreviewHtml embeds og tags", () => {
  const html = buildLinkPreviewHtml({
    title: 'Товар "X"',
    description: "Описание",
    url: "https://gitorg.ru/product/abc",
    imageUrl: "https://cdn.gitorg.ru/uploads/p.jpg?v=1",
  });
  assert.match(html, /property="og:title" content="Товар &quot;X&quot;"/);
  assert.match(
    html,
    /property="og:image" content="https:\/\/cdn\.gitorg\.ru\/uploads\/p\.jpg\?v=1"/,
  );
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
});

test("resolveAbsolutePublicMediaUrl: preset / relative / absolute", () => {
  const prevFront = process.env.FRONTEND_URL;
  const prevCdn = process.env.PUBLIC_UPLOAD_BASE_URL;
  process.env.FRONTEND_URL = "https://gitorg.ru";
  process.env.PUBLIC_UPLOAD_BASE_URL = "https://cdn.gitorg.ru";
  try {
    assert.equal(resolveAbsolutePublicMediaUrl("preset:mist"), "");
    assert.equal(
      resolveAbsolutePublicMediaUrl("/uploads/a.jpg"),
      "https://cdn.gitorg.ru/uploads/a.jpg",
    );
    assert.equal(
      resolveAbsolutePublicMediaUrl("https://i.pinimg.com/x.jpg"),
      "https://i.pinimg.com/x.jpg",
    );
  } finally {
    if (prevFront == null) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = prevFront;
    if (prevCdn == null) delete process.env.PUBLIC_UPLOAD_BASE_URL;
    else process.env.PUBLIC_UPLOAD_BASE_URL = prevCdn;
  }
});

test("appendMediaCacheBust + resolveSiteOgImageUrl", () => {
  const prevFront = process.env.FRONTEND_URL;
  process.env.FRONTEND_URL = "https://gitorg.ru,https://www.gitorg.ru";
  try {
    assert.equal(resolveSiteOgImageUrl(), "https://gitorg.ru/og-image.png");
    assert.equal(
      appendMediaCacheBust("https://gitorg.ru/og-image.png", new Date("2020-01-01T00:00:00.000Z")),
      "https://gitorg.ru/og-image.png?v=1577836800000",
    );
  } finally {
    if (prevFront == null) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = prevFront;
  }
});
