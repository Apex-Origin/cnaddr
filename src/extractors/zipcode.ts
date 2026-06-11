import { removeFirst } from '../utils.js';

// 带「邮编 / 邮政编码」上下文的优先
const ZIP_CTX =
  /(?:邮编|邮政编码|邮政编号|zip(?:code)?)[：:\s]*([1-8]\d{5})(?!\d)/i;
// 独立的 6 位数字（首位 1-8，避免误吞号码片段）
const ZIP_BARE = /(?<!\d)([1-8]\d{5})(?!\d)/;

/**
 * 从文本中抽取邮政编码（6 位），优先带上下文关键字的，并返回去除后的文本。
 * 注意：应在抽取手机号 / 身份证之后调用，避免误吞其数字片段。
 */
export function extractZipcode(text: string): {
  zipcode: string;
  text: string;
} {
  const ctx = text.match(ZIP_CTX);
  if (ctx) {
    return { zipcode: ctx[1]!, text: removeFirst(text, ctx[0]) };
  }
  const bare = text.match(ZIP_BARE);
  if (bare) {
    return { zipcode: bare[1]!, text: removeFirst(text, bare[1]!) };
  }
  return { zipcode: '', text };
}
