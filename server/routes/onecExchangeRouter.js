import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import {
  onecExchangeAuthRateLimiter,
  onecExchangeRequestRateLimiter,
  onecExchangeStartRateLimiter,
} from "../middlewares/index.js";
import { ONEC_EXCHANGE_MODE_CHECKAUTH } from "../constants/onecExchangeConstants.js";
import { oneCExchangeController } from "../controllers/OneC/onecExchangeControllers.js";

const router = createAsyncRouter();

/**
 * Жёсткий лимит только на старт обмена: внутри сессии 1С делает сотни
 * запросов (по одному на каждый кусок файла), и общий счётчик их бы срезал.
 *
 * @type {import('express').RequestHandler}
 */
const exchangeRateLimiter = (req, res, next) => {
  if (req.query?.mode === ONEC_EXCHANGE_MODE_CHECKAUTH) {
    // Два независимых потолка: частота обмена — на логин, перебор пароля — на IP.
    return onecExchangeAuthRateLimiter(req, res, () =>
      onecExchangeStartRateLimiter(req, res, next),
    );
  }
  return onecExchangeRequestRateLimiter(req, res, next);
};

// 1С ходит и GET'ом (checkauth/init/import/query), и POST'ом (file).
router.get("/", exchangeRateLimiter, oneCExchangeController);
router.post("/", exchangeRateLimiter, oneCExchangeController);

export default router;
