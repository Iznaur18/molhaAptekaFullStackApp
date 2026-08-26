import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(mobileRoot, "..");
const readMobileFile = (p) => readFileSync(resolve(mobileRoot, p), "utf8");
const readRepoFile = (p) => readFileSync(resolve(repoRoot, p), "utf8");

const storage = readMobileFile("entities/product/lib/createProductFormDraftStorage.ts");
const hook = readMobileFile("features/create-product/model/useCreateProductFormDraft.ts");
const screen = readMobileFile("features/create-product/ui/CreateProductScreen.tsx");

test("черновик хранится синхронно, без SecureStore", () => {
  // SecureStore режет значение на 2048 байтах — описание товара его переполняет.
  // Упоминание в комментарии допустимо, импорт — нет.
  assert.ok(
    !/^import .*expo-secure-store/m.test(storage),
    "черновик нельзя класть в SecureStore: лимит 2048 байт",
  );
  const secureStore = readRepoFile("node_modules/expo-secure-store/build/SecureStore.js");
  assert.match(secureStore, /larger than \$\{VALUE_BYTES_LIMIT\} bytes/);

  // Синхронное чтение — иначе форма отрендерилась бы пустой и автосейв затёр
  // бы черновик до того, как он успел приехать.
  assert.ok(storage.includes("textSync()"), "чтение обязано быть синхронным");
  assert.ok(
    !/export const readCreateProductFormDraft[\s\S]{0,120}async/.test(storage),
    "readCreateProductFormDraft не должен быть async",
  );
});

test("на вебе expo-file-system не работает — там localStorage", () => {
  assert.ok(storage.includes('Platform.OS === "web"'), "нет развилки по платформе");
  assert.ok(storage.includes("localStorage"), "на вебе нужен localStorage");

  const webShim = readRepoFile("node_modules/expo-file-system/src/ExpoFileSystem.web.ts");
  assert.match(
    webShim,
    /not supported on web/,
    "развилка держится на том, что модуль на вебе не работает",
  );
});

test("модуль хранилища добавлен как прямая зависимость нужной версии", () => {
  const pkg = JSON.parse(readMobileFile("package.json"));
  const pinned = JSON.parse(
    readRepoFile("node_modules/expo/bundledNativeModules.json"),
  )["expo-file-system"];
  assert.equal(
    pkg.dependencies["expo-file-system"],
    pinned,
    "версия обязана совпадать с пином SDK, иначе поедет нативная часть",
  );
  // Тот же модуль тянет сам expo, поэтому пересобирать dev-client не нужно.
  const expoPkg = JSON.parse(readRepoFile("node_modules/expo/package.json"));
  assert.ok(
    expoPkg.dependencies["expo-file-system"],
    "expo больше не зависит от expo-file-system — модуль может выпасть из автолинковки",
  );
});

test("автосейв закрывает то, чего в вебе не бывает: ОС убивает приложение молча", () => {
  assert.ok(hook.includes('AppState.addEventListener("change"'), "нет сохранения при сворачивании");
  assert.ok(hook.includes('state !== "active"'), "флаш должен идти на любой не-active");
  assert.ok(hook.includes("setTimeout"), "нет дебаунса — писали бы на каждую букву");
  assert.ok(hook.includes("subscription.remove()"), "подписка на AppState не снимается");
  assert.ok(/useEffect\(\(\) => \(\) => flush\(\)/.test(hook), "нет флаша при уходе с экрана");
});

test("черновик не мешает копированию, правке и отправке", () => {
  assert.ok(
    screen.includes('const draftEnabled = !isEdit && initialLaunch?.kind !== "copy";'),
    "черновик обязан быть только у чистого создания",
  );
  // После успешной отправки черновик обязан исчезнуть.
  assert.ok(
    /clearCreateProductFormDraft\(\);[\s\S]{0,120}router\.replace\("\/hub\/my-products"\)/.test(
      screen,
    ),
    "после создания товара черновик остаётся жить",
  );
  // Восстановленный черновик несёт свой самовывоз — профильный поверх нельзя.
  assert.ok(
    screen.includes("initialLaunch?.kind === \"copy\" || initialDraft != null"),
    "профильный самовывоз затрёт восстановленный черновик",
  );
  assert.ok(screen.includes("CREATE_PRODUCT_UI.DRAFT_RESTORED_HINT"), "нет баннера восстановления");
  assert.ok(screen.includes("onPress={discardDraft}"), "нет кнопки «начать заново»");
  assert.ok(screen.includes("onPress={handleSaveDraftAndExit}"), "нет кнопки «сохранить и выйти»");
});

test("пустая форма черновиком не считается", () => {
  // Поля самовывоза подставляются из профиля сами: если считать их вводом,
  // только что открытая форма «восстанавливалась» бы при каждом входе.
  const meaningful = storage.slice(
    storage.indexOf("export const isCreateProductFormDraftMeaningful"),
  );
  for (const field of ["productPickupAddress", "productPickupLat", "productPickupLocations"]) {
    assert.ok(
      !meaningful.includes(field),
      `${field} не должен делать пустую форму черновиком`,
    );
  }
  for (const field of ["productName", "productDescription", "productPrice", "imageUrls"]) {
    assert.ok(meaningful.includes(field), `${field} обязан считаться вводом продавца`);
  }
  // Незначимый черновик не пишется, а стирается.
  assert.ok(
    /writeCreateProductFormDraft[\s\S]{0,220}isCreateProductFormDraftMeaningful[\s\S]{0,120}clearCreateProductFormDraft/.test(
      storage,
    ),
    "пустую форму нельзя оставлять файлом на диске",
  );
});

test("битый или чужой файл черновика не роняет мастер", () => {
  assert.ok(storage.includes("JSON.parse"), "нет разбора файла");
  // Любая ошибка чтения/записи гасится: черновик — удобство, не обязанность.
  assert.ok(
    (storage.match(/} catch \{/g) ?? []).length >= 5,
    "чтение, запись, очистка и разбор обязаны глотать ошибки",
  );
  assert.ok(
    storage.includes("stepCount"),
    "шаг из файла обязан ограничиваться числом шагов мастера",
  );
});
