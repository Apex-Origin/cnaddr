import { digitsOnly } from '../utils.js';

// 允许 +86 / 86 / 0086 前缀，号段内允许 1 处空格或短横线分隔
// （138-1234-5678 / 138 1234 5678）。边界断言放在最前面，兼容国家码前缀。
const MOBILE =
  /(?<!\d)(?:\+?86|0086)?[- ]?(1[3-9]\d)[- ]?(\d{4})[- ]?(\d{4})(?!\d)/;

/**
 * 从文本中抽取第一个手机号，规范化为 11 位（去 +86 与分隔符）。
 */
export function extractMobile(text: string): { mobile: string; text: string } {
  const m = text.match(MOBILE);
  if (!m || m.index === undefined) return { mobile: '', text };

  const mobile = digitsOnly(m[1]! + m[2]! + m[3]!);
  if (!/^1[3-9]\d{9}$/.test(mobile)) return { mobile: '', text };

  const removed = text.slice(0, m.index) + text.slice(m.index + m[0].length);
  return { mobile, text: removed };
}
