import { describe, it, expect } from 'vitest';
import { isValidIdCard, isLikelyName } from '../src/index.js';
import { extractMobile } from '../src/extractors/mobile.js';
import { extractLandline } from '../src/extractors/landline.js';
import { extractZipcode } from '../src/extractors/zipcode.js';
import { extractIdCard } from '../src/extractors/idcard.js';

describe('手机号抽取', () => {
  it.each([
    ['手机13812345678哦', '13812345678'],
    ['+8613812345678', '13812345678'],
    ['0086 138 1234 5678', '13812345678'],
    ['联系 138-1234-5678', '13812345678'],
  ])('%s → %s', (input, expected) => {
    expect(extractMobile(input).mobile).toBe(expected);
  });

  it('非法号段不识别', () => {
    expect(extractMobile('12345678901').mobile).toBe('');
    expect(extractMobile('座机12345').mobile).toBe('');
  });

  it('抽取后从文本中移除', () => {
    expect(extractMobile('张三13812345678').text).toBe('张三');
  });
});

describe('固定电话抽取', () => {
  it('区号座机', () => {
    expect(extractLandline('电话020-38888888').phone).toBe('020-38888888');
  });
  it('带分机', () => {
    expect(extractLandline('010-12345678转8001').phone).toBe(
      '010-12345678-8001',
    );
  });
  it('400 热线', () => {
    expect(extractLandline('客服400-800-8888').phone).toBe('4008008888');
  });
});

describe('邮编抽取', () => {
  it('独立六位', () => {
    expect(extractZipcode('杭州 310012').zipcode).toBe('310012');
  });
  it('带上下文关键字', () => {
    expect(extractZipcode('邮编：518000').zipcode).toBe('518000');
  });
  it('首位为 9 不识别（非法邮编）', () => {
    expect(extractZipcode('编号900000').zipcode).toBe('');
  });
});

describe('身份证抽取与校验', () => {
  it('抽取 18 位', () => {
    expect(extractIdCard('身份证110101199003077213结尾').idCard).toBe(
      '110101199003077213',
    );
  });
  it('校验合法 18 位', () => {
    expect(isValidIdCard('110101199003077213')).toBe(true);
  });
  it('校验码错误', () => {
    expect(isValidIdCard('110101199003077212')).toBe(false);
  });
  it('15 位仅校验格式', () => {
    expect(isValidIdCard('110101900307212')).toBe(true);
  });
  it('非法格式', () => {
    expect(isValidIdCard('hello')).toBe(false);
  });
});

describe('姓名判定', () => {
  it('常见姓氏通过', () => {
    expect(isLikelyName('张三')).toBe(true);
    expect(isLikelyName('欧阳娜娜')).toBe(true);
  });
  it('行政区/省份不被当作姓名', () => {
    expect(isLikelyName('北京')).toBe(false);
    expect(isLikelyName('天河区')).toBe(false);
  });
  it('非姓氏开头（默认严格）被拒', () => {
    expect(isLikelyName('座机')).toBe(false);
  });
});
