/**
 * Динамическая надстройка над `app.json` (Expo SDK 54): статический конфиг
 * приходит сюда параметром `config`, мы дополняем его тем, что зависит от
 * профиля сборки.
 *
 * Зачем: `usesCleartextTraffic`, `NSAllowsLocalNetworking` и dev-launcher нужны
 * только когда API отдаётся по http (LAN-бэкенд в development/preview). В
 * релизе API — https://api.gitorg.ru, а разрешённый cleartext попадает в отчёт
 * Google Play о безопасности и держит в манифесте дыру, которой никто не
 * пользуется. Раньше эти три вещи стояли в `app.json` безусловно.
 */

const PRODUCTION_BUILD_PROFILE = "production";

/** @param {string} value */
const isPlainHttpUrl = (value) => value.toLowerCase().startsWith("http://");

/**
 * Cleartext разрешаем только вне production-профиля и только когда API
 * действительно на http (или ещё не задан — локальный `expo start`).
 *
 * @returns {boolean}
 */
const resolveAllowCleartextTraffic = () => {
  if (process.env.EAS_BUILD_PROFILE === PRODUCTION_BUILD_PROFILE) {
    return false;
  }
  const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? "").trim();
  return apiUrl === "" || isPlainHttpUrl(apiUrl);
};

/**
 * @param {{ config: import('expo/config').ExpoConfig }} params
 * @returns {import('expo/config').ExpoConfig}
 */
module.exports = ({ config }) => {
  const allowCleartextTraffic = resolveAllowCleartextTraffic();

  if (!allowCleartextTraffic) {
    return config;
  }

  return {
    ...config,
    // Dev-launcher только в дев-сборках: в релизе плагин ничего полезного не
    // даёт, а активность лаунчера остаётся в манифесте.
    plugins: ["expo-dev-client", ...(config.plugins ?? [])],
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        NSAppTransportSecurity: {
          ...config.ios?.infoPlist?.NSAppTransportSecurity,
          NSAllowsLocalNetworking: true,
        },
      },
    },
    android: {
      ...config.android,
      usesCleartextTraffic: true,
    },
  };
};
