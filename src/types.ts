/**
 * 一个行政区划节点（省 / 市 / 区县）。
 * `code` 为 6 位国标行政区划代码；当从字典中无法确定时为空字符串。
 */
export interface RegionNode {
  /** 6 位国标行政区划代码（GB/T 2260）。未知时为 ''。 */
  code: string;
  /** 标准全称，如「广东省」「深圳市」「南山区」。 */
  name: string;
}

/** 解析结果。 */
export interface ParsedAddress {
  /** 省 / 直辖市 / 自治区 / 特别行政区。未识别为 null。 */
  province: RegionNode | null;
  /** 地级市 / 地区 / 州 / 盟。未识别为 null。 */
  city: RegionNode | null;
  /** 区 / 县 / 县级市 / 旗。未识别为 null。 */
  district: RegionNode | null;
  /** 乡镇 / 街道（仅名称，结构化抽取）。 */
  town: string;
  /** 剩余详细地址（道路、门牌、楼栋单元等）。 */
  detail: string;
  /** 收件人姓名。 */
  name: string;
  /** 手机号（11 位，已去除分隔符与 +86 前缀）。 */
  mobile: string;
  /** 固定电话（含区号，如 020-88888888）。 */
  phone: string;
  /** 身份证号（18 / 15 位）。 */
  idCard: string;
  /** 邮政编码（6 位）。 */
  zipcode: string;
  /** 解析置信度 0~1，命中字典越多越高。 */
  confidence: number;
  /** 传入的原始文本。 */
  raw: string;
}

/** 解析选项。 */
export interface ParseOptions {
  /** 抽取并移除手机号。默认 true。 */
  extractMobile?: boolean;
  /** 抽取并移除固定电话。默认 true。 */
  extractPhone?: boolean;
  /** 抽取并移除身份证号。默认 true。 */
  extractIdCard?: boolean;
  /** 抽取并移除邮政编码。默认 true。 */
  extractZipcode?: boolean;
  /** 抽取并移除姓名。默认 true。 */
  extractName?: boolean;
  /**
   * 使用内置行政区划字典补全与纠错（如由「杭州市」反推「浙江省」）。
   * 默认 true。
   */
  normalizeRegion?: boolean;
  /**
   * 严格模式：省 / 市 必须能在内置字典中命中才会被采纳，
   * 否则留空。默认 false（宽松，尽量结构化抽取）。
   */
  strict?: boolean;
  /**
   * 需要从文本中预先剔除的噪声词（如「详细地址」「收货地址」等）。
   * 会按出现顺序整体删除。
   */
  textFilter?: string[];
}

/**
 * 可选的「区县级」数据提供方。内置字典只覆盖到地级市，
 * 如需精确的区县代码，可通过 {@link setDistrictProvider} 注入完整数据。
 */
export type DistrictProvider = (
  /** 已识别出的城市代码（6 位），可能为 ''。 */
  cityCode: string,
  /** 结构化抽取到的区县名称，如「南山区」。 */
  districtName: string,
) => RegionNode | null;
