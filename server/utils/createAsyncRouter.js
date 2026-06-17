import { Router } from "express";

import { asyncHandler } from "../middlewares/errorHandlerMW.js";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "all"];

const isErrorMiddleware = (handler) => typeof handler === "function" && handler.length === 4;

const wrapRouteHandlers = (handlers) => {
  if (handlers.length === 0) {
    return handlers;
  }

  const lastIndex = handlers.length - 1;
  const last = handlers[lastIndex];

  if (typeof last !== "function" || isErrorMiddleware(last)) {
    return handlers;
  }

  const wrapped = [...handlers];
  wrapped[lastIndex] = asyncHandler(last);
  return wrapped;
};

/**
 * Express Router с auto asyncHandler на последнем handler в цепочке.
 */
export const createAsyncRouter = (options) => {
  const router = Router(options);

  for (const method of HTTP_METHODS) {
    const register = router[method].bind(router);
    router[method] = (path, ...handlers) => {
      if (typeof path === "function") {
        return register(wrapRouteHandlers([path, ...handlers]));
      }
      return register(path, ...wrapRouteHandlers(handlers));
    };
  }

  return router;
};
