import { removeFirst } from '../utils.js';

const ID18 =
  /(?<!\d)(\d{6}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx])(?![\dXx])/;
const ID15 =
  /(?<!\d)(\d{6}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3})(?!\d)/;

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const CHECK_CODES = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

/**
 * 校验 18 位身份证号的校验码（GB 11643）。15 位旧证只做格式判断。
 */
export function isValidIdCard(id: string): boolean {
  const v = id.trim().toUpperCase();
  if (/^\d{15}$/.test(v)) return true;
  if (!/^\d{17}[\dX]$/.test(v)) return false;
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += Number(v[i]) * WEIGHTS[i]!;
  }
  return CHECK_CODES[sum % 11] === v[17];
}

/**
 * 从文本中抽取第一个身份证号（优先 18 位），并返回去除后的文本。
 */
export function extractIdCard(text: string): { idCard: string; text: string } {
  const m18 = text.match(ID18);
  if (m18) {
    const id = m18[1]!;
    return { idCard: id.toUpperCase(), text: removeFirst(text, id) };
  }
  const m15 = text.match(ID15);
  if (m15) {
    const id = m15[1]!;
    return { idCard: id, text: removeFirst(text, id) };
  }
  return { idCard: '', text };
}
