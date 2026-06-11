/**
 * cnaddr · 智能中文地址解析
 * 零依赖 · Node / 浏览器 / Deno 通用 · TypeScript 优先
 *
 * @packageDocumentation
 */

export { parse, parseBatch } from './parse.js';
export {
  setDistrictProvider,
  getDistrictProvider,
  matchRegion,
  matchRegionStructural,
  type RegionMatch,
} from './region.js';
export { isValidIdCard } from './extractors/idcard.js';
export {
  isLikelyName,
  SURNAMES,
  COMPOUND_SURNAMES,
} from './extractors/name.js';
export { formatAddress } from './format.js';

// 云端增强（Pro）· Powered by 极数本源 ApiZero (https://apizero.cn)
export {
  parseCloud,
  createCloudParser,
  CloudError,
  type CloudEndpoint,
  type CloudOptions,
  type CloudParsed,
} from './cloud.js';

export {
  PROVINCES,
  CITIES,
  provinceByCode,
  cityByCode,
  type ProvinceRecord,
  type CityRecord,
} from './data/index.js';

export type {
  ParsedAddress,
  ParseOptions,
  RegionNode,
  DistrictProvider,
} from './types.js';

/** 当前版本号。 */
export const version = '1.0.0';
