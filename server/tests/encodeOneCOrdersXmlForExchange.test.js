import assert from "node:assert/strict";
import { describe, it } from "node:test";

import iconv from "iconv-lite";

import { encodeOneCOrdersXmlForExchange } from "../services/onec/exchange/encodeOneCOrdersXmlForExchange.js";

describe("encodeOneCOrdersXmlForExchange", () => {
  it("rewrites prolog and encodes Cyrillic as windows-1251", () => {
    const utf8 = `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация>
  <Документ><ХозОперация>Заказ товара</ХозОперация></Документ>
</КоммерческаяИнформация>`;

    const buf = encodeOneCOrdersXmlForExchange(utf8);
    assert.ok(Buffer.isBuffer(buf));

    const decoded = iconv.decode(buf, "windows-1251");
    assert.match(decoded, /encoding="windows-1251"/);
    assert.doesNotMatch(decoded, /encoding="UTF-8"/);
    assert.match(decoded, /Заказ товара/);
    assert.notEqual(buf.compare(Buffer.from(decoded, "utf8")), 0);
  });
});
