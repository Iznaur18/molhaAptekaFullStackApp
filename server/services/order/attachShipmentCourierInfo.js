import { UserModel } from "../../models/index.js";

/**
 * Публичная карточка курьера для сторон сделки.
 *
 * Проекция явная, а не populate: в `courierProfile` лежат ссылки на права и
 * ПТС, и populate целиком утащил бы их продавцу с покупателем.
 */
const COURIER_PUBLIC_SELECT =
  "userName userRatingByVotes courierProfile.vehicleMake courierProfile.vehicleColor courierProfile.vehiclePlate";

/** @param {{ countVotes?: number; totalRating?: number } | null | undefined} votes */
const resolveRating = (votes) => {
  const count = Number(votes?.countVotes) || 0;
  const total = Number(votes?.totalRating) || 0;
  if (count <= 0) return null;
  return Math.round((total / count) * 10) / 10;
};

/**
 * Подставляет в отправления данные назначенного курьера.
 *
 * Продавец и покупатель должны понимать, кто к ним приедет: имя, рейтинг и
 * авто. Телефон сюда не кладём — до передачи товара стороны общаются через
 * заказ, а после неё курьеру звонят по номеру из карточки доставки.
 *
 * @template {{ shipments?: Array<Record<string, any>> | null }} T
 * @param {T[]} orders
 * @returns {Promise<T[]>}
 */
export async function attachShipmentCourierInfo(orders) {
  if (!Array.isArray(orders) || orders.length === 0) return orders;

  const courierIds = new Set();
  for (const order of orders) {
    for (const shipment of order?.shipments ?? []) {
      if (shipment?.courierId) courierIds.add(String(shipment.courierId));
    }
  }
  if (courierIds.size === 0) return orders;

  const couriers = await UserModel.find({ _id: { $in: [...courierIds] } })
    .select(COURIER_PUBLIC_SELECT)
    .lean();

  const byId = new Map(
    couriers.map((courier) => [
      String(courier._id),
      {
        userName: courier.userName ?? "",
        rating: resolveRating(courier.userRatingByVotes),
        vehicleMake: courier.courierProfile?.vehicleMake ?? "",
        vehicleColor: courier.courierProfile?.vehicleColor ?? "",
        vehiclePlate: courier.courierProfile?.vehiclePlate ?? "",
      },
    ]),
  );

  for (const order of orders) {
    for (const shipment of order?.shipments ?? []) {
      if (!shipment?.courierId) continue;
      shipment.courier = byId.get(String(shipment.courierId)) ?? null;
    }
  }

  return orders;
}
