import { createReadStream } from "node:fs";
import { open } from "node:fs/promises";

import sax from "sax";

/**
 * CommerceML из 1С исторически идёт в windows-1251, современные релизы —
 * в UTF-8. Кодировка объявлена в прологе, читаем её из первых байт файла.
 *
 * @param {string} filePath
 * @returns {Promise<string>} label для TextDecoder
 */
export async function detectXmlEncoding(filePath) {
  const handle = await open(filePath, "r");
  try {
    const head = Buffer.alloc(256);
    const { bytesRead } = await handle.read(head, 0, 256, 0);
    const prolog = head.subarray(0, bytesRead).toString("latin1");
    const match = /encoding\s*=\s*["']([\w-]+)["']/i.exec(prolog);
    const raw = match?.[1]?.toLowerCase();
    if (!raw) return "utf-8";
    if (raw === "utf-8" || raw === "utf8") return "utf-8";
    if (raw === "windows-1251" || raw === "cp1251") return "windows-1251";
    if (raw === "windows-1252" || raw === "cp1252") return "windows-1252";
    if (raw === "koi8-r") return "koi8-r";
    return raw;
  } finally {
    await handle.close();
  }
}

/**
 * Плоское представление узла: атрибуты в `$`, текст в `_`, дети — по имени тега
 * (второй одноимённый ребёнок превращает поле в массив).
 *
 * @typedef {{ $: Record<string, string>, _: string, [child: string]: unknown }} XmlNode
 */

/** @param {string} name @param {Record<string, {value: string}>} attributes */
function createNode(name, attributes) {
  /** @type {Record<string, string>} */
  const attrs = {};
  for (const [key, attr] of Object.entries(attributes ?? {})) {
    attrs[key] = typeof attr === "string" ? attr : (attr?.value ?? "");
  }
  return { __name: name, $: attrs, _: "" };
}

/** @param {XmlNode} parent @param {string} name @param {XmlNode} child */
function attachChild(parent, name, child) {
  const existing = parent[name];
  if (existing === undefined) {
    parent[name] = child;
    return;
  }
  if (Array.isArray(existing)) {
    existing.push(child);
    return;
  }
  parent[name] = [existing, child];
}

/**
 * Стрим XML: собирает поддеревья интересующих тегов и отдаёт их пачками.
 *
 * Весь смысл — не держать каталог целиком в памяти: узлы живут ровно до того
 * момента, как их заберёт `onBatch`, дальше их съедает GC. `parser.write()`
 * синхронный, поэтому обратное давление получаем естественно — читающий поток
 * ждёт, пока отработает `await onBatch(...)`.
 *
 * @param {{
 *   filePath: string;
 *   capture: string[];
 *   batchSize?: number;
 *   onBatch: (nodes: Array<XmlNode & { __name: string }>) => Promise<void> | void;
 *   onOpenTag?: (name: string, attributes: Record<string, string>) => void;
 * }} params
 */
export async function streamXmlElements({
  filePath,
  capture,
  batchSize = 200,
  onBatch,
  onOpenTag,
}) {
  const captureSet = new Set(capture);
  const encoding = await detectXmlEncoding(filePath);
  const decoder = new TextDecoder(encoding, { fatal: false });

  const parser = sax.parser(true, { trim: false, position: false });

  /** Стек открытых узлов внутри захваченного поддерева. */
  /** @type {Array<XmlNode & { __name: string }>} */
  const stack = [];
  /** @type {Array<XmlNode & { __name: string }>} */
  let pending = [];
  /** @type {Error | null} */
  let parseError = null;

  parser.onerror = (error) => {
    parseError = error instanceof Error ? error : new Error(String(error));
    // Без resume sax перестаёт разбирать остаток файла и молча теряет данные.
    parser.resume();
  };

  parser.onopentag = (tag) => {
    // Служебные атрибуты (`СодержитТолькоИзменения` у `<Каталог>`) висят на
    // контейнерах, которые захватывать целиком нельзя — это весь файл.
    if (onOpenTag && stack.length === 0) {
      /** @type {Record<string, string>} */
      const attrs = {};
      for (const [key, value] of Object.entries(tag.attributes ?? {})) {
        attrs[key] = typeof value === "string" ? value : (value?.value ?? "");
      }
      onOpenTag(tag.name, attrs);
    }
    if (stack.length === 0 && !captureSet.has(tag.name)) return;
    stack.push(createNode(tag.name, tag.attributes));
  };

  parser.ontext = (text) => {
    const top = stack[stack.length - 1];
    if (top) top._ += text;
  };

  parser.oncdata = (text) => {
    const top = stack[stack.length - 1];
    if (top) top._ += text;
  };

  parser.onclosetag = (name) => {
    if (stack.length === 0) return;
    const node = stack.pop();
    if (!node || node.__name !== name) return;
    node._ = node._.trim();
    const parent = stack[stack.length - 1];
    if (parent) {
      attachChild(parent, name, node);
      return;
    }
    pending.push(node);
  };

  const stream = createReadStream(filePath);
  try {
    for await (const chunk of stream) {
      parser.write(decoder.decode(chunk, { stream: true }));
      if (parseError) throw parseError;
      while (pending.length >= batchSize) {
        const batch = pending.slice(0, batchSize);
        pending = pending.slice(batchSize);
        await onBatch(batch);
      }
    }
    parser.write(decoder.decode());
    parser.close();
    if (parseError) throw parseError;
    if (pending.length > 0) {
      await onBatch(pending);
      pending = [];
    }
  } finally {
    stream.destroy();
  }
}

/**
 * Текст ребёнка (`<Ид>…</Ид>` → строка). Массив детей — берём первый.
 *
 * @param {unknown} node
 * @param {string} childName
 * @returns {string}
 */
export function childText(node, childName) {
  const child = /** @type {Record<string, unknown>} */ (node ?? {})[childName];
  const first = Array.isArray(child) ? child[0] : child;
  if (!first || typeof first !== "object") return "";
  const text = /** @type {{ _?: unknown }} */ (first)._;
  return typeof text === "string" ? text.trim() : "";
}

/**
 * Дети с данным именем всегда массивом — CommerceML свободно чередует
 * «одна картинка» и «пять картинок» в пределах одного файла.
 *
 * @param {unknown} node
 * @param {string} childName
 * @returns {Array<Record<string, unknown>>}
 */
export function childList(node, childName) {
  const child = /** @type {Record<string, unknown>} */ (node ?? {})[childName];
  if (child === undefined || child === null) return [];
  return Array.isArray(child) ? child : [child];
}
