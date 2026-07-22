import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const maskBirthDateInput = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  if (digits.length <= 2) return day;
  if (digits.length <= 4) return `${day}.${month}`;
  return `${day}.${month}.${year}`;
};

const parseBirthDateInputToIsoDate = (masked) => {
  const trimmed = masked.trim();
  const dotted = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmed);
  if (dotted) {
    const day = Number(dotted[1]);
    const month = Number(dotted[2]);
    const year = Number(dotted[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const utc = new Date(Date.UTC(year, month - 1, day));
    if (
      utc.getUTCFullYear() !== year ||
      utc.getUTCMonth() !== month - 1 ||
      utc.getUTCDate() !== day
    ) {
      return null;
    }
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!iso) return null;
  const year = Number(iso[1]);
  const month = Number(iso[2]);
  const day = Number(iso[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

test("profile birth date uses DD.MM.YYYY mask and ISO patch", () => {
  const form = readMobileFile("features/profile-edit/ui/EditProfileForm.tsx");
  const patch = readMobileFile("entities/user/lib/buildPatchUserProfileBody.ts");
  const map = readMobileFile("entities/user/lib/mapUserToEditProfileForm.ts");
  const validate = readMobileFile("entities/user/lib/validateEditProfileForm.ts");

  assert.match(form, /maskBirthDateInput/);
  assert.match(form, /PLACEHOLDER_BIRTH_DATE/);
  assert.match(map, /formatBirthDateForInput/);
  assert.match(patch, /parseBirthDateInputToIsoDate/);
  assert.match(patch, /birthDateIsoDateToApiValue/);
  assert.doesNotMatch(patch, /\$\{form\.userBirthDate\}T12:00:00/);
  assert.match(validate, /Дата рождения: ДД\.ММ\.ГГГГ/);
});

test("birth date mask and parse round-trip", () => {
  assert.equal(maskBirthDateInput("15011990"), "15.01.1990");
  assert.equal(parseBirthDateInputToIsoDate("15.01.1990"), "1990-01-15");
  assert.equal(parseBirthDateInputToIsoDate("1990-01-15"), "1990-01-15");
  assert.equal(parseBirthDateInputToIsoDate("31.02.1990"), null);
});
