import { captureServerHttpError } from "./captureServerHttpError.js";
import { formatLogError, logServerEvent } from "./logServerEvent.js";

const formatFatalReason = (reason) => {
  if (reason instanceof Error) {
    return reason;
  }
  return new Error(typeof reason === "string" ? reason : "Unhandled rejection");
};

/**
 * Глобальные process hooks — до старта HTTP (импорт из instrument.js).
 */
export const registerProcessFatalHandlers = () => {
  process.on("unhandledRejection", (reason) => {
    const error = formatFatalReason(reason);
    logServerEvent("error", {
      event: "process.unhandled_rejection",
      ...formatLogError(error),
    });
    captureServerHttpError(error, null);
  });

  process.on("uncaughtException", (error) => {
    logServerEvent("fatal", {
      event: "process.uncaught_exception",
      ...formatLogError(
        error instanceof Error ? error : new Error(String(error)),
      ),
    });
    captureServerHttpError(
      error instanceof Error ? error : new Error(String(error)),
      null,
    );
    process.exit(1);
  });
};
