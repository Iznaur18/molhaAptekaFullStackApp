const AUTH_SESSION_DEAD_EVENT = "auth:session-dead";

export const emitAuthSessionDead = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_DEAD_EVENT));
};

/**
 * @param {() => void} listener
 */
export const subscribeAuthSessionDead = (listener) => {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(AUTH_SESSION_DEAD_EVENT, listener);
  return () => window.removeEventListener(AUTH_SESSION_DEAD_EVENT, listener);
};
