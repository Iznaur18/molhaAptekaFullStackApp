import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { Platform } from "react-native";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();

const DEFAULT_TRACES_SAMPLE_RATE = 0.1;

export function isMobileSentryEnabled(): boolean {
  return Boolean(dsn);
}

const resolveAppVersion = (): string => Constants.expoConfig?.version ?? "unknown";

const resolveBuildNumber = (): string | undefined => {
  const iosBuild = Constants.expoConfig?.ios?.buildNumber;
  if (Platform.OS === "ios" && iosBuild) {
    return iosBuild;
  }

  const androidVersionCode = Constants.expoConfig?.android?.versionCode;
  if (Platform.OS === "android" && androidVersionCode != null) {
    return String(androidVersionCode);
  }

  return Constants.nativeBuildVersion ?? undefined;
};

const scrubSentryRequestHeaders = (
  event: Sentry.ErrorEvent,
): Sentry.ErrorEvent => {
  if (!event.request?.headers) {
    return event;
  }

  const headers = { ...event.request.headers };
  if (headers.Authorization) {
    headers.Authorization = "[Filtered]";
  }
  if (headers.Cookie) {
    headers.Cookie = "[Filtered]";
  }

  return { ...event, request: { ...event.request, headers } };
};

const setAppVersionContext = (): void => {
  const appVersion = resolveAppVersion();
  const buildNumber = resolveBuildNumber();

  Sentry.setContext("app", {
    version: appVersion,
    buildNumber,
    nativeAppVersion: Constants.nativeAppVersion,
    nativeBuildVersion: Constants.nativeBuildVersion,
    expoSdkVersion: Constants.expoConfig?.sdkVersion,
  });

  Sentry.addBreadcrumb({
    category: "app",
    message: `Gitorg mobile ${appVersion}${buildNumber ? ` (${buildNumber})` : ""}`,
    level: "info",
  });
};

export function initMobileSentry(): boolean {
  if (!dsn) {
    return false;
  }

  const tracesSampleRate = Number(
    process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? DEFAULT_TRACES_SAMPLE_RATE,
  );
  const release = process.env.EXPO_PUBLIC_GIT_COMMIT_SHA?.trim() || undefined;
  const environment =
    process.env.EXPO_PUBLIC_APP_ENV?.trim() ||
    (__DEV__ ? "development" : "production");

  Sentry.init({
    dsn,
    environment,
    release,
    enabled: true,
    tracesSampleRate: Number.isFinite(tracesSampleRate)
      ? tracesSampleRate
      : DEFAULT_TRACES_SAMPLE_RATE,
    initialScope: {
      tags: {
        platform: "mobile",
        app_platform: Platform.OS,
      },
    },
    beforeSend: scrubSentryRequestHeaders,
  });

  setAppVersionContext();
  return true;
}

initMobileSentry();

export { Sentry };
