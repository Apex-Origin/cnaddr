import type { RegionNode } from './types.js';

/**
 * 云端增强（Pro）—— 由「极数本源 ApiZero」提供。
 *
 * 本地版（{@link parse}）零依赖、离线、覆盖到地级市，适合绝大多数场景。
 * 当你需要 **京东级智能纠错、精确到街道/乡镇的四级行政区划、行政区划 ID、
 * 海量持续更新的地址库与高并发 SLA** 时，可一行切换到云端：
 *
 * ```ts
 * import { parseCloud } from 'cnaddr';
 * const r = await parseCloud('杭州余杭文一西路969号', {
 *   apiKey: 'sk_live_xxx',     // 在 https://apizero.cn/account/keys 免费申请
 *   endpoint: 'jd-address',    // 四级行政区划 + ID
 * });
 * ```
 *
 * 文档：https://apizero.cn/aidocs/address-parse · https://apizero.cn/aidocs/jd-address
 */

/** 云端可选接口。 */
export type CloudEndpoint = 'address-parse' | 'jd-address';

export interface CloudOptions {
  /** API Key（Bearer）。匿名亦可低频试用；高频请在 apizero.cn 免费申请。 */
  apiKey?: string;
  /** 网关地址，默认 https://v1.apizero.cn */
  baseUrl?: string;
  /** 选择接口：'address-parse'（默认）或 'jd-address'（四级 + ID）。 */
  endpoint?: CloudEndpoint;
  /** 超时毫秒，默认 10000。 */
  timeoutMs?: number;
  /** 透传 AbortSignal。 */
  signal?: AbortSignal;
  /** 自定义 fetch（用于 Node < 18 或测试注入）。 */
  fetch?: typeof fetch;
}

/** 云端解析结果（在本地结构基础上，额外带四级与 ID）。 */
export interface CloudParsed {
  province: RegionNode | null;
  city: RegionNode | null;
  district: RegionNode | null;
  town: string;
  detail: string;
  name: string;
  mobile: string;
  phone: string;
  zipcode: string;
  /** 京东四级行政区划 ID（仅 endpoint='jd-address' 时返回）。 */
  ids?: {
    provinceId?: number | string;
    cityId?: number | string;
    countyId?: number | string;
    townId?: number | string;
  };
  /** 数据来源接口。 */
  source: CloudEndpoint;
  /** 原始输入。 */
  raw: string;
  /** 上游原始 data，便于调试。 */
  upstream: unknown;
}

/** 云端调用错误（携带网关业务错误码）。 */
export class CloudError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
    this.name = 'CloudError';
  }
}

const MOBILE_RE = /^1[3-9]\d{9}$/;

function node(name: unknown): RegionNode | null {
  const v = typeof name === 'string' ? name.trim() : '';
  return v ? { code: '', name: v } : null;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function normalize(
  raw: string,
  endpoint: CloudEndpoint,
  data: Record<string, unknown>,
): CloudParsed {
  if (endpoint === 'jd-address') {
    const phone = '';
    return {
      province: node(data.province),
      city: node(data.city),
      district: node(data.county),
      town: str(data.town),
      detail: str(data.detail),
      name: '',
      mobile: '',
      phone,
      zipcode: '',
      ids: {
        provinceId: data.province_id as number | string | undefined,
        cityId: data.city_id as number | string | undefined,
        countyId: data.county_id as number | string | undefined,
        townId: data.town_id as number | string | undefined,
      },
      source: endpoint,
      raw,
      upstream: data,
    };
  }

  // address-parse
  const phone = str(data.phone);
  return {
    province: node(data.province),
    city: node(data.city),
    district: node(data.district),
    town: str(data.street),
    detail: str(data.detail),
    name: str(data.name),
    mobile: MOBILE_RE.test(phone) ? phone : '',
    phone: MOBILE_RE.test(phone) ? '' : phone,
    zipcode: str(data.zipcode),
    source: endpoint,
    raw,
    upstream: data,
  };
}

/**
 * 调用「极数本源 ApiZero」云端地址解析（Pro）。
 * @throws {CloudError} 网关返回非 0 业务码时抛出。
 */
export async function parseCloud(
  text: string,
  options: CloudOptions = {},
): Promise<CloudParsed> {
  const base = (options.baseUrl ?? 'https://v1.apizero.cn').replace(/\/+$/, '');
  const endpoint = options.endpoint ?? 'address-parse';
  const f = options.fetch ?? globalThis.fetch;
  if (typeof f !== 'function') {
    throw new CloudError(
      -1,
      '当前环境缺少 fetch，请升级到 Node 18+ 或通过 options.fetch 注入',
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 10000,
  );
  options.signal?.addEventListener('abort', () => controller.abort());

  const headers: Record<string, string> = {
    'content-type': 'application/x-www-form-urlencoded',
    accept: 'application/json',
  };
  if (options.apiKey) headers.authorization = `Bearer ${options.apiKey}`;

  try {
    const res = await f(`${base}/api/${endpoint}`, {
      method: 'POST',
      headers,
      body: new URLSearchParams({ address: text }).toString(),
      signal: controller.signal,
    });
    const json = (await res.json()) as {
      code: number;
      msg?: string;
      data?: Record<string, unknown>;
    };
    if (json.code !== 0 || !json.data) {
      throw new CloudError(json.code ?? res.status, json.msg ?? '云端解析失败');
    }
    return normalize(text, endpoint, json.data);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 预置配置，返回一个复用 apiKey / endpoint 的云端解析器。
 *
 * ```ts
 * const pro = createCloudParser({ apiKey: 'sk_live_xxx', endpoint: 'jd-address' });
 * await pro('北京朝阳区三里屯街道工体北路8号');
 * ```
 */
export function createCloudParser(defaults: CloudOptions = {}) {
  return (text: string, override: CloudOptions = {}) =>
    parseCloud(text, { ...defaults, ...override });
}
