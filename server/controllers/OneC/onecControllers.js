import { successRes } from "../../services/http/index.js";
import {
  disconnectSellerOneC,
  getSellerOneCSettings,
  listSellerOneCLogs,
  runSellerOneCSync,
  saveSellerOneCSettings,
  testSellerOneCConnection,
} from "../../services/onec/index.js";
import {
  listOneCCategoryMappings,
  listOneCImportJobs,
  regenerateOneCExchangeCredentials,
  saveOneCCategoryMappings,
} from "../../services/onec/exchange/index.js";

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

/**
 * POST /onec/exchange-credentials
 *
 * Пароль возвращается ровно здесь и больше нигде: в базе только bcrypt-хэш,
 * повторно показать его невозможно — только перевыпустить.
 */
export const postOneCExchangeCredentialsController = async (req, res) => {
  const credentials = await regenerateOneCExchangeCredentials(req.userId);
  return successRes(res, {
    message:
      "Логин и пароль выданы. Пароль показывается один раз — сохраните его сейчас.",
    credentials,
  });
};

/** GET /onec/category-mappings */
export const getOneCCategoryMappingsController = async (req, res) => {
  const mappings = await listOneCCategoryMappings(req.userId);
  return successRes(res, { mappings });
};

/** PUT /onec/category-mappings */
export const putOneCCategoryMappingsController = async (req, res) => {
  const result = await saveOneCCategoryMappings(req.userId, req.body.items);
  return successRes(res, {
    message: `Сопоставлено групп: ${result.saved}. Перевешено товаров: ${result.remapped}`,
    result,
  });
};

/** GET /onec/import-jobs */
export const getOneCImportJobsController = async (req, res) => {
  const jobs = await listOneCImportJobs(req.userId, { limit: req.query.limit });
  return successRes(res, { jobs });
};

/** GET /onec/logs */
export const getOneCLogsController = async (req, res) => {
  const logs = await listSellerOneCLogs(req.userId, {
    limit: req.query.limit,
  });
  return successRes(res, { logs });
};
