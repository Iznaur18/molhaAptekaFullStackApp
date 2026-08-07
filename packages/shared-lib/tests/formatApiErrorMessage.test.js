import assert from "node:assert/strict";
import test from "node:test";

import { formatApiErrorMessage } from "@izibuy/shared-lib";

test("prefers server body message", () => {
  assert.equal(
    formatApiErrorMessage({
      response: { status: 400, data: { message: "  Уже прочитано  " } },
      message: "Request failed with status code 400",
    }),
    "Уже прочитано",
  );
});

test("maps 5xx without body to friendly RU", () => {
  assert.equal(
    formatApiErrorMessage({
      response: { status: 500, data: {} },
      message: "Request failed with status code 500",
    }),
    "Сервер временно недоступен. Попробуйте позже",
  );
});

test("maps axios status string on plain Error", () => {
  assert.equal(
    formatApiErrorMessage(
      new Error("Request failed with status code 500"),
      "fallback",
    ),
    "Сервер временно недоступен. Попробуйте позже",
  );
});

test("maps common client statuses", () => {
  assert.equal(
    formatApiErrorMessage({ response: { status: 401 }, message: "Request failed with status code 401" }),
    "Нужно войти в аккаунт",
  );
  assert.equal(
    formatApiErrorMessage({ response: { status: 403 }, message: "Request failed with status code 403" }),
    "Недостаточно прав",
  );
  assert.equal(
    formatApiErrorMessage({ response: { status: 404 }, message: "Request failed with status code 404" }),
    "Не найдено",
  );
  assert.equal(
    formatApiErrorMessage({ response: { status: 429 }, message: "Request failed with status code 429" }),
    "Слишком много запросов. Подождите немного",
  );
  assert.equal(
    formatApiErrorMessage({ response: { status: 400 }, message: "Request failed with status code 400" }),
    "Некорректный запрос",
  );
});

test("network and timeout codes", () => {
  assert.equal(formatApiErrorMessage({ code: "ERR_NETWORK" }), "Нет подключения к интернету");
  assert.equal(formatApiErrorMessage({ code: "ECONNABORTED" }), "Превышено время ожидания ответа");
});

test("falls back when nothing useful", () => {
  assert.equal(formatApiErrorMessage({}, "custom"), "custom");
  assert.equal(formatApiErrorMessage(null, "custom"), "custom");
});
