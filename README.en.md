<div align="center">

# cnaddr · Smart Chinese Address Parser

**Turn any messy Chinese address string into structured data — instantly.**

Province / City / District / Town + name / mobile / landline / ID card / zipcode.

[![npm version](https://img.shields.io/npm/v/cnaddr.svg?color=%236ea8fe)](https://www.npmjs.com/package/cnaddr)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-success)](#)
[![license](https://img.shields.io/npm/l/cnaddr.svg?color=%23999)](./LICENSE)

[简体中文](./README.md)

</div>

---

```ts
import { parse } from 'cnaddr';

parse('张三 13812345678 浙江省杭州市余杭区五常街道文一西路969号 311121');
// {
//   province: { code: '330000', name: '浙江省' },
//   city:     { code: '330100', name: '杭州市' },
//   district: { code: '',       name: '余杭区' },
//   town: '五常街道', detail: '文一西路969号',
//   name: '张三', mobile: '13812345678', zipcode: '311121',
//   confidence: 1, ...
// }
```

## Features

- 🧠 Splits **province / city / district / town** out of free-form text.
- 🔁 **Back-fills** the province from a city name; expands short forms (`广东深圳` → `广东省 / 深圳市`).
- 👤 Extracts & strips **name / mobile / landline / ID card / zipcode** in one pass.
- 🗺️ Built-in dictionary of **34 provinces + 333 prefectures** with GB codes. No network, no DB.
- 🧩 Pluggable district-level data via `setDistrictProvider`.
- 📦 **Zero runtime dependencies**, ESM + CJS, tiny gzip size.
- 🌐 Works in Node / Browser / Deno / edge runtimes.
- ⚡ ~1µs per parse (~900k ops/s).
- 🛡️ First-class TypeScript types. 🖥️ Ships a `cnaddr` CLI.

## Install

```bash
npm i cnaddr
```

## Usage

```ts
import { parse, parseBatch, formatAddress } from 'cnaddr';

parse('北京朝阳区三里屯街道工体北路8号');
formatAddress(parse('浙江杭州余杭区五常街道文一西路969号'));
// → '浙江省杭州市余杭区五常街道文一西路969号'
parseBatch(['浙江省杭州市', '广东省深圳市南山区']);
```

### CLI

```bash
npx cnaddr "张三 13812345678 浙江省杭州市余杭区文一西路969号"
cnaddr -j "北京朝阳区三里屯街道工体北路8号"
cat addresses.txt | cnaddr --json
```

## API

See the [Chinese README](./README.md#-api) for the full options table. Quick reference:

- `parse(input, options?) => ParsedAddress`
- `parseBatch(inputs, options?) => ParsedAddress[]`
- `formatAddress(parsed) => string`
- `isValidIdCard(id) => boolean`
- `setDistrictProvider(provider)` — resolve district-level codes
- `PROVINCES`, `CITIES`, `provinceByCode`, `cityByCode`

`ParseOptions`: `extractMobile`, `extractPhone`, `extractIdCard`, `extractZipcode`,
`extractName`, `normalizeRegion`, `strict`, `textFilter`.

## ☁️ Cloud Pro

The local parser is offline and covers most cases. When you need **JD-grade correction,
4-level regions (down to town/street) with IDs, a continuously-updated nationwide
address database and high-concurrency SLA**, switch to the cloud in one line — powered
by [**ApiZero**](https://apizero.cn):

```ts
import { parseCloud } from 'cnaddr';
const pro = await parseCloud('杭州余杭文一西路969号', {
  apiKey: 'sk_live_xxx', // free key: https://apizero.cn/account/keys
  endpoint: 'jd-address',
});
```

Docs: [address-parse](https://apizero.cn/aidocs/address-parse) · [jd-address](https://apizero.cn/aidocs/jd-address)

## License

[MIT](./LICENSE) © cnaddr contributors

---

<div align="center">

Maintained by [**ApiZero · 极数本源**](https://apizero.cn) — [hundreds of high-quality APIs →](https://apizero.cn/marketplace)

</div>
