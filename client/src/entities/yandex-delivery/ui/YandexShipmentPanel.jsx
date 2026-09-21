import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

// Та же карточка, что у накладной СДЭК: продавец видит службы одинаково.
import "../../cdek/ui/CdekWaybillPanel.css";

const UI = {
  TITLE: "Яндекс Доставка",
  PICKUP_POINT: "Покупатель заберёт в пункте",
  RECIPIENT: "Получатель",
  DELIVERY_PAID_BY_BUYER: "Доставку покупатель оплатит картой в пункте",
  COMMISSION: "Комиссия Яндекса за приём оплаты (спишут с вас)",
  DROPOFF: "Сдать посылку в пункт",
  HINT: "Отнесите коробку в свой пункт сдачи Яндекса. Заявку в Яндексе пока создайте в кабинете dostavka.yandex.ru — кнопка здесь появится следующим обновлением.",
};

/**
 * Снимок Яндекс Доставки в карточке продажи: куда и кому везти, сколько
 * покупатель заплатит в пункте и сколько Яндекс спишет с продавца.
 *
 * @param {{ snapshot: Record<string, any> }} props
 */
export function YandexShipmentPanel({ snapshot }) {
  const recipient = snapshot.recipient ?? {};
  return (
    <section className="cdek-waybill-panel" aria-label={UI.TITLE}>
      <h4 className="cdek-waybill-panel__title">{UI.TITLE}</h4>
      <dl className="cdek-waybill-panel__facts">
        {snapshot.pickupPoint?.address ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.PICKUP_POINT}</dt>
            <dd>{snapshot.pickupPoint.address}</dd>
          </div>
        ) : null}
        {recipient.name ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.RECIPIENT}</dt>
            <dd>
              {recipient.name}
              {recipient.phone ? `, ${recipient.phone}` : ""}
            </dd>
          </div>
        ) : null}
        {snapshot.deliverySumRub ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.DELIVERY_PAID_BY_BUYER}</dt>
            <dd>{formatPriceRub(snapshot.deliverySumRub)}</dd>
          </div>
        ) : null}
        {snapshot.paymentCommissionRub ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.COMMISSION}</dt>
            <dd>{formatPriceRub(snapshot.paymentCommissionRub)}</dd>
          </div>
        ) : null}
      </dl>
      <p className="cdek-waybill-panel__hint">{UI.HINT}</p>
    </section>
  );
}
