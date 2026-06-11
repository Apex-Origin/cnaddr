import type { ParsedAddress } from './types.js';

/**
 * 把解析结果重新拼回标准化地址字符串（省+市+区+镇+详细，直辖市自动去重）。
 *
 * @example
 * ```ts
 * formatAddress(parse('浙江杭州余杭五常街道文一西路969号'));
 * // → '浙江省杭州市余杭区五常街道文一西路969号'
 * ```
 */
export function formatAddress(parsed: ParsedAddress): string {
  const parts: string[] = [];
  if (parsed.province) parts.push(parsed.province.name);
  if (parsed.city && parsed.city.name !== parsed.province?.name) {
    parts.push(parsed.city.name);
  }
  if (parsed.district) parts.push(parsed.district.name);
  if (parsed.town) parts.push(parsed.town);
  if (parsed.detail) parts.push(parsed.detail);
  return parts.join('');
}
