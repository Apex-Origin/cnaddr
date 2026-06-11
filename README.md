<div align="center">

# cnaddr · 智能中文地址解析

**把任意一段中文地址，秒变结构化数据。**

省 / 市 / 区 / 镇 + 姓名 / 手机 / 固话 / 身份证 / 邮编，一次搞定。

[![npm version](https://img.shields.io/npm/v/cnaddr.svg?color=%236ea8fe)](https://www.npmjs.com/package/cnaddr)
[![npm downloads](https://img.shields.io/npm/dm/cnaddr.svg?color=%2306b6d4)](https://www.npmjs.com/package/cnaddr)
[![bundle size](https://img.shields.io/bundlephobia/minzip/cnaddr?color=%2334d399)](https://bundlephobia.com/package/cnaddr)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-success)](#)
[![CI](https://github.com/Apex-Origin/cnaddr/actions/workflows/ci.yml/badge.svg)](https://github.com/Apex-Origin/cnaddr/actions)
[![license](https://img.shields.io/npm/l/cnaddr.svg?color=%23999)](./LICENSE)
[![types](https://img.shields.io/npm/types/cnaddr.svg)](#)
[![Powered by ApiZero](https://img.shields.io/badge/云端增强-极数本源%20ApiZero-6ea8fe)](https://apizero.cn/aidocs/address-parse)

[English](./README.en.md) · [在线演示 Playground](#-在线演示) · [API 文档](#-api) · [☁️ 云端增强 Pro](#️-云端增强pro) · [更新日志](./CHANGELOG.md)

</div>

---

```ts
import { parse } from 'cnaddr';

parse('张三 13812345678 浙江省杭州市余杭区五常街道文一西路969号 311121');
```

```jsonc
{
  "province": { "code": "330000", "name": "浙江省" },
  "city":     { "code": "330100", "name": "杭州市" },
  "district": { "code": "",       "name": "余杭区" },
  "town":     "五常街道",
  "detail":   "文一西路969号",
  "name":     "张三",
  "mobile":   "13812345678",
  "phone":    "",
  "idCard":   "",
  "zipcode":  "311121",
  "confidence": 1,
  "raw": "张三 13812345678 浙江省杭州市余杭区五常街道文一西路969号 311121"
}
```

## ✨ 特性

- 🧠 **智能识别** —— 省 / 市 / 区 / 乡镇街道 四级行政区划，自动从地址中切分。
- 🔁 **反向补全** —— 只写「杭州市」也能反推出「浙江省」；只写简称「广东深圳」也能补全为「广东省 / 深圳市」。
- 👤 **混合抽取** —— 同时识别并剥离 **姓名 / 手机号 / 固定电话 / 身份证 / 邮编**，快递面单一行流也能解析。
- 🗺️ **内置字典** —— 自带 **34 个省级 + 333 个地级**行政区划及**国标编码**，无需联网、无需数据库。
- 🧩 **可插拔区县数据** —— 通过 `setDistrictProvider` 注入完整区县级数据，即可解析到区县代码。
- 📦 **零依赖** —— 运行时 **0 依赖**，gzip 后体积极小，ESM + CJS 双格式。
- 🌐 **全平台** —— Node / 浏览器 / Deno / 边缘运行时通用，纯前端可用（地址数据不出本地）。
- ⚡ **极快** —— 单条解析 **~1µs**，约 **90 万次/秒**（见 [基准测试](#-基准测试)）。
- 🛡️ **TypeScript** —— 完整类型定义，开箱即用。
- 🖥️ **命令行** —— 附带 `cnaddr` CLI，支持管道与批量。

## 📦 安装

```bash
npm i cnaddr
# 或
pnpm add cnaddr
# 或
yarn add cnaddr
```

> 要求 Node ≥ 18。浏览器可直接打包，或用 `import` ESM。

## 🚀 快速开始

```ts
import { parse, parseBatch, formatAddress } from 'cnaddr';

// 1. 基础解析
const r = parse('北京朝阳区三里屯街道工体北路8号');
r.province?.name; // '北京市'
r.district?.name; // '朝阳区'
r.detail;         // '工体北路8号'

// 2. 快递面单（姓名 + 电话 + 地址混合）
parse('收件人：王小明 13900139000 广东深圳南山区粤海街道科技园');
// → name '王小明', mobile '13900139000', province '广东省', city '深圳市', district '南山区'

// 3. 反向拼回标准化地址（直辖市自动去重）
formatAddress(parse('浙江杭州余杭区五常街道文一西路969号'));
// → '浙江省杭州市余杭区五常街道文一西路969号'

// 4. 批量解析
parseBatch(['浙江省杭州市', '广东省深圳市南山区']);
```

## 🧰 命令行 CLI

```bash
# 直接解析
npx cnaddr "张三 13812345678 浙江省杭州市余杭区文一西路969号"

# JSON 输出
cnaddr -j "北京朝阳区三里屯街道工体北路8号"

# 只取某个字段
cnaddr --field province "广东深圳南山区"   # → 广东省

# 标准化地址
cnaddr -f "浙江杭州余杭区五常街道"        # → 浙江省杭州市余杭区五常街道

# 管道 / 批量（每行一条）
cat addresses.txt | cnaddr --json
```

完整选项见 `cnaddr --help`。

## 📖 API

### `parse(input, options?) => ParsedAddress`

解析单条地址。

```ts
interface ParsedAddress {
  province: RegionNode | null; // { code, name }
  city: RegionNode | null;
  district: RegionNode | null;
  town: string;       // 乡镇 / 街道
  detail: string;     // 剩余详细地址
  name: string;       // 姓名
  mobile: string;     // 手机号（11 位，已规范化）
  phone: string;      // 固定电话
  idCard: string;     // 身份证号
  zipcode: string;    // 邮编
  confidence: number; // 置信度 0~1
  raw: string;        // 原始输入
}
```

### `parseBatch(inputs, options?) => ParsedAddress[]`

批量解析。

### 选项 `ParseOptions`

| 选项 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `extractMobile` | `boolean` | `true` | 抽取并移除手机号 |
| `extractPhone` | `boolean` | `true` | 抽取并移除固定电话 |
| `extractIdCard` | `boolean` | `true` | 抽取并移除身份证号 |
| `extractZipcode` | `boolean` | `true` | 抽取并移除邮编 |
| `extractName` | `boolean` | `true` | 抽取并移除姓名 |
| `normalizeRegion` | `boolean` | `true` | 使用内置字典补全 / 反推省份；`false` 则仅结构化切分（code 为空） |
| `strict` | `boolean` | `false` | 严格模式：省 / 市必须命中内置字典，否则留空 |
| `textFilter` | `string[]` | `—` | 解析前需要剔除的噪声词，如 `['【顺丰】']` |

### 其它导出

```ts
import {
  formatAddress,       // 反向拼回标准化地址字符串
  isValidIdCard,       // 18 位身份证校验码校验（GB 11643）
  isLikelyName,        // 判断字符串是否像中文姓名
  setDistrictProvider, // 注入区县级数据提供方
  PROVINCES, CITIES,   // 内置行政区划数据
  provinceByCode, cityByCode, // 编码索引
  version,
} from 'cnaddr';
```

## 🧩 解析到「区县代码」

内置字典覆盖到**地级市**。如果你需要精确到**区县级代码**，注入一份完整区县数据即可：

```ts
import { parse, setDistrictProvider } from 'cnaddr';

// areaData：你自备的「市 code → 区县列表」数据（如从国家统计局区划代码生成）
setDistrictProvider((cityCode, districtName) => {
  const found = areaData[cityCode]?.find((d) => d.name === districtName);
  return found ? { code: found.code, name: found.name } : null;
});

parse('广东省深圳市南山区粤海街道').district;
// → { code: '440305', name: '南山区' }
```

## ☁️ 云端增强（Pro）

本地版已能覆盖绝大多数场景。当你需要 **京东级智能纠错、精确到街道/乡镇的四级行政区划、行政区划 ID、持续更新的全国地址库与高并发 SLA** 时，一行切换到云端 —— 由 [**极数本源 ApiZero**](https://apizero.cn) 提供：

```ts
import { parse, parseCloud } from 'cnaddr';

// 本地：零依赖、离线、毫秒级
const local = parse('杭州余杭文一西路969号');

// 云端 Pro：四级行政区 + ID（在 https://apizero.cn/account/keys 免费申请 Key）
const pro = await parseCloud('杭州余杭文一西路969号', {
  apiKey: 'sk_live_xxx',
  endpoint: 'jd-address', // 'address-parse' | 'jd-address'
});
pro.town; // '五常街道' —— 四级
pro.ids;  // { provinceId, cityId, countyId, townId }
```

或复用配置：

```ts
import { createCloudParser } from 'cnaddr';
const pro = createCloudParser({ apiKey: 'sk_live_xxx', endpoint: 'jd-address' });
await pro('北京朝阳区三里屯街道工体北路8号');
```

| 能力 | 本地版 `parse()` | 云端 Pro `parseCloud()` |
| --- | :---: | :---: |
| 省 / 市 / 区 三级 | ✅ | ✅ |
| 乡镇 / 街道（第四级） | ⚠️ 结构化 | ✅ 精确 + ID |
| 行政区划编码 / ID | 到地级 | ✅ 四级 |
| 智能纠错 / 残缺地址补全 | 一般 | ✅ 京东级 |
| 地址库更新 | 随版本 | ✅ 持续更新 |
| 运行方式 | 离线 / 零依赖 | 云端 API |
| 适用 | 大多数场景 | 高精度 / 大批量 / 生产 |

> 🔑 **免费申请 Key**：<https://apizero.cn/account/keys> · 📖 接口文档：[address-parse](https://apizero.cn/aidocs/address-parse) · [jd-address](https://apizero.cn/aidocs/jd-address)

## 🏪 关于 极数本源 ApiZero

`cnaddr` 由 [**极数本源 ApiZero**](https://apizero.cn) 开源维护 —— 一个聚合 API 工具集市，覆盖**天气、IP、翻译、OCR、AI、电商、地址**等 **数百个高质量接口**，统一鉴权、统一计费、5 分钟接入。

- 🧰 [浏览全部 API（集市）](https://apizero.cn/marketplace)
- 🤖 [AI 接入文档（喂给 ChatGPT/Claude 直接出代码）](https://apizero.cn/aidocs)
- 🔑 [免费获取 API Key](https://apizero.cn/account/keys)

## 🌍 在线演示

仓库内置一个 **Vite + React** 的可视化 Playground（含「本地 / 云端 Pro」实时对比）：

```bash
pnpm build          # 先构建库
pnpm playground     # 启动 http://localhost:5173
```

> 纯前端解析，输入的地址数据不会离开浏览器。

## ⚡ 基准测试

`node v24` / 单线程实测（`pnpm bench`）：

| 场景 | 吞吐 | 单次耗时 |
| --- | --- | --- |
| 完整面单（姓名+电话+地址） | ~660k ops/s | ~1.5 µs |
| 混合样本 | ~930k ops/s | ~1.1 µs |
| 仅省市区 | ~1.74M ops/s | ~0.6 µs |

## 🆚 对比

| | cnaddr | 传统正则方案 | 调用第三方 API |
| --- | --- | --- | --- |
| 离线可用 | ✅ | ✅ | ❌ |
| 由市反推省 | ✅ | ❌ | ✅ |
| 简称补全 | ✅ | ⚠️ | ✅ |
| 姓名/电话/身份证抽取 | ✅ | ⚠️ | ⚠️ |
| 行政区划编码 | ✅（到地级，区县可插拔） | ❌ | ✅ |
| 运行时依赖 | 0 | 0 | 网络 |
| 隐私 | 本地处理 | 本地处理 | 上传第三方 |

## ❓ FAQ

**Q：为什么区县没有 code？**
内置数据覆盖到地级市；区县级共数千条，体积较大，故默认只做结构化抽取（`district.name` 有值、`code` 为空）。需要 code 请用 [`setDistrictProvider`](#-解析到区县代码)。

**Q：识别不准 / 漏识别怎么办？**
欢迎提交带样例的 [Issue](https://github.com/Apex-Origin/cnaddr/issues)。地址写法千变万化，我们持续补充规则与测试用例。

**Q：会上传我的地址吗？**
不会。`cnaddr` 是纯本地库，没有任何网络请求。

## 🤝 贡献

欢迎 PR！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。本地开发：

```bash
pnpm install
pnpm test       # 测试
pnpm lint       # 代码检查
pnpm build      # 构建
```

## 📄 许可

[MIT](./LICENSE) © 极数本源 ApiZero

---

<div align="center">

由 [**极数本源 ApiZero**](https://apizero.cn) 开源维护 · [数百个高质量 API，5 分钟接入 →](https://apizero.cn/marketplace)

</div>
