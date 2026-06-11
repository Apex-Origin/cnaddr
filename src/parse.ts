import type { ParsedAddress, ParseOptions } from './types.js';
import { extractIdCard } from './extractors/idcard.js';
import { extractMobile } from './extractors/mobile.js';
import { extractLandline } from './extractors/landline.js';
import { extractZipcode } from './extractors/zipcode.js';
import { extractName, isLikelyName } from './extractors/name.js';
import { matchRegion, matchRegionStructural } from './region.js';
import { collapseSeparators } from './utils.js';

const SEP_RE = /[\s,，;；、]+/u;

// 抽取后残留的常见标签词（电话：/ 地址：/ 手机号 …），region 解析前清掉。
const LABEL_RE =
  /(收货地址|详细地址|联系电话|联系方式|联系人|收件人|收货人|手机号码|手机号|邮政编码|所在地区|电话|手机|地址|姓名|邮编)[：:\s]*/g;

const DEFAULT_OPTIONS: Required<Omit<ParseOptions, 'textFilter'>> = {
  extractMobile: true,
  extractPhone: true,
  extractIdCard: true,
  extractZipcode: true,
  extractName: true,
  normalizeRegion: true,
  strict: false,
};

function emptyResult(raw: string): ParsedAddress {
  return {
    province: null,
    city: null,
    district: null,
    town: '',
    detail: '',
    name: '',
    mobile: '',
    phone: '',
    idCard: '',
    zipcode: '',
    confidence: 0,
    raw,
  };
}

/**
 * 解析一段中文地址，抽取结构化字段。
 *
 * @example
 * ```ts
 * parse('张三 13812345678 浙江省杭州市余杭区五常街道文一西路969号');
 * // → { province:{code:'330000',name:'浙江省'}, city:{...杭州市}, district:{name:'余杭区'},
 * //     town:'五常街道', detail:'文一西路969号', name:'张三', mobile:'13812345678', ... }
 * ```
 */
export function parse(
  input: string,
  options: ParseOptions = {},
): ParsedAddress {
  const raw = typeof input === 'string' ? input : String(input ?? '');
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let text = raw.trim();
  if (text === '') return emptyResult(raw);

  if (options.textFilter?.length) {
    for (const f of options.textFilter) {
      if (f) text = text.split(f).join(' ');
    }
  }

  let idCard = '';
  let mobile = '';
  let phone = '';
  let zipcode = '';
  let name = '';

  if (opts.extractIdCard) ({ idCard, text } = extractIdCard(text));
  if (opts.extractMobile) ({ mobile, text } = extractMobile(text));
  if (opts.extractPhone) ({ phone, text } = extractLandline(text));
  if (opts.extractZipcode) ({ zipcode, text } = extractZipcode(text));
  if (opts.extractName) ({ name, text } = extractName(text));

  // 清掉残留的标签词（电话：/ 地址： …）
  text = text.replace(LABEL_RE, ' ');

  // 裸姓名启发式：取首段或末段（必须以已知姓氏开头，避免误吞）
  if (opts.extractName && !name) {
    const segs = text.split(SEP_RE).filter(Boolean);
    if (segs.length >= 2) {
      if (isLikelyName(segs[0]!, true)) {
        name = segs.shift()!;
        text = segs.join(' ');
      } else if (isLikelyName(segs[segs.length - 1]!, true)) {
        name = segs.pop()!;
        text = segs.join(' ');
      }
    }
  }

  const core = collapseSeparators(text);
  const region = opts.normalizeRegion
    ? matchRegion(core, opts.strict)
    : matchRegionStructural(core, opts.strict);

  return {
    province: region.province,
    city: region.city,
    district: region.district,
    town: region.town,
    detail: region.detail,
    name,
    mobile,
    phone,
    idCard,
    zipcode,
    confidence: region.confidence,
    raw,
  };
}

/**
 * 批量解析多段地址。
 */
export function parseBatch(
  inputs: readonly string[],
  options: ParseOptions = {},
): ParsedAddress[] {
  return inputs.map((item) => parse(item, options));
}
