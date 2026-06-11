/** 单个汉字的 Unicode 范围（基本区）。 */
export const HAN = '\u4e00-\u9fa5';

/** 详细地址里常见的「门牌 / 楼栋」起始字符，用于短名城市的防误判。 */
const DETAIL_LEADING = new Set([
  '路',
  '道',
  '街',
  '巷',
  '弄',
  '号',
  '室',
  '栋',
  '幢',
  '座',
  '楼',
  '层',
  '组',
  '队',
  '村',
  '园',
  '苑',
  '里',
  '大',
  '小',
  '广',
  '中',
]);

/**
 * 判断某个「短名城市」匹配后紧跟的字符是否像详细地址。
 * 例如「中山路100号」里的「中山」后跟「路」，应拒绝当作城市。
 */
export function looksLikeDetailAfter(rest: string): boolean {
  if (rest === '') return false;
  const first = rest[0]!;
  if (first >= '0' && first <= '9') return true;
  return DETAIL_LEADING.has(first);
}

/** 折叠分隔符：去掉空白与中英文逗号、分号、顿号。 */
export function collapseSeparators(s: string): string {
  return s.replace(/[\s,，;；、]+/gu, '').trim();
}

/** 仅保留数字。 */
export function digitsOnly(s: string): string {
  return s.replace(/\D+/g, '');
}

/** 安全地把一段子串从原文中移除（仅移除第一次出现）。 */
export function removeFirst(text: string, fragment: string): string {
  if (fragment === '') return text;
  const idx = text.indexOf(fragment);
  if (idx < 0) return text;
  return text.slice(0, idx) + text.slice(idx + fragment.length);
}

/** 四舍五入到指定小数位。 */
export function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
