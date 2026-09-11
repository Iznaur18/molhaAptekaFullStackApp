import iconv from "iconv-lite";

/**
 * Bitrix CSaleExport исторически отдаёт заказы в windows-1251.
 * Часть УТ/«Обмен с сайтом» читает ответ без уважения к UTF-8 в прологе —
 * UTF-8 кириллица тогда даёт «Не удалось разобрать данные».
 *
 * @param {string} xmlUtf8 XML, собранный в UTF-8 (prolog может быть UTF-8)
 * @returns {Buffer}
 */
export function encodeOneCOrdersXmlForExchange(xmlUtf8) {
  const withProlog = String(xmlUtf8 ?? "").replace(
    /<\?xml version="1\.0" encoding="UTF-8"\?>/i,
    '<?xml version="1.0" encoding="windows-1251"?>',
  );
  return iconv.encode(withProlog, "windows-1251");
}
