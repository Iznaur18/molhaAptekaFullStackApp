import assert from "node:assert/strict";
import { describe, it } from "node:test";

const {
  ADDRESS_LINE_MAX_LENGTH,
  PRODUCT_PICKUP_ADDRESS_MAX_LENGTH,
  createOrderBodySchema,
  userSavedAddressPatchItemSchema,
} = await import("@molha/api-contract");
const { OrderModel, PendingRegistrationModel, UserModel } = await import(
  "../models/index.js"
);
const { buildPickupSummaryAddress } = await import(
  "../services/order/createOrder.js"
);

/**
 * Настоящий адрес из выдачи DaData, 102 символа.
 *
 * На нём и сломалось: покупатель выбирал подсказку, а сервер отвечал «Адрес не
 * длиннее 100 символов». В одной выдаче по этому посёлку таких вариантов сразу
 * три.
 */
const LONG_REAL_ADDRESS =
  "Ханты-Мансийский Автономный округ - Югра, Кондинский р-н, пгт Междуреченский, ул Волгоградская, уч 12а";

describe("длина адресной строки", () => {
  it("вмещает реальный адрес из подсказок DaData", () => {
    assert.ok(
      LONG_REAL_ADDRESS.length > 100,
      `контрольный адрес должен быть длиннее прежнего лимита, а он ${LONG_REAL_ADDRESS.length}`,
    );
    assert.ok(
      ADDRESS_LINE_MAX_LENGTH >= LONG_REAL_ADDRESS.length,
      `лимит ${ADDRESS_LINE_MAX_LENGTH} не вмещает адрес длиной ${LONG_REAL_ADDRESS.length}`,
    );
  });

  it("одна и та же у всех схем запросов", () => {
    assert.equal(
      PRODUCT_PICKUP_ADDRESS_MAX_LENGTH,
      ADDRESS_LINE_MAX_LENGTH,
      "адрес точки самовывоза — тот же адрес",
    );
  });

  it("одна и та же у всех моделей", () => {
    // Разъезд схемы запроса и модели — это ошибка mongoose по-английски в
    // ответе на валидный по zod запрос. Ровно так падало создание заказа.
    const paths = [
      ["Order.deliveryAddress", OrderModel.schema.path("deliveryAddress")],
      ["User.userAddress", UserModel.schema.path("userAddress")],
      [
        "PendingRegistration.userAddress",
        PendingRegistrationModel.schema.path("userAddress"),
      ],
    ];

    for (const [name, path] of paths) {
      assert.equal(
        path?.options?.maxlength,
        ADDRESS_LINE_MAX_LENGTH,
        `${name} разошлась с контрактом`,
      );
    }
  });

  it("zod заказа принимает длинный адрес", () => {
    const parsed = createOrderBodySchema.safeParse({
      items: [{ productId: "6a9a9dd613d2cafa469833fb", quantity: 1 }],
      paymentMethod: "cashOnDelivery",
      fulfillmentMethod: "delivery",
      deliveryAddress: LONG_REAL_ADDRESS,
      idempotencyKey: "address-limit-test",
    });

    assert.ok(parsed.success, JSON.stringify(parsed.error?.issues ?? []));
  });

  it("zod книги адресов принимает длинный адрес", () => {
    const parsed = userSavedAddressPatchItemSchema.safeParse({
      id: "8933da2b-d5f7-4b4d-9b9a-36ad77cf6755",
      label: "Дом",
      line: LONG_REAL_ADDRESS,
      flat: "12",
      isDefault: true,
    });

    assert.ok(parsed.success, JSON.stringify(parsed.error?.issues ?? []));
  });

  it("сводка точек самовывоза по-прежнему влезает в поле заказа", () => {
    // Лимит вырос — вместе с ним и сводка; она не должна его перерасти.
    const line = buildPickupSummaryAddress([
      LONG_REAL_ADDRESS,
      LONG_REAL_ADDRESS,
      LONG_REAL_ADDRESS,
    ]);

    assert.ok(line.length <= ADDRESS_LINE_MAX_LENGTH, `длина ${line.length}`);
    assert.match(line, /всего точек: 3/u);
  });
});
