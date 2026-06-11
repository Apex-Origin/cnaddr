import { describe, it, expect, afterEach } from 'vitest';
import {
  parse,
  matchRegion,
  matchRegionStructural,
  setDistrictProvider,
  formatAddress,
  provinceByCode,
  cityByCode,
} from '../src/index.js';

afterEach(() => setDistrictProvider(null));

describe('matchRegion · 字典匹配', () => {
  it('由地级市反推省份', () => {
    const r = matchRegion('苏州市姑苏区干将东路', false);
    expect(r.province?.name).toBe('江苏省');
    expect(r.city?.code).toBe('320500');
  });

  it('直辖市的市级等于省级', () => {
    const r = matchRegion('北京东城区景山前街', false);
    expect(r.province?.code).toBe('110000');
    expect(r.city?.code).toBe('110100');
    expect(r.district?.name).toBe('东城区');
  });

  it('省份简称 + 省略「市」', () => {
    const r = matchRegion('广东广州天河区', false);
    expect(r.province?.name).toBe('广东省');
    expect(r.city?.name).toBe('广州市');
    expect(r.district?.name).toBe('天河区');
  });
});

describe('matchRegionStructural · 无字典结构化', () => {
  it('仅按后缀切分，code 为空', () => {
    const r = matchRegionStructural('江苏省苏州市姑苏区干将东路', false);
    expect(r.province?.name).toBe('江苏省');
    expect(r.province?.code).toBe('');
    expect(r.city?.name).toBe('苏州市');
    expect(r.district?.name).toBe('姑苏区');
    expect(r.detail).toBe('干将东路');
  });
});

describe('setDistrictProvider · 注入区县数据', () => {
  it('注入后可解析区县代码', () => {
    setDistrictProvider((cityCode, name) =>
      cityCode === '440300' && name === '南山区'
        ? { code: '440305', name }
        : null,
    );
    const r = parse('广东省深圳市南山区粤海街道');
    expect(r.district?.code).toBe('440305');
    expect(r.town).toBe('粤海街道');
  });
});

describe('formatAddress · 反向拼接', () => {
  it('标准化输出且直辖市去重', () => {
    expect(formatAddress(parse('北京朝阳区三里屯街道工体北路8号'))).toBe(
      '北京市朝阳区三里屯街道工体北路8号',
    );
  });
  it('简称补全为全称', () => {
    expect(formatAddress(parse('浙江杭州余杭区五常街道文一西路969号'))).toBe(
      '浙江省杭州市余杭区五常街道文一西路969号',
    );
  });
});

describe('数据集自洽', () => {
  it('省份/城市编码索引可用', () => {
    expect(provinceByCode.get('330000')?.name).toBe('浙江省');
    expect(cityByCode.get('440300')?.city.name).toBe('深圳市');
    expect(cityByCode.get('440300')?.provinceCode).toBe('440000');
  });
});
