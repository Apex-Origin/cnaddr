import { describe, it, expect } from 'vitest';
import { parse, parseBatch } from '../src/index.js';
import { FIXTURES } from './fixtures.js';

describe('parse · 真实地址用例', () => {
  for (const { input, expect: e } of FIXTURES) {
    it(input, () => {
      const r = parse(input);
      if (e.provinceName !== undefined)
        expect(r.province?.name).toBe(e.provinceName);
      if (e.provinceCode !== undefined)
        expect(r.province?.code).toBe(e.provinceCode);
      if (e.cityName !== undefined) expect(r.city?.name).toBe(e.cityName);
      if (e.cityCode !== undefined) expect(r.city?.code).toBe(e.cityCode);
      if (e.districtName !== undefined)
        expect(r.district?.name).toBe(e.districtName);
      if (e.town !== undefined) expect(r.town).toBe(e.town);
      if (e.detail !== undefined) expect(r.detail).toBe(e.detail);
      if (e.name !== undefined) expect(r.name).toBe(e.name);
      if (e.mobile !== undefined) expect(r.mobile).toBe(e.mobile);
      if (e.phone !== undefined) expect(r.phone).toBe(e.phone);
      if (e.idCard !== undefined) expect(r.idCard).toBe(e.idCard);
      if (e.zipcode !== undefined) expect(r.zipcode).toBe(e.zipcode);
    });
  }
});

describe('parse · 边界与选项', () => {
  it('空输入返回空结果且置信度为 0', () => {
    const r = parse('');
    expect(r.confidence).toBe(0);
    expect(r.province).toBeNull();
    expect(r.detail).toBe('');
  });

  it('保留原始文本', () => {
    const raw = '广东省广州市天河区';
    expect(parse(raw).raw).toBe(raw);
  });

  it('完整命中省市区时置信度为 1', () => {
    const r = parse('浙江省杭州市余杭区五常街道文一西路969号');
    expect(r.confidence).toBe(1);
  });

  it('可关闭手机号抽取', () => {
    const r = parse('张三 13812345678 北京朝阳区', { extractMobile: false });
    expect(r.mobile).toBe('');
  });

  it('strict 模式下未知省份不会被结构化捏造', () => {
    const r = parse('火星基地一号坑', { strict: true });
    expect(r.province).toBeNull();
    expect(r.city).toBeNull();
  });

  it('normalizeRegion=false 时仅结构化切分（code 为空）', () => {
    const r = parse('广东省广州市天河区天河路', { normalizeRegion: false });
    expect(r.province?.name).toBe('广东省');
    expect(r.province?.code).toBe('');
    expect(r.city?.name).toBe('广州市');
    expect(r.district?.name).toBe('天河区');
  });

  it('textFilter 可剔除噪声词', () => {
    const r = parse('【顺丰】广东省深圳市福田区', { textFilter: ['【顺丰】'] });
    expect(r.province?.name).toBe('广东省');
    expect(r.city?.name).toBe('深圳市');
  });

  it('parseBatch 批量解析', () => {
    const rs = parseBatch(['浙江省杭州市', '广东省深圳市南山区']);
    expect(rs).toHaveLength(2);
    expect(rs[0]!.city?.name).toBe('杭州市');
    expect(rs[1]!.district?.name).toBe('南山区');
  });

  it('不会把街道路名误判为城市（中山路）', () => {
    const r = parse('广东省广州市中山路100号');
    expect(r.city?.name).toBe('广州市');
    expect(r.detail).toContain('中山路');
  });
});
