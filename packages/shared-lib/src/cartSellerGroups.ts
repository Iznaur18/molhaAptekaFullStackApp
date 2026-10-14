import {
  ORDER_FULFILLMENT_DELIVERY,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  calculateSellerDeliveryFee,
  normalizeSellerDeliveryTariff,
  productShipsToBuyer,
  resolveProductDeliveryCarrier,
  type SellerDeliveryTariff,
} from "@molha/api-contract";

type CartFulfillment = "pickup" | "delivery";

/** Строка корзины: товар приходит из API как есть, поля читаем бережно. */
export type CartSellerGroupLine = {
  productId?: string;
  product?: unknown;
  productSellerId?: unknown;
  productSellerName?: unknown;
};

export type CartSellerGroup<TLine extends CartSellerGroupLine = CartSellerGroupLine> = {
  sellerId: string;
  sellerName: string;
  sellerAvatarUrl: string;
  sellerAvatarFocus: { x?: number; y?: number } | null;
  isPremiumUser: boolean;
  isUserDataConfirmed: boolean;
  /** Что продавец принимает; пусто — «не настраивал», принимает всё. */
  sellerPaymentMethods: string[];
  lines: TLine[];
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  /** Все товары группы везут курьеры площадки. */
  courierDelivery: boolean;
  /** Кто везёт товары группы: один перевозчик на всех или "mixed". */
  deliveryCarrier: string | null;
  defaultMethod: CartFulfillment | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readProduct = (line: CartSellerGroupLine | null | undefined) =>
  isRecord(line?.product) ? line.product : null;

const resolveSellerId = (line: CartSellerGroupLine | null | undefined): string => {
  const seller = readProduct(line)?.productSeller;
  const raw = (isRecord(seller) ? seller._id : seller) ?? line?.productSellerId;
  return raw ? String(raw) : "";
};

const resolveSellerProfile = (line: CartSellerGroupLine | null | undefined) => {
  const seller = readProduct(line)?.productSeller;
  if (!isRecord(seller)) {
    return {
      sellerName: String(line?.productSellerName ?? "").trim(),
      sellerAvatarUrl: "",
      sellerAvatarFocus: null,
      isPremiumUser: false,
      isUserDataConfirmed: false,
      sellerPaymentMethods: [] as string[],
    };
  }

  return {
    sellerName: String(seller.userName ?? line?.productSellerName ?? "").trim(),
    sellerAvatarUrl: String(seller.userAvatarUrl ?? "").trim(),
    sellerAvatarFocus: isRecord(seller.userAvatarFocus)
      ? (seller.userAvatarFocus as { x?: number; y?: number })
      : null,
    isPremiumUser: seller.isPremiumUser === true,
    isUserDataConfirmed: seller.isUserDataConfirmed === true,
    sellerPaymentMethods: Array.isArray(seller.sellerPaymentMethods)
      ? (seller.sellerPaymentMethods as string[])
      : [],
  };
};

/**
 * Корзина по отправлениям: одно на продавца.
 *
 * Раньше корзина делилась на две секции по возможностям товара, и правило
 * «умеет и то и другое → самовывоз» делало доставку у таких товаров
 * недостижимой: покупателя просто не спрашивали. Способ выбирается на
 * отправление, поэтому и группировать надо по продавцу.
 *
 * Отправление едет одним способом целиком, поэтому способ доступен, только
 * если его поддерживают ВСЕ товары продавца в корзине.
 */
export function groupCartLinesBySeller<TLine extends CartSellerGroupLine>(
  visibleLines: readonly TLine[] | null | undefined,
): CartSellerGroup<TLine>[] {
  const bySeller = new Map<string, CartSellerGroup<TLine>>();
  /** Перевозчик ещё не встречался — отличаем от «нет доставки» (`null`). */
  const carrierSeen = new Set<string>();

  for (const line of Array.isArray(visibleLines) ? visibleLines : []) {
    const sellerId = resolveSellerId(line);
    const product = readProduct(line) ?? {};
    const profile = resolveSellerProfile(line);
    const group: CartSellerGroup<TLine> = bySeller.get(sellerId) ?? {
      sellerId,
      sellerName: profile.sellerName,
      sellerAvatarUrl: profile.sellerAvatarUrl,
      sellerAvatarFocus: profile.sellerAvatarFocus,
      isPremiumUser: profile.isPremiumUser,
      isUserDataConfirmed: profile.isUserDataConfirmed,
      sellerPaymentMethods: profile.sellerPaymentMethods,
      lines: [],
      pickupAvailable: true,
      deliveryAvailable: true,
      // Курьеры площадки и доставка продавцом взаимоисключающи на товаре,
      // но у продавца могут быть товары обоих видов — тогда группа не
      // курьерская, и суммы курьеру в ней нет.
      courierDelivery: true,
      deliveryCarrier: null,
      defaultMethod: "pickup",
    };

    group.lines.push(line);
    if (product.productPickupEnabled === false) {
      group.pickupAvailable = false;
    }
    // Перевозчик — из поля товара: у ЛОБО старые флаги сняты.
    if (!productShipsToBuyer(product)) {
      group.deliveryAvailable = false;
    }
    const carrier = resolveProductDeliveryCarrier(product);
    if (!carrierSeen.has(sellerId)) {
      carrierSeen.add(sellerId);
      group.deliveryCarrier = carrier;
    } else if (group.deliveryCarrier !== carrier) {
      group.deliveryCarrier = "mixed";
    }
    if (product.productCourierDeliveryEnabled !== true) {
      group.courierDelivery = false;
    }
    if (!group.sellerName && profile.sellerName) {
      group.sellerName = profile.sellerName;
    }
    if (!group.sellerAvatarUrl && profile.sellerAvatarUrl) {
      group.sellerAvatarUrl = profile.sellerAvatarUrl;
      group.sellerAvatarFocus = profile.sellerAvatarFocus;
    }
    if (!group.isPremiumUser && profile.isPremiumUser) {
      group.isPremiumUser = true;
    }
    if (!group.isUserDataConfirmed && profile.isUserDataConfirmed) {
      group.isUserDataConfirmed = true;
    }
    if (
      group.sellerPaymentMethods.length === 0 &&
      profile.sellerPaymentMethods.length > 0
    ) {
      group.sellerPaymentMethods = profile.sellerPaymentMethods;
    }

    bySeller.set(sellerId, group);
  }

  for (const group of bySeller.values()) {
    group.defaultMethod = group.pickupAvailable
      ? "pickup"
      : group.deliveryAvailable
        ? "delivery"
        : null;
  }

  return [...bySeller.values()];
}

/**
 * Способ для каждого продавца: что выбрал покупатель, иначе дефолт группы.
 *
 * Недоступный выбор игнорируем — иначе сохранённый в состоянии способ пережил
 * бы удаление товара, который его разрешал, и заказ ушёл бы с 400.
 */
export function resolveCartFulfillmentBySeller(
  groups: ReadonlyArray<
    Pick<
      CartSellerGroup,
      "sellerId" | "defaultMethod" | "pickupAvailable" | "deliveryAvailable"
    >
  >,
  chosenBySellerId: Record<string, CartFulfillment | undefined> = {},
): Record<string, CartFulfillment> {
  const result: Record<string, CartFulfillment> = {};

  for (const group of groups) {
    if (!group.sellerId || !group.defaultMethod) continue;

    const chosen = chosenBySellerId[group.sellerId];
    const allowed =
      (chosen === "pickup" && group.pickupAvailable) ||
      (chosen === "delivery" && group.deliveryAvailable);

    result[group.sellerId] = allowed && chosen ? chosen : group.defaultMethod;
  }

  return result;
}

/**
 * Везут ли товары разные службы доставки (свой курьер продавца, курьеры
 * площадки, ЛОБО).
 *
 * Такие товары одного продавца одной доставкой не оформить: сервер не знает,
 * кому отдавать отправление, и отвечает «нельзя смешивать разные службы».
 * Товары без доставки (только самовывоз) службы не задают и не считаются.
 */
export function hasMixedDeliveryCarriers(
  products: ReadonlyArray<unknown> | null | undefined,
): boolean {
  const carriers = new Set<string>();
  for (const product of Array.isArray(products) ? products : []) {
    const carrier = resolveProductDeliveryCarrier(isRecord(product) ? product : {});
    if (carrier) {
      carriers.add(carrier);
    }
  }
  return carriers.size > 1;
}

export type CartSellerDelivery = {
  sellerId: string;
  tariff: SellerDeliveryTariff;
  goodsTotalRub: number;
};

/**
 * Данные для расчёта доставки продавца на оформлении.
 *
 * `null` — доставки по тарифу нет: либо покупатель забирает сам, либо везёт
 * не продавец, либо продавец возит бесплатно. Во всех трёх случаях блок с
 * ценой на чекауте показывать нечего.
 *
 * Точку отправления и расстояние по дорогам клиент не считает: это делает
 * сервер котировкой, тем же путём, что и заказ.
 */
export function resolveCartSellerDelivery({
  sellerGroups,
  fulfillmentBySellerId = {},
  goodsTotalRub = 0,
}: {
  sellerGroups: ReadonlyArray<Pick<CartSellerGroup, "sellerId" | "lines">> | null;
  fulfillmentBySellerId?: Record<string, string | undefined>;
  goodsTotalRub?: number;
}): CartSellerDelivery | null {
  const groups: ReadonlyArray<Pick<CartSellerGroup, "sellerId" | "lines">> =
    Array.isArray(sellerGroups) ? sellerGroups : [];
  // Тариф — свойство одного продавца. В сборной корзине показывать «доставку
  // продавцом» без уточнения, чьей именно, значит обмануть в сумме.
  if (groups.length !== 1) {
    return null;
  }

  const [group] = groups;
  if (fulfillmentBySellerId?.[group.sellerId] !== ORDER_FULFILLMENT_DELIVERY) {
    return null;
  }

  const lines: ReadonlyArray<CartSellerGroupLine> = Array.isArray(group.lines)
    ? group.lines
    : [];
  const carrierProduct = lines
    .map((line) => readProduct(line))
    .find(
      (product) =>
        product != null &&
        resolveProductDeliveryCarrier(product) === PRODUCT_DELIVERY_CARRIER_SELLER,
    );
  if (!carrierProduct) {
    return null;
  }

  const seller = carrierProduct.productSeller;
  const defaults = isRecord(seller) ? seller.sellerFulfillmentDefaults : null;
  const tariff = normalizeSellerDeliveryTariff(
    isRecord(defaults) ? defaults.deliveryTariff : null,
  );
  if (!tariff.paid) {
    return null;
  }

  return {
    sellerId: String(group.sellerId),
    tariff,
    goodsTotalRub: Number(goodsTotalRub) || 0,
  };
}

export type CartSellerDeliveryQuote = {
  feeRub: number;
  isFree: boolean;
  isEstimate: boolean;
  goodsTotalRub: number;
  payableRub: number;
};

/**
 * Котировка доставки продавца для блока на оформлении.
 *
 * Расстояние по дорогам приходит с сервера (`POST /order/seller-delivery-quote`)
 * — тем же расчётом, что и в заказе. Здесь из него, тарифа и стоимости товаров
 * собирается сумма функцией контракта. Пока расстояния нет — оценка «от».
 */
export function quoteCartSellerDelivery({
  tariff,
  distanceKm = null,
  goodsTotalRub = 0,
}: {
  tariff: unknown;
  distanceKm?: number | null;
  goodsTotalRub?: number;
}): CartSellerDeliveryQuote | null {
  const normalized = normalizeSellerDeliveryTariff(tariff);
  if (!normalized.paid) {
    return null;
  }

  const goods = Number(goodsTotalRub) || 0;
  const { feeRub, isFree, isEstimate } = calculateSellerDeliveryFee({
    tariff: normalized,
    goodsTotalRub: goods,
    distanceKm,
  });

  return {
    feeRub,
    isFree,
    isEstimate,
    goodsTotalRub: goods,
    payableRub: goods + feeRub,
  };
}
