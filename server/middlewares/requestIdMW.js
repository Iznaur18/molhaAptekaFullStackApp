import { REQUEST_ID_HEADER } from "../constants/requestLogConstants.js";
import { generateRequestId } from "../utils/generateRequestId.js";
import { normalizeIncomingRequestId } from "../utils/normalizeIncomingRequestId.js";

/**
 * Корреляция запроса: принимает X-Request-Id или генерирует UUID.
 * @type {import('express').RequestHandler}
 */
export function requestIdMW(req, res, next) {
  const incoming = normalizeIncomingRequestId(req.get(REQUEST_ID_HEADER));
  const requestId = incoming ?? generateRequestId();

  req.requestId = requestId;
  res.locals.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}
