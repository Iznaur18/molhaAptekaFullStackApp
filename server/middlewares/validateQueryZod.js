import { formatZodQueryError } from "@molha/api-contract";

import { errorRes } from "../services/http/index.js";

/**
 * Проверяет параметры адресной строки схемой.
 *
 * Приведённые значения (числа из `z.coerce`, значения по умолчанию) лежат в
 * `req.validatedQuery`. В `req.query` их нет: в Express 5 это геттер, который
 * на каждое обращение заново разбирает адрес, и запись в него ни на что не
 * влияет — `page` там всегда строка, а пропущенный параметр — `undefined`.
 *
 * Строка `Object.assign` ниже оставлена ради старых контроллеров и их тестов
 * с ручным `req`. Перевести всех на `validatedQuery` разом нельзя: у многих
 * схем свои значения по умолчанию (размер страницы 10), а контроллеры
 * подставляют другие — поведение страниц тихо поменялось бы.
 *
 * @param {import('zod').ZodTypeAny} schema
 */
export function validateQueryZod(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return errorRes(res, 400, formatZodQueryError(result.error));
    }
    req.validatedQuery = result.data;
    Object.assign(req.query, result.data);
    return next();
  };
}
