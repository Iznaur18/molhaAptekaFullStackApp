import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { assertPublicHttpUrl } from "../services/product/bulkImport/guardedImageFetch.js";

describe("bulk import SSRF guard — assertPublicHttpUrl", () => {
  it("rejects non-http(s) protocols", async () => {
    await assert.rejects(
      () => assertPublicHttpUrl("file:///etc/passwd"),
      /http:\/\/ или https:\/\//,
    );
    await assert.rejects(
      () => assertPublicHttpUrl("ftp://example.com/a.jpg"),
      /http:\/\/ или https:\/\//,
    );
  });

  it("rejects malformed urls", async () => {
    await assert.rejects(() => assertPublicHttpUrl("not a url"), /Некорректный URL/);
    await assert.rejects(() => assertPublicHttpUrl(""), /Некорректный URL/);
  });

  it("blocks loopback ip literals", async () => {
    for (const url of [
      "http://127.0.0.1/a.jpg",
      "http://127.5.5.5/a.jpg",
      "http://[::1]/a.jpg",
    ]) {
      await assert.rejects(() => assertPublicHttpUrl(url), /внутренний адрес/, url);
    }
  });

  it("blocks private, link-local, metadata and CGNAT ranges", async () => {
    for (const url of [
      "http://10.0.0.5/a.jpg",
      "http://172.16.0.1/a.jpg",
      "http://172.31.255.255/a.jpg",
      "http://192.168.1.1/a.jpg",
      "http://169.254.169.254/latest/meta-data/", // cloud metadata
      "http://100.64.0.1/a.jpg", // CGNAT
      "http://0.0.0.0/a.jpg",
    ]) {
      await assert.rejects(() => assertPublicHttpUrl(url), /внутренний адрес/, url);
    }
  });

  it("blocks ipv4-mapped ipv6 pointing at internal ranges", async () => {
    await assert.rejects(
      () => assertPublicHttpUrl("http://[::ffff:127.0.0.1]/a.jpg"),
      /внутренний адрес/,
    );
    await assert.rejects(
      () => assertPublicHttpUrl("http://[::ffff:169.254.169.254]/a.jpg"),
      /внутренний адрес/,
    );
  });

  it("блокирует IPv6-литералы, а не уводит их в DNS", async () => {
    // URL отдаёт такой хост в скобках, а isIP скобки не понимает: литерал
    // уезжал мимо проверки диапазонов в резолвер. На Windows тот скобки
    // проглатывал и адрес всё же блокировался, на Linux падал с другой
    // ошибкой — расхождение вскрылось только когда CI впервые заработал.
    // Плюс URL нормализует ::ffff:127.0.0.1 в ::ffff:7f00:1, и точечный
    // разбор вложенного IPv4 по такой записи не срабатывал.
    for (const url of [
      "http://[::1]/a.jpg",
      "http://[::ffff:127.0.0.1]/a.jpg",
      "http://[::ffff:169.254.169.254]/a.jpg",
      "http://[fe80::1]/a.jpg",
      "http://[fc00::1]/a.jpg",
    ]) {
      await assert.rejects(() => assertPublicHttpUrl(url), /внутренний адрес/, url);
    }
  });

  it("публичный IPv6-литерал не блокируется заодно", async () => {
    const parsed = await assertPublicHttpUrl("http://[2606:4700:4700::1111]/a.jpg");
    assert.match(parsed.href, /2606:4700:4700::1111/);
  });

  it("allows public ip literals", async () => {
    const parsed = await assertPublicHttpUrl("http://1.1.1.1/a.jpg");
    assert.equal(parsed.hostname, "1.1.1.1");
    const parsed2 = await assertPublicHttpUrl("https://8.8.8.8/photo.png");
    assert.equal(parsed2.protocol, "https:");
  });
});
