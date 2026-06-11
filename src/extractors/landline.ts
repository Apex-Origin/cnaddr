// 400 / 800 客服热线
const HOTLINE = /(?<!\d)((?:400|800)[- ]?\d{3,4}[- ]?\d{3,4})(?!\d)/;
// 区号(3~4位，0 开头) + 7~8 位号码 + 可选分机
const LANDLINE =
  /(?<!\d)(0\d{2,3})[- ]?(\d{7,8})(?:[- ]?(?:转|转接|ext\.?|#)\s?(\d{1,5}))?(?!\d)/i;

/**
 * 从文本中抽取固定电话（区号座机或 400/800 热线），并返回去除后的文本。
 */
export function extractLandline(text: string): { phone: string; text: string } {
  const hot = text.match(HOTLINE);
  if (hot && hot.index !== undefined) {
    const phone = hot[1]!.replace(/[- ]/g, '');
    const removed =
      text.slice(0, hot.index) + text.slice(hot.index + hot[0].length);
    return { phone, text: removed };
  }

  const m = text.match(LANDLINE);
  if (!m || m.index === undefined) return { phone: '', text };

  const area = m[1]!;
  const number = m[2]!;
  const ext = m[3];
  const phone = ext ? `${area}-${number}-${ext}` : `${area}-${number}`;
  const removed = text.slice(0, m.index) + text.slice(m.index + m[0].length);
  return { phone, text: removed };
}
