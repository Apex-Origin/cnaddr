import { HAN, removeFirst } from '../utils.js';
import { PROVINCES } from '../data/provinces.js';

/** 常见复姓。 */
export const COMPOUND_SURNAMES = [
  '欧阳',
  '太史',
  '端木',
  '上官',
  '司马',
  '东方',
  '独孤',
  '南宫',
  '万俟',
  '闻人',
  '夏侯',
  '诸葛',
  '尉迟',
  '公羊',
  '赫连',
  '澹台',
  '皇甫',
  '宗政',
  '濮阳',
  '公冶',
  '太叔',
  '申屠',
  '公孙',
  '慕容',
  '仲孙',
  '钟离',
  '长孙',
  '宇文',
  '司徒',
  '鲜于',
  '司空',
  '闾丘',
  '子车',
  '亓官',
  '司寇',
  '巫马',
  '公西',
  '颛孙',
  '壤驷',
  '公良',
  '漆雕',
  '乐正',
  '宰父',
  '谷梁',
  '拓跋',
  '夹谷',
  '轩辕',
  '令狐',
  '段干',
  '百里',
  '呼延',
  '东郭',
  '南门',
  '羊舌',
  '微生',
  '西门',
  '南郭',
  '第五',
  '梁丘',
];

/** 常见单姓（覆盖人口占比 ~99%）。 */
export const SURNAMES = new Set<string>(
  (
    '王李张刘陈杨黄赵周吴徐孙马朱胡郭何高林罗郑梁谢宋唐许韩冯邓曹彭曾萧' +
    '田董袁潘于蒋蔡余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范金石廖贾夏韦' +
    '付方白邹孟熊秦邱江尹薛闫段雷侯龙史陶黎贺顾毛郝龚邵万钱严覃武戴莫' +
    '孔向汤常温康施文牛樊葛邢安齐易乔伍庞颜倪庄聂章鲁岳翟殷詹申欧耿关' +
    '兰焦俞左柳甘祝包宁尚符舒阮柯纪梅童凌毕单季裴霍涂成苗谷盛曲翁冉骆' +
    '蓝路游辛靳管柴蒙鲍华喻祁蒲房滕屈饶解牟艾尤阳时穆农司卓古吉缪简车' +
    '项连芦麦褚娄窦戚岑景党宫费卜冷晏席卫米柏宗瞿桂全佟应臧闵苟邬边卞' +
    '姬师和仇栾隋商刁沙荣巫寇桑郎甄丛仲虞敖巩明佘池查麻苑迟邝都'
  ).split(''),
);

const PROVINCE_TOKENS = new Set<string>();
for (const p of PROVINCES) {
  PROVINCE_TOKENS.add(p.name);
  PROVINCE_TOKENS.add(p.short);
  for (const a of p.alias) PROVINCE_TOKENS.add(a);
}

const ADMIN_WORD = new RegExp(
  `(省|市|区|县|街道|镇|乡|路|大道|街|巷|弄|道|旗|州|盟|自治|开发区|新区|栋|幢|号|楼|室|村|组|队|园|苑|大厦|广场|花园|小区|社区|公司|学校|医院|大学)`,
  'u',
);

const NAME_PREFIX = '收件人|收货人|联系人|姓名|签收人|客户|用户|收件|收货';
const TITLE_SUFFIX = '先生|女士|小姐|同学|师傅|老师|大夫';

const CTX_PREFIX = new RegExp(
  `(?:${NAME_PREFIX})[：:\\s]*([${HAN}·]{2,5})`,
  'u',
);
const CTX_SUFFIX = new RegExp(
  `(?<![${HAN}])([${HAN}·]{2,4})(?:${TITLE_SUFFIX})`,
  'u',
);

/**
 * 判断一个 token 是否像中文姓名。
 * @param requireSurname 为 true 时必须以已知姓氏开头（精确，少误判）。
 */
export function isLikelyName(token: string, requireSurname = true): boolean {
  if (!/^[\u4e00-\u9fa5·]{2,4}$/u.test(token)) return false;
  if (ADMIN_WORD.test(token)) return false;
  if (PROVINCE_TOKENS.has(token)) return false;
  if (!requireSurname) return true;
  if (token.length >= 3 && COMPOUND_SURNAMES.includes(token.slice(0, 2))) {
    return true;
  }
  return SURNAMES.has(token[0]!);
}

/**
 * 通过上下文关键字（收件人：/ …先生）抽取姓名，并返回去除整段后的文本。
 */
export function extractName(text: string): { name: string; text: string } {
  const pre = text.match(CTX_PREFIX);
  if (pre) {
    return { name: pre[1]!, text: removeFirst(text, pre[0]) };
  }
  const suf = text.match(CTX_SUFFIX);
  if (suf) {
    return { name: suf[1]!, text: removeFirst(text, suf[0]) };
  }
  return { name: '', text };
}
