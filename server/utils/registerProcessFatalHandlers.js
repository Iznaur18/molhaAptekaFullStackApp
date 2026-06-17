import { captureServerHttpError } from "./captureServerHttpError.js";
import { logServerEvent } from "./logServerEvent.js";

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
    console.error("unhandledRejection:", error);
    logServerEvent("error", {
      event: "unhandledRejection",
      message: error.message,
    });
    captureServerHttpError(error, null);
  });

  process.on("uncaughtException", (error) => {
    console.error("uncaughtException:", error);
    logServerEvent("error", {
      event: "uncaughtException",
      message: error instanceof Error ? error.message : String(error),
    });
    captureServerHttpError(error instanceof Error ? error : new Error(String(error)), null);
    process.exit(1);
  });
};
