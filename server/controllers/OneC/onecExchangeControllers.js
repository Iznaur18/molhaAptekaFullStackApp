import {
  ONEC_CHANNEL_COMMERCEML,
  ONEC_EXCHANGE_ALLOW_ZIP,
  ONEC_EXCHANGE_COOKIE_NAME,
  ONEC_EXCHANGE_FILE_CHUNK_LIMIT_BYTES,
  ONEC_EXCHANGE_MODE_CHECKAUTH,
  ONEC_EXCHANGE_MODE_COMPLETE,
  ONEC_EXCHANGE_MODE_FILE,
  ONEC_EXCHANGE_MODE_IMPORT,
  ONEC_EXCHANGE_MODE_INIT,
  ONEC_EXCHANGE_MODE_QUERY,
  ONEC_EXCHANGE_MODE_SUCCESS,
  ONEC_EXCHANGE_TYPE_CATALOG,
  ONEC_EXCHANGE_TYPE_SALE,
  ONEC_EXCHANGE_TYPES,
  ONEC_IMPORT_STATUS_PENDING,
} from "../../constants/onecExchangeConstants.js";
import { OneCImportJobModel, UserModel } from "../../models/index.js";
import {
  buildOneCOrdersXml,
  markOneCOrderPushesSynced,
} from "../../services/onec/exchange/buildOneCOrdersXml.js";
import { classifyOneCImportFile } from "../../services/onec/exchange/expandOneCImportFile.js";
import { enqueueOneCImportJob } from "../../services/onec/exchange/enqueueOneCImportJob.js";
import {
  parseBasicAuthHeader,
  verifyOneCExchangeCredentials,
} from "../../services/onec/exchange/onecExchangeCredentials.js";
import {
  createOneCExchangeSession,
  destroyOneCExchangeSession,
  resolveOneCExchangeSession,
  setOneCExchangeCookie,
  touchOneCExchangeSession,
} from "../../services/onec/exchange/onecExchangeSession.js";
import {
  receiveOneCFileChunk,
  resolveOneCFilePath,
  sanitizeOneCFilename,
} from "../../services/onec/exchange/receiveOneCFile.js";
import { AppError } from "../../errors/AppError.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";

/**
 * 1С читает тело ответа построчно и не смотрит на HTTP-код: первая строка
 * `success` / `failure` / `progress` и есть протокол. Поэтому отвечаем 200
 * даже на ошибки — иначе платформа покажет «сервер недоступен» вместо текста.
 *
 * @param {import('express').Response} res
 * @param {string} body
 */
function sendPlain(res, body) {
  res.status(200);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.send(body);
}

/** @param {import('express').Response} res @param {string} message */
function sendFailure(res, message) {
  return sendPlain(res, `failure\n${String(message ?? "Ошибка обмена")}`);
}

/** @param {import('express').Request} req */
function readParam(req, name) {
  const value = req.query?.[name];
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  return typeof value === "string" ? value.trim() : "";
}

/**
 * `mode=checkauth`: Basic-авторизация продавца, выдача сессии обмена.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} type
 */
async function handleCheckAuth(req, res, type) {
  const credentials = parseBasicAuthHeader(req.headers?.authorization);
  if (!credentials) {
    res.setHeader("WWW-Authenticate", 'Basic realm="1C exchange"');
    return sendFailure(res, "Не переданы логин и пароль обмена");
  }

  const verified = await verifyOneCExchangeCredentials(credentials);
  if (!verified) {
    logServerEvent("warn", {
      event: "onec.exchange_auth_failed",
      login: credentials.login.slice(0, 64),
      ip: req.ip,
    });
    return sendFailure(res, "Неверный логин или пароль обмена");
  }

  const user = await UserModel.findById(verified.sellerId)
    .select("oneCIntegration.enabled oneCIntegration.channel")
    .lean();

  if (user?.oneCIntegration?.enabled !== true) {
    return sendFailure(res, "Интеграция с 1С выключена в кабинете продавца");
  }
  if (user?.oneCIntegration?.channel !== ONEC_CHANNEL_COMMERCEML) {
    return sendFailure(
      res,
      "В кабинете выбран другой канал обмена — включите «Обмен с сайтом (CommerceML)»",
    );
  }

  const session = await createOneCExchangeSession({
    sellerId: verified.sellerId,
    login: verified.login,
    type,
    remoteIp: req.ip ?? "",
  });

  setOneCExchangeCookie(res, session.sessionId);
  // Третья строка — значение cookie: часть конфигураций 1С берёт его отсюда,
  // а не из заголовка Set-Cookie.
  return sendPlain(
    res,
    `success\n${ONEC_EXCHANGE_COOKIE_NAME}\n${session.sessionId}`,
  );
}

/**
 * `mode=init`: сайт диктует формат приёма.
 *
 * @param {import('express').Response} res
 */
function handleInit(res) {
  return sendPlain(
    res,
    `zip=${ONEC_EXCHANGE_ALLOW_ZIP ? "yes" : "no"}\nfile_limit=${ONEC_EXCHANGE_FILE_CHUNK_LIMIT_BYTES}`,
  );
}

/**
 * `mode=file`: приём очередного куска.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('mongoose').HydratedDocument<any>} session
 */
async function handleFile(req, res, session) {
  const received = await receiveOneCFileChunk({
    req,
    session,
    filename: readParam(req, "filename"),
  });

  logServerEvent("info", {
    event: "onec.exchange_file_chunk",
    sellerId: String(session.sellerId),
    filename: received.filename,
    bytes: received.bytes,
    totalBytes: received.totalBytes,
  });

  return sendPlain(res, "success");
}

/**
 * `mode=import`: 1С сообщила, что файл дослан целиком.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('mongoose').HydratedDocument<any>} session
 */
async function handleImport(req, res, session) {
  const filename = sanitizeOneCFilename(readParam(req, "filename"));
  const known = session.files.find((row) => row.filename === filename);
  if (!known) {
    return sendFailure(res, `Файл ${filename} не был загружен`);
  }

  const filePath = resolveOneCFilePath(session.uploadDir, filename);
  const job = await OneCImportJobModel.create({
    sellerId: session.sellerId,
    sessionId: session.sessionId,
    filename,
    filePath,
    kind: classifyOneCImportFile(filename),
    status: ONEC_IMPORT_STATUS_PENDING,
  });

  known.imported = true;
  await session.save();

  await enqueueOneCImportJob(String(job._id));

  return sendPlain(res, "success");
}

/**
 * `mode=query`: отдать 1С новые заказы в CommerceML.
 *
 * @param {import('express').Response} res
 * @param {import('mongoose').HydratedDocument<any>} session
 */
async function handleQuery(res, session) {
  const { xml, pushIds, orders } = await buildOneCOrdersXml(
    String(session.sellerId),
  );

  session.queriedPushIds = pushIds;
  await session.save();

  logServerEvent("info", {
    event: "onec.exchange_orders_query",
    sellerId: String(session.sellerId),
    orders,
  });

  res.status(200);
  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.send(xml);
}

/**
 * `mode=success` (для `type=sale`): 1С подтвердила приём заказов.
 *
 * @param {import('express').Response} res
 * @param {import('mongoose').HydratedDocument<any>} session
 */
async function handleOrdersSuccess(res, session) {
  const { synced } = await markOneCOrderPushesSynced(
    (session.queriedPushIds ?? []).map(String),
  );
  session.queriedPushIds = [];
  await session.save();

  logServerEvent("info", {
    event: "onec.exchange_orders_confirmed",
    sellerId: String(session.sellerId),
    synced,
  });

  return sendPlain(res, "success");
}

/**
 * Единая точка входа CommerceML: `/onec/exchange?type=…&mode=…`.
 *
 * Роутер смонтирован до `express.json` и CSRF-гейта — тело `mode=file` бинарное,
 * а 1С не шлёт ни `Origin`, ни куки сайта.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function oneCExchangeController(req, res) {
  const type = readParam(req, "type");
  const mode = readParam(req, "mode");

  if (!ONEC_EXCHANGE_TYPES.includes(type)) {
    return sendFailure(res, `Неизвестный type=${type}`);
  }

  try {
    if (mode === ONEC_EXCHANGE_MODE_CHECKAUTH) {
      return await handleCheckAuth(req, res, type);
    }

    const session = await resolveOneCExchangeSession(req, type);
    if (!session) {
      // 1С на `failure` в середине обмена начинает цикл заново с checkauth —
      // ровно то, что нужно после истечения сессии.
      return sendFailure(res, "Сессия обмена истекла, начните заново");
    }

    switch (mode) {
      case ONEC_EXCHANGE_MODE_INIT:
        await touchOneCExchangeSession(session);
        return handleInit(res);

      case ONEC_EXCHANGE_MODE_FILE:
        if (type !== ONEC_EXCHANGE_TYPE_CATALOG) {
          return sendFailure(res, "mode=file допустим только для type=catalog");
        }
        return await handleFile(req, res, session);

      case ONEC_EXCHANGE_MODE_IMPORT:
        if (type !== ONEC_EXCHANGE_TYPE_CATALOG) {
          return sendFailure(res, "mode=import допустим только для type=catalog");
        }
        return await handleImport(req, res, session);

      case ONEC_EXCHANGE_MODE_QUERY:
        if (type !== ONEC_EXCHANGE_TYPE_SALE) {
          return sendFailure(res, "mode=query допустим только для type=sale");
        }
        return await handleQuery(res, session);

      case ONEC_EXCHANGE_MODE_SUCCESS:
        if (type === ONEC_EXCHANGE_TYPE_SALE) {
          return await handleOrdersSuccess(res, session);
        }
        return sendPlain(res, "success");

      case ONEC_EXCHANGE_MODE_COMPLETE:
        // Обмен закончен: временные файлы больше не нужны, а разбор уже
        // поставлен в очередь и читает их по собственному пути.
        return sendPlain(res, "success");

      default:
        return sendFailure(res, `Неизвестный mode=${mode}`);
    }
  } catch (error) {
    const message =
      error instanceof AppError
        ? error.message
        : "Внутренняя ошибка обмена — подробности в журнале сайта";

    logServerEvent("error", {
      event: "onec.exchange_request_failed",
      type,
      mode,
      ...formatLogError(error),
    });

    return sendFailure(res, message);
  }
}

export { destroyOneCExchangeSession };
