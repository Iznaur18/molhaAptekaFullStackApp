/**
 * Одноразовый бэкфил: проставить координаты сохранённым адресам пользователей.
 *
 *   node scripts/backfillUserAddressGeo.js            # dry-run (только отчёт)
 *   node scripts/backfillUserAddressGeo.js --apply    # выполнить
 *
 * Зачем. Адрес, у которого дома нет в ФИАС, до коммита c412505a сохранялся
 * «мягко» — без `geo` и `fiasId`. Новый код такие адреса координатами уже
 * снабжает, но у ТЕКУЩИХ записей в книге их по-прежнему нет, а из базы их
 * читают карта «рядом» и чекаут.
 *
 * Безопасность:
 *   - Строку адреса (`line`) НЕ переписываем: канонизация DaData теряет части
 *     вроде «уч 27а», а пользователь свой адрес уже подтвердил. Дописываем
 *     только пустые поля.
 *   - Пишем лишь тем адресам, для которых DaData вернула координаты; всё
 *     остальное остаётся как есть и попадает в отчёт.
 *   - Перед записью --apply складывает прежнее состояние затронутых
 *     пользователей в JSON рядом со скриптом — для отката.
 *   - Один запрос к DaData на уникальную строку адреса, с паузой между ними.
 */
import "dotenv/config";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mongoose from "mongoose";

import { isDadataSuggestConfigured } from "../utils/dadata/dadataClient.js";
import { verifyRuDeliveryAddress } from "../utils/dadata/verifyRuDeliveryAddress.js";

const isApply = process.argv.includes("--apply");
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DADATA_PAUSE_MS = 250;

/**
 * @param {number} ms
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {{ lat?: unknown; lon?: unknown } | null | undefined} geo
 */
function hasGeo(geo) {
  return (
    geo != null &&
    geo.lat != null &&
    geo.lon != null &&
    Number.isFinite(Number(geo.lat)) &&
    Number.isFinite(Number(geo.lon))
  );
}

/**
 * @param {unknown} value
 */
function isBlank(value) {
  return String(value ?? "").trim() === "";
}

/**
 * Координаты по строке адреса, с кешом на уникальную строку.
 *
 * Квартиру в запрос не кладём: на координаты дома она не влияет, а лишний
 * «кв 5» в строке иногда рушит совпадение подсказки.
 *
 * @param {Map<string, Awaited<ReturnType<typeof verifyRuDeliveryAddress>> | null>} cache
 * @param {string} line
 */
async function resolveAddress(cache, line) {
  const key = line.trim().toLowerCase();
  if (cache.has(key)) {
    return cache.get(key);
  }
  let verified = null;
  try {
    verified = await verifyRuDeliveryAddress({ addressLine: line, flat: "" });
  } catch (error) {
    console.log(
      `    DaData отказала: ${error instanceof Error ? error.message : error}`,
    );
  }
  cache.set(key, verified);
  await sleep(DADATA_PAUSE_MS);
  return verified;
}

/**
 * Что дописать в адрес книги: только пустые поля плюс координаты.
 *
 * @param {Record<string, unknown>} address
 * @param {Awaited<ReturnType<typeof verifyRuDeliveryAddress>>} verified
 * @param {string} prefix  путь до адреса в документе
 */
function buildAddressPatch(address, verified, prefix) {
  /** @type {Record<string, unknown>} */
  const patch = { [`${prefix}.geo`]: verified.geo };
  const optional = {
    fiasId: verified.fiasId,
    city: verified.city,
    district: verified.district,
    street: verified.street,
    house: verified.house,
  };
  for (const [field, value] of Object.entries(optional)) {
    if (isBlank(address[field]) && !isBlank(value)) {
      patch[`${prefix}.${field}`] = value;
    }
  }
  return patch;
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI не задан");
  }
  if (!isDadataSuggestConfigured()) {
    throw new Error("DADATA_API_KEY не задан — координаты брать неоткуда");
  }

  await mongoose.connect(process.env.MONGO_URI);
  try {
    const users = mongoose.connection.db.collection("users");
    const candidates = await users
      .find(
        {
          $or: [
            {
              userAddresses: {
                $elemMatch: {
                  line: { $nin: [null, ""] },
                  $or: [
                    { geo: null },
                    { geo: { $exists: false } },
                    { "geo.lat": null },
                  ],
                },
              },
            },
            {
              userAddress: { $nin: [null, ""] },
              $or: [
                { userAddressGeo: null },
                { userAddressGeo: { $exists: false } },
              ],
            },
          ],
        },
        {
          projection: {
            userName: 1,
            userAddress: 1,
            userAddressFiasId: 1,
            userAddressGeo: 1,
            userAddresses: 1,
          },
        },
      )
      .toArray();

    console.log(`Пользователей с адресами без координат: ${candidates.length}`);

    const cache = new Map();
    const backup = [];
    /** @type {Array<{ _id: unknown; patch: Record<string, unknown> }>} */
    const updates = [];
    let resolved = 0;
    let skipped = 0;
    let usersTouched = 0;

    for (const user of candidates) {
      /** @type {Record<string, unknown>} */
      const patch = {};
      console.log(`\n${user.userName ?? user._id} (${user._id})`);

      const book = Array.isArray(user.userAddresses) ? user.userAddresses : [];
      for (const [index, address] of book.entries()) {
        const line = String(address?.line ?? "").trim();
        if (!line || hasGeo(address?.geo)) {
          continue;
        }
        const verified = await resolveAddress(cache, line);
        if (!verified || !hasGeo(verified.geo)) {
          console.log(`  — [${index}] ${line}: координат нет, пропускаем`);
          skipped += 1;
          continue;
        }
        Object.assign(
          patch,
          buildAddressPatch(address, verified, `userAddresses.${index}`),
        );
        console.log(
          `  ✓ [${index}] ${line} → ${verified.geo.lat}, ${verified.geo.lon}`,
        );
        resolved += 1;
      }

      // Легаси-поля: заполняем, только когда книга пуста — иначе источник
      // истины книга, и userAddress трогать незачем.
      const legacyLine = String(user.userAddress ?? "").trim();
      if (book.length === 0 && legacyLine && !hasGeo(user.userAddressGeo)) {
        const verified = await resolveAddress(cache, legacyLine);
        if (verified && hasGeo(verified.geo)) {
          patch.userAddressGeo = verified.geo;
          if (isBlank(user.userAddressFiasId) && !isBlank(verified.fiasId)) {
            patch.userAddressFiasId = verified.fiasId;
          }
          console.log(
            `  ✓ userAddress: ${legacyLine} → ${verified.geo.lat}, ${verified.geo.lon}`,
          );
          resolved += 1;
        } else {
          console.log(`  — userAddress: ${legacyLine}: координат нет`);
          skipped += 1;
        }
      }

      if (Object.keys(patch).length === 0) {
        continue;
      }
      usersTouched += 1;
      updates.push({ _id: user._id, patch });
      backup.push({
        _id: user._id,
        userName: user.userName ?? null,
        userAddresses: user.userAddresses ?? null,
        userAddressGeo: user.userAddressGeo ?? null,
        userAddressFiasId: user.userAddressFiasId ?? null,
      });
    }

    console.log(
      `\nАдресов ${isApply ? "к записи" : "к обновлению"}: ${resolved}` +
        ` (пользователей: ${usersTouched}), без координат осталось: ${skipped}`,
    );

    if (!isApply) {
      console.log("\nDry-run. Для выполнения добавьте --apply");
      return;
    }

    // Снимок прежнего состояния пишем ДО первой записи — иначе откатывать
    // будет нечем, если что-то упадёт на середине.
    const backupPath = path.join(
      SCRIPT_DIR,
      `backfillUserAddressGeo.backup-${Date.now()}.json`,
    );
    await writeFile(backupPath, JSON.stringify(backup, null, 2), "utf8");
    console.log(`Прежнее состояние сохранено: ${backupPath}`);

    let written = 0;
    for (const update of updates) {
      const result = await users.updateOne(
        { _id: update._id },
        { $set: update.patch },
      );
      written += result.modifiedCount;
    }
    console.log(`Документов обновлено: ${written}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
