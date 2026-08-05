import { successRes } from "../../services/http/index.js";
import {
  disconnectSellerOneC,
  getSellerOneCSettings,
  listSellerOneCLogs,
  runSellerOneCSync,
  saveSellerOneCSettings,
  testSellerOneCConnection,
} from "../../services/onec/index.js";

/** GET /onec/settings */
export const getOneCSettingsController = async (req, res) => {
  const settings = await getSellerOneCSettings(req.userId);
  return successRes(res, { settings });
};

/** PUT /onec/settings */
export const putOneCSettingsController = async (req, res) => {
  const settings = await saveSellerOneCSettings(req.userId, {
    enabled: req.body.enabled,
    baseUrl: req.body.baseUrl,
    apiKey: req.body.apiKey,
    clearApiKey: req.body.clearApiKey === true,
  });
  return successRes(res, {
    message: "Настройки 1С сохранены",
    settings,
  });
};

/** DELETE /onec/settings */
export const deleteOneCSettingsController = async (req, res) => {
  const settings = await disconnectSellerOneC(req.userId);
  return successRes(res, {
    message: "Интеграция с 1С отключена",
    settings,
  });
};

/** POST /onec/test */
export const postOneCTestController = async (req, res) => {
  const result = await testSellerOneCConnection(req.userId);
  return successRes(res, {
    message: "Соединение с 1С успешно",
    result,
  });
};

/** POST /onec/sync */
export const postOneCSyncController = async (req, res) => {
  const summary = await runSellerOneCSync(req.userId, { triggeredBy: "manual" });
  return successRes(res, {
    message: "Обмен с 1С выполнен",
    summary,
  });
};

/** GET /onec/logs */
export const getOneCLogsController = async (req, res) => {
  const logs = await listSellerOneCLogs(req.userId, {
    limit: req.query.limit,
  });
  return successRes(res, { logs });
};
