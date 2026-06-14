import Constants from "expo-constants";

const isExpoGo = Constants.appOwnership === "expo";

const sentryModule = isExpoGo
  ? require("./initMobileSentry.stub")
  : require("./initMobileSentry.sentry.native");

export const isMobileSentryEnabled = sentryModule.isMobileSentryEnabled;
export const initMobileSentry = sentryModule.initMobileSentry;
export const Sentry = sentryModule.Sentry;
