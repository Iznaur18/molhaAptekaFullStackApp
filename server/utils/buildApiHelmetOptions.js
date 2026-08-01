/**
 * Helmet для JSON API. CSP задаётся на SPA (nginx), не на ответы `/auth`, `/product`, …
 *
 * @param {{ isProduction?: boolean }} [options]
 */
export function buildApiHelmetOptions(options = {}) {
  const isProduction = options.isProduction ?? process.env.NODE_ENV === "production";

  return {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    ...(isProduction
      ? {}
      : {
          // HSTS на edge (nginx); API за reverse proxy часто видит только HTTP.
        }),
  };
}
