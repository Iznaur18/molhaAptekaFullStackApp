import { initServerSentry } from "./utils/initServerSentry.js";
import { registerProcessFatalHandlers } from "./utils/registerProcessFatalHandlers.js";

registerProcessFatalHandlers();
initServerSentry();
