import { PROVINCES, type ProvinceRecord } from './provinces.js';
import { CITIES, type CityRecord } from './cities.js';

export { PROVINCES, CITIES };
export type { ProvinceRecord, CityRecord };

/** 省级 code -> 记录 */
export const provinceByCode = new Map<string, ProvinceRecord>(
  PROVINCES.map((p) => [p.code, p]),
);

/** 市级 code -> { 所属省 code, 记录 } */
export const cityByCode = new Map<
  string,
  { provinceCode: string; city: CityRecord }
>();
for (const [provinceCode, list] of Object.entries(CITIES)) {
  for (const city of list) {
    cityByCode.set(city.code, { provinceCode, city });
  }
}

/** 一个用于前缀匹配的省份 key。 */
interface ProvinceKey {
  key: string;
  record: ProvinceRecord;
}

/**
 * 省份匹配 key：全称 + 简称 + 长度 ≥ 2 的别名。
 * 单字别名（京/沪/粤…）误伤率高，不参与常规前缀匹配。
 * 按 key 长度降序，优先匹配最长（最精确）的。
 */
export const PROVINCE_KEYS: ProvinceKey[] = (() => {
  const keys: ProvinceKey[] = [];
  for (const record of PROVINCES) {
    keys.push({ key: record.name, record });
    if (record.short && record.short !== record.name) {
      keys.push({ key: record.short, record });
    }
    for (const alias of record.alias) {
      if (alias.length >= 2) keys.push({ key: alias, record });
    }
  }
  return keys.sort((a, b) => b.key.length - a.key.length);
})();

/** 一个用于前缀匹配的城市 key。 */
export interface CityKey {
  key: string;
  provinceCode: string;
  city: CityRecord;
  /** 是否为带后缀的完整名（如「苏州市」为 true，「苏州」为 false）。 */
  full: boolean;
}

function shortCityName(name: string): string | null {
  if (name.endsWith('市')) return name.slice(0, -1);
  if (name.endsWith('地区')) return name.slice(0, -2);
  if (name.endsWith('盟')) return name.slice(0, -1);
  // 自治州 / 林区 / 特别行政区 简称形态不规则，不生成短 key。
  return null;
}

const allCityKeys: CityKey[] = [];
/** 省 code -> 该省城市 key 列表（含全称 + 短名），按长度降序。 */
export const cityKeysByProvince = new Map<string, CityKey[]>();

for (const [provinceCode, list] of Object.entries(CITIES)) {
  const perProvince: CityKey[] = [];
  for (const city of list) {
    const fullKey: CityKey = { key: city.name, provinceCode, city, full: true };
    perProvince.push(fullKey);
    allCityKeys.push(fullKey);

    const short = shortCityName(city.name);
    if (short && short.length >= 2) {
      const shortKey: CityKey = {
        key: short,
        provinceCode,
        city,
        full: false,
      };
      perProvince.push(shortKey);
      allCityKeys.push(shortKey);
    }
  }
  perProvince.sort((a, b) => b.key.length - a.key.length);
  cityKeysByProvince.set(provinceCode, perProvince);
}

/**
 * 全国城市全称索引（仅 full=true），用于「无省份时由市反推省」。
 * 只用完整名（带后缀）避免「中山路」被误判成「中山市」。
 * 按长度降序排列。
 */
export const GLOBAL_CITY_FULL_KEYS: CityKey[] = allCityKeys
  .filter((k) => k.full)
  .sort((a, b) => b.key.length - a.key.length);
