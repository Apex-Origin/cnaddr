/**
 * 34 个省级行政区。
 *
 * 字段：
 *   - code   6 位国标行政区划代码（省级以 0000 结尾）
 *   - name   标准全称（如「广东省」）
 *   - short  最常用简称（去掉「省/自治区/特别行政区」等后缀）
 *   - alias  其它常见别名 / 一字简称（车牌简称等），用于宽松匹配
 *   - isMunicipality  是否直辖市（直辖市的「市」级等于省级本身）
 */
export interface ProvinceRecord {
  code: string;
  name: string;
  short: string;
  alias: string[];
  isMunicipality?: boolean;
}

export const PROVINCES: ProvinceRecord[] = [
  // 直辖市
  {
    code: '110000',
    name: '北京市',
    short: '北京',
    alias: ['京'],
    isMunicipality: true,
  },
  {
    code: '120000',
    name: '天津市',
    short: '天津',
    alias: ['津'],
    isMunicipality: true,
  },
  {
    code: '310000',
    name: '上海市',
    short: '上海',
    alias: ['沪', '申'],
    isMunicipality: true,
  },
  {
    code: '500000',
    name: '重庆市',
    short: '重庆',
    alias: ['渝'],
    isMunicipality: true,
  },

  // 省
  { code: '130000', name: '河北省', short: '河北', alias: ['冀'] },
  { code: '140000', name: '山西省', short: '山西', alias: ['晋'] },
  { code: '210000', name: '辽宁省', short: '辽宁', alias: ['辽'] },
  { code: '220000', name: '吉林省', short: '吉林', alias: ['吉'] },
  { code: '230000', name: '黑龙江省', short: '黑龙江', alias: ['黑'] },
  { code: '320000', name: '江苏省', short: '江苏', alias: ['苏'] },
  { code: '330000', name: '浙江省', short: '浙江', alias: ['浙'] },
  { code: '340000', name: '安徽省', short: '安徽', alias: ['皖'] },
  { code: '350000', name: '福建省', short: '福建', alias: ['闽'] },
  { code: '360000', name: '江西省', short: '江西', alias: ['赣'] },
  { code: '370000', name: '山东省', short: '山东', alias: ['鲁'] },
  { code: '410000', name: '河南省', short: '河南', alias: ['豫'] },
  { code: '420000', name: '湖北省', short: '湖北', alias: ['鄂'] },
  { code: '430000', name: '湖南省', short: '湖南', alias: ['湘'] },
  { code: '440000', name: '广东省', short: '广东', alias: ['粤'] },
  { code: '460000', name: '海南省', short: '海南', alias: ['琼'] },
  { code: '510000', name: '四川省', short: '四川', alias: ['川', '蜀'] },
  { code: '520000', name: '贵州省', short: '贵州', alias: ['黔', '贵'] },
  { code: '530000', name: '云南省', short: '云南', alias: ['滇', '云'] },
  { code: '610000', name: '陕西省', short: '陕西', alias: ['陕', '秦'] },
  { code: '620000', name: '甘肃省', short: '甘肃', alias: ['甘', '陇'] },
  { code: '630000', name: '青海省', short: '青海', alias: ['青'] },
  { code: '710000', name: '台湾省', short: '台湾', alias: ['台'] },

  // 自治区
  {
    code: '150000',
    name: '内蒙古自治区',
    short: '内蒙古',
    alias: ['内蒙', '蒙'],
  },
  { code: '450000', name: '广西壮族自治区', short: '广西', alias: ['桂'] },
  { code: '540000', name: '西藏自治区', short: '西藏', alias: ['藏'] },
  { code: '640000', name: '宁夏回族自治区', short: '宁夏', alias: ['宁'] },
  { code: '650000', name: '新疆维吾尔自治区', short: '新疆', alias: ['新'] },

  // 特别行政区
  { code: '810000', name: '香港特别行政区', short: '香港', alias: ['港'] },
  { code: '820000', name: '澳门特别行政区', short: '澳门', alias: ['澳'] },
];
