import {
  PLATFORM_SERVICE_KIND_INTRO_AD,
  PLATFORM_SERVICE_KIND_PRODUCT_PROMOTION,
} from "../../constants/yookassaConstants.js";
import {
  activateIntroAdCampaignAfterPayment,
  loadPayableIntroAdCampaign,
} from "../intro-ad/introAdCampaign.js";
import {
  activateProductPromotionAfterPayment,
  loadPayableProductPromotion,
} from "../product/productPromotion.js";
import { registerPlatformServiceHandler } from "./platformServiceInvoice.js";

/**
 * Связывает платёжный слой с услугами площадки.
 *
 * Отдельным модулем, а не внутри `platformServiceInvoice`, чтобы платёж не
 * импортировал продвижение и рекламу напрямую: иначе получается цикл — услуга
 * зовёт платёж, платёж зовёт услугу.
 *
 * Вызывается один раз при старте приложения.
 */
export function registerPlatformServices() {
  registerPlatformServiceHandler(PLATFORM_SERVICE_KIND_PRODUCT_PROMOTION, {
    loadPayable: loadPayableProductPromotion,
    activate: activateProductPromotionAfterPayment,
  });

  registerPlatformServiceHandler(PLATFORM_SERVICE_KIND_INTRO_AD, {
    loadPayable: loadPayableIntroAdCampaign,
    activate: activateIntroAdCampaignAfterPayment,
  });
}
