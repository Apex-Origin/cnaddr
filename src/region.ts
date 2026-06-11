import type { RegionNode, DistrictProvider } from './types.js';
import {
  PROVINCE_KEYS,
  CITIES,
  cityKeysByProvince,
  GLOBAL_CITY_FULL_KEYS,
  provinceByCode,
  type ProvinceRecord,
  type CityKey,
} from './data/index.js';
import { HAN, looksLikeDetailAfter, round } from './utils.js';

let districtProvider: DistrictProvider | null = null;

/**
 * 注入「区县级」数据提供方。内置字典只到地级市，注入后可解析出区县代码。
 * 传 null 可清除。
 */
export function setDistrictProvider(provider: DistrictProvider | null): void {
  districtProvider = provider;
}

/** 获取当前的区县级数据提供方。 */
export function getDistrictProvider(): DistrictProvider | null {
  return districtProvider;
}

const DISTRICT_RE = new RegExp(
  `^([${HAN}]{1,7}?(?:特别行政区|新区|矿区|林区|自治县|县|区|市|旗|岛))`,
  'u',
);
const TOWN_RE = new RegExp(`^([${HAN}·]{1,8}?(?:民族乡|街道|镇|乡|苏木))`, 'u');

const MUNI_RE = /^(北京|天津|上海|重庆)市?/u;
const PROVINCE_STRUCT_RE = new RegExp(
  `^([${HAN}]{2,6}?(?:省|自治区|特别行政区))`,
  'u',
);
const CITY_STRUCT_RE = new RegExp(
  `^([${HAN}]{2,7}?(?:市|地区|自治州|州|盟))`,
  'u',
);

const GLOBAL_CITY_SHORT_KEYS: CityKey[] = (() => {
  const seen = new Set<string>();
  const result: CityKey[] = [];
  for (const [provinceCode, list] of cityKeysByProvince) {
    void provinceCode;
    for (const ck of list) {
      if (ck.full || seen.has(ck.key)) continue;
      seen.add(ck.key);
      result.push(ck);
    }
  }
  return result.sort((a, b) => b.key.length - a.key.length);
})();

export interface RegionMatch {
  province: RegionNode | null;
  city: RegionNode | null;
  district: RegionNode | null;
  town: string;
  detail: string;
  confidence: number;
}

/**
 * 从「已清洗的地址主体」中切出省 / 市 / 区 / 镇，剩余为详细地址。
 */
export function matchRegion(core: string, strict: boolean): RegionMatch {
  let remaining = core;
  let province: RegionNode | null = null;
  let provinceRecord: ProvinceRecord | null = null;

  // 1. 省级前缀
  for (const pk of PROVINCE_KEYS) {
    if (remaining.startsWith(pk.key)) {
      provinceRecord = pk.record;
      province = { code: pk.record.code, name: pk.record.name };
      remaining = remaining.slice(pk.key.length);
      // 简称命中后清掉悬挂的「省 / 市」
      if (
        pk.key !== pk.record.name &&
        (remaining[0] === '市' || remaining[0] === '省')
      ) {
        remaining = remaining.slice(1);
      }
      break;
    }
  }

  // 2. 市级
  let city: RegionNode | null = null;
  let cityCode = '';

  if (provinceRecord) {
    if (provinceRecord.isMunicipality) {
      const first = CITIES[provinceRecord.code]?.[0];
      city = first
        ? { code: first.code, name: first.name }
        : { code: provinceRecord.code, name: provinceRecord.name };
      cityCode = city.code;
    } else {
      const keys = cityKeysByProvince.get(provinceRecord.code) ?? [];
      for (const ck of keys) {
        if (!remaining.startsWith(ck.key)) continue;
        const rest = remaining.slice(ck.key.length);
        if (!ck.full && looksLikeDetailAfter(rest)) continue;
        city = { code: ck.city.code, name: ck.city.name };
        cityCode = ck.city.code;
        remaining = rest;
        break;
      }
    }
  } else {
    // 无省份：先用「完整市名」反推省，再尝试「短市名 + 紧跟区县/乡镇」
    for (const ck of GLOBAL_CITY_FULL_KEYS) {
      if (!remaining.startsWith(ck.key)) continue;
      ({ province, provinceRecord } = adoptCity(ck));
      city = { code: ck.city.code, name: ck.city.name };
      cityCode = ck.city.code;
      remaining = remaining.slice(ck.key.length);
      break;
    }
    if (!city) {
      for (const ck of GLOBAL_CITY_SHORT_KEYS) {
        if (!remaining.startsWith(ck.key)) continue;
        const rest = remaining.slice(ck.key.length);
        if (!DISTRICT_RE.test(rest) && !TOWN_RE.test(rest)) continue;
        ({ province, provinceRecord } = adoptCity(ck));
        city = { code: ck.city.code, name: ck.city.name };
        cityCode = ck.city.code;
        remaining = rest;
        break;
      }
    }
  }

  // 3. 区 / 县
  let district: RegionNode | null = null;
  const dm = remaining.match(DISTRICT_RE);
  if (dm) {
    const name = dm[1]!;
    const fromProvider = districtProvider
      ? districtProvider(cityCode, name)
      : null;
    if (fromProvider) {
      district = fromProvider;
      remaining = remaining.slice(name.length);
    } else if (!strict) {
      district = { code: '', name };
      remaining = remaining.slice(name.length);
    }
  }

  // 4. 乡 / 镇 / 街道
  let town = '';
  const tm = remaining.match(TOWN_RE);
  if (tm) {
    town = tm[1]!;
    remaining = remaining.slice(town.length);
  }

  const detail = remaining.trim();

  let confidence = 0;
  if (province) confidence += 0.4;
  if (city) confidence += 0.3;
  if (district) confidence += 0.2;
  if (detail) confidence += 0.1;

  return {
    province,
    city,
    district,
    town,
    detail,
    confidence: round(Math.min(1, confidence)),
  };
}

function adoptCity(ck: CityKey): {
  province: RegionNode | null;
  provinceRecord: ProvinceRecord | null;
} {
  const pr = provinceByCode.get(ck.provinceCode) ?? null;
  return {
    province: pr ? { code: pr.code, name: pr.name } : null,
    provinceRecord: pr,
  };
}

/**
 * 纯结构化区域解析：不使用内置字典，仅靠后缀正则切分（normalizeRegion=false 时使用）。
 * 所有 code 均为空串。
 */
export function matchRegionStructural(
  core: string,
  strict: boolean,
): RegionMatch {
  let remaining = core;
  let province: RegionNode | null = null;
  let city: RegionNode | null = null;

  const muni = remaining.match(MUNI_RE);
  if (muni) {
    const name = `${muni[1]}市`;
    province = { code: '', name };
    city = { code: '', name };
    remaining = remaining.slice(muni[0].length);
  } else {
    const pm = remaining.match(PROVINCE_STRUCT_RE);
    if (pm) {
      province = { code: '', name: pm[1]! };
      remaining = remaining.slice(pm[1]!.length);
    }
  }

  if (!city) {
    const cm = remaining.match(CITY_STRUCT_RE);
    if (cm) {
      city = { code: '', name: cm[1]! };
      remaining = remaining.slice(cm[1]!.length);
    }
  }

  let district: RegionNode | null = null;
  const dm = remaining.match(DISTRICT_RE);
  if (dm) {
    district = { code: '', name: dm[1]! };
    remaining = remaining.slice(dm[1]!.length);
  }

  let town = '';
  const tm = remaining.match(TOWN_RE);
  if (tm) {
    town = tm[1]!;
    remaining = remaining.slice(town.length);
  }

  const detail = remaining.trim();

  let confidence = 0;
  if (province) confidence += 0.3;
  if (city) confidence += 0.25;
  if (district) confidence += 0.2;
  if (detail) confidence += 0.1;
  void strict;

  return {
    province,
    city,
    district,
    town,
    detail,
    confidence: round(Math.min(1, confidence)),
  };
}
