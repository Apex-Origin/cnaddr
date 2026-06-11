import type { ParsedAddress } from 'cnaddr';

export type TokenType =
  | 'name'
  | 'mobile'
  | 'phone'
  | 'idCard'
  | 'zipcode'
  | 'region'
  | 'town'
  | 'detail'
  | 'plain';

export interface Token {
  text: string;
  type: TokenType;
}

interface Span {
  start: number;
  end: number;
  type: TokenType;
}

/**
 * 尽力把原始地址按识别结果切成带类型的 token，用于彩色高亮。
 * 采用「在原文中定位子串」的方式，规范化/简称导致定位失败时会自动跳过（保持纯文本）。
 */
export function highlightTokens(parsed: ParsedAddress): Token[] {
  const raw = parsed.raw;
  if (!raw) return [];

  const spans: Span[] = [];
  const mark = (value: string, type: TokenType) => {
    if (!value) return;
    const idx = raw.indexOf(value);
    if (idx >= 0) spans.push({ start: idx, end: idx + value.length, type });
  };

  mark(parsed.name, 'name');
  mark(parsed.mobile, 'mobile');
  mark(parsed.phone, 'phone');
  mark(parsed.idCard, 'idCard');
  mark(parsed.zipcode, 'zipcode');
  if (parsed.province) mark(parsed.province.name, 'region');
  if (parsed.city) mark(parsed.city.name, 'region');
  if (parsed.district) mark(parsed.district.name, 'region');
  mark(parsed.town, 'town');
  mark(parsed.detail, 'detail');

  // 按起点升序、长度降序，跳过重叠
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Span[] = [];
  let cursor = 0;
  for (const s of spans) {
    if (s.start < cursor) continue;
    merged.push(s);
    cursor = s.end;
  }

  const tokens: Token[] = [];
  let pos = 0;
  for (const s of merged) {
    if (s.start > pos) tokens.push({ text: raw.slice(pos, s.start), type: 'plain' });
    tokens.push({ text: raw.slice(s.start, s.end), type: s.type });
    pos = s.end;
  }
  if (pos < raw.length) tokens.push({ text: raw.slice(pos), type: 'plain' });
  return tokens;
}

export const TOKEN_LABEL: Record<Exclude<TokenType, 'plain'>, string> = {
  name: '姓名',
  mobile: '手机',
  phone: '固话',
  idCard: '身份证',
  zipcode: '邮编',
  region: '省市区',
  town: '乡镇/街道',
  detail: '详细',
};
